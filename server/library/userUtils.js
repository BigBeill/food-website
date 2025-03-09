const friendships = require('../models/joinTables/friendship');
const friendRequest = require('../models/joinTables/friendRequest');


function getRelationship (user, target) {
   return new Promise( async (resolve, reject) => {
      try {
         // make sure user and target are not the same
         if (user == target) { return resolve({ type: 4, _id: 0 }); }
         let relationship;

         // check if users are friends
         relationship = await friendships.findOne({ friendIds: { $all: [user, target] } });
         if (relationship) { return resolve({ type: 1, _id: relationship._id }); }

         // check if friend request has been received
         relationship = await friendRequest.findOne({ senderId: target, receiverId: user });
         if (relationship) { return resolve({ type: 2, _id: relationship._id }); }

         // check if friend request has been sent
         relationship = await friendRequest.findOne({ senderId: user, receiverId: target });
         if (relationship) { return resolve({ type: 3, _id: relationship._id }); }

         return resolve({ type: 0, _id: 0 });

      }
      catch (error) {
         console.log("server/utils/userUtils.js getRelationship failed");
         console.error(error);
         reject("getRelationship failed");
      }
   });
}

module.exports = {
   getRelationship
}