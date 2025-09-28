const recipeUtils = require("../library/recipeUtils");
const userUtils = require("../library/userUtils");
const Recipe = require("../models/recipe");
const User = require("../models/user");
const volumeUtils = require("../library/volumeUtils");

// IMPORTANT: go to server/routes/recipe.router.js for a more detailed explanations



/*
finds a recipeObject based of id provided
@route: GET /recipe/getObject
*/
exports.getObject = async (req, res) => {

   const userId = req.user?._id;
   const { recipeId, includeNutrition = false } = req.params;

   const recipe = {
      _id: recipeId
   }

   // get recipe object from recipeUtils
   let recipeObject;
   try {
      recipeObject = await recipeUtils.verifyObject(recipe, true, includeNutrition);
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.getObject failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: 'server failed to convert provided data into a recipe object' })
   }

   // return recipe if client is the owner or the recipe is public
   if (recipeObject.visibility == "public") { return res.status(200).json({ message: "recipe object found", payload: recipeObject }); }

   //else: logic for handling the return of non-public recipes
   
   // check if the user is signed in, and return the recipe if they are the owner
   if (!userId) { return res.status(401).json({ error: "user must be signed in to access a non public recipe" }); }
   if (recipeObject.owner == userId) { return res.status(200).json({ message: "recipe object found", payload: recipeObject }); }

   // reject the request if the recipe is personal
   if (recipeObject.visibility == "personal") { return res.status(403).json({ error: "current user does not have read access to the recipe" }); }

   // check if the user is friends with the owner of the recipe
   let isFriend;
   try {
      isFriend = await userUtils.isFriend({ _id: userId }, recipeObject.owner);
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.getObject failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: 'server failed to verify if the client has read access to the recipe' });
   }

   // return recipe if they are friends
   if (isFriend) { return res.status(200).json({ message: "recipe object found", payload: recipeObject }); }
   else { return res.status(403).json({ error: "current user does not have read access to the recipe" }); }
}



/*
finds a list of recipes in the database that match the query parameters
@route: GET /recipe/find
*/
exports.find = async (req, res) => {

   // get query parameters from request
   const { title, foodIdList, limit = 6, skip = 0, count, category = 'public', includeNutrition = false } = req.query;
   const userId = req.user?._id;

   // make sure user is signed in if visibility is not public
   if ( category != 'public' && !userId) { return res.status(401).json({ error: "user must be signed in to access a non public visibility" }); }
   
   let recipeData = [];
   let query = {};

   // only return public recipes if category is public
   if (category == "public") { query.visibility = "public"; }

   // if searching the friends category, get an array of all friends and attach them to the query
   if (category == "friends") {
      let friendList;
      // get a list of user _ids that the current user is friends with
      try {
         friendList = await userUtils.getFriendList({_id: userId}, false);
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "recipe.controller.find failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to define valid user _ids for query" });
      }

      // add the friend _ids to the query
      query.owner = { $in: friendList };
      query.visibility = { $in: ["public", "friends"] }; // only return public and friends recipes
   }

   // if searching the personal category, attach current users id to the query
   if (category == "personal") { query.owner = userId; }

   // attach additional search fields to the query
   if (title) { query.title = { $regex: new RegExp(title, 'i') } }
   if (foodIdList) { query["ingredients.foodId"] = { $all: foodIdList }; }

   // conduct the database search
   let recipeObjectArray = [];
   try {
      recipeData = await Recipe.find(query)
         .limit(limit)
         .skip(skip);

      // make sure each recipe found is converted into a recipeObject
      recipeObjectArray = await Promise.all(recipeData.map((recipe) => { return recipeUtils.verifyObject(recipe, true, includeNutrition); }));
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.find failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to find recipes" });
   }

   // prep the return payload
   let payload = { recipeObjectArray };

   // attach the count field to the payload if requested
   if (count) {
      try {
         const recipeCount = await Recipe.countDocuments(query);
         payload.count = recipeCount;
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "recipe.controller.find failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to count recipes" });
      }
   }

   // return the payload to the client
   return res.status(200).json({ message: "recipes found", payload });
}






