const settingsModel = require('../models/settings.model')

const defaultSettings = {
    posVendors: ['Verifone', 'Ingenico', 'pax'],
    workflowStatuses: ['verified & operational'],
    roleColors: {
        admin: { primary: '#CBF1F5', secondary: '#CBF1F5' },
        manager: { primary: '#F9F7F7', secondary: '#DBE2EF' },
        user: { primary: '#FFF5E4', secondary: '#FFE3E1' }
    }
}

async function getSettingsController(req, res) {
    const settings = await settingsModel.findOne({ key: 'global' }).lean()
    res.status(200).json({ settings: serializeSettings(settings) })
}

async function updateSettingsController(req, res) {
    const { posVendors, workflowStatuses, roleColors } = req.body || {}

    if (!isValidOptionList(posVendors) || !isValidOptionList(workflowStatuses)) {
        return res.status(400).json({
            message: 'POS vendors and workflow statuses must each contain non-empty text options'
        })
    }

    if (!isValidRoleColors(roleColors)) {
        return res.status(400).json({
            message: 'Each role needs valid primary and secondary hex colors'
        })
    }

    const normalizedVendors = posVendors.map((option) => option.trim())
    const normalizedStatuses = workflowStatuses.map((option) => option.trim())
    if (
        new Set(normalizedVendors.map((option) => option.toLowerCase())).size !== normalizedVendors.length
        || new Set(normalizedStatuses.map((option) => option.toLowerCase())).size !== normalizedStatuses.length
    ) {
        return res.status(400).json({ message: 'Options must be unique' })
    }

    const settings = await settingsModel.findOneAndUpdate(
        { key: 'global' },
        { $set: { posVendors: normalizedVendors, workflowStatuses: normalizedStatuses, roleColors } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean()

    res.status(200).json({
        message: 'Portal settings saved',
        settings: serializeSettings(settings)
    })
}

function isValidOptionList(options) {
    return Array.isArray(options)
        && options.length > 0
        && options.length <= 50
        && options.every((option) => typeof option === 'string' && option.trim().length > 0 && option.length <= 80)
        && new Set(options.map((option) => option.trim().toLowerCase())).size === options.length
}

function isValidRoleColors(roleColors) {
    return ['admin', 'manager', 'user'].every((role) => (
        roleColors?.[role]
        && ['primary', 'secondary'].every((color) => (
            typeof roleColors[role][color] === 'string'
            && /^#[\da-f]{6}$/i.test(roleColors[role][color])
        ))
    ))
}

function serializeSettings(settings) {
    return {
        posVendors: settings?.posVendors ?? defaultSettings.posVendors,
        workflowStatuses: settings?.workflowStatuses ?? defaultSettings.workflowStatuses,
        roleColors: settings?.roleColors ?? defaultSettings.roleColors
    }
}

module.exports = {
    getSettingsController,
    updateSettingsController,
    serializeSettings
}
