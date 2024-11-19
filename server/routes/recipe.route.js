const router = require("express").Router();
const recipeController = require("../controllers/recipe.controller");
const recipes = require("../models/recipe");



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

router.get('/data', recipeController.data);



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
    _id: mongoDB objectId (recipe id)

Method 'ALL' description:
    put relevant data from body into a json object
    check the newly created recipe schema to make sure all data inserted into the object is valid and forms a completed recipe schema
    if successful, store the approved recipe schema inside req.recipeSchema

Method 'POST' description:
    save recipe schema to database.
    add recipes Id to current users list of owned recipe

Method 'PUT' description:
    check to make sure the current user is the owner of the recipe with req.body._id as its id
    use the json object in req.recipeSchema to save over the recipe with the id req.body._id
*/

router.all('/edit', recipeController.packageIncoming);
router.post('/edit', recipeController.add);
router.put('/edit', recipeController.update);



module.exports = router