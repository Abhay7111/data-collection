const express = require('express')
const dataRouter = express.Router()
const postController = require('../controllers/post.controller')
const userIdentify = require('../middlewares/auth.middleware')
const { authorizedRoles } = require('../middlewares/authorize.middleware')

dataRouter.get('/data/APOS', userIdentify, postController.APOSGetController)
dataRouter.post('/data/APOS', userIdentify, postController.APOSPostController)
dataRouter.patch('/data/APOS/:id', userIdentify, authorizedRoles('admin', 'manager'), postController.APOSUpdateController)
dataRouter.delete('/data/APOS/:id', userIdentify, authorizedRoles('admin', 'manager'), postController.APOSDeleteController)
dataRouter.patch('/data/APOS/:id/assignment', userIdentify, authorizedRoles('admin'), postController.APOSAssignController)

module.exports = dataRouter