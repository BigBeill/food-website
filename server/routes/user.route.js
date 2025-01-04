const router = require("express").Router();
const userController = require("../controllers/user.controller");

/*
------------ /info route ------------

takes 0 arguments from params

Optionally accepts 1 arguments from params:
    userId: mongoose object id


route will:
    get user data with {userId} from database
    if no userId provided return data for user that is currently logged in

*/
router.get("/info/:userId?", userController.info);

/*
------------ /defineRelationship route ------------

takes 1 arguments from params
    userId: mongoose object id

route will:
    figure out the relationship between the user that is currently logged in and the user with {userId}

returns:
    type: int
        0: no relationship
        1: user is friends with {userId}
        2: user has received a friend request from {userId}
        3: user has sent a friend request to {userId}
    _id: mongoose object id
*/
router.get("/defineRelationship/:userId", userController.defineRelationship);

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

Returns:
    array
*/

router.get("/find", userController.find);

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
router.post("/register",  userController.register);

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
router.post("/login", userController.login);

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
router.post("/updateAccount", userController.updateAccount);

/*
---------- /sendFriendRequest route ------------

Type:
    POST - creates a friend request in server database

Requires 1 arguments from body:
    userId: mongoose object id

Route description:
    creates a friend request in the database, setting the current user as the sender and {receiver} as the receiver
*/
router.post("/sendFriendRequest", userController.sendFriendRequest);

/*
---------- /acceptFriendRequest route ------------

Type:
    POST - logs user out

Requires 1 arguments from body:
    requestId: mongoose object id
    accept: boolean

Route description:
    checks the validity of the friend request
    if accept is true, create a friendship object between the sender and receiver of the request
    if accept is false, delete the friend request from the database
*/
router.post("/processFriendRequest", userController.processFriendRequest);

module.exports = router;
