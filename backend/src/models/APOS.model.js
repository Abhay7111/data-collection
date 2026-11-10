const mongoose = require('mongoose')

const APOSSchema = new mongoose.Schema({
    Ro_ID: String,
    Ro_Name: String,
    Mapped_MST: String,
    Hos_Pos_ID: String,
    BPCL_TID: String,
    POS_ID: String,
    POS_Vender: { type: String, default: "Verifone" },
    HW_Seral_No: String,
    HW_Physically_Available: String,
    Currently_Working: String,
    workflow_Status: { type: String, default: "verified & operational" },
    complaint_No: String,
    Removal_Requist_Raised_and_No: String,
    observed_ALP_Activated: String,
    observed_UFHI_Activated: String,
    General_Remarks: String,
    user: String,
    submittedBy: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    }
}, { timestamps: true })

const APOSModel = mongoose.model('APOSdata', APOSSchema)

module.exports = APOSModel