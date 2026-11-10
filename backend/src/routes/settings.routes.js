const express = require('express')
const settingsController = require('../controllers/settings.controller')
const userIdentify = require('../middlewares/auth.middleware')
const { authorizedRoles } = require('../middlewares/authorize.middleware')

const settingsRouter = express.Router()

settingsRouter.get('/', settingsController.getSettingsController)
settingsRouter.put(
    '/',
    userIdentify,
    authorizedRoles('admin'),
    settingsController.updateSettingsController
)

module.exports = settingsRouter
