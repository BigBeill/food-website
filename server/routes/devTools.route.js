const router = require("express").Router()
const { json } = require("express")
const mongoConnection = require('../config/connectMongo') 
const ingredients = mongoConnection.models.ingredient



// ---------- devTools post routes ------------

// takes 13 arguments from body:
//   name, unitType: string
//   physical volume, calories, fat, cholesterol, sodium, potassium, carbohydrates, fiber, sugar, protein: int

// route will:
//   take all data provided and save as a new ingredient in database

// if arguments are not provided:
//   name, unitType, calories, fat, cholesterol, sodium, potassium, carbohydrates, fiber, sugar, protein: no recipe will be saved
//   physical, volume
router.post('/addIngredient', async (req, res) => {

  // print to console all data route will be useing
  console.log("\x1b[36m%s\x1b[0m", "devTools/addIngredient", "post request received")
  console.log()
  console.log("required information")
  console.log("            name:", req.body.name)
  console.log("        unitType:", req.body.unitType)
  console.log("        calories:", req.body.calories)
  console.log("             fat:", req.body.fat)
  console.log("     cholesterol:", req.body.cholesterol)
  console.log("          sodium:", req.body.sodium)
  console.log("       potassium:", req.body.potassium)
  console.log("   carbohydrates:", req.body.carbohydrates)
  console.log("           fiber:", req.body.fiber)
  console.log("           sugar:", req.body.sugar)
  console.log("         protein:", req.body.protein)
  console.log()
  console.log("optional information")
  console.log("        physcial:", req.body.physical)
  console.log("          volume:", req.body.volume)
  console.log()

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

  console.log("checking for bad data")
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

  if (missingData) {
    console.log("important data missing, ending devTools/addIngredient request")
    res.end(JSON.stringify({message: "failed"}))
    return
  }
  
  console.log("checking database for ingredient")
  var result = await ingredients.find({name: req.body.name})
  if (!result.length == 0){
    console.log("ingredient already exists, ending devTools/addIngredient request")
    res.end(JSON.stringify({message: "failed"}))
    return
  }

  console.log("no bad data found")
  console.log("attempting to save ingredient in database: ")
  console.log(newIngredient)
  try {
  newIngredient.save()
  .then(() => {
    console.log("new ingredint saved, ending devTools/addIngredient request")
    res.end(JSON.stringify({message: "success"}))
    return
  })
  } catch {
    console.log("server failed to save new ingredint, ending devTools/addIngredient request")
    res.end(JSON.stringify({message: "failed"}))
    return
  }
})

module.exports = router