const express = require('express')
const router = express.Router()

const connection = require('../config/connectDB')

router.get("/", (req, res) => {
    var foundRecipes
    connection.query("SELECT * FROM `recipes`",
        function (err, results) {foundRecipes = results 
            console.log(results)})
    console.log(foundRecipes)
    res.render("index", {recipes: foundRecipes})
})

module.exports = router