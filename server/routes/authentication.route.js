// router for managing authentication related
const router = require("express").Router();
const authenticationController = require("../controllers/authentication.controller");
const { body, checkExact } = require("express-validator");
const { runValidation } = require("../library/sanitationUtils");






/*
---------- /status route ------------
Type: GET — Checks if user is logged in

Expects 0 arguments in query

Route description:
   - Checks if the user is logged in by verifying the JWT token
   - If logged in, returns user data

Returns:
   - 200 User is logged in, returns user Id
   - 401 User is not logged in
*/
router.get("/status",
   authenticationController.status
);




/*
---------- /register route ------------

Type:
   POST — Registers a new user

Expects 3 arguments in body:
   username: string
   email: string
   password: string

Route description:
   - Checks if the username or email is already registered
   - Salts and hashes the password
   - Creates a user object and saves it to the database
   - Creates JSON Web Token cookies and sends them to the client

Returns:
   - 201 User was successfully registered
   - 400 Invalid or missing fields
   - 409 Username or email is already registered
*/
router.post("/register",
   [
      body("username").isString().isLength({ min: 3, max: 60 }).withMessage("Username must be a string between 3 and 60 characters"),
      body("email").isString().isEmail().withMessage("Email must be a valid email address"),
      body("password").isString().isLength({ min: 3, max: 60 }).withMessage("Password must be a string between 3 and 60 characters"),
      checkExact(),
   ],
   runValidation,
   authenticationController.register
);






/*
---------- /login route ------------

Type:
   POST — Logs user in

Expects 3 arguments in body:
   username: string
   password: string
   rememberMe: boolean

Route description:
   - Retrieves user data from the database
   - Verifies the password matches the hashed password
   - Creates JWT cookies and sends them to the client
   - If rememberMe is true, sets cookie max-age to 30 days

Returns:
   - 200 User verified and cookies sent
   - 400 Invalid or missing fields
   - 401 Username or password is incorrect
*/
router.post("/login", 
   [
      body("username").isString().isLength({ min: 3, max: 60 }).withMessage("Username must be a string between 3 and 60 characters"),
      body("password").isString().isLength({ min: 3, max: 60 }).withMessage("Password must be a string between 3 and 60 characters"),
      body("rememberMe").isBoolean().withMessage("Remember must be a boolean value"),
      checkExact(),
   ],
   runValidation,
   authenticationController.login
);






/*
---------- /refresh route ------------

Type:
   POST — Issues a new user token

Expects:
   No arguments in body

Route description:
   - Checks validity of refresh tokens in the client’s cookies
   - Creates and sends a new user token

Returns:
   - 200 New user token sent
   - 400 Arguments were provided or valid refresh token not found
   - 401 Refresh token is invalid or expired
*/
router.post("/refresh", 
   [
      checkExact(),
   ],
   runValidation,
   authenticationController.refresh
);






/*
---------- /requestPasswordReset route ------------
Type: 
   POST — sends a password reset email to client

Expects:
   email: string

Route description:
   - Verifies if the email is associated with a registered user
   - Generates a unique password reset token
   - Sends an email to the user with the password reset link

Returns:
   - 200 Password reset email sent
   - 400 Invalid or missing fields
   - 401 User is already logged in
*/
router.post("/requestPasswordReset", 
   [
      body("email").isString().isEmail().withMessage("Email must be a valid email address"),
      checkExact(),
   ],
   runValidation,
   authenticationController.requestPasswordReset
);

/*
---------- /changePassword route ------------

Type:
   POST — Changes the user’s password

Expects 2 arguments in body:
   password: string
   uniqueString: string (optional, required if user is not logged in)
   currentPassword: string (optional, required if user is logged in)

Route description:
   - Get userId from JWT if user is logged in
   - If userId not found in JWT, get userId from uniqueString
   - Salts and hashes the new password
   - Deletes any user authentication tokens (logs user out of all devices)
   - Deletes the password reset token from the database

Returns:
   - 200 Password successfully changed
   - 400 Invalid or missing fields
   - 401 User isn’t logged in and no uniqueString provided
   - 404 uniqueString not found in database
*/
router.post("/changePassword",
   [
      body("password").isString().isLength({ min: 6, max: 45 }).withMessage("Password must be a string between 6 and 45 characters"),
      body("uniqueString").optional().isString().withMessage("Unique string must be a valid string"),
      body("currentPassword").optional().isString().withMessage("Current password must be a valid string"),
      checkExact(),
   ],
   runValidation,
   authenticationController.changePassword
);





/*
---------- /logout route ------------

Type:
   POST — Logs the current user out

Expects:
   No arguments in body

Route description:
   - Removes all cookies from the client’s browser

Returns:
   - 200 Cookies successfully removed
   - 400 Arguments were provided with this request
*/
router.post("/logout",
   [
      checkExact(),
   ],
   runValidation,
   authenticationController.logout
);






module.exports = router;