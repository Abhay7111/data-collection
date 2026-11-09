const express = require('express')
const dataRouter = express.Router()
const postController = require('../controllers/post.controller')
const userIdentify = require('../middlewares/auth.middleware')

const dataController = require('../controllers/data.controller')

dataRouter.get('/data', userIdentify, dataController)
dataRouter.post('/data/APOS', userIdentify, postController.APOSPostController)

module.exports = dataRouter