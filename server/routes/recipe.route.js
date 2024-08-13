const router = require("express").Router();
const recipeController = require("../controllers/recipe.controller");
const recipes = require("../models/recipe")
const users = require("../models/user")
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

router.get('/data', recipeController.data)



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
---------- /paginatedList routes ------------
*/

router.get('/paginatedList', async (req, res) => {
    
    const page = parseInt(req.query.page)
    const size = parseInt(req.query.size)
    const number = parseInt(req.query.number) || 1

    if (!page) { return res.status(400).json({ error: "page not provided" })}
    if (!size) { return res.status(400).json({ error: "size not provided" })}

    const skip = page * size

    let pageList = []

    try {
        for (let index = 0; index <= number; index = 0) {
            const recipeList = await ingredients.find().skip(skip + (size * index)).limit(size)
            pageList.push(recipeList)
        }
    }
    catch {
        return res.status(500).json({ error: "server failed to find recipes" })
    }

    return res.status(200).json( pageList )
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