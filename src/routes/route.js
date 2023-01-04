const express = require("express")
const router = express.Router()

router.get("/test-me",(req,res)=>{
    res.send("first api")
})

module.exports=router