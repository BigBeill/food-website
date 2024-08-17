const postgresConnection = require('../config/postgres');
const { ingredientNutrition, conversionFactorList, ingredientListNutrition } = require('../library/canadianNutrientFileUtils');





exports.details = async (req, res) => {
   const foodId = req.query.foodId;
   if (!foodId) return res.status(400).json({ error:'foodId not provided' })

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
}






exports.list = async (req, res) => {
   const {foodDescription, foodGroupId, limit} = req.query

   // find all ingredients with given key words
   let query = 'SELECT foodid, FoodDescription FROM foodname ';
   let values = [];
   if (foodDescription) {
      values = foodDescription.split(" ");
      values = values.map(substring => `%${substring}%`);
      query += 'WHERE fooddescription ILIKE $1 ';
      for (let i = 2; i <= values.length; i++) query += `AND fooddescription ILIKE $${i} `;
   }

   // add foodGroup restriction
   if (foodGroupId) {
      if (values.length == 0) query += 'WHERE ';
      else query += 'AND ';
      values.push(foodGroupId);
      query += `foodgroupid=$${values.length} `;
   }

   // tag the limit on to the end of the query
   if (limit) {
      values.push(limit);
      query += `LIMIT $${values.length}`;
   }

   console.log('sending query to postgre');
   console.log('query:', query);
   console.log('values:', values);
   const data = await postgresConnection.query(query, values);
   return res.status(200).json(data.rows);
}






exports.groups = async (req, res) => {
   const data = await postgresConnection.query('select * from foodgroup');
   return (res.status(200).json(data.rows));
};