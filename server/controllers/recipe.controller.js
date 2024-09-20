const { createRecipeSchema } = require("../library/validSchemaUtils");
const recipes = require("../models/recipe");

exports.data = async (req, res) => {
   const _id = req.query._id
   if (!_id) { return res.status(400).json({ error: "_id not provided" }) }

   try {
      const data = await recipes.findOne({ _id:_id })
      if (!data) { return res.status(404).json({ error: "recipe with _id does not exist in database"})}
      else { return res.status(200).json(data) }
   } 
   catch { return res.status(500).json({ error: "database error finding recipe" }) }
}






exports.packageIncoming = async (req, res, next) => {
   if(!req.user) return res.status(401).json({ error: 'user not signed in' });

   const { title, description, image, ingredients, instructions } = req.body;
   const clientRecipeData = { title, description, image, ingredients, instructions };

   createRecipeSchema(clientRecipeData, req.user._id)
   .then(response => {
      req.recipeSchema = response;
      next();
   })
   .catch(response => {
      try {
         console.log("failed to create recipe schema:", response.error);
         return res.status(response.status).json({ error: response.error});
      }
      catch {
         console.log("failed to send error code to client using response from createRecipeSchema:", response);
         return res.status(500).json({ error: "server failed to provide valid error response" });
      }
   });
}






exports.add = async (req, res) => {
   new recipes(req.recipeSchema)
   .save()
   .then((newRecipe) => {
      users.updateOne({_id: req.user._id}, { $push: { ownedRecipes: newRecipe._id } });
      return res.status(201).json({ response: 'new recipe created', newObject: newRecipe });
   })
   .catch ((error) => { 
      return res.status(500).json({error: 'failed to save new recipe in database:' + error });
   });
}






exports.update = async (req, res) => {
   if (!req.body.id) return res.status(400).json({ error: 'no recipe id provided' });

   recipes.findOne({_id: req.body.id})
   .then((recipe) => {

      if (!recipe.owner == req.user) return res.status(401).json({ error: 'current user is not the owner of the recipe' });

      recipes.updateOne({_id: req.body.id}, {$set: req.recipeSchema})
      .then(() => { return res.status(200).json({ message: 'recipe saved successfully' }); })
      .catch(() => { return res.status(500).json({ error: 'failed to save the recipe' }); })
   })
   .catch ((error) => { 
      return res.status(500).json({error: 'failed to find recipe in database:' + error }) 
   })
}