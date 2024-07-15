const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const recipes = mongoConnection.models.recipe
const recipeSchema = require("../schemas/recipe")
const ingredients = require("../schemas/ingredient")
const users = require("../schemas/user")
const createRecipeSchema = require("../library/validSchemaUtils").createRecipeSchema





// ------------ recipe get routes ------------



// description:
//   returns a list of title and image data for recipes with similar title to title provided

// takes 2 arguments from url:
//   title: string
//   amount: int

// return:
//   list of max size {amount}, containing {title, image} information on recipes with a similar title to {name}

// if missing:
//   name: return recipes with any title
//   amount: assume amount is 20
router.get('/findRecipes', async (req, res) => {

    const title = req.query.title || '';
    const amount = parseInt(req.query.amount, 10) || 20;

    try {
        let query = {}
        if (title != '') { query = { title: {$regex: new RegExp(title, 'i')}}}
        const data = await recipes.find(query).limit(amount)
        res.end(JSON.stringify(data))
    } catch {
        res.status(500).json({ message: "failed to collect recipes from database" });
    }
})



// description:
//   returns all data associated for recipe with provided _id

// takes 1 argument from url:
//   _id: _id

// return:
//   completed recipe schema for recipe with provided _id

// if missing:
//   _id: throw error
router.get('/recipeData', async (req,res) => {

    const _id = req.query._id
    if (!_id) { return res.status(400).json({ error: "_id not provided" }) }

    try {
        const data = await recipes.findOne({ _id:_id })
        if (!data) { return res.status(404).json({ error: "recipe with _id does not exist in database"})}
        else { return res.status(200).json({schema: data}) }
    } 
    catch { return res.status(500).json({ error: "database error finding recipe" }) }

})



// takes 2 arguments from url: 
//   name: string
//   amount: int

// route will:
//   return a list of max size {amount}, containing the name of ingredients in database with a similar name to the {name} given in body

// if arguments are not provided:
//   name: nothing will be returned
//   amount: assume amount is 5
router.get('/findIngredient', async (req, res) => {
    const name = req.query.name || '';
    const amount = parseInt(req.query.amount, 10) || 5;

    try {
        // Check if name was provided; if not, return an empty array
        if (name == '') {
            return res.status(400).json({ message: "Name parameter is required." });
        }

        // Perform a search using a case-insensitive regex based on the 'name' parameter
        const data = await ingredients.find(
            { name: {$regex: new RegExp(name, 'i')} },
            { name:1, unitType: 1}
        ).limit(amount)
        res.end(JSON.stringify(data));
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        res.status(500).json({ message: "Server error occurred." });
    }
})

router.get('/getIngredient', async (req, res) => {
    const _id = req.query.amount || ''
    const name = req.query.name || ''

    if (_id){
        const data = await ingredients.findOne({_id: _id})
        return res.status(200).json(data)
    }
    else if (name){
        const data = await ingredients.findOne({name: name})
        return res.status(200).json(data)
    }
    
    return res.status(400).json({error: "no parameters provided"})
})






// ---------- recipe post routes ------------

// takes 5 arguments from body
//   _id: recipeId,
//   title: string
//   description: string
//   image: string
//   ingredients: [{_id: string, unit: string, amount: number}]
//   instructions: [string]

// route will:
//   take data in the body and store it in recipeData (json object)
//   go through every ingredient and calculate its nutrition data
//   save total of all nutrition data in 

router.all('/edit', (req, res, next) => {

    if(!req.user) { return res.status(401).json({ error: 'user not signed in' }) }

    const clientRecipeData = {
        owner: req.user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions
    }

    createRecipeSchema(clientRecipeData)
    .then((response) => {
        req.recipeSchema = response
        console.log("/edit middleware is done prepping the request, passing data to the endpoint")
        next()
    })
    .catch((error) => { return res.status(400).json({ error: error }) })
})

router.post('/edit', (req, res) => {

    // save recipe to server
    new recipes(req.recipeSchema).save()
    .then((newRecipe) => {
        users.updateOne({_id: req.user._id}, { $push: { ownedRecipes: newRecipe._id } })
        return res.status(201).json({ response: 'new recipe created', newObject: newRecipe })
    })
    .catch ((error) => { return res.status(500).json({error: 'failed to save new recipe in database:' + error }) })
})

router.put('/edit', (req, res) => {

    if (!req.body.id) { return res.status(400).json({ error: 'no recipe id provided' }) }

    recipes.findOne({_id: req.body.id})
    .then((recipe) => {

        if (!recipe.owner == req.user) { return res.status(401).json({ error: 'current user is not the owner of the recipe' }) }

        recipes.updateOne({_id: req.body.id}, {$set: req.recipeSchema})
        .then(() => { return res.status(200).json({ message: 'recipe saved successfully' }) })
        .catch(() => { return res.status(500).json({ error: 'failed to save the recipe' }) })
    })
    .catch ((error) => { return res.status(500).json({error: 'failed to find recipe in database:' + error }) })
})



module.exports = router