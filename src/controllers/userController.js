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
        if (req.query.userId) {
            const otherUser = await userModel.findById(req.query.userId);
            const { password, updatedAt, ...other } = otherUser._doc;
            return res.status(200).send({ status: true, message: "user fetched successfully", data: other })
        }

        const userLoggedIn = await userModel.findById(req.decodedToken.userId);
        const { password, updatedAt, ...other } = userLoggedIn._doc;
        return res.status(200).send({ status: true, message: "user fetched successfully", data: other })

    }
    catch (error) {
        return res.status(500).send({ status: false, Error: error.message })
    }
}


//============================================== Update user ==============================================================


const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        const files = req.files
        let userdata = req.body

        if (Object.keys(userdata).length == 0 && files == undefined) { return res.status(400).send({ status: false, message: "plz enter some data to update" }) }

        let { fullname, email, phone, password } = userdata;

        {
            if (!check.isValidname(fullname)) {
                return res.status(400).send({ status: false, message: "Fname should be valid" })
            }
            let duplicatefullname = await userModel.findOne({ fullname })
            if (duplicatefullname) return res.status(400).send({ status: false, message: "This name is already exists" });
            userdata.fullname = fullname
        }

        if (email) {
            if (!check.isVAlidEmail(email)) { return res.status(400).send({ status: false, message: "Email should valid" }) };
            let duplicateEmail = await userModel.findOne({ email: email })
            if (duplicateEmail) return res.status(400).send({ status: false, message: "This email is already exists" });
            userdata.email = email;
        }

        if (Object.keys(userdata).includes("password")) {
            if (password.length < 8 || password.length > 15) {
                return res.status(400).send({ status: false, message: "password length should be between 8 to 15", });
            }
            if (!check.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password is not valid " });
            }
            password = await bcrypt.hash(password, saltRounds);
            userdata.password = password;
        }

        if (phone) {
            if ((!check.isValidPhone(phone))) { return res.status(400).send({ status: false, message: "Phone should be valid" }) };
            let duplicatePhone = await userModel.findOne({ phone: phone })
            if (duplicatePhone) return res.status(400).send({ status: false, message: "This phone number is already exists" });
        }

        if (files && files.length != 0) {
            if (!check.isValidImage(files[0].originalname))
                return res.status(400).send({ status: false, message: "Profile Image is required only in Image format", });
            userdata.profileImage = await uploadFile(files[0]);
        }

        const updateUser = await userModel.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            userdata,
            { new: true }
        );

        if (!updateUser) return res.status(400).send({ status: false, message: "no user prsenet for updation with this id" })

        return res.status(200).send({ status: true, message: "successfully updated", data: updateUser });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}



//---------------------------Delete user-------------------------------------


const deleteuser = async function (req, res) {
    try {
        let UserId = req.params.userId
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

        return res.status(200).send({ status: true, message: "User sucessfully deleted" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//---------------------------  follow user-------------------------------------

const followUser = async function (req, res) {
    try {

        let selfId = req.decodedToken.userId
        let persontofollow = req.params.userId

        if (selfId === persontofollow) {
            return res.status(400).send({ status: false, message: "you cant follow yourself" })
        }
        let persontofollowData = await userModel.findById(persontofollow)
        let persontofollower = persontofollowData.followers
        for (let i = 0; i < persontofollower.length; i++) {
            if (persontofollower.includes(selfId)) {
                await userModel.findByIdAndUpdate(
                    persontofollow,
                    {
                        $pull: { followers: selfId }
                    },
                    { new: true }
                )
            }
            return res.status(200).send({ status: true, message: `You're now unfollowing ${persontofollow}.` })
        }

        let persontounfollowData = await userModel.findById(selfId)
        let persontounfollower = persontounfollowData.followings
        for (let i = 0; i < persontounfollower.length; i++) {
            if (persontounfollower.includes(persontofollow)) {
                await userModel.findByIdAndUpdate(
                    selfId,
                    {
                        $pull: { followings: persontofollow }
                    },
                    { new: true }
                )
            }
            return res.status(200).send({ status: true, message: `You're now unfollowing ${persontofollow}.` })
        }


        let followed = await userModel.findByIdAndUpdate(
            persontofollow,
            {
                $push: { followers: selfId }
            },
            { new: true }
        )
        let following = await userModel.findByIdAndUpdate(
            selfId,
            {
                $push: { followings: persontofollow }
            },
            { new: true }
        )
        return res.status(200).send({ status: true, message: `You're now following ${persontofollow}.` })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//---------------------------  unfollow  user-------------------------------------

const unfollowUser = async function (req, res) {
    try {
        let selfId = req.decodedToken.userId
        let persontounfollow = req.params.userId

        let persontofollowData = await userModel.findById(persontounfollow)
        let persontofollower = persontofollowData.followers
        for (let i = 0; i < persontofollower.length; i++) {
            if (persontofollower.includes(selfId)) {
                await userModel.findByIdAndUpdate(
                    persontounfollow,
                    {
                        $push: { followers: selfId }
                    },
                    { new: true }
                )
            }
            return res.status(200).send({ status: true, message: `You're now following ${persontounfollow}.` })
        }

        let persontounfollowData = await userModel.findById(selfId)
        let persontounfollower = persontounfollowData.followings
        for (let i = 0; i < persontounfollower.length; i++) {
            if (persontounfollower.includes(persontounfollow)) {
                await userModel.findByIdAndUpdate(
                    selfId,
                    {
                        $push: { followings: persontounfollow }
                    },
                    { new: true }
                )
            }
            return res.status(200).send({ status: true, message: `You're now following ${persontounfollow}.` })
        }


        if (selfId === persontounfollow) {
            return res.status(400).send({ status: false, message: "you cant follow yourself" })
        }

        let followed = await userModel.findByIdAndUpdate(
            persontounfollow,
            {
                $pull: { followers: selfId }
            },
            { new: true }
        )
        let following = await userModel.findByIdAndUpdate(
            selfId,
            {
                $pull: { followings: persontounfollow }
            },
            { new: true }
        )
        return res.status(200).send({ status: true, message: `You're unfollowed ${persontounfollow}.` })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createUser, userLogin, getUser, updateUser, deleteuser, followUser, unfollowUser }