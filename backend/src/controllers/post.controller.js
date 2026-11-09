const APOSModel = require('../models/APOS.model')

async function APOSPostController(req, res) {
    await APOSModel.create(req.body)

    res.status(200).json({
        message:"Data collected successfully",
        APOSModel
    })
}

module.exports = {
    APOSPostController
}