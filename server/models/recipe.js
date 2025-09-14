const mongoose = require('mongoose')
const ImageSchema = require('./image');

const recipeSchema = new mongoose.Schema({
    owner: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    image: { type: ImageSchema, default: null },
    ingredients: [{
        foodId: Number,
        label: String,
        portion: {
            measureId: Number,
            amount: Number
        }
    }],
    instructions: [String],
    nutrition: {
        calories: Number,
        fat: Number,
        cholesterol: Number,
        sodium: Number,
        potassium: Number,
        carbohydrates: Number,
        fibre: Number,
        sugar: Number,
        protein: Number,
    },
    visibility: {type: String, enum: ['public', 'private', 'personal'], default: 'public'},
})

module.exports = mongoose.model("recipe", recipeSchema)