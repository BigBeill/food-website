const router = require("express").Router();
const ingredientController = require("../controllers/ingredient.controller")

router.get('/details', (req, res, next) => {
   if (!req.query.foodId) return res.status(400).json({ error:'foodId not provided' });
   next();
}
,ingredientController.details);

router.get('/list', ingredientController.list);

router.get('/groups', ingredientController.groups);

module.exports = router;