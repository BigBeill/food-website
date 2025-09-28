const FriendRequest = require("../models/joinTables/friendRequest");
const Friendship = require("../models/joinTables/friendship");
const FriendFolder = require("../models/friendFolder");
const path = require("path");
const User = require("../models/user");
const userUtils = require('../library/userUtils');
const volumeUtils = require("../library/volumeUtils");
require("dotenv").config();

/*
returns a complete userObject depending on the parameters provided in the request
@route: GET /user/getObject/:userId?/:relationship?
*/
exports.getObject = async (req, res) => {

   const clientId = req.user?._id;
   const { userId = clientId, relationship = false } = req.params;
   if (!userId) { return res.status(401).json({ error: "no user signed in and missing userId field in params" }); }

   // create the userObject based on the userId provided
   let userObject;
   try {
      let userData = await User.findOne({ _id: userId });
      if (!userData) { return res.status(400).json({ error: "user not found in database" }); }
      userData = userData.toObject(); // convert userData to a plain object

      // attach current user as target if relationship is true
      if (relationship) { userData.relationship = {target: clientId}; }

      // verify the userObject before returning to the client
      userObject = await userUtils.verifyObject(userData, true);
   }
   catch(error){
      console.log("\x1b[31m%s\x1b[0m", "user.controller.getObject failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to get user data" });
   }

   return res.status(200).json({ message: "user data collected successfully", payload: userObject });
}



/*
returns a userObject array containing all the users in the database that match the query parameters
@route: GET /user/find
*/
exports.find = async (req, res) => {

   // define variables for the request
   const _id = req.user?._id;
   const { category, username, email, limit, skip, count } = req.query;

   // make sure no required fields are missing
   if (category != 'all' && !_id) { return res.status(401).json({ error: "user not signed in" }); };

   let userList = []; // create empty array to hold user objects
   let query = {}; // create query for searching the database with required user fields

   // add a list of user _ids that are friends with the current user to the query if the friends list is provided
   if (category == 'friends') {
      try {
         // collect a list of friendship relationships user is apart of
         const friendshipList = await Friendship.find({ friendIds: _id });
         // extract the _ids of each non-signed in user
         const friendsList = friendshipList.map((friendship) => friendship.friendIds.filter((friend) => friend != _id) );
         // add the _ids to the query
         query._id = { $in: friendsList };
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.find failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed collect a list of friends inside the database" });
      }
   }

   // add a list of user _ids that have sent the current user a friend request to the query if the requests list is provided
   else if (category == 'requests') {
      try {
         // collect a list of friend requests user has received
         const receivedRequests = await FriendRequest.find({ receiverId: _id });
         // extract the _ids of each non-signed in user
         const requestList = receivedRequests.map((request) => request.senderId);
         // add the _ids to the query
         query._id = { $in: requestList };
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.find failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed collect a list of friend requests inside the database" });
      }
   }

   // add additional fields to the search query
   if (username) query.username = { $regex: new RegExp(username, 'i') };
   if (email) query.email = { $regex: new RegExp(email, 'i') };

   // conduct the database search for users
   let userObjectArray = [];
   try {
      userList = await User.find(query)
         .skip(skip)
         .limit(limit);

      // verify and complete each userObject before returning to the client
      userObjectArray = await Promise.all( userList.map( async (user) => {
         userData = user.toObject();
         userData.relationship = { target: _id };
         const userObject = await userUtils.verifyObject(userData, true);
         return userObject;
      }));
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.find failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to find users in database" });
   }

   let payload = { userObjectArray };

   // attach the count field if requested by the client
   if (count) {
      try {
         const totalCount = await User.countDocuments(query);
         payload.count = totalCount;
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.find failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to count users in database" });
      }
   }

   return res.status(200).json({ message: "user list collected successfully", payload });
}



