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
router.post('/addIngredient', (req, res) => {
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

  var missingData = false
  for (const key in ingredientData) {
    if (ingredientData[key].length == 0) {
      missingData = true
    }
  }

  if (!missingData){
    newIngredient.save()
    .then((ingredient) => {console.log(ingredient)})
  }

  res.end()
})

module.exports = router