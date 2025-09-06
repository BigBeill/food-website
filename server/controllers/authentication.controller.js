const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const passwordUtils = require("../library/passwordUtils");
const userUtils = require("../library/userUtils");
const { verify } = require("jsonwebtoken");
const createToken = require("../config/jsonWebToken");
const uuid = require("uuid");
const PasswordReset = require("../models/passwordReset");
const mailUtils = require("../library/mailUtils");
const crypto = require('crypto');
require("dotenv").config();

// the max age of all cookies created by this controller
const cookieAge = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds






exports.status = async (req, res) => {
   // check if user is logged in
   if (req.user?._id) { return res.status(200).json({ message: "user is logged in", payload: req.user._id }); }
   else { return res.status(401).json({ error: "user is not logged in" }); }
}






exports.register = async (req, res) => {
   const { username, email, password } = req.body;

   // check if password meets all requirements
   if (!passwordUtils.validPassword(password)) { return res.status(400).json({ error: "password does not meet requirements" }); }

   // check the database for any existing User with the same username or email
   try {
      const searchUsername = await User.findOne({ username: { $regex: `^${username}$`} });
      if (searchUsername) { return res.status(409).json({ error: "username already taken" }); }

      const searchEmail = await User.findOne({ email: { $regex: `^${email}$`} });
      if (searchEmail) { return res.status(409).json({ error: "email already taken" }); }
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.register failed... unable to search database for existing username or email");
      console.error(error);
      return res.status(500).json({ error: "server failed to search database for existing username or email" });
   }

   try {
      // encrypt password
      const hashedPassword = passwordUtils.encryptPassword(password);

      // create newUser
      const newUser = {
         username,
         email,
         bio: "no bio yet",
      };

      // create userObject with newUser
      const userObject = await userUtils.verifyObject(newUser, false);

      // send userObject to database with salt and hash
      const savedUser = await new User({...userObject, hash: hashedPassword.hash, salt: hashedPassword.salt})
      .save();

      // create tokens
      const tokens = createToken(savedUser);

      // save refresh token in database
      await new RefreshToken({ user: savedUser._id, token: tokens.refreshToken })
      .save();

      // send cookies to client
      res.cookie("accessToken", tokens.accessToken);
      res.cookie("refreshToken", tokens.refreshToken);
      return res.status(200).json({ message: "account registered successfully" });
   }

   // handle any errors caused by the controller
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.register failed... server failed to register new user");
      console.error(error);
      return res.status(500).json({ error: "server failed to register new user" });
   }
}






exports.login = async (req, res) => {

   const { username, password, rememberMe } = req.body;

   try {
      // find user in database with provided username
      const user = await User.findOne(
         { username: new RegExp(`^${username}$`, 'i') },
         { _id: 1, username: 1, email: 1, bio: 1, hash: 1, salt: 1 }
      );
      if (!user) return res.status(401).json({ error: "username not found" });

      // check if password is correct
      if (!passwordUtils.correctPassword(password, user.hash, user.salt)) { return res.status(401).json({ error: "incorrect password" }); }

      // create new refresh tokens
      const tokens = createToken(user);

      //save refresh tokens in database
      await new RefreshToken({ user: user._id, token: tokens.refreshToken })
      .save();

      // save tokens as cookies for client
      const cookieAgeField = rememberMe ? { maxAge: cookieAge } : {};
      res.cookie("accessToken", tokens.accessToken, cookieAgeField);
      res.cookie("refreshToken", tokens.refreshToken, cookieAgeField);
      return res.status(200).json({ message: "user Signed in" });
   }

   // handle any errors caused by the controller
   catch (error) {
      console.error(error);
      return res.status(500).json({ error: "server failed to login user" });
   }
}






