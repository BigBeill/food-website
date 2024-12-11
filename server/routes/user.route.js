const router = require("express").Router();
const userController = require("../controllers/user.controller");

// ------------ User Get Routes ------------

// takes 0 arguments from url

// route will:
//   return data for user that is currently logged in
router.get("/info", (req, res) => {
  if(!req.user)  return res.status(401).json({ error: "user not signed in" });
  return res.status(200).json({ message: "signed in user data", payload: req.user });
});

/*
---------- /findUser route ------------

Type:
    GET - get a list of users

Requires 0 arguments from body:

Optionally accepts 3 arguments from body:
    username: string (assumed to be "")
    limit: int (assumed to be 5)
    skip: int (assumed to be 0)

Route description:
    gathers a list of users of size {limit} containing the string {username}
    skip over the first {skip} results found
    return list to client
*/
router.get("/findUsers", (req, res, next) => {
    if (!req.body.username) req.body.username = "";
    if (!req.body.limit) req.body.limit = 5;
    if (!req.body.skip) req.body.skip = 0;
    next();
}, userController.findUsers);

/*
---------- /register route ------------

Type:
    POST - registers a new user

Requires 3 arguments from body:
    username: string
    email: string
    password: string

Route description:
    checks database for any data already being used by another account
    encrypt password
    create user profile and save in database
    create json cookies
    send json cookies to client
*/
router.post("/register", (req, res, next) => {
  if(!req.body.username) return res.status(400).json({error: 'missing username field in body'});
  if(!req.body.email) return res.status(400).json({error: 'missing email field in body'});
  if(!req.body.password) return res.status(400).json({error: 'missing password field in body'});
  next();
}, userController.register);

/*
---------- /login route ------------

Type:
    POST - logs user in

Requires 2 arguments from body:
    username: string
    password: string

Route description:
    get user data from database
    encrypt password and compare to database
    return json web token to client if valid password
*/
router.post("/login", (req, res, next) => {
  if (!req.body.username) return res.status(400).json({error: 'missing username field in body'});
  if (!req.body.password) return res.status(400).json({error: 'missing password field in body'});
  next();
}, userController.login);

/*
---------- /refresh route ------------

Type: 
    POST - gets a new user token

Requires 0 arguments from body

Route description:
    check validity of refresh tokens saved in cookies
    create and send new user token to client
*/
router.post("/refresh", userController.refresh);

/*
---------- /logout route ------------

Type:
    POST - logs user out

Requires 0 arguments from body

Route description:
    removes cookies from clients local storage
*/
router.post("/logout", userController.logout);

/*
---------- /updateAccount route ------------

Type:
    POST - change user profile data saved in database

Requires 2 arguments from body:
    username: string
    email: string

Optionally takes 1 argument from body:
    bio: string

Route description:
    make sure username and email doesn't already exist in database
    update users profile data in database
    create and send new cookies to client
*/
router.post("/updateAccount", (req, res, next) => {
  if (!req.body.username) return res.status(400).json({error: 'missing username filed provided in body'});
  if (!req.body.email) return res.status(400).json({error: 'missing email field provided in body'});
  next();
},userController.updateAccount);

module.exports = router;
