const router = require("express").Router()



// ------------ Tools Get Routes ------------

router.get('/getFlash', (req, res) => {
    console.log("tools/getFlash get request triggered...")

    var flashMessage = req.flash()
    console.log(flashMessage)
    res.json({flashMessage: flashMessage})
})



module.exports = router