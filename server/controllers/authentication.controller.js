const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const passwordUtils = require("../library/passwordUtils");
const userUtils = require("../library/userUtils");
const { verify } = require("jsonwebtoken");
const createToken = require("../config/jsonWebToken");
const PasswordReset = require("../models/passwordReset");
const mailUtils = require("../library/mailUtils");
const crypto = require('crypto');
require("dotenv").config();

// the max age of all cookies created by this controller
const cookieAge = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds



/*
Returns the status of the current user session
@route: GET /authentication/status
*/
exports.status = async (req, res) => {
   // check if user is logged in, send userId if they are
   if (req.user?._id) { return res.status(200).json({ message: "user is logged in", payload: req.user._id }); }
   else { return res.status(401).json({ error: "user is not logged in" }); }
}



/*
Creates a new user account
@route: POST /authentication/register
*/
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
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.register failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed to search database for existing username or email" });
   }

   // encrypt password
   const hashedPassword = passwordUtils.encryptPassword(password);

   // create newUser object
   const newUser = {
      username,
      email,
      bio: "no bio yet",
   };

   // add newUser to the database
   let savedUser;
   try {
      // create userObject with newUser
      const userObject = await userUtils.verifyObject(newUser, false);

      // send userObject to database with salt and hash
      savedUser = await new User({...userObject, hash: hashedPassword.hash, salt: hashedPassword.salt})
         .save();
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.register failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed add new user to database" });
   }

   // create authentication tokens for new user
   const tokens = createToken(savedUser);

   // save refresh token inside the database
   try {
      await new RefreshToken({ user: savedUser._id, token: tokens.refreshToken })
         .save();
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.register failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed to save refresh token to database" });
   }

   // attach cookies to the response and return success message
   res.cookie("accessToken", tokens.accessToken);
   res.cookie("refreshToken", tokens.refreshToken);
   return res.status(200).json({ message: "account registered successfully" });
}



/*
Creates a new user session with access tokens
@route: POST /authentication/login
*/
exports.login = async (req, res) => {
   const { username, password, rememberMe } = req.body;

   //find the user inside the database based on username (collect the hash and salt)
   let foundUser;
   try {
      foundUser = await User.findOne(
         { username: new RegExp(`^${username}$`, 'i') },
         { _id: 1, username: 1, email: 1, bio: 1, hash: 1, salt: 1 }
      )
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.login failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed to find user by username" });
   }

   // make sure an account was found inside the database
   if (!foundUser) { return res.status(401).json({ error: "username not found" }); }

   // check if the correct password was provided
   if (!passwordUtils.correctPassword(password, foundUser.hash, foundUser.salt)) { return res.status(401).json({ error: "incorrect password" }); }

   // create new refresh tokens
   const tokens = createToken(foundUser);

   // add new refresh token to the database
   try {
      await new RefreshToken({ user: foundUser._id, token: tokens.refreshToken })
         .save();
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.login failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed to save refresh token to database" });
   }

   // attach the cookies to the response and return success message
   const cookieAgeField = rememberMe ? { maxAge: cookieAge } : {};
   res.cookie("accessToken", tokens.accessToken, cookieAgeField);
   res.cookie("refreshToken", tokens.refreshToken, cookieAgeField);
   return res.status(200).json({ message: "user Signed in" });
}



/*
Refreshes the current user session
@route: POST /authentication/refresh
*/
exports.refresh = async (req, res) => {

   // make sure a refresh token was sent with the request
   if (!req.cookies?.refreshToken) { return res.status(401).json({ error: "Refresh token not found" }); }
   const refreshToken = req.cookies.refreshToken;
   
    // make sure the refresh token exists inside the database
    let databaseToken;
   try {
      databaseToken = await RefreshToken.findOne({ token: refreshToken });
      if (!databaseToken) { return res.status(401).json({ error: "invalid refresh token" }); }
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.refresh failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed to verify refresh token inside database" });
   }

   // validate the refresh token
   const validToken = verify(refreshToken, process.env.SESSION_SECRET);
   const databaseUserAsString = String(databaseToken.user);
   if (!validToken || validToken._id !== databaseUserAsString) { return res.status(401).json({ error: "invalid refresh token provided" }); }

   // create the send new access token
   const tokens = createToken({ _id: validToken._id});
   res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
   return res.status(200).json({ message: "new access token sent" });
}



