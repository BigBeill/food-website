const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const recipes = mongoConnection.models.recipe
const recipeSchema = require("../schemas/recipe")
const ingredients = require("../schemas/ingredient")
const getNutrition = require("../library/unitConvertingUtils").getNutrition

// ------------ recipe get routes ------------

// STILL WORKING ON THIS ROUTE, DISCRIPTION DOES NOT YET MATCH OUTPUT

// takes 2 arguments from url:
//   name: string
//   amount: int

// route will:
//   return list of max size {amount}, containing the information on recipes with a similer title to {name}

// if arguments are not provided:
//   name: return recipes with any title
//   amount: assume amount is 20
router.get('/publicRecipes', async (req, res) => {
    console.log("recipe/publicRecipes get request triggered...")
    const name = req.query.name || '';
    const amount = parseInt(req.query.amount, 10) || 20;

    try {
        let query = {}
        if (name != '') { query = { name: {$regex: new RegExp(name, 'i')}}}
        const data = await recipes.find(query).limit(amount)
        res.end(JSON.stringify(data))
    } catch {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ message: "Server error occurred." });
    }
})



// takes 2 arguments from url: 
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



// ---------- recipe post routes ------------

router.post('/updateRecipe', async(req, res) => {
    console.log("recipe/updateRecipe post request triggered...")
    if (!req.user) { 
        res.end(JSON.stringify({ message: "user not signed in" }))
        return 
    }

    const recipeData = {
        owner: req.user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
        sodium: 0,
        fiber: 0,
    }

    // go through all posible reasons the new recipe may be rejected
    if (!recipeData.title || !recipeData.description || !recipeData.image || !recipeData.ingredients || !recipeData.instructions || !recipeData.ingredients.length == 0 || recipe.instructions.length == 0) { res.end(JSON.stringify({ message: "important data missing" })); return }
    if (recipeData.title.length < 3 || recipeData.title.length > 500) { res.end(JSON.stringify({message: "bad title length"})); return }
    if (recipeData.description.length < 5 || recipeData.description.length > 5000) { res.end(JSON.stringify({message: "bad description length"})); return }
    // make image requierments later
    if (recipeData.ingredients.length < 50) { res.end(JSON.stringify({message: "too many ingredients"})); return }
    if (recipeData.instructions.length < 50) { res.end(JSON.stringify({message: "too many instructions"})); return }

    // go through every ingredient, make sure its data is inside database and calculate its nutrition value
    for (const ingredient of recipeData.ingredients){
        if (!ingredient._id) { res.end(JSON.stringify({message: "ingredient id missing"})); return }
        const nutritionData = await getNutrition({name: ingredient.name, amount: ingredient.amount, unit: ingredient.unit})
        recipeData.calories += nutritionData.calories
        recipeData.protein += nutritionData.protein
        recipeData.fat += nutritionData.fat
        recipeData.carbohydrates += nutritionData.carbohydrates
        recipeData.sodium += nutritionData.sodium
        recipeData.fiber += nutritionData.fiber
    }
})



module.exports = router