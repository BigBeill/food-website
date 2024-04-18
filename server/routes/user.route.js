const router = require("express").Router()
const passport = require("passport");
const genPassword = require('../library/passwordUtils').genPassword
const mongoConnection = require('../config/connectMongo')
const User = mongoConnection.models.user
const recipes = require('../schemas/recipe')
const users = require('../schemas/user')

// ------------ User Subroutes ------------
const friendsRouter = require("./userSubroutes/friends.route");
const { json } = require("express");
router.use('/friends', friendsRouter)



// ------------ User Get Routes ------------

router.get('/userInfo', (req, res) => {
    console.log("user/userInfo get request triggered...")
    data = req.user
    res.end(JSON.stringify(data))
})

router.get('/findUser/:datatype/:value', async (req, res) => {
    console.log("user/findUser get request triggered...")
    var input = req.params
    console.log("searching database: datatype = " + input.datatype + " value = " + input.value)
    if (input.datatype == "_id"){
        result = await User.findOne({_id: input.value})
        res.send(result)
    } else {
        var query = {}
        query[input.datatype] = {'$regex': input.value}
        var result = await User.find(query)
        res.send(result)
    }
})



// ------------ User Post Routes ------------

router.post('/login', (req, res, next) => {
    console.log("user/login post request triggered...")

    passport.authenticate('local', (error, user, info) => {
        if (error) {return res.end(JSON.stringify(error))}
        if (!user) {return res.end(JSON.stringify(info))}
        req.login(user, (error) => {
            if (error) {return res.end(error)}
            else {return res.end(JSON.stringify({message: "success"}))}
        })
    })(req, res, next)
})

router.post('/register', async (req, res) => {
    console.log("user/register post request triggered...")

    //make sure no data is missing
    if (!req.body.username) { res.end(JSON.stringify({message: "noUsername"}))}
    if (!req.body.email) { res.end(JSON.stringify({message: "noEmail"}))}
    if (!req.body.password) { res.end(JSON.stringify({message: "noPassword"}))}

    //check if username is available
    var result = await users.find({username: req.body.username})
    if (result.length != 0 ) { res.end(JSON.stringify({message: "takenUsername"}))}

    // hash password
    const saltHash = genPassword(req.body.password)
    const salt = saltHash.salt
    const hash = saltHash.hash

    // create new user
    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt
    })

    // add new user to database
    newUser.save()
 
    // login new user
    .then((user) => {
        req.login(user, (error) => {
            if (error) { res.end(error)}
            else { res.end(JSON.stringify({message: "success"}))}
        })
    })
})

router.post('/logout', (req, res) => {
    console.log("user/logout post request triggered...")
    req.logout( (error) => {
        if (error) {res.end(error)}
        else {res.end(JSON.stringify({message: "success"}))}
    })
})



module.exports = router