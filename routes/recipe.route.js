const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const recipe = mongoConnection.models.recipe


// ------------ recipe get routes ------------

router.get('/new', (req, res) => {
    if (req.user){
        res.render("newRecipe")
    } else{
        res.render("/index")
    }
})



// ---------- recipe post routes ------------

router.post('/new', (req, res) => {
    const newRecipe = new recipe ({
        owner: req.user._id,
        title: req.body.title,
        description: req.body.description
    })

    newRecipe.save() .then((recipe) => {
        console.log(recipe)
    })
    
    res.redirect('/index')
})


module.exports = router