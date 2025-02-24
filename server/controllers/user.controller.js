// internal imports
const friendRequest = require("../models/joinTables/friendRequest");
const friendships = require("../models/joinTables/friendship");
const users = require("../models/user");
const { validationResult } = require("express-validator");
require("dotenv").config();


exports.updateAccount = async (req, res) => {
   if (!req.user) return res.status(401).json({ error: "user not signed in" });

   const errors = validationResult(req);
   if (!errors.isEmpty()) { return res.status(400).json({ error: errors.array() }); }

   const { username, email, bio } = req.body;

   // check for any missing fields in the request
   if (!username) return res.status(400).json({error: 'missing username filed provided in body'});
   if (!email) return res.status(400).json({error: 'missing email field provided in body'});

   try{
      //make sure username or email isn't already taken
      const foundUsername = await users.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (foundUsername && foundUsername._id != req.user._id) { return res.status(400).json({ error: "username already taken" }); }
      const foundEmail = await users.findOne({ email: new RegExp(`^${email}$`, 'i') }) 
      if (foundEmail && foundEmail._id != req.user._id) { return res.status(400).json({ error: "email already taken" }); }

      // save user to database
      await users.updateOne(
         { _id: req.user._id },
         { $set: {
         email: email,
         username: username,
         bio: bio,
         }, }
      );

      return res.status(200).json({ message: "account registered successfully" });
   }

   // handle any errors caused by the controller
   catch(error){
      console.error(error);
      return res.status(500).json({ error: "server failed to update user account" });
   }
}

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
}

exports.defineRelationship = async (req, res) => {
   if (!req.user) { return res.status(401).json({ error: "user not signed in" }); }

   const { _id } = req.user;
   const { userId } = req.params;

   // check for any missing fields in the request
   if (!userId) return res.status(400).json({ error: "missing userId parameter" });

   // check if user is trying to define relationship with self
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
   const _id = req.user?._id;

   const { username, email, limit, skip, relationship, count } = req.query;

   // Parsing limit and skip as integers 
   const parsedLimit = parseInt(limit, 10) || 6; 
   const parsedSkip = parseInt(skip, 10) || 0;
   const parsedRelationship = parseInt(relationship, 10) || 0;

   if (parsedRelationship != 0 && !_id) { return res.status(401).json({ error: "user not signed in" }) };

   try {

      // create query for searching the database for usernames containing client provided string
      let query = {};

      // add username and email to query if provided
      if (username) query.username = { $regex: new RegExp(username, 'i') };
      if (email) query.email = { $regex: new RegExp(email, 'i') };

      if (parsedRelationship == 1) {
         // collect a list of friendship relationships user is involved in
         const friendshipList = await friendships.find({ friendIds: _id });
         // extract the _ids of each non-signed in user
         const friendsList = friendshipList.map((friendship) => friendship.friendIds.filter((friend) => friend != _id) );
         // add the _ids to the query
         query._id = { $in: friendsList };
      }

      else if (parsedRelationship == 2) {
         // collect a list of friend requests user has received
         const receivedRequests = await friendRequest.find({ receiverId: _id });
         // extract the _ids of each non-signed in user
         const requestList = receivedRequests.map((request) => request.senderId);
         // add the _ids to the query
         query._id = { $in: requestList };
      }

      else if (parsedRelationship == 3) {
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
      let payload = {users: usersList};

      // attach count if requested by the client
      if (count) {
         const totalCount = await users.countDocuments(query);
         payload.totalCount = totalCount;
      }

      return res.status(200).json({message: "List of users collected successfully", payload})
   }

   // handle any errors caused by the controller
   catch (error){
      console.error(error);
      return res.status(500).json({ error: "server failed to find users with provided parameters" });
   }
}

exports.sendFriendRequest = async (req, res) => {
   if (!req.user) return res.status(401).json({ error: "user not signed in" });

   const errors = validationResult(req);
   if (!errors.isEmpty()) { return res.status(400).json({ error: errors.array() }); }

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
}

exports.processFriendRequest = async (req, res) => {
   if (!req.user) return res.status(401).json({ error: "user not signed in" });

   const errors = validationResult(req);
   if (!errors.isEmpty()) { return res.status(400).json({ error: errors.array() }); }

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
}

exports.deleteFriend = async (req, res) => {
   if (!req.user) return res.status(401).json({ error: "user not signed in" });

   const errors = validationResult(req);
   if (!errors.isEmpty()) { return res.status(400).json({ error: errors.array() }); }

   const { _id } = req.user;
   const { relationshipId } = req.body;

   // check if user is signed in
   if (!_id) return res.status(401).json({ error: "user not signed in" });

   // check for any missing fields in the request
   if (!relationshipId) return res.status(400).json({ error: 'missing relationshipId field in body' });

   try {
      // make sure friendship exists in database
      const friendship = await friendships.findOne({ _id: relationshipId });
      if (!friendship) return res.status(400).json({ error: "friendship not found in database" });

      // make sure user is part of the friendship
      if (!friendship.friendIds.includes(_id)) return res.status(401).json({ error: "user is not part of this friendship" });

      // delete friendship from database
      await friendships.deleteOne({ _id: relationshipId });
      return res.status(200).json({ message: "friendship deleted successfully" });
   }

   // handle any errors caused by the controller
   catch (error) {
      console.error(error);
      return res.status(500).json({ error: "server failed to delete friendship" });
   }
}