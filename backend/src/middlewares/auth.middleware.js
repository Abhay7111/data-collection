const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

async function userIdentify(req, res, next) {
    const token = req.cookies.token

    if(!token) {
        return res.status(401).json({
            message: "Token not provided, Unauthorized access"
        })
    }

    let decoded

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    }catch (error) {
        return res.status(401).json({
            message: "user not authorized"
        })
    }

    const user = await userModel.findById(decoded.id).select('username role')
    if (!user) {
        return res.status(401).json({
            message: "user not authorized"
        })
    }

    req.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role
    }
    req.deviceId = getDeviceId(req)

    next()
}

function getDeviceId(req) {
    const deviceId = req.get('x-device-id')
    return typeof deviceId === 'string' && /^[\da-f-]{36}$/i.test(deviceId)
        ? deviceId
        : 'unknown-device'
}

module.exports = userIdentify