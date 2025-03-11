const postgresConnection = require('../config/postgres');

/*
accepts a list of ingredients and calculates there nutritional value

expected input:

  ingredientList = [
    ingredient: {
      foodId: int,
      measureId: int,
      amount: int
    }
  ]

returns:
  {
    calories: int,
    fat: int,
    cholesterol: int,
    sodium: int,
    potassium: int,
    carbohydrates: int,
    fibre: int,
    sugar: int,
    protein: int
  }  
*/
function ingredientListNutrition (ingredientList) {
  return new Promise( async (resolve, reject) => {

    try {
      let totalNutrients = { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 };

      for (const ingredient of ingredientList) {
        const nutritionData = await ingredientNutrition(ingredient);

        totalNutrients.calories += nutritionData.calories;
        totalNutrients.fat += nutritionData.fat;
        totalNutrients.cholesterol += nutritionData.cholesterol;
        totalNutrients.sodium += nutritionData.sodium;
        totalNutrients.potassium += nutritionData.potassium;
        totalNutrients.carbohydrates += nutritionData.carbohydrates;
        totalNutrients.fibre += nutritionData.fibre;
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

/*
accepts an ingredient and calculates its nutritional value

expected input: 
  ingredient = {
    foodId: int
    measureId: int (optional: assume measurement is 100g if none provided)
    amount: int (optional assuming measureId is not provided, otherwise required)
  }

returns:
  {
    calories: int,
    fat: int,
    cholesterol: int,
    sodium: int,
    potassium: int,
    carbohydrates: int,
    fibre: int,
    sugar: int,
    protein: int
  }
*/
function ingredientNutrition (ingredient) {
  return new Promise( async (resolve, reject) => {
    let nutrients;

    // collect base ingredient nutrition value (100g)
    try {

      const query = `SELECT nutrientid, nutrientvalue FROM nutrientamount WHERE foodid = $1 AND nutrientid IN (203, 204, 205, 208, 269, 291, 306, 307, 601) ORDER BY nutrientid;`;
      const values = [ingredient.foodId];
      const data = await postgresConnection.query(query, values);
      let nutritionData = data.rows;

      // if any data is missing, set it to 0
      {
        if (nutritionData[0].nutrientid != 203) nutritionData.splice(0, 0, { nutrientid: '203', nutrientvalue: '0' } );
        if (nutritionData[1].nutrientid != 204) nutritionData.splice(1, 0, { nutrientid: '204', nutrientvalue: '0' } );
        if (nutritionData[2].nutrientid != 205) nutritionData.splice(2, 0, { nutrientid: '205', nutrientvalue: '0' } );
        if (nutritionData[3].nutrientid != 208) nutritionData.splice(3, 0, { nutrientid: '208', nutrientvalue: '0' } );
        if (nutritionData[4].nutrientid != 269) nutritionData.splice(4, 0, { nutrientid: '269', nutrientvalue: '0' } );
        if (nutritionData[5].nutrientid != 291) nutritionData.splice(5, 0, { nutrientid: '291', nutrientvalue: '0' } );
        if (nutritionData[6].nutrientid != 306) nutritionData.splice(6, 0, { nutrientid: '306', nutrientvalue: '0' } );
        if (nutritionData[7].nutrientid != 307) nutritionData.splice(7, 0, { nutrientid: '307', nutrientvalue: '0' } );
        if (!nutritionData[8]) nutritionData.splice(8, 0, { nutrientid: '601', nutrientvalue: '0' } );
      }

      // put all values into a json file as parseInts
      nutrients = {
        calories: parseInt(nutritionData[3].nutrientvalue),
        fat: parseInt(nutritionData[1].nutrientvalue),
        cholesterol: parseInt(nutritionData[8].nutrientvalue),
        sodium: parseInt(nutritionData[7].nutrientvalue),
        potassium: parseInt(nutritionData[6].nutrientvalue),
        carbohydrates: parseInt(nutritionData[2].nutrientvalue),
        fibre: parseInt(nutritionData[5].nutrientvalue),
        sugar: parseInt(nutritionData[4].nutrientvalue),
        protein: parseInt(nutritionData[0].nutrientvalue)
      }

    }
    catch (error) {
      console.log('failed to collect nutritional data from database for ingredient:', ingredient);
      console.error('error:', error);
      reject('failed to collect nutrient data from database');
    }

    // if measureId is provided, calculate nutrition value after applying conversions
    try {
      if (ingredient.measureId){
        let conversionFactorValue;
        const amount = parseInt(ingredient.amount)

        //get the standard conversion rate for measureId
        {
          const query = `SELECT conversionfactorvalue FROM conversionfactor WHERE foodid = $1 AND measureid = $2 LIMIT 1`;
          const values = [ingredient.foodId, ingredient.measureId];
          const data = await postgresConnection.query(query, values);
          conversionFactorValue = parseInt(data.rows[0].conversionfactorvalue);
        }

        //set conversionFactorValue to represent the conversion to one single unit
        {
          const query = `SELECT measuredescription FROM measurename WHERE measureid = $1 LIMIT 1`;
          const values = [ingredient.measureId];
          const data = await postgresConnection.query(query, values);
          const brokenMeasureDescription = breakupMeasureDescription(data.rows[0].measuredescription);
          conversionFactorValue = conversionFactorValue / brokenMeasureDescription.integer;
        }

        // apply conversionFactorValue to each item in nutrition
        for (let item in nutrients) {
          nutrients[item] = (nutrients[item]/100) * conversionFactorValue * amount;
        }

      }
    }
    catch (error) {
      console.log('failed to convert nutritional value for ingredient:', ingredient);
      console.error('error:', error);
      reject('failed to convert nutritional value');
    }

    resolve(nutrients);
  })
}


/*
accepts an ingredientId and returns a list of all possible that ingredient can be measured in and there conversion values.
does not return grams as its assumed all ingredients can be measured in grams

expected input:
  ingredientId = int

returns:
  [{
    measureId: int,
    unit: string,
    value: int
  }]
*/
function conversionFactorList (ingredientId) {
  return new Promise( async (resolve, reject) => {

    // accumulate a list of every posable conversion and there values for provided ingredient
    try {
      let conversionOptions = [];
  
      // get a list of all possible conversions from database
      const query = `SELECT measureid, conversionfactorvalue FROM conversionfactor WHERE foodid = $1`;
      const values = [ingredientId];
      const possibleConversionsData = await postgresConnection.query(query, values);

      //go though all items in list of possible conversions and collect more detailed information
      for(const conversion of possibleConversionsData.rows){
        // get more detailed information about conversion from database
        const query = `SELECT measuredescription FROM measurename WHERE measureid = $1 LIMIT 1`;
        const values = [conversion.measureid];
        const data = await postgresConnection.query(query, values);

        // if conversion is found add to conversionOptions arrays
        if (data.rows[0]){
          const brokenString = breakupMeasureDescription(data.rows[0].measuredescription);
          conversionOptions.push({ measureId: conversion.measureid, unit: brokenString.string, value: conversion.conversionfactorvalue / brokenString.integer, });
        }
      }

      // remove any duplicate entries from conversionOptions array
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
    }
    catch (error) {
      console.error("error:", error);
      reject('failed to collect conversion information from database');
    }

  });
}

/*
accepts a string starting with a number and breaks it into an int and string
example:
  input: "12345 testing"
  output: { 12345, "testing" }
*/
function breakupMeasureDescription(measureDescription) {
  let integer = "";
  let denominator = "";
  let slashFound = false;
  let unitStart = 0;

  // go through each number in the string until a character is found
  for (let i = 0; i < measureDescription.length; i++) {
    if ( (!isNaN(measureDescription[i]) && measureDescription[i].trim() !== '') || measureDescription[i] == ".") {
      if(!slashFound) integer += measureDescription[i];
      else denominator += measureDescription[i];
    } 
    else if (measureDescription[i] == "/") slashFound = true;
    else{
      if (measureDescription[i] == " ") unitStart = i + 1;
      else unitStart = i;
      break;
    }
  }

  integer = parseInt(integer);
  if(denominator) integer = integer/parseInt(denominator);

  const string =  measureDescription.slice(unitStart);

  return { integer, string }
}

module.exports = {
  ingredientNutrition,
  ingredientListNutrition,
  conversionFactorList
}