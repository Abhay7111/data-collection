const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

async function registerController(req, res) {
    const {username, password} = req.body

    const user = await userModel.findOne({
        $or: [
            {username}
        ]
    })

    if (user){
        return res.status(409).json({
            message: `user Already exist with this username please try anotherone`
        })
    }

    const hash = await bcrypt.hash(password, 12)

    const createUser = await userModel.create({
        username,
        password: hash
    })

    const token = jwt.sign({
        id: createUser._id,
        username: createUser.username,
        role: createUser.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "2d"}
    )
    res.cookie("token", token)

    res.status(201).json({
        message: "Thank you for register",
        user: createUser.username
    })
}

async function loginController(req, res) {
    const {username, password} = req.body

    const user = await userModel.findOne({
        $or: [
            {username}
        ]
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

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "2d"}
    )
    res.cookie("token", token)

    res.status(200).json({
        message: "user Loggedin successfully",
        username: user
    })
}


module.exports = {
    registerController,
    loginController
}