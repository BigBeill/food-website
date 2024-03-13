const router = require("express").Router()

router.get("/list", (req, res) => {
    console.log("user/friends/list get request triggered...")
    res.render('user/friends')
})

router.get("/requests", (req, res) => {

})

router.get("/search", (req, res) => {
    
})

module.exports = router