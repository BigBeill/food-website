const users = require("../models/user");
const refreshTokens = require("../models/refreshToken");
const { validPassword, genPassword } = require("../library/passwordUtils");
const createToken = require("../config/jsonWebToken");
const { verify } = require("jsonwebtoken");
require("dotenv").config();






/*------CONTROLLERS FOR MANAGING USER AUTHENTICATION / ACCOUNT DETAILS------*/

// the max age of all cookies created by this controller
const cookieAge = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // make sure username and email don't already exist in database
  const searchUsername = await users.findOne({ username });
  if (searchUsername) return res.status(400).json({ error: "username already taken" });

  const searchEmail = await users.findOne({ email });
  if (searchEmail) return res.status(400).json({ error: "email already taken" });

  // hash password
  const hashedPassword = genPassword(password);

  // create user
  const newUser = {
    username,
    email,
    hash: hashedPassword.hash,
    salt: hashedPassword.salt,
  };

  // save new user to database
  const savedUser = await new users(newUser)
  .save()
  .catch((error) => {
    console.error(error);
    return res.status(500).json({ message: "server failed to save new user to database" });
  });

  // create tokens
  const tokens = createToken(savedUser);

  // save refresh token in database
  await new refreshTokens({ user: savedUser._id, token: tokens.refreshToken })
  .save()
  .catch((error) => {
    console.error(error);
    return res.status(500).json({ message: "server failed to save refresh token in database" })
  });

  // send cookies to client
  res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
  res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
  return res.status(200).json({ message: "account registered successfully" });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // get user information from the server
  const user = await users.findOne({ username }, { _id: 1, username: 1, email: 1, bio: 1, hash: 1, salt: 1 })
  .catch((error) => {
    console.error(error);
    return res.status(500).json({ error: "server failed to search database for username" });
  });

  // check if user exists
  if (!user) return res.status(400).json({ error: "username not found" });

  // check if password is correct
  if (!validPassword(password, user.hash, user.salt)) return res.status(400).json({ error: "incorrect password" });

  // create new refresh tokens
  const tokens = createToken(user);

  //save refresh tokens in database
  await new refreshTokens({ user: user._id, token: tokens.refreshToken })
  .save()
  .catch((error) => {
    console.error(error);
    return res.status(500).catch({ error: "server failed to save tokens to database" });
  });

  // save tokens as cookies for client
  res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
  res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
  return res.status(200).json({ message: "user Signed in" });
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
  if (users.findOne({ username })) {
    return res.status(400).json({ error: "username already taken" });
  }
  if (users.findOne({ email })) {
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
      // create tokens
      const tokens = createToken(result);
      // send tokens to database
      new refreshTokens({ user: savedUser._id, token: tokens.refreshToken })
      .save()
      .then(() => {
        // send cookies to client
        res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
        res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
        return res.status(200).json({ message: "account registered successfully" });
      })
    });
};



/*------CONTROLLERS FOR MANAGING USER INTERACTION WITH OTHER ACCOUNTS------*/

exports.findUsers = async (req, res) => {
  const { username, limit, skip } = req.body;
  const regex = new RegExp(username, 'i');
  const usersList = await collection.find({ name: { $regex: regex } })
  .skip(skip)
  .limit(limit)
  .toArray()
  .catch((error) => {
    console.error(error);
    return res.status(500).json({ error: "failed to collect users from the database" });
  });

  return res.status(200).json({message: "List of users collected successfully", payload: usersList})
}