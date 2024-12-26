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

  // check for any missing fields in the request
  if(!username) return res.status(400).json({error: 'missing username field in body'});
  if(!email) return res.status(400).json({error: 'missing email field in body'});
  if(!password) return res.status(400).json({error: 'missing password field in body'});

  try {
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
    .save();

    // create tokens
    const tokens = createToken(savedUser);

    // save refresh token in database
    await new refreshTokens({ user: savedUser._id, token: tokens.refreshToken })
    .save();

    // send cookies to client
    res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
    res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
    return res.status(200).json({ message: "account registered successfully" });
  }

  // handle any errors caused by the controller
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server failed to register new user" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // check for any missing fields in the request
  if (!username) return res.status(400).json({error: 'missing username field in body'});
  if (!password) return res.status(400).json({error: 'missing password field in body'});

  try {
    // find user in database with provided username
    const user = await users.findOne({ username }, { _id: 1, username: 1, email: 1, bio: 1, hash: 1, salt: 1 })
    if (!user) return res.status(400).json({ error: "username not found" });

    // check if password is correct
    if (!validPassword(password, user.hash, user.salt)) return res.status(400).json({ error: "incorrect password" });

    // create new refresh tokens
    const tokens = createToken(user);

    //save refresh tokens in database
    await new refreshTokens({ user: user._id, token: tokens.refreshToken })
    .save();

    // save tokens as cookies for client
    res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
    res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });
    return res.status(200).json({ message: "user Signed in" });
  }

  // handle any errors caused by the controller
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server failed to login user" });
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

  // check for any missing fields in the request
  if (!username) return res.status(400).json({error: 'missing username filed provided in body'});
  if (!email) return res.status(400).json({error: 'missing email field provided in body'});

  try{
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
  }

  // handle any errors caused by the controller
  catch(error){
    console.error(error);
    return res.status(500).json({ error: "server failed to update user account" });
  }
};



/*------CONTROLLERS FOR MANAGING USER INTERACTION WITH OTHER ACCOUNTS------*/

exports.find = async (req, res) => {
  const { 
    username = "", 
    limit = 6, 
    skip = 0 
  } = req.query;

  // Parsing limit and skip as integers 
  const parsedLimit = parseInt(limit, 10) || 6; 
  const parsedSkip = parseInt(skip, 10) || 0;

  try {
    // create query for searching the database for usernames containing client provided string
    let query = {};
    if (username) { 
      const regex = new RegExp(username, 'i'); 
      query = { username: { $regex: regex } }; 
    }

    // use query to find users in database
    const usersList = await users.find(query)
    .skip(parsedSkip)
    .limit(parsedLimit);
    
    return res.status(200).json({message: "List of users collected successfully", payload: usersList})
  }

  // handle any errors caused by the controller
  catch (error){
    console.error(error);
    return res.status(500).json({ error: "server failed to find users with provided parameters" });
  }
}