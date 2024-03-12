const router = require("express").Router()
const passport = require("passport");
const genPassword = require('../library/passwordUtils').genPassword
const mongoConnection = require('../config/connectMongo')
const User = mongoConnection.models.user
const recipes = require('../schemas/recipe')
const users = require('../schemas/user')



// ------------ User Get Routes ------------

router.get('/', (req, res) => {
    console.log("user/ get request triggered...")
    res.render('index')
})

router.get('/login', (req, res) => {
    console.log("user/login get request triggered...")
    res.render('user/login')
})

router.get('/register', (req, res) => {
    console.log("user/register get request triggered...")
    res.render('user/register')
})

router.get('/profile', async (req, res) => {
    console.log("user/profile get request triggered...")
    if (req.user){
        var result
        result = await recipes.find()
        console.log(result)
        data = {
            username: req.user.username,
            email: req.user.email,
            recipes: result
        }
        res.render('user/profile', data)
    }else{
        res.render('user/login')
    }
})



// ------------ User Post Routes ------------

router.post('/login', (req, res, next) => {
    console.log("user/login post request triggered...")
    next()
},
    passport.authenticate('local', {
        successRedirect: '/index',
        failureFlash: true
    }
))

router.post('/login')

router.post('/register', async (req, res, next) => {
    console.log("user/register post request triggered...")

    //list of items that needs to be true for username to be added
    checklist = {
        usernameAvailable: false,
        emailAvailable: true, //website does not yet take email
        userSaved: false
    }

    //check if username is available
    var result = await users.find({username: req.body.username})
    if (result.length != 0 ){
        res.send(checklist)
        return;
    } else {
        checklist.usernameAvailable = true
    }

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
    newUser.save() .then((user) => {
        checklist.userSaved = true
        console.log(user)
    })
    
    res.redirect('login')
})

router.post('/logout', (req, res) => {
    console.log("user/logout post request triggered...")
    req.logout( (err) => {
        res.redirect("login")
    })
})



module.exports = router