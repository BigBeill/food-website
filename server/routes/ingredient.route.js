const router = require("express").Router();
const postgresConnection = require('../config/postgres');
const { ingredientNutrition, conversionFactorList } = require('../library/canadianNutrientFileUtils');

router.get('/', (req, res) => {
  const foodGroupID = req.query.foodGroupId;
  postgresConnection.query(`select * from foodname where foodgroupid=${foodGroupID}`)
  .then(data => res.status(200).json(data.rows));
});

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

router.get('/list', async (req, res) => {
  const foodName = req.query.foodName || '';
  const limit = parseInt(req.query.limit) || 1;
  const listData = await postgresConnection.query(`select * from foodname where name like '%' || ${foodName} || '%' limit ${limit}`);
})

router.get('/groups', (req, res) => {
  postgresConnection.query('select * from foodgroup')
  .then(data => res.status(200).json(data.rows));
});

module.exports = router;