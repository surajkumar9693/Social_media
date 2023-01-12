const userModel = require("../models/userModel")
const postModel = require("../models/postModel")
const check = require("../utils/validator")
const { uploadFile } = require("./awsController")


//=====================    post create  =====================================

const createpost = async function (req, res) {
    try {
        let data = req.body
        if (!check.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Please enter data to create user" }) }
        let { userId, description, image, likes } = data

        if (!userId) {
            return res.status(400).send({ status: false, msg: "UserId not present " })
        }
        if (!check.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "given UserId is not valid" })
        }
        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "user not found " })
        }

        const files = req.files

        if (files && files.length == 0)
            return res.status(400).send({ status: false, message: "Profile Image is required" });
        else if (!check.isValidImage(files[0].originalname))
            return res.status(400).send({ status: false, message: "Profile Image is required as an Image format" });
        else data.profilePicture = await uploadFile(files[0]);

        const userDetails = { userId, description, likes, profilePicture: data.profilePicture }
        const newpost = await postModel.create(userDetails);
        return res.status(201).send({ status: true, message: "post created successfully", data: newpost });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}


//=====================   get a post  =====================================

const getpost = async function (req, res) {
    try {
        let postId = req.params.postId
        if (!postId) {
            return res.status(400).send({ status: false, msg: "postId not present" })
        }
        if (!check.isValidObjectId(postId)) {
            return res.status(400).send({ status: false, message: "given postId is not valid" })
        }
        let find = await postModel.findOne({ _id: postId })
        if (!find) {
            return res.status(404).send({ status: false, message: "post not found " })
        }
        let findpost = await postModel.find({ _id: postId })
        return res.status(200).send({ status: true, message: "fetch post", findpost });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//=====================   update a post  =====================================

const updatepost = async function (req, res) {
    try {
        let postId = req.params.postId
        if (!postId) {
            return res.status(400).send({ status: false, msg: "postId not present" })
        }
        if (!check.isValidObjectId(postId)) {
            return res.status(400).send({ status: false, message: "given postId is not valid" })
        }
        let find = await postModel.findOne({ _id: postId })
        if (!find) {
            return res.status(404).send({ status: false, message: "post not found " })
        }
        let UserId = req.body.UserId
        if (!UserId) {
            return res.status(400).send({ status: false, msg: "UserId not present in params" })
        }
        if (!check.isValidObjectId(UserId)) {
            return res.status(400).send({ status: false, message: "given UserId is not valid" })
        }
        let findcurrentUser = await userModel.findOne({ _id: UserId })
        if (!findcurrentUser) {
            return res.status(404).send({ status: false, message: "user not found " })
        }
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("the post has been updated");
        } else {
            res.status(403).json("you can update only your post");
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//=====================   delete a post =====================================

const deletepost = async function (req, res) {
    try {
        let postId = req.params.postId
        if (!postId) {
            return res.status(400).send({ status: false, msg: "postId not present" })
        }
        if (!check.isValidObjectId(postId)) {
            return res.status(400).send({ status: false, message: "given postId is not valid" })
        }
        let findpost = await postModel.findOne({ _id: postId, isDeleted: false })
        if (!findpost) {
            return res.status(404).send({ status: false, message: "post not found or already delete" })
        }
        let deletedpost = await postModel.findOneAndUpdate({ _id: postId },
            { $set: { isDeleted: true } },
            { new: true });

        return res.status(200).send({ status: true, message: "post sucessfully deleted", deletedpost });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//=====================   like / dislike a post  =====================================


const likepost = async function (req, res) {
    try {
        let postId = req.params.postId
        if (!postId) {
            return res.status(400).send({ status: false, msg: "postId not present " })
        }
        if (!check.isValidObjectId(postId)) {
            return res.status(400).send({ status: false, message: "given postId is not valid" })
        }
        let findpost = await postModel.findOne({ _id: postId })

        if (!findpost.likes.includes(req.body.userId)) {
            let like = await postModel.findOneAndUpdate(
                { _id: postId }, { $push: { likes: req.body.userId } }, { new: true })
            return res.status(200).send({ status: true, message: "The post has been liked", like });
        }
        else {
            let dislike = await postModel.findOneAndUpdate(
                { _id: postId }, { $pull: { likes: req.body.userId } }, { new: true })
            return res.status(200).send({ status: true, message: "The post has been disliked", dislike });
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createpost, getpost, deletepost, likepost, updatepost }