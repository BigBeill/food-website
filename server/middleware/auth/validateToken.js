const { verify } = require("jsonwebtoken");
require("dotenv").config();

function validateToken(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken) {
    req.user = {failure: "no access token provided"};
    return next();
  }

  try {
    const validToken = verify(accessToken, process.env.SESSION_SECRET);
    if (validToken) {
      req.user = {
        _id: validToken._id,
        username: validToken.username,
        email: validToken.email,
        bio: validToken.bio,
      };
    }
    else {
      req.user = {failure: "invalid access token"};
    }
  } catch (error) {
    console.log("error validating access token:", accessToken);
    req.user = {failure: "system error validating access token"};
  }
  return next();
}

module.exports = validateToken;
