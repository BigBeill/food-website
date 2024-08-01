const {sign} = require("jsonwebtoken");
require('dotenv').config();

function createToken(user) {
  
  const accessToken = sign(
    { _id: user._id, username: user.username}, 
    process.env.SESSION_SECRET,
    { expiresIn: '30d' }
  );

  return accessToken;
}

module.exports = createToken;