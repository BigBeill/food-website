const router = require("express").Router();
const ingredientController = require("../controllers/ingredient.controller")

router.get('/details', ingredientController.details);

router.get('/list', ingredientController.list);

router.get('/groups', ingredientController.groups);

module.exports = router;