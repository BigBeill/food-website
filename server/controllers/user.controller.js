const users = require("../models/user");
const refreshTokens = require("../models/refreshToken");
const { validPassword, genPassword } = require("../library/passwordUtils");
const createToken = require("../config/jsonWebToken");
const genPassword = require("../library/passwordUtils").genPassword;
const { verify } = require("jsonwebtoken");
require("dotenv").config();

// the max age of all cookies created by this controller
const cookieAge = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // check for missing data
  if (!username) {
    return res.status(400).json({ error: "no username provided" });
  }
  if (!email) {
    return res.status(400).json({ error: "no email provided" });
  }
  if (!password) {
    return res.status(400).json({ error: "no password provided" });
  }

  //make sure username or email isn't already taken
  const searchUsername = await users.findOne({ username });
  if (searchUsername) {
    return res.status(400).json({ error: "username already taken" });
  }
  const searchEmail = await users.findOne({ email });
  if (searchEmail) {
    return res.status(400).json({ error: "email already taken" });
  }

  const hashedPassword = genPassword(password);
  const newUser = {
    username,
    email,
    hash: hashedPassword.hash,
    salt: hashedPassword.salt,
  };
  let savedUser;

  // save user to database
  try {
    savedUser = await new users(newUser).save();
    console.log("new user created:", newUser);
  } catch (error) {
    console.log("failed to create new user:", newUser);
    console.error(error);
    return res.status(500).json({ error: "server failed to create new user" });
  }

  // send cookies to client
  try {
    const tokens = createToken(savedUser);
    await new refreshTokens({
      user: savedUser._id,
      token: tokens.refreshToken,
    }).save();
    res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
    res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
    return res.status(200).json({ message: "register successful" });
  } catch (error) {
    console.log("error saving refresh token for user:", savedUser);
    console.error(error);
    return res.status(500).json({ error: "server issue while saving refresh token" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // make sure data provided is valid
  const user = await users.findOne(
    { username },
    { _id: 1, username: 1, email: 1, bio: 1, hash: 1, salt: 1 }
  );
  if (!user) {
    return res.status(400).json({ error: "username not found" });
  }
  if (!validPassword(password, user.hash, user.salt)) {
    return res.status(400).json({ error: "incorrect password" });
  }

  // return cookies to client
  try {
    const tokens = createToken(user);
    await new refreshTokens({
      user: user._id,
      token: tokens.refreshToken,
    }).save();
    res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
    res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
    return res.status(200).json({ message: "user Signed in" });
  } catch (error) {
    console.error("error saving refresh token for user:", user);
    console.error(error);
    return res
      .status(500)
      .json({ error: "server issue while saving refresh token" });
  }
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  // make sure refresh token exists in database
  const databaseToken = await refreshTokens.findOne({ token: refreshToken });
  if (!databaseToken)
    return res.status(403).json({ error: "invalid refresh token" });

  // validate the refresh token and send a new access token
  try {
    const validToken = verify(refreshToken, process.env.SESSION_SECRET);
    if (validToken && validToken._id == databaseToken.user) {
      const tokens = createToken({
        _id: validToken._id,
        username: validToken.username,
      });
      res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
      return res.status(200).json({ message: "new access token sent" });
    }
  } catch (error) {
    console.error("error creating new access token:", refreshToken);
    console.error(error);
    return res.status(403).json({ error: "could not create new access token" });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "success" });
};

exports.updateAccount = (req, res) => {
  const { username, email, bio } = req.body;
  //make sure username or email isn't already taken
  if (username && users.findOne({ username })) {
    return res.status(400).json({ error: "username already taken" });
  }
  if (email && users.findOne({ email })) {
    return res.status(400).json({ error: "email already taken" });
  }
  // save user to database
  users
    .updateOne(
      { _id: req.user._id },
      {
        $set: {
          email: email,
          username: username,
          bio: bio,
        },
      }
    )
    .then((result) => {
      // TODO : HERE
      // MAC: I need the json token to update here so that after refreshing the page the profile will accurately display the *updated* user data
      // currently after updating the user data it updates in the database but then after refreshing the page your changes are gone and dont come back until you logout and back in refreshing the token.
      res.send(JSON.stringify({ message: "success", result: result }));
    });
};
