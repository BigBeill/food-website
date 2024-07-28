const postgresConnection = require('../config/postgres');

function ingredientListNutrition (ingredientIDList) {
  return new Promise( async (resolve, reject) => {
    try {
      let totalNutrients = { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 };

      for (const ingredientID of ingredientIDList) {
        const nutritionData = await ingredientNutrition(ingredientID)
        totalNutrients.calories += nutritionData.calories;
        totalNutrients.fat += nutritionData.fat;
        totalNutrients.cholesterol += nutritionData.cholesterol;
        totalNutrients.sodium += nutritionData.sodium;
        totalNutrients.potassium += nutritionData.potassium;
        totalNutrients.carbohydrates += nutritionData.carbohydrates;
        totalNutrients.fibre += nutritionData.fiber;
        totalNutrients.sugar += nutritionData.sugar;
        totalNutrients.protein += nutritionData.protein;
      };

      resolve(totalNutrients)
    }
    catch{
      console.log('failed to collect nutrient data for list:', ingredientIDList);
      reject('failed to collect nutrient data from database');
    }
  })
}

function ingredientNutrition (ingredientId) {
  return new Promise( async (resolve, reject) => {
    try {

      const data = await postgresConnection.query(`SELECT nutrientid, nutrientvalue FROM nutrientamount WHERE foodid = ${ingredientId} AND nutrientid IN (203, 204, 205, 208, 269, 291, 306, 307, 601) ORDER BY nutrientid;`);
      
      let nutritionData = data.rows
      if (nutritionData[0].nutrientid != 203) { nutritionData.splice(0, 0, 0); }
      if (nutritionData[1].nutrientid != 204) { nutritionData.splice(1, 0, 0); }
      if (nutritionData[2].nutrientid != 205) { nutritionData.splice(2, 0, 0); }
      if (nutritionData[3].nutrientid != 208) { nutritionData.splice(3, 0, 0); }
      if (nutritionData[4].nutrientid != 269) { nutritionData.splice(4, 0, 0); }
      if (nutritionData[5].nutrientid != 291) { nutritionData.splice(5, 0, 0); }
      if (nutritionData[6].nutrientid != 306) { nutritionData.splice(6, 0, 0); }
      if (nutritionData[7].nutrientid != 307) { nutritionData.splice(7, 0, 0); }
      if (nutritionData[8].nutrientid != 601) { nutritionData.splice(8, 0, 0); }

      const nutrients = {
        calories: nutritionData[3].nutrientvalue,
        fat: nutritionData[1].nutrientvalue,
        cholesterol: nutritionData[8].nutrientvalue,
        sodium: nutritionData[7].nutrientvalue,
        potassium: nutritionData[6].nutrientvalue,
        carbohydrates: nutritionData[2].nutrientvalue,
        fibre: nutritionData[5].nutrientvalue,
        sugar: nutritionData[4].nutrientvalue,
        protein: nutritionData[0].nutrientvalue
      }
      resolve(nutrients);

    }
    catch (error) {
      console.log('failed to collect nutritional data from database for ingredient with id:', ingredientId);
      console.log('error:', error);
      reject('failed to collect nutrient data from database');
    }
  })
}

function conversionValueList (ingredientId) {
  return new Promise( async (resolve, reject) => {
    const conversionData = await postgresConnection.query(`SELECT measureid, conversionfactorvalue FROM conversionfactor where foodid=${ingredientId}`);

    let conversionOptions = [];
    let value

    for(const conversion of conversionData.rows){
      const measureData = await postgresConnection.query(`SELECT measuredescription FROM measuredescription WHERE measureid=${conversion.measureid}`);

      value = 0;
      measureDescription = measureData.rows[0].measuredescription;

      for (let index = 0; index < measureDescription.length; index++) {
        if (measureDescription.index){

        }
      }

    }
     
  })
}

module.exports = {
  ingredientListNutrition,
  ingredientNutrition
};