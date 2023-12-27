const express = require("express")
const router = express.Router()

var data = [{userName: 'BigBeill', email: 'BigBeill@gmail.com'}]

router.get("/", (req, res) => {
    res.render('profile', {profileInfo: data})
})

module.exports = router