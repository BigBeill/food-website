const ingredients = require("../schemas/ingredient")

/* 
expects aa array of json files with ingredient _id, amount, unit:
[{
  _id: string,
  amount: int,
  unit: string
}]

returns total calculated nutrition value of all ingredients combined (in grams):
{
  calories: int,
  fat: int,
  cholesterol: int,
  sodium: int,
  potassium: int,
  carbohydrates: int,
  fiber: int,
  sugar: int,
  protein: int,
}
*/
async function getNutrition(ingredients) {
  let totalNutrition = {
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
  for (const ingredient of ingredients){
    const nutrition = await ingredientNutrition(ingredient._id, ingredient.amount, ingredient.unit)
    totalNutrition.calories += nutrition.calories
    totalNutrition.fat += nutrition.fat
    totalNutrition.cholesterol += nutrition.cholesterol
    totalNutrition.sodium += nutrition.sodium
    totalNutrition.potassium += nutrition.potassium
    totalNutrition.carbohydrates += nutrition.carbohydrates
    totalNutrition.fiber += nutrition.fiber
    totalNutrition.sugar += nutrition.sugar
    totalNutrition.protein += nutrition.protein
  }

  return totalNutrition
}

async function ingredientNutrition(_id, amount, unit) {
  const ingredientData = await ingredients.findOne({_id: _id})

  let multiplier = 0
  if (unit == "physical") { multiplier = ingredientData.physical * amount }
  else if (unit == "milligram") { multiplier = 0.001 * amount }
  else if (unit == "gram") { multiplier = 1 * amount }
  else if (unit == "pound") { multiplier = 453.592 * amount }
  else if (unit == "ounce") { multiplier = 28.3495 * amount }
  else if (unit == "milliliter") { multiplier = 0.001 * ingredientData.volume * amount }
  else if (unit == "liter") { multiplier = ingredientData.volume * amount }
  else if (unit == "teaspoon") { multiplier = 0.00492892 * ingredientData.volume * amount }
  else if (unit == "tablespoon") { multiplier = 0.0147868 * ingredientData.volume * amount }
  else if (unit == "cup") { multiplier = 0.24 * ingredientData.volume * amount }

  else{ throw "given unit not recognized by getNutrition" }

  const nutritionData = {
    calories: ingredientData.calories * multiplier,
    fat: ingredientData.fat * multiplier,
    cholesterol: ingredientData.cholesterol * multiplier,
    sodium: ingredientData.sodium * multiplier,
    potassium: ingredientData.potassium * multiplier,
    carbohydrates: ingredientData.carbohydrates * multiplier,
    fiber: ingredientData.fiber * multiplier,
    sugar: ingredientData.sugar * multiplier,
    protein: ingredientData.protein * multiplier,
  }

  return nutritionData
}

module.exports.getNutrition = getNutrition