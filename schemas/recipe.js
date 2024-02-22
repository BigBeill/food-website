const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    owner: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
})

module.exports = mongoose.model("recipe", recipeSchema)