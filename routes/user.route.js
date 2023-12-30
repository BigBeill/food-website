const express = require("express")
const router = express.Router()

const bcrypt = require('bcrypt')
const passport = require('passport')
const initializePassport = require('../passport-config')
initializePassport(passport, username => {
    return users.find(user => user.username === username)
})

//const connection = require('../config/connectDB')

const users = []

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})


module.exports = router