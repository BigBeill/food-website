const mongoose = require("mongoose")

const ingredientSchema = new mongoose.Schema({
  name: String,
  unitType: {type: String, enum: ['grams', 'milliliters', 'none', 'cups']},
  calories: Number,
  protein: Number,
  fat: Number,
  carbohydrates: Number,
  sodium: Number,
  fiber: Number,
})

module.exports = mongoose.model("ingredient", ingredientSchema)