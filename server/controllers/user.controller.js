// external imports
const { verify } = require("jsonwebtoken");

// internal imports
const friendRequest = require("../models/joinTables/friendRequest");
const friendships = require("../models/joinTables/friendship");
const users = require("../models/user");
const refreshTokens = require("../models/refreshToken");
const { validPassword, genPassword } = require("../library/passwordUtils");
const createToken = require("../config/jsonWebToken");
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

  try {
    // make sure refresh token exists in database
    const databaseToken = await refreshTokens.findOne({ token: refreshToken });
    if (!databaseToken)
      return res.status(403).json({ error: "invalid refresh token" });

    // validate the refresh token and send a new access token
    const validToken = verify(refreshToken, process.env.SESSION_SECRET);
    if (validToken && validToken._id == databaseToken.user) {
      const tokens = createToken({
        _id: validToken._id,
        username: validToken.username,
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

exports.info = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    if(!req.user)  return res.status(401).json({ error: "user not signed in" });
    return res.status(200).json({ message: "signed in user data", payload: req.user });
  }

  try {
    // find user in database
    const userData = await users.findOne({ _id: userId });
    if (!userData) return res.status(400).json({ error: "user not found" });

    return res.status(200).json({ message: "user data collected successfully", payload: userData });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server failed to find user" });
  }
};

exports.defineRelationship = async (req, res) => {
  const { _id } = req.user;
  const { userId } = req.params;

  // check if user is signed in
  if (!_id) return res.status(401).json({ error: "user not signed in" });

  // check for any missing or invalid fields in the request
  if (!userId) return res.status(400).json({ error: "missing userId parameter" });
  if (userId == _id) return res.status(200).json({ message: "this is the current user", payload: { type: 4, _id: 0 } });

  try {
    // check if users are friends
    const friendship = await friendships.findOne({ friendIds: { $all: [_id, userId] } });
    if (friendship) return res.status(200).json({ message: "users are friends", payload: {type: 1, _id: friendship._id} });

    // check if friend request has been received
    const received = await friendRequest.findOne({ senderId: userId, receiverId: _id });
    if (received) return res.status(200).json({ message: "friend request received", payload: { type: 2, _id: received._id } });

    // check if friend request has been sent
    const sent = await friendRequest.findOne({ senderId: _id, receiverId: userId });
    if (sent) return res.status(200).json({ message: "friend request sent", payload: { type: 3, _id: sent._id } });

    return res.status(200).json({ message: "no relationship", payload: { type: 0, _id: 0 } });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server failed to define relationship" });
  }
}

exports.find = async (req, res) => {
  const { _id } = req.user;
  const { username, email, limit, skip, collection } = req.query;

  // Parsing limit and skip as integers 
  const parsedLimit = parseInt(limit, 10) || 6; 
  const parsedSkip = parseInt(skip, 10) || 0;
  const parsedCollection = parseInt(collection, 10) || 0;

  if (parsedCollection != 0 && !_id) return res.status(401).json({ error: "user not signed in" });

  try {

    // create query for searching the database for usernames containing client provided string
    let query = {};

    // add username and email to query if provided
    if (username) query.username = { $regex: new RegExp(username, 'i') };
    if (email) query.email = { $regex: new RegExp(email, 'i') };

    if (parsedCollection == 1) {
      // collect a list of friendship relationships user is involved in
      const friendshipList = await friendships.find({ friendIds: _id });
      // extract the _ids of each non-signed in user
      const friendsList = friendshipList.map((friendship) => friendship.friendIds.filter((friend) => friend != _id) );
      // add the _ids to the query
      query._id = { $in: friendsList };
    }

    else if (parsedCollection == 2) {
      // collect a list of friend requests user has received
      const receivedRequests = await friendRequest.find({ receiverId: _id });
      // extract the _ids of each non-signed in user
      const requestList = receivedRequests.map((request) => request.senderId);
      // add the _ids to the query
      query._id = { $in: requestList };
    }

    else if (parsedCollection == 3) {
      // collect a list of friend requests user has sent
      const sentRequests = await friendRequest.find({ senderId: _id });
      // extract the _ids of each non-signed in user
      const requestList = sentRequests.map((request) => request.receiverId);
      // add the _ids to the query
      query._id = { $in: requestList };
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
};

exports.sendFriendRequest = async (req, res) => {
  const { _id } = req.user;
  const { userId } = req.body;

  // check if user is signed in
  if (!_id) return res.status(401).json({ error: "user not signed in" });

  // check for any missing or invalid fields in the request
  if (!userId) return res.status(400).json({error: 'missing userId field in body'});
  if (userId == _id) return res.status(400).json({ error: "user cannot send friend request to self" });

  try {
    // make sure user exists in database
    const senderData = await users.findOne({ _id });
    if (!senderData) return res.status(400).json({ error: "signed in user not found in database" });

    // make sure receiver exists in database
    const receiverData = await users.findOne({ _id: userId });
    if (!receiverData) return res.status(400).json({ error: "receiver not found" });

    // make sure friend request doesn't already exist in database
    const sentRequest = await friendRequest.findOne({ senderId: _id, receiverId: userId });
    if (sentRequest) return res.status(400).json({ error: "friend request already sent" });
    const receivedRequest = await friendRequest.findOne({ senderId: userId, receiverId: _id });
    if (receivedRequest) return res.status(400).json({ error: "friend request already received" });

    // make sure friendship doesn't already exist in database
    const existingFriendship = await friendships.findOne({ friendIds: { $all: [senderData._id, receiverData._id] } });
    if (existingFriendship) return res.status(400).json({ error: "friendship already exists" });

    // create friend request
    const newRequest = {
      senderId: _id,
      receiverId: userId,
    };

    // save friend request to database
    const friendship = await new friendRequest(newRequest)
    .save();

    return res.status(200).json({ message: "friend request sent", payload: friendship });
  }

  // handle any errors caused by the controller
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server failed to send friend request" });
  }
};

exports.processFriendRequest = async (req, res) => {
  const { _id } = req.user;
  const { requestId, accept } = req.body;

  // check if user is signed in
  if (!_id) return res.status(401).json({ error: "user not signed in" });

  // check for any missing fields in the request
  if (!requestId) return res.status(400).json({ error: 'missing sender field in body' });
  if (accept === undefined) return res.status(400).json({ error: 'missing accept field in body' });

  try {

    // make sure friend request exists in database
    const requestData = await friendRequest.findOne({ _id: requestId });
    if (!requestData) return res.status(400).json({ error: "request not found in database" });
    // check if sender is current user
    if (requestData.senderId == _id) {
      if (accept) return res.status(401).json({ error: "you cant accept a friend request sent by you" });
      await friendRequest.deleteOne({ _id: requestData._id });
      return res.status(200).json({ message: "friend request canceled" });
    }
    // check that current user is the receiver of the request
    if (!requestData.receiverId == _id) return res.status(401).json({ error: "current user is not the receiver of this request" });

    // check if user accepted the friend request
    if (!accept) {
      // delete friend request from database
      await friendRequest.deleteOne({ _id: requestData._id });
      return res.status(200).json({ message: "friend request denied" });
    }

    // make sure user exists in database
    const receiverData = await users.findOne({ _id });
    if (!receiverData) return res.status(400).json({ error: "signed in user not found in database" });

    // make sure receiver exists in database
    const senderData = await users.findOne({ _id: requestData.senderId });
    if (!senderData) return res.status(400).json({ error: "request sender not found in database" });

    // make sure friendship doesn't already exist in database
    const existingFriendship = await friendships.findOne({ friends: { $all: [senderData._id, _id] }});
    if (existingFriendship) {
      await friendRequest.deleteOne({ _id: request });
      return res.status(400).json({ error: "friendship already exists" });
    }

    // delete friend request from database
    await friendRequest.deleteOne({ _id: requestId });

    // create friendship and save to database
    const newFriendship = await new friendships({
      friendIds: [senderData._id, _id]
    })
    .save();

    return res.status(200).json({ message: "friend request accepted", payload: newFriendship });
  }

  // handle any errors caused by the controller
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server failed to accept friend request" });
  }
};