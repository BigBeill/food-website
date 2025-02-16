const router = require("express").Router();

const user = require("../models/user");
const { genPassword } = require("../library/passwordUtils");
const refreshToken = require("../models/refreshToken");
const friendship = require("../models/joinTables/friendship");
const friendRequest = require("../models/joinTables/friendRequest");
const friendFolder = require("../models/friendFolder");
const presetUsers = require("../testingSampleData/sampleUsers");

require("dotenv").config();






router.put("/resetUsers", async (req, res) => {

   // delete all user related data from the database (users, refreshTokens, friendships, friendRequests, folders)
   try { 
      await user.deleteMany({})
      await refreshToken.deleteMany({})
      await friendship.deleteMany({})
      await friendRequest.deleteMany({})
      await friendFolder.deleteMany({})
   }
   catch (error) {
      console.error(error);
      return res.status(500).json({ error: "server failed to delete all data around users"})
   }

   
   presetUsers.forEach(async (userData) => {
      try {
         const hashedPassword = genPassword(userData.password);
         await new user({ username: userData.username, email: userData.email, bio: userData.bio, hash: hashedPassword.hash, salt: hashedPassword.salt, }).save();
      }
      catch (error) {
         console.log("issue saving user to database:", user);
         console.error(error);
         return res.status(500).json({ error: "server failed to save preset users" });
      }
   });

   return res.status(200).json({ message: "users and refresh tokens reset" });

});



module.exports = router;