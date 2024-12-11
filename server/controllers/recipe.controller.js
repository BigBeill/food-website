const { createRecipeSchema } = require("../library/validSchemaUtils");
const recipes = require("../models/recipe");
const users = require("../models/user");

exports.data = async (req, res) => {
   const { _id } = req.query

   // find recipe in database
   const data = await recipes.findOne({ _id:_id })
   .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "database error finding recipe" });
   });

   // return error if recipe does not exist
   if(!data) return res.status(404).json({ error: "recipe with _id does not exist in database"});

   //return recipe data to client
   return res.status(200).json({ message: "recipe found", payload: data})
}






exports.packageIncoming = async (req, res, next) => {
   if(!req.user) return res.status(401).json({ error: 'user not signed in' });

   const { title, description, image, ingredients, instructions } = req.body;
   const clientRecipeData = { title, description, image, ingredients, instructions };

   const response = await createRecipeSchema(clientRecipeData, req.user._id)
   .catch((error) => {
      try {
         return res.status(error.status).json({ error: error.message});
      }
      catch (error) {
         console.error(error);
         return res.status(500).json({ error: "server failed to provide valid error response" });
      }
   });

   req.recipeSchema = response;
   next();
}






exports.add = async (req, res) => {
   const newRecipe = await new recipes(req.recipeSchema)
   .save()
   .catch ((error) => { 
      console.error(error);
      return res.status(500).json({ error: 'failed to save new recipe in database' });
   });

   await users.updateOne({_id: req.user._id}, { $push: { ownedRecipes: newRecipe._id } })
   .catch ((error) => {
      console.error(error);
      return res.status(500).json({ error: 'failed to add new recipe to users list of owned recipes' });
   });

   return res.status(201).json({ message: 'new recipe created' });
}


exports.update = async (req, res) => {
   // check if _id exists in the body
   if (!req.body._id) return res.status(400).json({ error: 'no recipe id provided' });

   // find recipe being updated in database
   const recipe = await recipes.findOne({_id: req.body._id})
   .catch ((error) => { 
      console.error(error)
      return res.status(500).json({error: 'failed to find recipe in database' }) 
   })

   // make sure current user is the owner of found recipe
   if (!recipe.owner == req.user) return res.status(401).json({ error: 'current user is not the owner of the recipe' });

   // update recipe in database
   await recipes.updateOne({_id: req.body._id}, {$set: req.recipeSchema})
   .catch((error) => { 
      console.error(error);
      return res.status(500).json({ error: 'failed to save the recipe' }); 
   })
   
   return res.status(200).json({ message: 'recipe saved successfully' });
}