const router = require("express").Router();
const userController = require("../controllers/user.controller")

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



router.post("/register", userController.register);

router.post('/login', userController.login);

router.post('/refresh', userController.refresh);

router.post('/logout', userController.logout);



module.exports = router;
