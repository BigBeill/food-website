const router = require("express").Router()
const { response } = require("express")
const users = require('../../schemas/user')



// ------------ users/friends get requests ------------

router.get("/list", (req, res) => {
    console.log("user/friends/list get request triggered...")
    if (req.user){
        res.render('user/friends/friendsList')
    } else {
        res.render('user/login')
    }
})

router.get("/requests", (req, res) => {
    console.log("user/friends/request get request triggered...")
})

router.get("/search", async (req, res) => {
    console.log("user/friends/search get request triggered...")
    if (req.user){
        res.render('user/friends/searchFriends')
    } else {
        res.render('user/login')
    }
})



// ------------ users/friends post requests ------------

router.post("/sendRequest", async (req, res) => {
    console.log("user/friend/sendRequest post request triggered...")
    console.log(req.user._id)
    if (req.user){
        users.updateOne({_id: req.body.id}, {$addToSet: {friendRequests: req.user._id}})
        .then((response) => {
            console.log(response)
        })
    }
    res.send()
})

module.exports = router