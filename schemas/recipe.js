const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    owner: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    image: {type: String, enum: ['129374', '127789', '127828']}
})

module.exports = mongoose.model("recipe", recipeSchema)