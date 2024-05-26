const mongoose = require('mongoose')
const ingredient = require('./ingredient')

const recipeSchema = new mongoose.Schema({
    owner: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    image: {type: String, enum: ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']},
    ingredients: [String],
    instructions: [String],
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number,
    sodium: Number,
    fiber: Number,
})

module.exports = mongoose.model("recipe", recipeSchema)