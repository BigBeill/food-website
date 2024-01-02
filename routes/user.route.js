const express = require("express")
const router = express.Router()

const processQuery = require('../models/dbQuery')

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})

router.post('/register', (req, res) => {
    var results = processQuery("INSERT INTO `users` (`username`, `email`, `password`) VALUES ('test', 'test@gmail.com', '123')")
    console.log(results)
})


module.exports = router