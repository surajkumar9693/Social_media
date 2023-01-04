const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        fullname:{
            type: String,
            require: true,
            // min: 3,
            // max: 20,
            unique: true,
        },
        username: {
            type: String,
            require: true,
            // min: 3,
            // max: 20,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            //max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            //min: 6,
        },
        phone:{
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        followers: {
            type: Array,
            default: [],
        },
        followings: {
            type: Array,
            default: [],
        },
        description: {
            type: String,
            max: 50,
        },
        city: {
            type: String,
            max: 50,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