/*
returns a folderObject array containing all the folders in the database that match the query parameters
@route: GET /user/folder
*/
exports.folder = async (req, res) => {
   // make sure user is signed in
   if (!req.user) return res.status(401).json({ error: "user not signed in" });

   const _id = req.user._id;
   const { folderId, count, limit, skip } = req.query;

   // build the query
   let query;
   if (!folderId) { query = { owner: _id, parent: null }; }
   else { query = { owner: _id, parent: folderId }; }

   // find folders in database
   let foldersList;
   try {
      foldersList = await FriendFolder.find(query)
         .skip(skip)
         .limit(limit);
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.folder failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to find folders" });
   }

   let payload = { folders: foldersList };

   // attach count if requested by the client
   if (count) {
      try {
         const totalCount = await FriendFolder.countDocuments(query);
         payload.count = totalCount;
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.folder failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to count folders" });
      }
   }

   res.status(200).json({ message: "folders collected successfully", payload });
}



/*
updates the information inside database for the signed in user
@route: POST /user/updateAccount
*/
exports.updateAccount = async (req, res) => {
   if (!req.user) { return res.status(401).json({ error: "user not signed in" }); }

   const { username, email, bio } = req.body;

   // check for any missing fields in the request
   if (!username) return res.status(400).json({error: 'missing username filed provided in body'});
   if (!email) return res.status(400).json({error: 'missing email field provided in body'});

   //make sure username or email aren't already taken
   try{
      const foundUsername = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (foundUsername && foundUsername._id != req.user._id) { return res.status(400).json({ error: "username already taken" }); }
      const foundEmail = await User.findOne({ email: new RegExp(`^${email}$`, 'i') }) 
      if (foundEmail && foundEmail._id != req.user._id) { return res.status(400).json({ error: "email already taken" }); }
   }
   catch(error){
      console.log("\x1b[31m%s\x1b[0m", "user.controller.updateAccount failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to update user account" });
   }

   let updatedUserData = {
      username: username,
      email: email,
      bio: bio || ""
   };

   // check if a new profile photo has been uploaded with the request
   if (req.file) {
      try {
         // add image data to the updated user data
         updatedUserData.image = {
            filename: req.file.filename,
            url: path.join("/uploads/users", req.file.filename),
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date()
         };

         // delete the old image file from the server if it exists
         const existingImage = await User.findOne({ _id: req.user._id }, { image: 1 });
         if (existingImage && existingImage.image) {
            volumeUtils.deleteVolumeFile("users", existingImage.image.filename);
         }
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.updateAccount failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to handle replacing profile photo" });
      }
   }

   // update new user data inside the database
   let updatedUserObject;
   try {
      updatedUserObject = await userUtils.verifyObject(updatedUserData, false);
      await User.updateOne({ _id: req.user._id }, { $set: updatedUserObject });
   }
   catch (error) {
      console.error(error);
      return res.status(500).json({ error: "server failed to update user account" });
   }

   return res.status(200).json({ message: "user account updated successfully" });
}



/*
creates a friend request object in the database between the signed in user and the userId provided in the request body
@route: POST /user/sendFriendRequest
*/
exports.sendFriendRequest = async (req, res) => {
   // make sure user is signed in
   if (!req.user) return res.status(401).json({ error: "user not signed in" });

   const userId = req.user._id;
   const { targetId } = req.body;

   // find receiver in the database
   try {
      const targetData = await User.findOne({ _id: targetId });
      if (!targetData) { return res.status(404).json({ error: "user receiving friend request not found" }); }
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.sendFriendRequest failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to find user receiving friend request" });
   }

   // check if friend request or friendship already exist inside the database
   try {
      // make sure no outgoing or incoming friend requests already exist in the database
      const sentRequest = await FriendRequest.findOne({ senderId: userId, receiverId: targetId });
      if (sentRequest) return res.status(409).json({ error: "friend request already sent to this user" });

      const receivedRequest = await FriendRequest.findOne({ senderId: targetId, receiverId: userId });
      if (receivedRequest) return res.status(409).json({ error: "friend request already received from this user" });

      // make sure friendship doesn't already exist in database
      const existingFriendship = await Friendship.findOne({ friendIds: { $all: [targetId, userId] } });
      if (existingFriendship) return res.status(409).json({ error: "friendship already created with this user" });
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.sendFriendRequest failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to check if friendRequest or friendship already exist" });
   }

   // create the friend request and save to the database
   let friendship;
   try {
      const newRequest = { senderId: userId, receiverId: targetId };
      friendship = await new FriendRequest(newRequest)
         .save();
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.sendFriendRequest failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to create friend request inside the database" });
   }
   
   return res.status(201).json({ message: "friend request sent", payload: friendship });
}



