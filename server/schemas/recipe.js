const mongoose = require('mongoose')
const ingredient = require('./ingredient')

const recipeSchema = new mongoose.Schema({
    owner: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    image: {type: String, enum: ['🧀', '🥞', '🍗', '🍔','🍞', '🥯', '🥐','🥨','🍗','🥓','🥩','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🥚','🍳','🥘','🥣','🥗','🍿','🧂','🥫']},
    ingredients: [{
        _id: mongoose.SchemaTypes.ObjectId,
        name: String,
        unit: String,
        amount: Number
    }],
    instructions: [String],
    nutrition: {
        calories: Number,
        fat: Number,
        cholesterol: Number,
        sodium: Number,
        potassium: Number,
        carbohydrates: Number,
        fiber: Number,
        sugar: Number,
        protein: Number,
    }
})

module.exports = mongoose.model("recipe", recipeSchema)