const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const recipe = mongoConnection.models.recipe
const recipeSchema = require("../schemas/recipe")


// ------------ recipe get routes ------------

router.get('/new', async (req, res) => {
    console.log("recipe/new get request triggered...")
    if (req.user){
        const imageOptions = await recipeSchema.schema.path('image').enumValues
        res.render("newRecipe", {imageOptions: imageOptions})
    } else{
        res.redirect("/index")
    }
})



// ---------- recipe post routes ------------

router.post('/new', (req, res) => {
    console.log("recipe/new post request triggered...")
    const newRecipe = new recipe ({
        owner: req.user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image
    })

    newRecipe.save() .then((recipe) => {
        console.log(recipe)
    })
    
    res.redirect('/index')
})

module.exports = router