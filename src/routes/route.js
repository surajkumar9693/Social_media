const express = require("express")
const router = express.Router()
const { createUser, userLogin ,followUser,unfollowUser  } = require("../controllers/userController")
const {authentication, authorisation }= require("../middleware/auth")

router.get("/test-me", (req, res) => {
    res.send("first api")
})

router.post("/register", createUser)

router.post("/login", userLogin)

router.put("/:id/follow", followUser)

router.put("/:id/unfollow", unfollowUser)

module.exports = router