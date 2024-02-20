const express = require("express")
const router = express.Router()
const processQuery = require('../models/dbQuery');
const passport = require("passport");
const genPassword = require('../library/passwordUtils').genPassword

// ---------- User Post Routes ----------

router.post('login', passport.authenticate('local'), (req, res, next) => {});

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
    
    res.redirect('/login')
})

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})

/*
router.post('/register', (req, res) => {
    var results = processQuery("INSERT INTO `users` (`username`, `email`, `password`) VALUES ('test', 'test@gmail.com', '123')")
    console.log(results)
})
*/


module.exports = router