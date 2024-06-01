const router = require("express").Router()
const { json } = require("express")
const mongoConnection = require('../config/connectMongo') 
const ingredients = mongoConnection.models.ingredient



// ---------- devTools post routes ------------

// takes 10 arguments from body:
//   name, unitType: string
//   physical volume, calories, protein, fat, carbohydrates, sodium, fiber: int

// route will:
//   take all data provided and save as a new ingredient in database

// if arguments are not provided:
//   name, unitType, calories, protein, fat, carbohydrates, sodium, fiber: no recipe will be saved
//   physical, volume
router.post('/addIngredient', async (req, res) => {
  console.log("/devTools/addIngredient post request triggered...")
  const newIngredient = new ingredients ({
    name: req.body.name,
    physical: req.body.physical,
    volume: req.body.volume,
    unitType: req.body.unitType,
    calories: req.body.calories,
    fat: req.body.fat,
    cholesterol: req.body.cholesterol,
    sodium: req.body.sodium,
    potassium: req.body.potassium,
    carbohydrates: req.body.carbohydrates,
    fiber: req.body.fiber,
    sugar: req.body.sugar,
    protein: req.body.protein,
  })

  var missingData = false
  if (newIngredient.name.length == 0) { missingData = true}
  if (newIngredient.calories.length == 0) { missingData = true}
  if (newIngredient.fat.length == 0) { missingData = true}
  if (newIngredient.cholesterol.length == 0) { missingData = true}
  if (newIngredient.sodium.length == 0) { missingData = true}
  if (newIngredient.potassium.length == 0) { missingData = true}
  if (newIngredient.carbohydrates.length == 0) { missingData = true}
  if (newIngredient.fiber.length == 0) { missingData = true}
  if (newIngredient.sugar.length == 0) { missingData = true}
  if (newIngredient.protein.length == 0) { missingData = true}
  
  var result = await ingredients.find({name: req.body.name})

  if (!missingData && result.length == 0){
    try {
    newIngredient.save()
    .then((ingredient) => {
      console.log(ingredient)
      res.end(JSON.stringify({message: "success"}))
      return
    })
    } catch {
      res.end(JSON.stringify({message: "failed"}))
    }
  } else { 
    res.end(JSON.stringify({message: "failed"}))
  }
})

module.exports = router