const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

router.use(express.urlencoded({ extended: false }))
router.use(express.json())

router.get("/", (req, res) => {
    res.render('login');
})

router.post("/", (req, res) => {
    console.log('post request received')
    var hassedPassword = bcrypt.hash(req.body.password, 10)
    var user = {
        name: req.body.username,
        password: hassedPassword
    }
    console.log(user)
})

module.exports = router