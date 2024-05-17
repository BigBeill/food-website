const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    owner: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    image: {type: String, enum: ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']},
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number,
    sodium: Number,
    fiber: Number,
})

module.exports = mongoose.model("recipe", recipeSchema)