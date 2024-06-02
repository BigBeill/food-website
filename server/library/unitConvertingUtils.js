/* 
expects a json file ingredient = {
  _id: string,
  amount: int,
  unit: string
}

returns total calculated nutrition value (in grams):
{
  calories: int
  protein: int
  fat: int
  carbohydrates: int
  sodium: int
  fiber: int
}
*/

const ingredients = require("../schemas/ingredient")

async function getNutrition(_id, amount, unit) {
  const ingredientData = await ingredients.findOne({_id: _id})

  let multiplyer = 0
  if (unit == "physical") { multiplyer = ingredientData.physical * amount }
  else if (unit == "milligram") { multiplyer = 0.001 * amount }
  else if (unit == "gram") { multiplyer = 1 * amount }
  else if (unit == "pound") { multiplyer = 453.592 * amount }
  else if (unit == "ounce") { multiplyer = 28.3495 * amount }
  else if (unit == "milliliter") { multiplyer = 0.001 * ingredientData.volume * amount }
  else if (unit == "liter") { multiplyer = ingredientData.volume * amount }
  else if (unit == "teaspoon") { multiplyer = 0.00492892 * ingredientData.volume * amount }
  else if (unit == "tablespoon") { multiplyer = 0.0147868 * ingredientData.volume * amount }
  else if (unit == "cup") { multiplyer = 0.24 * ingredientData.volume * amount }

  else{ throw "given unit not recognized by getNutrition" }

  const nutritionData = {
    calories: ingredientData.calories * multiplyer,
    fat: ingredientData.fat * multiplyer,
    cholesterol: ingredientData.cholesterol * multiplyer,
    sodium: ingredientData.sodium * multiplyer,
    potassium: ingredientData.potassium * multiplyer,
    carbohydrates: ingredientData.carbohydrates * multiplyer,
    fiber: ingredientData.fiber * multiplyer,
    sugar: ingredientData.sugar * multiplyer,
    protein: ingredientData.protein * multiplyer,
  }

  return nutritionData
}

module.exports.getNutrition = getNutrition