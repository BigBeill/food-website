const router = require("express").Router()
const passport = require("passport");
const genPassword = require('../library/passwordUtils').genPassword
const mongoConnection = require('../config/connectMongo')
const User = mongoConnection.models.user
const recipes = require('../schemas/recipe')
const users = require('../schemas/user')



// ------------ User Get Routes ------------

// takes 0 arguments from url

// route will:
//   return data for user that is currently logged in
router.get('/userInfo', (req, res) => {
    data = req.user
    res.end(JSON.stringify(data))
})

// takes 2 arguments from url:
    // searchTerm: string
    // amount: int
router.get('/findUsers', async (req, res) => {
    const searchTerm = req.query.searchTerm || ""
    const amount = parseInt(req.query.amount) || 30

    const data = await ingredients.find(
        { name: {$regex: new RegExp(searchTerm, 'i')} },
        { name:1}
    ).limit(amount)

    res.end(JSON.stringify(data))
})



// ------------ User Post Routes ------------

// takes 2 arguments from body:
//   username, password: string

// route will:
//   use passport local strategy to verify {username} and {password} are correct
//   save user data in server
//   return error data or {message: "success"}

// if arguments are not provided:
//   username, password: login will fail and error will be returned
router.post('/login', (req, res, next) => {
    console.log("user/login post request received")

    passport.authenticate('local', (error, user, info) => {
        if (error) {return res.end(JSON.stringify(error))}
        if (!user) {return res.end(JSON.stringify(info))}
        req.login(user, (error) => {
            if (error) {return res.end(error)}
            else {return res.end(JSON.stringify({message: "success"}))}
        })
    })(req, res, next)
})



// takes 3 arguments from body:
//   username, email, password: string

// route will:
//   create a new user with data provided and save it in the database
//   save user data to server and log new user in to the account
//   if route fails to create new user, return {message: reason for failure}
//   if successful return {message: "success"}

// if arguments not provided:
//   username, email, password: route will fail to create new user
router.post('/register', async (req, res) => {
    console.log("user/register post request received")

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



// takes 0 arguments from body

// route will:
//   logout current user
//   return error data or {message: "success"}
router.post('/logout', (req, res) => {
    console.log("user/logout post request received")
    req.logout( (error) => {
        if (error) {res.end(error)}
        else {res.end(JSON.stringify({message: "success"}))}
    })
})



module.exports = router