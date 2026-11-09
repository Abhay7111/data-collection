const APOSModel = require('../models/APOS.model')

async function dataController(req, res) {
    const responce = APOSModel.find()
    res.send("This is data route controller" , responce)
    
}

module.exports = dataController