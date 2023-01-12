const userModel = require("../models/userModel")
const check = require("../utils/validator")
const { uploadFile } = require("./awsController")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const createUser = async function (req, res) {
    try {
        let data = req.body
        if (!check.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Please enter data to create user" }) }
        let { fullname, username, email, password, phone } = data

        const files = req.files

        if (!fullname) { return res.status(400).send({ status: false, message: "fullname is mandatory" }) }
        if (!check.isValidname(fullname)) { return res.status(400).send({ status: false, message: "fullname should be in Alphabets" }) };
        if (!username) { return res.status(400).send({ status: false, message: "usernamename is mandatory" }) }
        if (!check.isValidUserName(username)) { return res.status(400).send({ status: false, message: "fullname should be valid" }) };

        if (!email) { return res.status(400).send({ status: false, message: "email is mandatory" }) };
        if (!check.isVAlidEmail(email)) { return res.status(400).send({ status: false, message: "Email should be valid" }) };
        let checkEmail = await userModel.findOne({ email });
        if (checkEmail) return res.status(400).send({ status: false, message: "This email is already registered" });

        if (!password) { return res.status(400).send({ status: false, message: "Password is mandatory" }) };
        if (!check.isValidPassword(password)) { return res.status(400).send({ status: false, message: "Password should be valid" }) };
        const encryptedPassword = await bcrypt.hash(password, 10)     //salt round is used to make password more secured and by adding a string of 32 or more characters and then hashing them

        if (!phone) { return res.status(400).send({ status: false, message: "Phone is mandatory" }) };
        if (!check.isValidPhone(phone)) { return res.status(400).send({ status: false, message: "Phone should be valid" }) };
        let checkPhone = await userModel.findOne({ phone });
        if (checkPhone) return res.status(400).send({ status: false, message: "This Phone is already registered" });


        if (files && files.length == 0)
            return res.status(400).send({ status: false, message: "Profile Image is required" });
        else if (!check.isValidImage(files[0].originalname))
            return res.status(400).send({ status: false, message: "Profile Image is required as an Image format" });
        else data.profilePicture = await uploadFile(files[0]);

        const userDetails = { fullname, username, email, phone, profilePicture: data.profilePicture, password: encryptedPassword }
        const newUser = await userModel.create(userDetails);
        return res.status(201).send({ status: true, message: "User created successfully", data: newUser });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message })
    }

}
//==========================================================================================================================================


const userLogin = async function (req, res) {

    try {
        let data = req.body
        const { username, phone, email, password } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: 'please provide some data' })
        }

        let user = await userModel.findOne({ $or: [{ email }, { phone }, { username }] })
        if (!user) return res.status(400).send({ status: false, message: "credentials is wrong" })

        let hashedPassword = await bcrypt.compare(password, user.password)
        if (!hashedPassword) return res.status(400).send({ status: false, message: "password is incorrect" })

        let token = jwt.sign({
            userId: user._id,
        }, 'om,arsh,suraj',
            { expiresIn: "24hr" })

        return res.status(201).send({ status: true, message: 'token created successfully', data: token })

    }
    catch (error) {
        res.status(500).send({ status: false, Error: error.message })
    }
}


//============================================== Get user ==============================================================


const getUser = async function (req, res) {
    try {
        let data = req.query
        let userId = req.decodedToken.userId
        let { id } = data
        let userData = { userId: userId, isDeleted: false }

        let user = await userModel.findById({ _id: userId })
        if (!user) {
            return res.status(404).send({ status: false, message: 'user id does not exist' })
        }

        if (id) userData.id = id

        let userProfile = await userModel.find(userData)
        if (userProfile.length === 0) return res.status(400).send({ status: false, message: 'no user found' })

        return res.status(200).send({ status: true, message: "user fetched successfully", data: userProfile })

    }
    catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}

// const getUser = async function (req, res) {
//     try {



//         let userId = req.decodedToken.userId
//         console.log(userId)

        // if (req.query) {
        //     let data = req.query

        //     let { fullname, username, id } = data

        //     let user = await userModel.findOne({ $or: [{ 'fullname': fullname }, { 'username': username }] })
        //     //console.log(user)
        //     if (user.length === 0) return res.status(400).send({ status: false, message: 'no user found' })
        //     return res.status(200).send({ status: true, message: "user fetched successfully", data: user })

        // }


//     }
//     catch (error) {
//         return res.status(500).send({ status: false, Error: error.message })
//     }
// }






//============================================== Update user ==============================================================


