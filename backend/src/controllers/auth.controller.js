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
        username: createUser.username
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


module.exports = {
    registerController
}