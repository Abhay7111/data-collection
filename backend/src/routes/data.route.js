const express = require('express')
const dataRouter = express.Router()
const postController = require('../controllers/post.controller')
const userIdentify = require('../middlewares/auth.middleware')
const { authorizedRoles } = require('../middlewares/authorize.middleware')

dataRouter.get('/data/APOS', userIdentify, authorizedRoles('admin'), postController.APOSGetController)
dataRouter.post('/data/APOS', userIdentify, postController.APOSPostController)

module.exports = dataRouter