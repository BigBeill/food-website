const router = require("express").Router();
const genPassword = require("../library/passwordUtils").genPassword;
const validPassword = require("../library/passwordUtils").validPassword;
const mongoConnection = require("../config/connectMongo");
const user = require("../models/user");
const users = require("../models/user");
const createToken = require("../config/jsonWebToken")

// ------------ User Get Routes ------------

// takes 0 arguments from url

// route will:
//   return data for user that is currently logged in
router.get("/info", (req, res) => {
  if (req.user) {
    return res.status(200).json(req.user);
  } else {
    return res.status(401).json({ error: "user not signed in" });
  }
});

// takes 2 arguments from url:
// searchTerm: string
// amount: int
router.get("/findUsers", async (req, res) => {
  const searchTerm = req.query.searchTerm || "";
  const amount = parseInt(req.query.amount) || 30;

  const data = await ingredients
    .find({ name: { $regex: new RegExp(searchTerm, "i") } }, { name: 1 })
    .limit(amount);

  res.end(JSON.stringify(data));
});

router.post("/register", async (req, res) => {
  const {username, email, password} = req.body;

  //check for missing data
  if (!username) { return res.status(400).json({ error: 'no username provided' }); }
  if (!email) { return res.status(400).json({ error: 'no email provided' }); }
  if (!password) { return res.status(400).json({ error: 'no password provided' }); }

  //make sure username isn't already taken
  const searchUsername = await users.findOne({ username });
  if (searchUsername) { return res.status(400).json({ error: 'username already taken' }); }
  const searchEmail = await users.findOne({ email });
  if (searchEmail) { return res.status(400).json({ error: 'email already taken' }) }

  const hashedPassword = genPassword(password);

  const newUser = { username, email, hash: hashedPassword.hash, salt: hashedPassword.salt }
  new users(newUser).save()
  .then(() => { 
    console.log('new user created:', newUser)
    const accessToken = createToken(user);
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7 // cookie will expire after 7 days
    })
    return res.status(200).json({ message: 'register successful'})
  })
  .catch((error) => {
    console.log('failed to create new user:', newUser); 
    console.log(error);
    return res.status(500).json({ error: 'server failed to create new user' })
  });
});

router.post('/login', async (req, res) => {
  const {username, password} = req.body;

  const user = await users.findOne({ username }, { _id:1, username:1, email:1, hash:1, salt:1 });
  console.log(user);
  if (!user) { return res.status(400).json({ error: 'username not found' }); }
  if (!validPassword(password, user.hash, user.salt)) { return res.status(400).json({ error: 'incorrect password' }) }

  const accessToken = createToken(user);
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 7 // cookie will expire after 7 days
  })

  return res.status(200).json({ message: 'login successful'})
})

module.exports = router;
