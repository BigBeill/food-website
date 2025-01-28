const { verify } = require("jsonwebtoken");
require("dotenv").config();

function validateToken(req, res, next) {
  const accessToken = req.cookies["accessToken"];

  if (!accessToken) {
    console.log("no access token found");
    return next();
  }

  try {
    const validToken = verify(accessToken, process.env.SESSION_SECRET);
    if (validToken) {
      req.user = {
        _id: validToken._id,
        username: validToken.username,
      };
    }
    else {
      req.user = {failure: "invalid access token"};
    }
  } catch (error) {
    console.log("error validating access token:", accessToken);
  }
  return next();
}

module.exports = validateToken;
