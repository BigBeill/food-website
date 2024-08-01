//External imports
const express = require('express');
const session = require ('express-session');
const bodyParser = require ('body-parser');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

//Local imports
const mongoConnection = require ('./config/connectMongo');
const validateToken = require ('./middleware/auth/validateToken')

//setup server
const app = express()
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

const devToolsRouter = require('./routes/devTools.route')
app.use('/devTools', devToolsRouter)

//listen to port
const PORT = 4000
app.listen(PORT, () => {console.log("Server started on port " + PORT)})