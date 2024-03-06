const express = require('express')
const router = express.Router()
const mongoConnection = require('../config/connectMongo')
const processQuery = require('../models/mongoQuery')
const recipes = require('../schemas/recipe')

router.get("/", async (req, res) => {
    var result
    result = await recipes.find()
    res.render("index", {recipes: result})
})

module.exports = router