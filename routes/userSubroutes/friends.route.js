const router = require("express").Router()
const users = require('../../schemas/user')

router.get("/list", (req, res) => {
    console.log("user/friends/list get request triggered...")
    res.render('user/friends/friendsList')
})

router.get("/requests", (req, res) => {
    console.log("user/friends/request get request triggered...")
})

router.get("/search", async (req, res) => {
    console.log("user/friends/search get request triggered...")
    res.render('user/friends/searchFriends')
})

module.exports = router