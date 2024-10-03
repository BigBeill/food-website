const mongoConnection = require('../config/connectMongo') 
const { ObjectId } = require('mongodb');
const { ingredientListNutrition } = require('./canadianNutrientFileUtils')



/*
takes recipe information, makes sure all information provided is valid, and adds nutritional information 

expected input:
  recipe = {
    title: string,
    description: string,
    image: string,
    ingredients: [{
      foodId: int;
      measureId: int,
      amount: int
    }],
    instructions: [ string ]
  }
  userId = int
*/
function createRecipeSchema (recipe, userId) {

  return new Promise ( async (resolve, reject) => {

    console.log("creating recipe schema")

    // create schema
    let schema = {
      owner: userId,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    }
    
    let validData = {
      owner: false,
      title: false,
      description: false,
      image: false,
      ingredients: false,
      instructions: false
    }
  
    // make sure all required information is provided
    if(schema.owner && ObjectId.isValid(schema.owner)) validData.owner = true;
    if(schema.title && schema.title.length >= 3 && schema.title.length <= 60) validData.title = true;
    if(schema.description && schema.description.length >= 10 && schema.description.length <= 200) validData.description = true;
    if(schema.image) validData.image = true;

    //make sure all provided ingredients are valid
    if(schema.ingredients && schema.ingredients.length >= 1 && schema.ingredients.length <= 100){
      let key = true;
      schema.ingredients.forEach(ingredient => {
        if (!ingredient.foodId) key = false;
        if (!ingredient.measureId) key = false;
        if (!ingredient.amount) key = false;
      })
      validData.ingredients = key;
    }

    // make sure all provided instructions are valid
    if(schema.instructions && schema.instructions.length >= 1 && schema.instructions.length <= 100) {
      let key = true
      schema.instructions.forEach(instruction => {
        if (instruction.length < 3 || instruction.length > 300) {
          key = false
        }
      })
      validData.instructions = key
    }

    //check for any missing data (reject promise if found)
    for (let index in validData) { 
      if (!validData[index]) { 
        console.log("failed to create recipe schema:", validData);
        reject({status: 400, error: "recipe is missing valid " + index + " field." });
        return;
      }
    }

    //add the nutrition field to the schema
    try {
      schema.nutrition = await ingredientListNutrition(schema.ingredients);
      validData.ingredients = true;
    }
    catch (error) {
      console.error("failed to collect nutrition data:", error);
      reject("Issue getting nutrition value for ingredients:", schema.ingredients);
      return;
    }

    //if no data is missing, return schema
    console.log("successfully created recipe schema...");
    console.log(schema);
    resolve(schema);
  })
}

module.exports.createRecipeSchema = createRecipeSchema