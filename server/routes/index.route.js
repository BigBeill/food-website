const express = require('express')
const router = express.Router()
const mongoConnection = require('../config/connectMongo')
const processQuery = require('../models/mongoQuery')
const recipes = require('../schemas/recipe')



// ------------ index get requests ------------
router.get("/", async (req, res) => {
    console.log("index/ get request triggered...")
    var result
    result = await recipes.find()
    res.render("index", {recipes: result})
})

router.get("/search", async (req,res) => {
    console.log("index/search get request triggered...")
    var result
    result = await recipes.find({"title": {'$regex': req.query.term}})
    res.render("index", {recipes: result})
})



module.exports = router