/* 
expects a json file ingredient = {
  name: string,
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

async function getNutrition(ingredient) {
  console.log("data")
  const ingredientData = await ingredients.findOne({name: ingredient.name})
  
  console.log("ingredient data ", ingredientData)

  let multiplyer = 0
  if (ingredient.unit == "physical") { multiplyer = 1/ingredientData.physical}

  console.log("multiplyer = ", multiplyer)

  const nutritionData = {
    calories: ingredientData.calories * multiplyer,
    protein: ingredientData.protein * multiplyer,
    fat: ingredientData.fat * multiplyer,
    carbohydrates: ingredientData.carbohydrates * multiplyer,
    sodium: ingredientData.sodium * multiplyer,
    fiber: ingredientData.fiber * multiplyer
  }

  console.log("nutrition data for ", ingredient.amount, " ", ingredient.unit, " of ", ingredient.name, ": ", nutritionData)
  return nutritionData
}

module.exports.getNutrition = getNutrition