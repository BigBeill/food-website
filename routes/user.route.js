const express = require("express")
const router = express.Router()

const connection = require('../config/connectDB')
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
    connection.query(
        "INSERT INTO `users` (`username`, `email`, `password`) VALUES ('test', 'test@gmail.com', '123')",
        function (err, results){
        console.log(results)
    })
})


module.exports = router