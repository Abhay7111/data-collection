const APOSModel = require('../models/APOS.model')

async function APOSPostController(req, res) {
    await APOSModel.create(req.body)

    res.status(200).json({
        message:"Data collected successfully",
        APOSModel
    })
}

async function APOSGetController(req, res){
    const data = await APOSModel.find()

    res.status(200).json({
        message: "data fetched successfully",
        data: data
    })
}

module.exports = {
    APOSPostController,
    APOSGetController
}