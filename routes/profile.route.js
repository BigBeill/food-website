const express = require("express")
const router = express.Router()
const passport = require('passport')
const session = require('express-session')
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

router.use(passport.session())

router.get("/", (req, res) => {
    if (!req.isAuthenticated()){res.redirect('/login')}
    var data = [{userName: req.user.username, email: 'BigBeill@gmail.com'}]
    res.render('profile', {profileInfo: data})
})

module.exports = router