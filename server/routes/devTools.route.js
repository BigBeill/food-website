const router = require("express").Router()
const mongoConnection = require('../config/connectMongo') 
const ingredient = require("../schemas/ingredient")
const ingredients = mongoConnection.models.ingredient
const ingredientSchema = require("../schemas/ingredient")



// ---------- devTools post routes ------------

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

  newIngredient.save()
  .then((ingredient) => {console.log(ingredient)})

  res.end()
})

module.exports = router