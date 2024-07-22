const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const postgresConnection = require('../config/postgres')
const recipes = mongoConnection.models.recipe
const recipeSchema = require("../schemas/recipe")
const ingredients = require("../schemas/ingredient")
const users = require("../schemas/user")
const { query } = require("express")
const createRecipeSchema = require("../library/validSchemaUtils").createRecipeSchema



/*
------------ /data routes ------------

One method type:
    GET - returns recipe data

Requires 1 argument from url:
    id: mongoDB objectId (recipe id)

Method 'GET' description:
    finds all data in database associated with the recipe that has id matching req.query.id

Method 'GET' returns:
    json object containing recipe data
*/

router.get('/data', async (req,res) => {

    const _id = req.query._id
    if (!_id) { return res.status(400).json({ error: "_id not provided" }) }

    try {
        const data = await recipes.findOne({ _id:_id })
        if (!data) { return res.status(404).json({ error: "recipe with _id does not exist in database"})}
        else { return res.status(200).json(data) }
    } 
    catch { return res.status(500).json({ error: "database error finding recipe" }) }
})



/*
---------- /list routes ------------
One method type:
    GET - returns recipe data

Optionally takes 2 arguments from url:
    name: string
    amount: int (if missing then assume 1)

*/

router.get('/list', async (req, res) => {

    const title = req.query.title || '';
    const amount = parseInt(req.query.amount, 10) || 20;

    try {
        let query = {}
        if (title != '') { query = { title: {$regex: new RegExp(title, 'i')}}}
        const data = await recipes.find(query).limit(amount)
        return res.status(200).json(data)
    } catch {
        res.status(500).json({ message: "failed to collect recipes from database" });
    }
})



/*
---------- /ingredient routes ------------

One method type:
    GET - returns a list of ingredients from the database

Optionally takes 3 arguments from url:
    id: mongoDB objectId (ingredient id)
    name: string
    amount: int (if missing then assume 1)

Method 'GET' description:
    two main paths the route will take:
        path 1:
            triggered by req.query.id being provided
            return to client ingredient with id of req.body.id
        path 2:
            triggered by req.query.id not being provided
            return to client a list of length req.body.amount with similar name to req.body.name (with any name if req.query.name is not provided)

Method 'GET' returns:
    list of json objects containing ingredient data
*/

router.get('/ingredient', async (req, res) => {
    const id = req.query.id || ''
    const name = req.query.name || ''
    const amount = parseInt(req.query.amount, 10) || 1

    //path 1
    if (id){
        try {
            const ingredientData = await ingredients.findOne({_id: _id})
            return res.status(200).json(ingredientData)
        }
        catch { 
            console.log('server failed to find ingredient with id:', id)
            console.log('reason:', error)
            res.status(500).json({ message: "Server error occurred." })
        }
    }

    //path 2
    else {
        try { 
            const ingredientData = await ingredients.find( { name: {$regex: new RegExp(name, 'i')} } ).limit(amount)
            return res.status(200).json(ingredientData)
        } 
        catch (error) {
            console.log('server failed to find ingredient with name:', name)
            console.log('reason:', error)
            res.status(500).json({ message: "Server error occurred." })
        }
    }
})



/*
---------- /edit routes ------------

Two Method types:
    POST - saving new recipe
    PUT - saving over existing recipe

requires 5 arguments from body:
    title: string
    description: string
    image: string
    ingredients: [{_id: string, unit: string, amount: number}]
    instructions: [string]

method 'PUT' requires 1 additional argument from body:
    id: mongoDB objectId (recipe id)

Method 'ALL' description:
    put relevant data from body into a json object
    check the newly created recipe schema to make sure all data inserted into the object is valid and forms a completed recipe schema
    if successful, store the approved recipe schema inside req.recipeSchema

Method 'POST' description:
    save recipe schema to database.
    add recipes Id to current users list of owned recipe

Method 'PUT' description:
    check to make sure the current user is the owner of the recipe with req.body.id as its id
    use the json object in req.recipeSchema to save over the recipe with the id req.body.id
*/


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