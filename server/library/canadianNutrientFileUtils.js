const postgresConnection = require('../config/postgres');

function ingredientListNutrition (ingredientIDList) {
  return new Promise( async (resolve, reject) => {
    try {
      let totalNutrients = { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 };

      for (const ingredientID of ingredientIDList) {
        const nutritionData = await ingredientNutrition(ingredientID);
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
    catch (error) {
      console.log('failed to collect nutrient data for list:', ingredientIDList);
      console.error(error)
      reject('failed to collect nutrient data from database');
    }
  })
}

function ingredientNutrition (ingredientId) {
  return new Promise( async (resolve, reject) => {
    try {

      const data = await postgresConnection.query(`SELECT nutrientid, nutrientvalue FROM nutrientamount WHERE foodid = ${ingredientId} AND nutrientid IN (203, 204, 205, 208, 269, 291, 306, 307, 601) ORDER BY nutrientid;`);
      
      // if any data is missing, set it to 0
      let nutritionData = data.rows;
      if (nutritionData[0].nutrientid != 203) nutritionData.splice(0, 0, { nutrientid: '203', nutrientvalue: '0' } );
      if (nutritionData[1].nutrientid != 204) nutritionData.splice(1, 0, { nutrientid: '204', nutrientvalue: '0' } );
      if (nutritionData[2].nutrientid != 205) nutritionData.splice(2, 0, { nutrientid: '205', nutrientvalue: '0' } );
      if (nutritionData[3].nutrientid != 208) nutritionData.splice(3, 0, { nutrientid: '208', nutrientvalue: '0' } );
      if (nutritionData[4].nutrientid != 269) nutritionData.splice(4, 0, { nutrientid: '269', nutrientvalue: '0' } );
      if (nutritionData[5].nutrientid != 291) nutritionData.splice(5, 0, { nutrientid: '291', nutrientvalue: '0' } );
      if (nutritionData[6].nutrientid != 306) nutritionData.splice(6, 0, { nutrientid: '306', nutrientvalue: '0' } );
      if (nutritionData[7].nutrientid != 307) nutritionData.splice(7, 0, { nutrientid: '307', nutrientvalue: '0' } );
      if (!nutritionData[8]) nutritionData.splice(8, 0, { nutrientid: '601', nutrientvalue: '0' } );

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
      console.error('error:', error);
      reject('failed to collect nutrient data from database');
    }
  })
}

function conversionFactorList (ingredientId) {
  return new Promise( async (resolve, reject) => {
    let conversionOptions = [];
 
    // get a list of all possible conversions from database
    const conversionData = await postgresConnection.query(`SELECT measureid, conversionfactorvalue FROM conversionfactor where foodid=${ingredientId}`);

    let value, denominator, slashFound, unitStart, measureDescription;
    for(const conversion of conversionData.rows){
      value = "";
      denominator = "";
      slashFound = false;
      unitStart = 0;


      const measureData = await postgresConnection.query(`SELECT measuredescription FROM measurename WHERE measureid=${conversion.measureid}`);
      if (measureData.rows[0]){
        measureDescription = measureData.rows[0].measuredescription;

        // go through each character in the string until final number is found
        for (let i = 0; i < measureDescription.length; i++) {
          if ( (!isNaN(measureDescription[i]) && measureDescription[i].trim() !== '') || measureDescription[i] == ".") {
            if(!slashFound) value += measureDescription[i];
            else denominator += measureDescription[i];
          } 
          else if (measureDescription[i] == "/") slashFound = true;
          else{
            if (measureDescription[i] == " ") unitStart = i + 1;
            else unitStart = i;
            break;
          }
        }

        value = parseInt(value);
        if(denominator) value = value/parseInt(denominator);

        conversionOptions.push({ measureId: conversion.measureid, unit: measureDescription.slice(unitStart), value: conversion.conversionfactorvalue / value, });
      }
    }

    // remove any duplicate entries
    for (let i = conversionOptions.length - 1;  i >= 0; i--) {
      if (conversionOptions[i].unit == 'g') conversionOptions.splice(i, 1);
      else {
        for(let j = i-1; j >=0; j--) {
          if (conversionOptions[i].unit == conversionOptions[j].unit) {
            conversionOptions.splice(j, 1);
            i--;
          }
        }
      }
    }

    resolve (conversionOptions);
  });
}

module.exports.ingredientNutrition = ingredientNutrition;
module.exports.ingredientListNutrition = ingredientListNutrition;
module.exports.conversionFactorList = conversionFactorList;