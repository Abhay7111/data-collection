const express = require('express')
const userAuthController = require('../controllers/auth.controller')

const authRouter = express.Router()

authRouter.post('/register', userAuthController.registerController)

module.exports = authRouter