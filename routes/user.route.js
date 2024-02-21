const router = require("express").Router()
const processQuery = require('../models/dbQuery');
const passport = require("passport");
const genPassword = require('../library/passwordUtils').genPassword
const mongoConnection = require('../config/connectMongo')
const User = mongoConnection.models.User



// ---------- User Post Routes ----------

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login', 
    successRedirect: '/index'
}))

router.post('/register', (req, res, next) => {

    const saltHash = genPassword(req.body.pw)
    const salt = saltHash.salt
    const hash = saltHash.hash

    const newUser = new User({
        username: req.body.uname,
        hash: hash,
        salt: salt
    })

    newUser.save()
        .then((user) => {
            console.log(user)
        })
    
    res.redirect('login')
})



// ---------- User Get Routs ----------

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})



module.exports = router