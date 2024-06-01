const mongoose = require("mongoose")

// all data inputed should be relavent to 1 gram
const ingredientSchema = new mongoose.Schema({
  name: String,
  physical: Number, // how much of this item would equal 1 gram
  volume: Number, // how many liters of this item would equal 1 gram
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