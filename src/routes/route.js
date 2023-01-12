const express = require("express")
const router = express.Router()
const { createUser, userLogin ,followUser,unfollowUser,getUser ,updateUser} = require("../controllers/userController")
const { createpost,getpost ,updatepost,deletepost,likepost} = require("../controllers/postController")

const {authentication, authorisation }= require("../middleware/auth")

router.get("/test-me", (req, res) => {
    res.send("first api")
})

router.post("/register", createUser)

router.post("/login", userLogin)

router.get("/getUser",authentication,getUser)

router.put("/updateUser/:userId",updateUser)

router.put("/:userId/follow", followUser)

router.put("/:userId/unfollow", unfollowUser)

router.post("/createpost/:userId",createpost)

router.get("/getpost/:userId",getpost)

router.put("/updatepost/:userId",updatepost)

router.delete("/deletepost/:userId",deletepost)

router.post("/likepost/:userId",likepost)


module.exports = router