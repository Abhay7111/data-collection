const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const ONLINE_WINDOW_MS = 90 * 1000
const VALID_ROLES = ['admin', 'manager', 'user']

function getDeviceId(req) {
    const deviceId = req.get('x-device-id')
    return typeof deviceId === 'string' && /^[\da-f-]{36}$/i.test(deviceId)
        ? deviceId
        : 'unknown-device'
}

function recordDeviceSession(user, deviceId, timestamp = new Date()) {
    user.lastSeenAt = timestamp
    user.deviceSessions = user.deviceSessions || []
    user.deviceSessions = user.deviceSessions.filter((session) => (
        session.lastSeenAt && Date.now() - new Date(session.lastSeenAt).getTime() <= ONLINE_WINDOW_MS
    ))
    const session = user.deviceSessions.find((item) => item.deviceId === deviceId)

    if (session) {
        session.lastSeenAt = timestamp
    } else {
        user.deviceSessions.push({ deviceId, lastSeenAt: timestamp })
    }
}

function countOnlineDevices(deviceSessions, lastSeenAt) {
    const onlineDevices = (deviceSessions || []).filter((session) => (
        session.lastSeenAt && Date.now() - new Date(session.lastSeenAt).getTime() <= ONLINE_WINDOW_MS
    )).length
    return onlineDevices || (isOnline(lastSeenAt) ? 1 : 0)
}

async function registerController(req, res) {
    const {username, password} = req.body

    if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        })
    }

    const normalizedUsername = username.trim()
    const user = await userModel.findOne({
        username: normalizedUsername
    })

    if (user){
        return res.status(409).json({
            message: `user Already exist with this username please try anotherone`
        })
    }

    const hash = await bcrypt.hash(password, 12)

    const createUser = await userModel.create({
        username: normalizedUsername,
        password: hash,
        lastSeenAt: new Date(),
        deviceSessions: [{ deviceId: getDeviceId(req), lastSeenAt: new Date() }]
    })

    const token = jwt.sign({
        id: createUser._id,
        username: createUser.username,
        role: createUser.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "2d"}
    )
    res.cookie("token", token, getCookieOptions())

    res.status(201).json({
        message: "Thank you for register",
        user: {
            id: createUser._id,
            username: createUser.username,
            role: createUser.role
        }
    })
}

async function loginController(req, res) {
    const {username, password} = req.body

    if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        })
    }

    const user = await userModel.findOne({
        username: username.trim()
    }).select("+password")

    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid) {
        return res.status(401).json({
            message: "password is incorrect"
        })
    }

    recordDeviceSession(user, getDeviceId(req))
    await user.save()

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "2d"}
    )
    res.cookie("token", token, getCookieOptions())

    res.status(200).json({
        message: "user Loggedin successfully",
        user: {
            id: user._id,
            username: user.username,
            role: user.role
        }
    })
}

async function currentUserController(req, res) {
    const user = await userModel.findById(req.user.id).select('username role lastSeenAt deviceSessions')
    if (!user) {
        return res.status(401).json({ message: 'User session is no longer valid' })
    }

    res.status(200).json({
        user: toPublicUser(user),
        isOnline: isOnline(user.lastSeenAt),
        onlineDevices: countOnlineDevices(user.deviceSessions, user.lastSeenAt)
    })
}

async function heartbeatController(req, res) {
    const user = await userModel.findById(req.user.id).select('username role lastSeenAt deviceSessions')
    if (!user) {
        return res.status(401).json({ message: 'User session is no longer valid' })
    }

    recordDeviceSession(user, req.deviceId)
    await user.save()

    res.status(200).json({
        isOnline: true,
        onlineDevices: countOnlineDevices(user.deviceSessions, user.lastSeenAt),
        user: toPublicUser(user)
    })
}

async function presenceController(req, res) {
    const users = await userModel.find().select('username role lastSeenAt deviceSessions').sort({ username: 1 })

    res.status(200).json({
        users: users.map((user) => ({
            ...toPublicUser(user),
            lastSeenAt: user.lastSeenAt,
            isOnline: countOnlineDevices(user.deviceSessions, user.lastSeenAt) > 0,
            onlineDevices: countOnlineDevices(user.deviceSessions, user.lastSeenAt)
        }))
    })
}

async function updateUserRoleController(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID' })
    }

    const { role } = req.body
    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Role must be admin, manager, or user' })
    }

    if (req.params.id === req.user.id) {
        return res.status(400).json({ message: 'You cannot change your own role' })
    }

    const targetUser = await userModel.findById(req.params.id).select('username role')
    if (!targetUser) {
        return res.status(404).json({ message: 'User not found' })
    }

    if (targetUser.role === 'admin' && role !== 'admin') {
        const adminCount = await userModel.countDocuments({ role: 'admin' })
        if (adminCount <= 1) {
            return res.status(409).json({ message: 'The last administrator cannot be demoted' })
        }
    }

    targetUser.role = role
    await targetUser.save()

    res.status(200).json({
        message: `${targetUser.username}'s role updated to ${role}`,
        user: toPublicUser(targetUser)
    })
}

async function logoutController(req, res) {
    const user = await userModel.findById(req.user.id).select('lastSeenAt deviceSessions')
    if (user) {
        const session = user.deviceSessions?.find((item) => item.deviceId === req.deviceId)
        if (session) session.lastSeenAt = null
        const remainingSessions = (user.deviceSessions || []).filter((item) => (
            item.lastSeenAt && Date.now() - new Date(item.lastSeenAt).getTime() <= ONLINE_WINDOW_MS
        ))
        user.lastSeenAt = remainingSessions.reduce(
            (latest, item) => new Date(item.lastSeenAt) > latest ? new Date(item.lastSeenAt) : latest,
            new Date(0)
        )
        if (user.lastSeenAt.getTime() === 0) user.lastSeenAt = null
        await user.save()
    }
    res.clearCookie("token", getCookieOptions())
    res.status(200).json({
        message: "user Logged out successfully"
    })
}

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction
    }
}

function isOnline(lastSeenAt) {
    return Boolean(lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() <= ONLINE_WINDOW_MS)
}

function toPublicUser(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        role: user.role
    }
}


module.exports = {
    registerController,
    loginController,
    currentUserController,
    heartbeatController,
    presenceController,
    updateUserRoleController,
    logoutController
}