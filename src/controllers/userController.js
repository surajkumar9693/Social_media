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

        return res.status(201).send({ status: true, message: 'token created successfully', data: { teacherId: user._id, token: token } })

    }
    catch (error) {
        res.status(500).send({ status: false, Error: error.message })
    }
}



module.exports = { createUser, userLogin }