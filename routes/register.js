const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

const passport = require('passport')
const session = require('express-session')
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
router.use(passport.session())
router.use(express.urlencoded({ extended: false }))
router.use(express.json())

router.get("/", (req, res) => {
    if (req.isAuthenticated()){res.redirect('/')}
    res.render('register');
})

router.post("/", (req, res) => {
    console.log('post request received')
    var hassedPassword = bcrypt.hash(req.body.password, 10)
    var user = {
        name: req.body.username,
        email: req.body.email,
        password: hassedPassword
    }
    console.log(user)
})

module.exports = router