/*
packages the data from the incoming request into a recipe schema
@route: n/a
*/
exports.packageIncoming = async (req, res, next) => {

   // make sure user is signed in
   if (!req.user) { return res.status(401).json({ error: 'user not signed in' }); }

   let recipe = req.body;
   if (!recipe.owner) { recipe.owner = req.user._id; }

   try {
      // if an image was uploaded, add the image data to the recipe object
      if (req.file) {
         recipe.image = {
            filename: req.file.filename,
            url: `/uploads/recipes/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date()
         };
      }

      if (!recipe.visibility) { recipe.visibility = "public"; }
      const recipeObject = await recipeUtils.verifyObject(recipe, false);
      req.recipeObject = recipeObject;
      next();
   }

   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.packageIncoming failed... unable to create recipe object");
      console.error(error);
      return res.status(500).json({ error: 'server failed to convert provided data into a recipe object' })
   }
}

/*
adds a new recipe to the database
@route: POST /recipe/edit
*/
exports.add = async (req, res) => {
   try {
      // create new recipe and save to database
      const newRecipe = await new Recipe(req.recipeObject)
      .save();

      // add recipe to user's ownedRecipes list in database
      await User.updateOne({ _id: req.user._id }, { $push: { ownedRecipes: newRecipe._id } })

      return res.status(201).json({ message: 'new recipe created' });
   }
   // handle any errors caused by the controller
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.add failed... unable to save recipeObject to database");
      console.error(error);
      return res.status(500).json({ error: 'server failed to save new recipe in the database' });
   }
}

/*
changes the contents of an existing recipe in the database
@route: PUT /recipe/edit
*/
exports.update = async (req, res) => {

   const recipeObject = req.recipeObject;

   // check if recipe _id was provided
   const recipeId = req.body._id;  
   if (!recipeId) { return res.status(400).json({ error: 'recipe _id needs to be provided' }); }

   try {
      // make sure current user is the owner of found recipe
      const recipeData = await Recipe.findOne({ _id: recipeId });
      if (!recipeData) { return res.status(404).json({ error: 'no recipe found with provided _id' }); }
      if (recipeData.owner != req.user._id) { return res.status(403).json({ error: 'current user does not have write access to this recipe' }); }

      // remove old images from server if a new image was uploaded
      if (req.file && recipeData.image) { volumeUtils.deleteVolumeFile("recipes", recipeData.image.filename); }

      // update recipe in database and return
      await Recipe.updateOne({ _id: recipeId }, { $set: recipeObject });
      return res.status(200).json({ message: 'recipe updated successfully' });
   }

   // handle any errors caused by the controller
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.update failed... unable to save recipeObject to database");
      console.error(error);
      return res.status(500).json({ error: 'server failed to update recipe' });
   }
}






/*
deletes a recipe from the database
@route: DELETE /recipe/delete
*/
exports.delete = async (req, res) => {

   const userId = req.user?._id;
   const { recipeId } = req.params;

   if (!userId) { return res.status(401).json({ error: "user must be signed in to delete a recipe" }); }

   // make sure client as access to the recipe being deleted
   let recipe;
   try {
      recipe = await recipeUtils.verifyObject({ _id: recipeId }, true);
      if (recipe.owner != userId) { return res.status(403).json({ error: "current user does not have write access to this recipe" }); }
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.deleteRecipe failed... unable to verify recipe object");
      console.error(error);
      return res.status(500).json({ error: 'server failed to verify recipe object' });
   }

   // delete the recipe from the database
   try {
      // remove recipe image from server
      if (recipe.image) { volumeUtils.deleteVolumeFile("recipes", recipe.image.filename); }

      await Recipe.deleteOne({ _id: recipeId });
      return res.status(200).json({ message: 'recipe deleted successfully' });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "recipe.controller.deleteRecipe failed... unable to delete recipe from database");
      console.error(error);
      return res.status(500).json({ error: 'server failed to delete recipe' });
   }
}