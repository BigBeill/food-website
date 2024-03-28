const router = require("express").Router()
const { response } = require("express")
const user = require('../../schemas/user')



// ------------ users/friends get requests ------------

router.get("/list", (req, res) => {
    console.log("user/friends/list get request triggered...")
    if (req.user){
        res.render('user/friends/friendsList')
    } else {
        res.redirect('/user/login')
    }
})

router.get("/requests", async (req, res) => {
    console.log("user/friends/request get request triggered...")
    if (req.user){
        var results = await user.findOne({_id: req.user._id}).select('friendRequests')  
        res.render('user/friends/requestList', {requests: results.friendRequests})
    } else {
        res.redirect('/user/login')
    }
})

router.get("/search", async (req, res) => {
    console.log("user/friends/search get request triggered...")
    if (req.user){
        res.render('user/friends/searchFriends')
    } else {
        res.redirect('/user/login')
    }
})



// ------------ users/friends post requests ------------

router.post("/sendRequest", async (req, res) => {
    console.log("user/friend/sendRequest post request triggered...")
    console.log(req.user._id)
    if (req.user){
        user.updateOne({_id: req.body.id}, {$addToSet: {friendRequests: req.user._id}})
        .then((response) => {
            console.log(response)
        })
    }
    res.send()
})

router.post("/processRequest", async (req, res) => {
    console.log("user/friends/processRequest post request triggered...")
    console.log("current user id: " + req.user._id)
    console.log("target user id: " + req.body.id)
    console.log("action type: " + req.body.action)

    //repsonse message will be sent as a response to the client
    //if this post request is working correctly responseMessage will be overwriten with something else
    //if client recieves "request failed" something went wrong with post request
    responseMessage = "request failed"

    if (req.body.action == "request"){

    } else if (req.body.action == "accept") {
        console.log("attempting to accept friend request...")
        //make sure current user actually possesses a friend request from target user
        hasRequest = user.findOne({_id: req.user._id, friendRequests: {$in: [req.body.id]}})
        if(!hasRequest){
            console.log("no original friend request found")
            responseMessage = "no friend request from target user found"
        } else {
            console.log("original friend request found")
            //user.updateOne({_id: req.user._id}, {$addToSet: {friends: req.user._id}}) .then((response) => {console.log(response)})
            //user.updateOne({_id: req.body.id}, {$addToSet: {friends: req.user._id}}) .then((response) => {console.log(response)})
        }

    } else if (req.body.action == "reject") {

    }

    console.log("sending message to client: " + responseMessage)
    res.send(responseMessage)
})

module.exports = router