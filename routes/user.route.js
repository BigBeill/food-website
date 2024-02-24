const router = require("express").Router()
const passport = require("passport");
const genPassword = require('../library/passwordUtils').genPassword
const mongoConnection = require('../config/connectMongo')
const User = mongoConnection.models.User
const recipes = require('../schemas/recipe')



// ------------ User Get Routes ------------

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('user/login')
})

router.get('/register', (req, res) => {
    res.render('user/register')
})

router.get('/profile', async (req, res) => {
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

router.post('/login', passport.authenticate('local', {
    failureRedirect: 'login', 
    successRedirect: '/index'
}))

router.post('/register', (req, res, next) => {

    const saltHash = genPassword(req.body.password)
    const salt = saltHash.salt
    const hash = saltHash.hash

    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt
    })

    newUser.save() .then((user) => {
        console.log(user)
    })
    
    res.redirect('login')
})



module.exports = router