exports.refresh = async (req, res) => {

   if (!req.cookies?.refreshToken) { return res.status(401).json({ error: "Refresh token not found" }); }
   const refreshToken = req.cookies.refreshToken;
   
   try {
      // make sure refresh token exists in database
      const databaseToken = await RefreshToken.findOne({ token: refreshToken });
      if (!databaseToken) {
         return res.status(401).json({ error: "invalid refresh token" });
      }
      // validate the refresh token and send a new access token
      const validToken = verify(refreshToken, process.env.SESSION_SECRET);
      if (validToken && validToken._id == databaseToken.user) {
         const tokens = createToken({
            _id: validToken._id,
         });
         res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
         return res.status(200).json({ message: "new access token sent" });
      }
   } 
   catch (error) {
      console.error("error creating new access token:", refreshToken);
      console.error(error);
      return res.status(500).json({ error: "could not create new access token" });
   }
}






exports.requestPasswordReset = async (req, res) => {

   const userId = req.user?._id;
   if (userId) return res.status(401).json({ error: "User already authenticated" });

   const { email } = req.body;

   // find user in database with provided email
   let userData;
   try {
      userData = await User.findOne(
         { email: new RegExp(`^${email}$`, 'i') },
         { _id: 1, email: 1 }
      );

      // make sure user exists
      if (!userData) { return res.status(404).json({ error: "email not found in database" }); }
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.requestPasswordReset failed... server failed to find user by email");
      console.error(error);
      return res.status(500).json({ error: "server failed to find user by email" });
   }

   // remove existing password reset tokens for user
   try {
      await PasswordReset.deleteMany({ userId: userData._id });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.requestPasswordReset failed... server failed to remove existing password reset tokens");
      console.error(error);
      return res.status(500).json({ error: "server failed to remove existing password reset tokens" });
   }

   //send reset password email to user
   try {
      const uniqueString = uuid.v4() + userData._id;

      const encryptedString = crypto.pbkdf2Sync(uniqueString, "fixedSalt", 10000, 64, 'sha512').toString('hex');
      console.log("uniqueString:", uniqueString);
      console.log("encryptedString:", encryptedString);
      await PasswordReset.create({
         userId: userData._id,
         encryptedString,
      });

      await mailUtils.sendPasswordResetEmail(userData.email, uniqueString);
      return res.status(200).json({ message: "password reset email sent" });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.requestPasswordReset failed... server failed to send password reset email");
      console.error(error);
      return res.status(500).json({ error: "server failed to send password reset email" });
   }
}






exports.changePassword = async (req, res) => {

   const authenticatedUserId = req.user?._id;
   const { uniqueString, password } = req.body;

   // find userId if not provided by authentication
   let passwordResetEntry;
   if (!authenticatedUserId) {
      // make sure uniqueString is provided
      if (!uniqueString) { return res.status(401).json({ error: "no user authenticated and missing uniqueString" }); }

      // verify the uniqueString provided
      try {
         const encryptedString = crypto.pbkdf2Sync(uniqueString, "fixedSalt", 10000, 64, 'sha512').toString('hex');
         passwordResetEntry = await PasswordReset.findOne({ encryptedString });
         if (!passwordResetEntry) { return res.status(404).json({ error: "uniqueString not found in database" }); }
         await PasswordReset.deleteMany({ userId: passwordResetEntry.userId }); // delete all password reset tokens for user
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "authentication.controller.changePassword failed... server failed to find uniqueString in database");
         console.error(error);
         return res.status(500).json({ error: "server failed to find uniqueString in database" });
      }
   }

   // set userId
   const userId = authenticatedUserId ? authenticatedUserId : passwordResetEntry.userId;

   // change password for user inside the database
   try {
      if (!passwordUtils.validPassword(password)) { return res.status(400).json({ error: "password does not meet requirements" }); }
      const hashedPassword = passwordUtils.encryptPassword(password);

      // remove all password reset tokens for user
      await PasswordReset.deleteMany({ userId });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // update user password in database
      await User.updateOne({ _id: userId }, { hash: hashedPassword.hash, salt: hashedPassword.salt });

      return res.status(200).json({ message: "password changed successfully" });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.changePassword failed... server failed to change users password inside the database");
      console.error(error);
      return res.status(500).json({ error: "server failed to change users password inside the database" });
   }

}



exports.logout = async (req, res) => {
   
   res.clearCookie("accessToken");
   res.clearCookie("refreshToken");
   res.status(200).json({ message: "success" });
}