/*
Removes a friend request from the database and creates a friendshipObject if the request is accepted
@route: POST /user/processFriendRequest
*/
exports.processFriendRequest = async (req, res) => {
   // make sure user is signed in
   if (!req.user) return res.status(401).json({ error: "no valid access token provided" });

   const userId = req.user._id;
   const { requestId, accept } = req.body;

   // find friend request inside the database
   let friendRequestData;
   try {
      friendRequestData = await FriendRequest.findOne({ _id: requestId });
      if (!friendRequestData) { return res.status(404).json({ error: "friend request not found in database" }); }      
   }
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.processFriendRequest failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to find friend request in database" });
   }

   // logic for accepting the friend request
   if (accept) {
      // check if the client has write access to the friend request
      if (friendRequestData.receiverId != userId) { return res.status(403).json({ error: "current user is not the receiver of this request" }); }

      try {
         // check if friendship already exists in the database
         const existingFriendship = await Friendship.findOne({ friendIds: { $all: [friendRequestData.senderId, userId] } });
         if (existingFriendship) {
            await FriendRequest.deleteOne({ _id: requestId });
            return res.status(409).json({ error: "friendship already exists inside the database" });
         }

         // add friendship to the database
         const newFriendship = await new Friendship({ friendIds: [friendRequestData.senderId, userId] })
            .save();
         
         // delete friend request from database
         await FriendRequest.deleteOne({ _id: requestId });
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.processFriendRequest failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to approve friend request" });
      }

      return res.status(201).json({ message: "friendship  created successfully", payload: newFriendship });
   }

   // instructions for rejecting or canceling the friend request
   else {
      // check if the client has write access to the friend request
      if (friendRequestData.senderId != userId && friendRequestData.receiverId != userId) { return res.status(403).json({ error: "current user does not have write access to this request" }); }

      // delete friend request from database
      try {
         await FriendRequest.deleteOne({ _id: requestId });
      }
      catch (error) {
         console.log("\x1b[31m%s\x1b[0m", "user.controller.processFriendRequest failed..." + "\n Reason given: " + error);
         return res.status(500).json({ error: "server failed to remove friend request from the database" });
      }

      return res.status(204).json({ message: "friendRequest removed from the database" });

   }
}



/*
removes a friendshipObject from the database
@route: POST /user/deleteFriend
*/
exports.deleteFriend = async (req, res) => {

   // make sure user is signed in
   if (!req.user) { return res.status(401).json({ error: "user not signed in" }); }

   const userId = req.user._id;
   const { relationshipId } = req.body;

   // check for any missing fields in the request
   if (!relationshipId) return res.status(400).json({ error: 'missing relationshipId field in body' });

   // find and delete the friendship from the database
   try {
      const friendship = await Friendship.findOne({ _id: relationshipId });
      if (!friendship) { return res.status(400).json({ error: "friendship not found in database" }); }

      // check if client has write access to the friendship
      if (!friendship.friendIds.includes(userId)) { return res.status(403).json({ error: "client does not have write access to this friendship" }); }

      // delete friendship from database
      await Friendship.deleteOne({ _id: relationshipId });
   }

   // handle any errors caused by the controller
   catch (error) {
      console.log("\x1b[31m%s\x1b[0m", "user.controller.deleteFriend failed..." + "\n Reason given: " + error);
      return res.status(500).json({ error: "server failed to delete friendship" });
   }

   return res.status(204).json({ message: "friendship deleted successfully" });
}