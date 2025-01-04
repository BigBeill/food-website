const router = require("express").Router();

const users = require("../models/user");
const { genPassword } = require("../library/passwordUtils");
const refreshTokens = require("../models/refreshToken");
const friendship = require("../models/joinTables/friendship");
const friendRequest = require("../models/joinTables/friendRequest");

// ------------ preset database data ------------
const presetUsers = [ 
   { username: "test", email: "test@gmail.com", bio: "account for testing the database", password: "123"  },
   { username: "test1", email: "test1@gmail.com", bio: "account for testing the database", password: "123"  },
   { username: "test2", email: "test2@gmail.com", bio: "account for testing the database", password: "123"  },
   { username: "test3", email: "test3@gmail.com", bio: "account for testing the database", password: "123"  },
   { username: "mackenzieNeill", email: "mackenzie@gmail.com", bio: "default account for mackenzie", password: "123"  },
   { username: "connorPink", email: "connor@gmail.com", bio: "default account for connor", password: "123"  },
   { username: "alexSmith", email: "alex@gmail.com", bio: "default account for alex", password: "123" },
   { username: "sarahJohnson", email: "sarah@gmail.com", bio: "default account for sarah", password: "123" },
   { username: "michaelBrown", email: "michael@gmail.com", bio: "default account for michael", password: "123" },
   { username: "emilyDavis", email: "emily@gmail.com", bio: "default account for emily", password: "123" },
   { username: "davidMartinez", email: "david@gmail.com", bio: "default account for david", password: "123" },
   { username: "jamesGarcia", email: "james@gmail.com", bio: "default account for james", password: "123" },
   { username: "isabellaMiller", email: "isabella@gmail.com", bio: "default account for isabella", password: "123" },
   { username: "ethanLopez", email: "ethan@gmail.com", bio: "default account for ethan", password: "123" },
   { username: "oliviaWilson", email: "olivia@gmail.com", bio: "default account for olivia", password: "123" },
   { username: "danielAnderson", email: "daniel@gmail.com", bio: "default account for daniel", password: "123" },
   { username: "avaThomas", email: "ava@gmail.com", bio: "default account for ava", password: "123" },
   { username: "lucasTaylor", email: "lucas@gmail.com", bio: "default account for lucas", password: "123" },
   { username: "miaMoore", email: "mia@gmail.com", bio: "default account for mia", password: "123" },
   { username: "benjaminHernandez", email: "benjamin@gmail.com", bio: "default account for benjamin", password: "123" },
   { username: "harperClark", email: "harper@gmail.com", bio: "default account for harper", password: "123" },
   { username: "jacksonLee", email: "jackson@gmail.com", bio: "default account for jackson", password: "123" },
   { username: "sophiaWalker", email: "sophia@gmail.com", bio: "default account for sophia", password: "123" },
   { username: "aidenHall", email: "aiden@gmail.com", bio: "default account for aiden", password: "123" },
   { username: "ellaAllen", email: "ella@gmail.com", bio: "default account for ella", password: "123" },
   { username: "loganYoung", email: "logan@gmail.com", bio: "default account for logan", password: "123" },
   { username: "scarlettKing", email: "scarlett@gmail.com", bio: "default account for scarlett", password: "123" },
   { username: "jacobWright", email: "jacob@gmail.com", bio: "default account for jacob", password: "123" },
   { username: "graceScott", email: "grace@gmail.com", bio: "default account for grace", password: "123" },
   { username: "liamGreen", email: "liam@gmail.com", bio: "default account for liam", password: "123" },
   { username: "zacharyAdams", email: "zachary@gmail.com", bio: "default account for zachary", password: "123" },
   { username: "chloeBaker", email: "chloe@gmail.com", bio: "default account for chloe", password: "123" },
   { username: "noahNelson", email: "noah@gmail.com", bio: "default account for noah", password: "123" },
   { username: "averyCarter", email: "avery@gmail.com", bio: "default account for avery", password: "123" },
   { username: "elijahMitchell", email: "elijah@gmail.com", bio: "default account for elijah", password: "123" },
   { username: "victoriaPerez", email: "victoria@gmail.com", bio: "default account for victoria", password: "123" }
]






router.put("/resetUsers", async (req, res) => {

   // delete all users
   await users.deleteMany({})
   .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "server failed to delete users" });
   });
   // delete all refresh tokens
   await refreshTokens.deleteMany({})
   .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "server failed to delete refresh tokens" });
   });

   await friendship.deleteMany({})
   .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "server failed to delete friendships" });
   });

   await friendRequest.deleteMany({})
   .catch((error) => {
      console.error(error);
      return res.status(500).json({ error: "server failed to delete friend requests"});
   });

   presetUsers.forEach(async (user) => {

      const hashedPassword = genPassword(user.password);
      await new users({ username: user.username, email: user.email, bio: user.bio, hash: hashedPassword.hash, salt: hashedPassword.salt, })
      .save()
      .catch((error) => {
         console.error(error);
         return res.status(500).json({ message: "server failed to save new user to database" });
      });
   });

   return res.status(200).json({ message: "users and refresh tokens reset" });
});

require("dotenv").config();




module.exports = router;