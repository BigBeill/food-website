const users = require("../models/user");
const refreshTokens = require("../models/refreshToken");
const validPassword = require("../library/passwordUtils").validPassword;
const createToken = require("../config/jsonWebToken");
require('dotenv').config();

// the max age of all cookies created by this controller
const cookieAge = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds


exports.register = async (req, res) => {
  const {username, email, password} = req.body;

  // check for missing data
  if (!username) { return res.status(400).json({ error: 'no username provided' }); }
  if (!email) { return res.status(400).json({ error: 'no email provided' }); }
  if (!password) { return res.status(400).json({ error: 'no password provided' }); }

  //make sure username or email isn't already taken
  const searchUsername = await users.findOne({ username });
  if (searchUsername) { return res.status(400).json({ error: 'username already taken' }); }
  const searchEmail = await users.findOne({ email });
  if (searchEmail) { return res.status(400).json({ error: 'email already taken' }) }

  const hashedPassword = genPassword(password);

  const newUser = { username, email, hash: hashedPassword.hash, salt: hashedPassword.salt }

  try {
    await new users(newUser).save()
    console.log('new user created:', newUser)
    const tokens = createToken(newUser);
    res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
    res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge }); 
  } 
  catch(error){
    console.log('failed to create new user:', newUser); 
    console.log(error);
    return res.status(500).json({ error: 'server failed to create new user' })
  }

  try { 
    await new refreshTokens({
      user: user._id,
      token: tokens.refreshToken
    })
    .save(); 
  }
  catch (error){
    console.error("error saving refresh token for user:", user);
    console.error(error);
    return res.status(500).json({ error: "server issue while saving refresh token" });
  }

  return res.status(200).json({ message: 'register successful'})
}



exports.login = async (req, res) => {
  const {username, password} = req.body;

  const user = await users.findOne({ username }, { _id:1, username:1, email:1, hash:1, salt:1 });
  if (!user) { return res.status(400).json({ error: 'username not found' }); }
  if (!validPassword(password, user.hash, user.salt)) { return res.status(400).json({ error: 'incorrect password' }) }

  const tokens = createToken(user);
  res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
  res.cookie("refreshToken", tokens.refreshToken, { maxAge: cookieAge });

  try { 
    await new refreshTokens({
      user: user._id,
      token: tokens.refreshToken
    })
    .save(); 
  }
  catch (error){
    console.error("error saving refresh token for user:", user);
    console.error(error);
    return res.status(500).json({ error: "server issue while saving refresh token" });
  }

  return res.status(200).json({ message: "user Signed in"})
}



exports.refresh = async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  // make sure refresh token exists in database
  const databaseToken = await refreshTokens.findOne({ token: refreshToken});
  if (!databaseToken) return res.status(403).json({ error: "invalid refresh token"})

  // validate the refresh token and send a new access token
  try {
    const validToken = verify(refreshToken, process.env.SESSION_SECRET);
    if (validToken && validToken._id == databaseToken.user) {
      const tokens = createToken({ _id: validToken._id, username: validToken.username });
      res.cookie("accessToken", tokens.accessToken, { maxAge: cookieAge });
      return res.status(200).json({ message: "new access token sent" })
    }
  } catch (error) {
    console.error('error validating refresh token:', refreshToken);
    console.error(error);
    return res.status(403).json({ error: "could not validate refresh token"})
  }

}