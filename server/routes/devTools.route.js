const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const ingredients = mongoConnection.models.ingredient



// ---------- devTools post routes ------------

// takes 8 arguments from body:
//   name, unitType: string
//   calories, protein, fat, carbohydrates, sodium, fiber: int

// route will:
//   take all data provided and save as a new ingredient in database

// if arguments are not provided:
//   name, unitType, calories, protein, fat, carbohydrates, sodium, fiber: no recipe will be saved
router.post('/addIngredient', async (req, res) => {
  console.log("/devTools/addIngredient post request triggered...")
  const newIngredient = new ingredients ({
    name: req.body.name,
    unitType: req.body.unitType,
    calories: req.body.calories,
    protein: req.body.protein,
    fat: req.body.fat,
    carbohydrates: req.body.carbohydrates,
    sodium: req.body.sodium,
    fiber: req.body.fiber,
  })

  console.log(newIngredient)
  var missingData = false
  if (newIngredient.name.length == 0) { missingData = true}
  if (newIngredient.unitType.length == 0) { missingData = true}
  if (newIngredient.calories.length == 0) { missingData = true}
  if (newIngredient.protein.length == 0) { missingData = true}
  if (newIngredient.fat.length == 0) { missingData = true}
  if (newIngredient.carbohydrates.length == 0) { missingData = true}
  if (newIngredient.sodium.length == 0) { missingData = true}
  if (newIngredient.fiber.length == 0) { missingData = true}
  console.log(missingData)

  var result = await ingredients.find({name: req.body.name})
  console.log(result)

  if (!missingData && result.length == 0){
    newIngredient.save()
    .then((ingredient) => {console.log(ingredient)})
  }

  res.end()
})

module.exports = router