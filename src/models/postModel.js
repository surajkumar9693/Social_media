const mongoose = require("mongoose");
const User = require("./userModel")
const ObjectId = mongoose.Schema.Types.ObjectId

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: User,
            required: true,
        },
        description: {
            type: String,
            max: 500,
        },
        image: {
            type: String,
        },
        likes: {
            type: Array,
            default: [],
        },
        isDeleted: {
            type: String,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
