//External imports
const express = require('express');
const bodyParser = require ('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//Local imports
const mongoConnection = require ('./config/connectMongo');
const validateToken = require ('./middleware/auth/validateToken');
const setCookieFlags = require ('./middleware/auth/cookieFlags');

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
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(validateToken);
app.use(setCookieFlags);

const logGeneralData = require('./middleware/debugging/logGeneralData')
app.use(logGeneralData)

const authenticationRouter = require('./routes/authentication.route')
app.use('/authentication', authenticationRouter)

const adminRouter = require('./routes/admin.route')
app.use('/admin', adminRouter)

const ingredientRouter = require('./routes/ingredient.route')
app.use('/ingredient', ingredientRouter)

const recipeRouter = require('./routes/recipe.route')
app.use('/recipe', recipeRouter)

const userRouter = require('./routes/user.route')
app.use('/user', userRouter)

const errorHandler = require('./middleware/debugging/errorHandler');
app.use(errorHandler);

//listen to port
const PORT = 4000
app.listen(PORT, () => {console.log("Server started on port " + PORT)})