const updateUser = async function (req, res) {
    try {
        let data = req.body
        const files = req.files
        let userId = req.params.userId
        console.log(userId)
        let { fullname, username, phone, email, password } = data

        //   let userData = {}

        // if (fullname) userData.fullname = fullname
        // if (username) userData.username = username
        // if (phone) userData.phone = phone
        // if (email) userData.email = email
        // if (password) userData.password = password
        // if (files) userData.files = files

        if (!check.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "given UserId is not valid" })

        if (!check.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Please enter data to update user" })

        let user = await userModel.findOne({ userId, isDeleted: false })
        if (!user) return res.status(404).send({ status: false, message: "user not found" })

        if (!check.isValidname(fullname)) return res.status(400).send({ status: false, message: "fullname should be in Alphabets" })
        if (!check.isValidUserName(username)) return res.status(400).send({ status: false, message: "fullname should be valid" })
        // if (!check.isValidPhone(phone)) return res.status(400).send({ status: false, message: "Phone should be valid" })
        // if (!check.isVAlidEmail(email)) return res.status(400).send({ status: false, message: "Email should be valid" })

        let duplicate = await userModel.findOne({ $or: [{ email }, { phone }] });
        if (duplicate) return res.status(400).send({ status: false, message: "Phone or Email are already registered" });

        // if (!check.isValidPassword(password)) return res.status(400).send({ status: false, message: "Password should be valid" })
        // const encryptedPassword = await bcrypt.hash(password, 10)
        // data.password = encryptedPassword

        // if (!check.isValidImage(files[0].originalname)) {
        //     return res.status(400).send({ status: false, message: "Profile Image is required as an Image format" })
        // }
        // data.profilePicture = await uploadFile(files[0])

        data ={fullname}
        console.log(data)
        let updateUser = await userModel.findOneAndUpdate({ userId }, { $set: data }, { new: true })

        return res.status(200).send({ status: true, message: "user updated successfully", data: updateUser })

    }
    catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}



//---------------------------  Delete user-------------------------------------


const deletuser = async function (req, res) {
    try {
        let UserId = req.params.UserId
        if (!UserId) {
            return res.status(400).send({ status: false, msg: "UserId not present" })
        }
        if (!check.isValidObjectId(UserId)) {
            return res.status(400).send({ status: false, message: "given UserId is not valid" })
        }

        let findUser = await userModel.findOne({ _id: UserId, isDeleted: false })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "user not found or already delete" })
        }
        let deleteduser = await userModel.findOneAndUpdate({ _id: UserId },
            { $set: { isDeleted: true } },
            { new: true });

        return res.status(200).send({ status: true, message: "User sucessfully deleted", deleteduser });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//---------------------------  follow user-------------------------------------

const followUser = async function (req, res) {
    try {
        let UserId = req.params.UserId
        if (!UserId) {
            return res.status(400).send({ status: false, msg: "UserId not present in params" })
        }
        if (!check.isValidObjectId(UserId)) {
            return res.status(400).send({ status: false, message: "given UserId is not valid" })
        }
        let findUser = await userModel.findOne({ _id: UserId })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "user not found " })
        }

        let currentUserId = req.body.currentUserId
        if (!currentUserId) {
            return res.status(400).send({ status: false, msg: "currentUserId not present in params" })
        }
        if (!check.isValidObjectId(currentUserId)) {
            return res.status(400).send({ status: false, message: "given currentUserId is not valid" })
        }
        let findcurrentUser = await userModel.findOne({ _id: currentUserId })
        if (!findcurrentUser) {
            return res.status(404).send({ status: false, message: "user not found " })
        }
        if (req.params.UserId != req.body.currentUserId) {

            let followUser = await userModel.findOneAndUpdate(
                { _id: UserId }, { $push: { followers: req.body.currentUser } }, { new: true })

            let currentfollowUser = await userModel.findOneAndUpdate(
                { _id: currentUserId }, { $push: { followings: req.params.UserId } }, { new: true })

            return res.status(200).send({ status: true, message: "User sucessfully fellow", followUser, currentfollowUser });
        }
        else {
            return res.status(403).send("you cant follow yourself");
        }


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//---------------------------  unfollow  user-------------------------------------

const unfollowUser = async function (req, res) {
    try {
        let UserId = req.params.UserId
        if (!UserId) {
            return res.status(400).send({ status: false, msg: "UserId not present in params" })
        }
        if (!check.isValidObjectId(UserId)) {
            return res.status(400).send({ status: false, message: "given UserId is not valid" })
        }
        let findUser = await userModel.findOne({ _id: UserId })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "user not found " })
        }

        let currentUserId = req.body.currentUserId
        if (!currentUserId) {
            return res.status(400).send({ status: false, msg: "currentUserId not present in params" })
        }
        if (!check.isValidObjectId(currentUserId)) {
            return res.status(400).send({ status: false, message: "given currentUserId is not valid" })
        }
        let findcurrentUser = await userModel.findOne({ _id: currentUserId })
        if (!findcurrentUser) {
            return res.status(404).send({ status: false, message: "user not found " })
        }
        if (req.params.UserId != req.body.currentUserId) {

            let unfollowUser = await userModel.findOneAndUpdate(
                { _id: UserId }, { $pull: { followers: req.body.currentUser } }, { new: true })

            let currentunfollowUser = await userModel.findOneAndUpdate(
                { _id: currentUserId }, { $pull: { followings: req.params.UserId } }, { new: true })

            return res.status(200).send({ status: true, message: "User sucessfully unfollow", unfollowUser, currentunfollowUser });
        }
        else {
            return res.status(403).send("you cant follow yourself");
        }


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createUser, userLogin, deletuser, updateUser, getUser, followUser, unfollowUser }