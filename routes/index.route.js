const express = require('express')
const router = express.Router()
const mongoConnection = require('../config/connectMongo')
const processQuery = require('../models/mongoQuery')
const recipes = require('../schemas/recipe')

router.get("/", async (req, res) => {
    var resault
    resault = await recipes.find()
    res.render("index", {recipes: resault})
})

module.exports = router