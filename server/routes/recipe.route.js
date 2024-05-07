const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const recipes = mongoConnection.models.recipe
const recipeSchema = require("../schemas/recipe")
const ingredients = mongoConnection.models.recipe
const ingredientSchema = require("../schemas/ingredient")

// ------------ recipe get routes ------------

// STILL WORKING ON THIS ROUTE, DISCRIPTION DOES NOT YET MATCH OUTPUT

// takes 2 arguments from body:
//   name: string
//   amount: int

// route will:
//   return list of max size {amount}, containing the information on recipes with a similer title to {name}

// if arguments are not provided:
//   name: return recipes with any title
//   amount: assume amount is 20
router.get('/publicRecipes', async (req, res) => {
    console.log("recipe/publicRecipes get request triggered...")
    data = await recipes.find()
    res.end(JSON.stringify(data))
})



// STILL WORKING ON THIS ROUTE, DISCRIPTION DOES NOT YET MATCH OUTPUT

// takes 2 arguments from body: 
//   name: string
//   amount: int

// route will:
//   return a list of max size {amount}, containing the name of ingredients in database with a similer name to the {name} given in body

// if arguments are not provided:
//   name: nothing will be returned
//   amount: assume amount is 5
router.get('/findIngredient', async (req, res) => {
    console.log("recipe/findIngredient get request triggered...")

    const name = req.query.name || '';
    const amount = parseInt(req.query.amount, 10) || 5;

    try {
        // Check if name was provided; if not, return an empty array
        if (!name) {
            return res.status(400).json({ message: "Name parameter is required." });
        }

        // Perform a search using a case-insensitive regex based on the 'name' parameter
        const data = await ingredients.find({
            name: { $regex: new RegExp(name, 'i') }
        }).limit(amount);

        res.end(JSON.stringify(data));
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        res.status(500).json({ message: "Server error occurred." });
    }
})



// ---------- recipe post routes ------------


module.exports = router