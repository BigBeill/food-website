if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

const passport = require('passport')
const initializePassport = require('../passport-config')
initializePassport(passport, username => {
    return users.find(user => user.username === username)
})

const flash = require('express-flash')
const session = require('express-session')

router.use(flash())
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

router.use(passport.initialize())
router.use(passport.session())

router.use(express.urlencoded({ extended: false }))
router.use(express.json())

router.get("/", (req, res) => {
    res.render('login');
})

router.post("/", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

module.exports = router