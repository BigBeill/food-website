const mongoose = require("mongoose")

// all data imputed should be relevant to 1 gram
const ingredientSchema = new mongoose.Schema({
  name: String,
  physical: Number, // how many grams one unit of this item is worth
  volume: Number, // how many grams one liter of this item is worth
  unitType: [{type: String, enum: ['physical', 'weight', 'volume']}],
  calories: Number,
  fat: Number,
  cholesterol: Number,
  sodium: Number,
  potassium: Number,
  carbohydrates: Number,
  fiber: Number,
  sugar: Number,
  protein: Number,
})

module.exports = mongoose.model("ingredient", ingredientSchema)