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
    if (req.user){
        await user.updateOne({_id: req.body.id}, {$addToSet: {friendRequests: req.user._id}})
        res.send({message: "friend request sent"})
    } else { 
        res.send({message: "current user is not signed in"})
    }
})

router.post("/acceptRequest", async (req, res) => {
    console.log("user/friend/acceptRequest post request triggered...")
    if (req.user){
        result = user.findOne({_id: req.user._id, friendRequests: {$in: [req.body.id]}})
        if (!result){
            res.send({message: "current user does not have a valid friend request from target"})
        } else {
            await user.updateOne({_id: req.user._id}, {$pull: {friendRequests: req.body.id}})
            await user.updateOne({_id: req.user._id}, {$addToSet: {friends: req.body.id}})
            await user.updateOne({_id: req.body.id}, {$addToSet: {friends: req.user._id}})
            res.send({message: "friend added"})
        }
    } else {
        res.send ({message: "current user is not signed in"})
    }
})

router.post("/rejectRequest", async (req, res) => {
    console.log("user/friend/rejectRequest post request triggered...")
    if (req.user){
        await user.updateOne({_id: req.user._id}, {$pull: {friendRequests: req.body.id}})
        res.send({message: "friend request removed"})
    } else {
        res.send({message: "current user is not signed in"})
    }
})

module.exports = router