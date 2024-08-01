const {verify} = require("jsonwebtoken");
require('dotenv').config();

function validateToken(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken){ return next(); }

  try {
    const validToken = verify(accessToken, process.env.SESSION_SECRET);
    if (validToken) {
      req.user = {
        _id: validToken._id,
        username: validToken.username
      }
    }
  } catch (error) {
    console.log('error validating cookie:', accessToken);
    console.log(error);
  }
  return next();
}

module.exports = validateToken;