const APOSModel = require('../models/APOS.model')
const userModel = require('../models/user.model')
const settingsModel = require('../models/settings.model')
const { serializeSettings } = require('./settings.controller')
const mongoose = require('mongoose')

const editableFields = [
    'Ro_ID',
    'Ro_Name',
    'Mapped_MST',
    'Hos_Pos_ID',
    'BPCL_TID',
    'POS_ID',
    'POS_Vender',
    'HW_Seral_No',
    'HW_Physically_Available',
    'Currently_Working',
    'workflow_Status',
    'complaint_No',
    'Removal_Requist_Raised_and_No',
    'observed_ALP_Activated',
    'observed_UFHI_Activated',
    'General_Remarks'
]

function getInvalidOption(data, settings, existing) {
    if (
        data.POS_Vender
        && !settings.posVendors.includes(data.POS_Vender)
        && data.POS_Vender !== existing?.POS_Vender
    ) {
        return { field: 'POS Vendor' }
    }
    if (
        data.workflow_Status
        && !settings.workflowStatuses.includes(data.workflow_Status)
        && data.workflow_Status !== existing?.workflow_Status
    ) {
        return { field: 'Workflow Status' }
    }
    return null
}

async function APOSPostController(req, res) {
    const settings = serializeSettings(await settingsModel.findOne({ key: 'global' }).lean())
    const { assignedTo, ...input } = req.body
    const invalidOption = getInvalidOption(input, settings)
    if (invalidOption) {
        return res.status(400).json({ message: `${invalidOption.field} is not in the available options` })
    }

    const record = input.HW_Physically_Available === 'No'
        ? {
            ...input,
            Currently_Working: '',
            complaint_No: '',
            Removal_Requist_Raised_and_No: ''
        }
        : input

    const data = await APOSModel.create({
        ...record,
        user: req.user.id,
        submittedBy: req.user.username,
        assignedTo: null
    })

    res.status(201).json({
        message: "Data collected successfully",
        data
    })
}

async function APOSGetController(req, res){
    const hasGlobalAccess = ['admin', 'manager'].includes(req.user.role)
    const filter = hasGlobalAccess && req.query.scope !== 'mine'
        ? {}
        : { $or: [{ user: req.user.id }, { assignedTo: req.user.id }] }
    const data = await APOSModel.find(filter)
        .populate('assignedTo', 'username role')
        .sort({ createdAt: -1 })

    res.status(200).json({
        message: "data fetched successfully",
        data: data
    })
}

async function APOSUpdateController(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid record ID' })
    }

    const update = Object.fromEntries(
        editableFields
            .filter((field) => Object.hasOwn(req.body, field))
            .map((field) => [field, req.body[field]])
    )

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: 'Provide at least one editable field' })
    }

    const existing = await APOSModel.findById(req.params.id)
    if (!existing) {
        return res.status(404).json({ message: 'Record not found' })
    }

    const settings = serializeSettings(await settingsModel.findOne({ key: 'global' }).lean())
    const invalidOption = getInvalidOption(update, settings, existing)
    if (invalidOption) {
        return res.status(400).json({ message: `${invalidOption.field} is not in the available options` })
    }

    if ((update.HW_Physically_Available ?? existing.HW_Physically_Available) === 'No') {
        update.Currently_Working = ''
        update.complaint_No = ''
        update.Removal_Requist_Raised_and_No = ''
    }

    const record = await APOSModel.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true
    }).populate('assignedTo', 'username role')

    if (!record) {
        return res.status(404).json({ message: 'Record not found' })
    }

    res.status(200).json({ message: 'Record updated successfully', data: record })
}

async function APOSDeleteController(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid record ID' })
    }

    const record = await APOSModel.findByIdAndDelete(req.params.id)
    if (!record) {
        return res.status(404).json({ message: 'Record not found' })
    }

    res.status(200).json({ message: 'Record deleted successfully' })
}

async function APOSAssignController(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid record ID' })
    }

    const { userId } = req.body
    let assignedTo = null

    if (userId) {
        if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid assigned user ID' })
        }
        assignedTo = await userModel.findById(userId).select('username role')
        if (!assignedTo) {
            return res.status(404).json({ message: 'Assigned user not found' })
        }
    }

    const record = await APOSModel.findByIdAndUpdate(
        req.params.id,
        { assignedTo: assignedTo?._id ?? null },
        { new: true, runValidators: true }
    ).populate('assignedTo', 'username role')

    if (!record) {
        return res.status(404).json({ message: 'Record not found' })
    }

    res.status(200).json({
        message: assignedTo ? `Record assigned to ${assignedTo.username}` : 'Record assignment cleared',
        data: record
    })
}

module.exports = {
    APOSPostController,
    APOSGetController,
    APOSUpdateController,
    APOSDeleteController,
    APOSAssignController
}