const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const recipes = mongoConnection.models.recipe
const recipeSchema = require("../schemas/recipe")
const ingredients = require("../schemas/ingredient")
const users = require("../schemas/user")
const getNutrition = require("../library/unitConvertingUtils").getNutrition






// ------------ recipe get routes ------------



// takes 2 arguments from url:
//   name: string
//   amount: int

// route will:
//   return list of max size {amount}, containing the information on recipes with a similer title to {name}

// if arguments are not provided:
//   name: return recipes with any title
//   amount: assume amount is 20
router.get('/findRecipes', async (req, res) => {
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



// takes 5 arguments from body
//   _id: recipeId,
//   title: string
//   description: string
//   image: string
//   ingredients: [{_id: string, name: string, unit: string, amount: number}]
//   instructions: [string]

// route will:
//   take data in the body and store it in recipeData (json object)
//   go through every ingredient and calculate its nutriton data
//   save total of all nutrition data in 
router.post('/updateRecipe', async(req, res) => {
    console.log("recipe/updateRecipe post request received")
    console.log()
    console.log("required information")
    console.log("   _id:", req.body._id)
    console.log("   title:", req.body.title)
    console.log("   description:", req.body.description)
    console.log("   image:", req.body.image)
    console.log("   ingredients:", req.body.ingredients)
    console.log("   instructions:", req.body.instructions)
    console.log()

    if (!req.user) { 
        console.log("user not signed in, ending recipe/updateRecipe request")
        res.end(JSON.stringify({ message: "user not signed in" }))
        return 
    }

    let recipeData = {
        owner: req.user._id,
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        nutrition:{
            calories: 0,
            fat: 0,
            cholesterol: 0,
            sodium: 0,
            potassium: 0,
            carbohydrates: 0,
            fiber: 0,
            sugar: 0,
            protein: 0,
        }
    }

    // go through all posible reasons the new recipe may be rejected
    console.log("checking for bad data")
    if (!req.body._id) { 
        console.log("no recipe _id provided, ending recipe/updateRecipe request")
        res.end(JSON.stringify({message: "bad recipe _id"}))
        return 
    }
    if (!recipeData.title || !recipeData.description || !recipeData.image || !recipeData.ingredients || !recipeData.instructions || recipeData.ingredients.length == 0 || recipeData.instructions.length == 0) { 
        console.log("important data missing, ending recipe/updateRecipe request")
        res.end(JSON.stringify({ message: "important data missing" }))
        return 
    }
    if (recipeData.title.length < 3 || recipeData.title.length > 100) { 
        console.log("bad title length (must be between 3 and 100 characters), ending recipe/updateRecipe request")
        res.end(JSON.stringify({message: "bad title length"}))
        return 
    }
    if (recipeData.description.length < 3 || recipeData.description.length > 3000) {
        console.log("bad description length (must be between 3 and 3000 characters), ending recipe/updateRecipe request")
        res.end(JSON.stringify({message: "bad description length"}))
        return 
    }
    // make image requierments later
    if (recipeData.ingredients.length > 50) { 
        console.log("too many ingredients (must be less than 50), ending recipe/updateRecipe request")
        res.end(JSON.stringify({message: "too many ingredients"}))
        return 
    }
    if (recipeData.instructions.length > 50) {
        console.log("too many instructions (must be less than 50), ending recipe/updateRecipe request")
        res.end(JSON.stringify({message: "too many instructions"}))
        return 
    }

    // go through every ingredient, make sure data is valid
    for (const ingredient of recipeData.ingredients){
        if (!ingredient._id || !ingredient.name || !ingredient.unit || !ingredient.amount) {
            console.log("issue with ingredient:", ingredient)
            console.log("important data missing (must have _id, name, unit, and amount field), ending recipe/updateRecipe request")
            res.end(JSON.stringify({message: "ingredient id missing"}))
            return
        }
    }

    // go through every instruction, make sure data is valid
    for (const instruction of recipeData.instructions){
        if (instruction.length < 3 || instruction.length > 300){
            console.log("bad instruction length (must be between 3 and 300 character), ending recipe/updateRecipe request")
            res.end(JSON.stringify({message: "bad instruction length"}))
            return
        }
    }

    console.log("no bad data found. recipe data from client accepted")
    console.log("calculating total recipe nutrition value (going through each ingredient)")
    for (const ingredient of recipeData.ingredients){

        try{ 
            const nutritionData = await getNutrition(ingredient._id, ingredient.amount, ingredient.unit) 
            console.log("calculated nutrition value for ingredient", ingredient._id + ":", nutritionData )
            recipeData.nutrition.calories += nutritionData.calories
            recipeData.nutrition.fat += nutritionData.fat
            recipeData.nutrition.cholesterol += nutritionData.cholesterol
            recipeData.nutrition.sodium += nutritionData.sodium
            recipeData.nutrition.potassium += nutritionData.potassium
            recipeData.nutrition.carbohydrates += nutritionData.carbohydrates
            recipeData.nutrition.fiber += nutritionData.fiber
            recipeData.nutrition.sugar += nutritionData.sugar
            recipeData.nutrition.protein += nutritionData.protein
        }
        catch (error){ 
            console.log("issue with ingredient: " +  ingredient.name + ". reason: " + error)
            console.log("unable to calculate nutrition data for ingredient, ending recipe/updateRecipe request")
            res.end(JSON.stringify({message: "unable to calculate nutrition value of: " + ingredient.name}))
            return 
        }
        
    }

    console.log("total recipe nutrition value calculated")
    console.log("compleated recipe data:", recipeData)

    if (req.body._id == 'new') {
        console.log("attempting to save new recipe")
        try {
            const newRecipe = new recipes(recipeData)
            await newRecipe.save()
            console.log("new recipe added successfully")
            await users.updateOne({_id: req.user._id}, { $push: { ownedRecipes: newRecipe._id } })
            console.log("new recipe added to users owned recipes collection")
            console.log("post request finnished, ending recipe/updateRecipe request")
            res.end(JSON.stringify({message: "success"}))
            return
        }
        catch {
            console.log("failed to save recipe, ending recipe/updateRecipe request")
            res.end(JSON.stringify({message: "server issue"}))
            return
        }
    } else {
        console.log("attempting to update recipe with _id:", req.body._id)
        try {
            const oldRecipe = await recipes.findOne({ _id: req.body._id},{owner: 1})
            if (oldRecipe.owner == req.user._id) {
                console.log("recipe owner verified")
                await recipes.updateOne( { _id: req.body._id}, { $set: recipeData } )
                console.log("recipe ", req.body._id, " has been updated, ending recipe/updateRecipe request")
                res.end(JSON.stringify({message: "success"}))
                return
            } else {
                console.log("owner of recipe ", req.body._id, " is not currently signed in, ending recipe/updateRecipe request")
                res.end(JSON.stringify({message: "server issue"}))
                return
            }
        }
        catch {
            console.log("failed to save recipe, ending recipe/updateRecipe request")
            res.end(JSON.stringify({message: "server issue"}))
            return
        }
    }
})



module.exports = router