/*
Sends a password reset link to the user's email
@route: POST /authentication/requestPasswordReset
*/
exports.requestPasswordReset = async (req, res) => {

   // make sure user is not already authenticated
   const userId = req.user?._id;
   if (userId) return res.status(401).json({ error: "User already authenticated" });

   const { email } = req.body;

   // find user in database with provided email
   let userData;
   try {
      const washedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      userData = await User.findOne(
         { email: new RegExp(`^${washedEmail}$`, 'i') },
         { _id: 1, email: 1 }
      );
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.requestPasswordReset failed..." + '"\n Reason given: ' + error);
      return res.status(500).json({ error: "server failed to find user by email" });
   }

   // respond with success message even if email  was not found (prevent email enumeration)
   if (!userData) { return res.status(200).json({ message: "If an account exists for that email, a reset link will be sent." }); }

   // remove already existing password reset tokens assigned to user
   try {
      await PasswordReset.deleteMany({ userId: userData._id });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.requestPasswordReset failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to remove existing password reset tokens" });
   }

   //send reset password email to user
   try {
      const uniqueString = crypto.randomBytes(32).toString('hex');
      const encryptedString = crypto.createHash('sha256').update(uniqueString).digest('hex');
      await PasswordReset.create({
         userId: userData._id,
         encryptedString,
      });
      await mailUtils.sendPasswordResetEmail(userData.email, uniqueString);
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.requestPasswordReset failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to send password reset email" });
   }

   return res.status(200).json({ message: "If an account exists for that email, a reset link will be sent." });
}



/*
Changes the user's password
@route: POST /authentication/changePassword
*/
exports.changePassword = async (req, res) => {

   const authenticatedUserId = req.user?._id;
   const { uniqueString, password, currentPassword } = req.body;

   let passwordResetEntry;

   // make sure new password meets requirements before spending resources on authenticating the user
   if (!passwordUtils.validPassword(password)) { return res.status(400).json({ error: "password does not meet requirements" }); }

   // if user is authenticated, re-authenticate them with their current password
   if (authenticatedUserId) {
      if (!currentPassword) { return res.status(401).json({ error: "missing current password for re-authentication" }); }

      // grab user from the database
      let userData;
      try {
         userData = await User.findById(authenticatedUserId, { hash: 1, salt: 1 });
      }
      catch(error) {
         console.log("\x1b[31m%s\x1b[0m", "authentication.controller.changePassword failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to find currently authenticated user" });
      }

      // make sure userData collected lines up with client provided data
      if (!userData) { return res.status(401).json({ error: "invalid session" }); }
      if (!passwordUtils.correctPassword(currentPassword, userData.hash, userData.salt)) { return res.status(401).json({ error: "incorrect password" }); }

   }
   // find userId if not provided by authentication
   else {
      // make sure uniqueString is provided
      if (!uniqueString) { return res.status(401).json({ error: "no user authenticated and missing uniqueString" }); }

      // verify the uniqueString provided
      try {
         const encryptedString = crypto.createHash('sha256').update(uniqueString).digest('hex');
         passwordResetEntry = await PasswordReset.findOne({ encryptedString });
         if (!passwordResetEntry) { return res.status(401).json({ error: "uniqueString not found in database" }); }
         await PasswordReset.deleteMany({ userId: passwordResetEntry.userId }); // delete all password reset tokens for user
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "authentication.controller.changePassword failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to find uniqueString in database" });
      }
   }

   // set userId
   const userId = authenticatedUserId ? authenticatedUserId : passwordResetEntry.userId;

   // encrypt new password
   const hashedPassword = passwordUtils.encryptPassword(password);

   // sign current user out and update their password inside the database
   try {
      // remove all password reset tokens for user
      await PasswordReset.deleteMany({ userId });
      await RefreshToken.deleteMany({ user: userId });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // update user password in database
      await User.updateOne({ _id: userId }, { hash: hashedPassword.hash, salt: hashedPassword.salt });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "authentication.controller.changePassword failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to change users password inside the database" });
   }

   return res.status(200).json({ message: "password changed successfully" });
}



/*
Logs the current user out by removing their tokens
@route: POST /authentication/logout
*/
exports.logout = async (_req, res) => {
   res.clearCookie("accessToken");
   res.clearCookie("refreshToken");
   res.status(200).json({ message: "success" });
}