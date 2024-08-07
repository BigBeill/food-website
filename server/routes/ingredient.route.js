const router = require("express").Router();
const postgresConnection = require('../config/postgres');
const ingredientNutrition = require('../library/canadianNutrientFileUtils').ingredientNutrition;

router.get('/', (req, res) => {
  const foodGroupID = req.query.foodGroupId;
  postgresConnection.query(`select * from foodname where foodgroupid=${foodGroupID}`)
  .then(data => res.status(200).json(data.rows));
});

router.get('/details', async (req, res) => {
  let ingredientData = {};

  const foodId = req.query.foodId;
  ingredientData.id = foodId;

  const ingredientName = await postgresConnection.query(`select fooddescription from foodname where foodid=${foodId}`);
  ingredientData.name = ingredientName.rows[0].fooddescription;

  ingredientData.nutrition = await ingredientNutrition(foodId);

  const conversionData = await postgresConnection.query(`select measureid, ConversionFactorValue from conversionfactor where foodid=${foodId} `);
  let conversionInfo = conversionData.rows;
  for (let conversion of conversionInfo){
    const measureDescription = await postgresConnection.query(`select measuredescription from measurename where measureid=${conversion.measureid}`);
    conversion.measureDescription = measureDescription.rows[0].measuredescription;
  }
  ingredientData.conversionInfo = conversionInfo;

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