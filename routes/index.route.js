const express = require('express')
const router = express.Router()
const recipes = require('../schemas/recipe')



// ------------ index get routes ------------
router.get("/", async (req, res) => {
    var result
    result = await recipes.find()
    res.render("index", {recipes: result})
})

router.get("/search", async (req, res) => {
    var result
    res.render("index", {recipes: result})
})



// ------------ index post routes ------------



module.exports = router