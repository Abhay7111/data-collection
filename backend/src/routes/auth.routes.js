const express = require('express')
const userAuthController = require('../controllers/auth.controller')
const userIdentify = require('../middlewares/auth.middleware')
const { authorizedRoles } = require('../middlewares/authorize.middleware')

const authRouter = express.Router()

authRouter.post('/register', userAuthController.registerController)
authRouter.post('/login', userAuthController.loginController)
authRouter.get('/me', userIdentify, userAuthController.currentUserController)
authRouter.post('/heartbeat', userIdentify, userAuthController.heartbeatController)
authRouter.get('/presence', userIdentify, authorizedRoles('admin', 'manager'), userAuthController.presenceController)
authRouter.patch('/users/:id/role', userIdentify, authorizedRoles('admin'), userAuthController.updateUserRoleController)
authRouter.post('/logout', userIdentify, userAuthController.logoutController)

module.exports = authRouter