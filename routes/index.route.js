const express = require('express')
const router = express.Router()

const processQuery = require('../models/dbQuery')

router.get("/", async (req, res) => {
    var result
    if (req.query.search)
        result = await processQuery("SELECT * FROM `recipes` WHERE `title` LIKE '%" + req.query.search + "%'")
    else
        result = await processQuery("SELECT * FROM `recipes`")
    res.render("index", {recipes: result})
})

module.exports = router