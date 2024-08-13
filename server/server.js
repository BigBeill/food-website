//External imports
const express = require('express');
const bodyParser = require ('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//Local imports
const mongoConnection = require ('./config/connectMongo');
const validateToken = require ('./middleware/auth/validateToken');

// define server settings
const corsOptions = {
   origin: function (origin, callback) {
      if (origin && origin.startsWith('http://localhost')) {
         callback(null, true);
      } else {
         callback(new Error('Not allowed by CORS'));
      }
   },
   credentials: true
};

//setup server
const app = express();
app.use((req, res, next) => { console.log("\n\n\n\n\n" + "\x1b[31m%s\x1b[0m", "CALL TO SERVER RECEIVED!"); next(); })
app.use(cors(corsOptions));
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(express.json());
app.use(cookieParser());
app.use(validateToken);

const logGeneralData = require('./middleware/debugging/logGeneralData')
app.use(logGeneralData)

const ingredientRouter = require('./routes/ingredient.route')
app.use('/ingredient', ingredientRouter)

const recipeRouter = require('./routes/recipe.route')
app.use('/recipe', recipeRouter)

const userRouter = require('./routes/user.route')
app.use('/user', userRouter)

//listen to port
const PORT = 4000
app.listen(PORT, () => {console.log("Server started on port " + PORT)})