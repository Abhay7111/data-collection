const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        unique: [true, "User already exist"],
        type: String,
        required: [true, "username is required"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        select: false
    },
    profile_image: {
        type: String,
        default: "https://img.magnific.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3407.jpg"
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel