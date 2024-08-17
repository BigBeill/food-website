const router = require("express").Router();
const ingredientController = require("../controllers/ingredient.controller")
const postgresConnection = require('../config/postgres');
const { ingredientNutrition, conversionFactorList, ingredientListNutrition } = require('../library/canadianNutrientFileUtils');

router.get('/details', async (req, res) => {
  const foodId = req.query.foodId;

  let ingredientData = { id: foodId };

  // get ingredient name from database
  const ingredientName = await postgresConnection.query(`select fooddescription from foodname where foodid=${foodId}`);
  ingredientData.name = ingredientName.rows[0].fooddescription;

  // get ingredients nutritional value (per 100 grams)
  ingredientData.nutrition = await ingredientNutrition(foodId);

  console.log("setting conversion values")
  // get all possible conversion values for ingredient
  ingredientData.conversionFactors = await conversionFactorList(foodId);

  console.log("sending response");
  return res.status(200).json(ingredientData);
});

router.get('/list', ingredientController.list);

router.get('/groups', ingredientController.groups);

module.exports = router;