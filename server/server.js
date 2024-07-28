//External imports
const express = require('express');
const session = require ('express-session');
const bodyParser = require ('body-parser')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)

//Local imports
const mongoConnection = require ('./config/connectMongo')

//setup server
const app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(express.json());

// setup sessionStore using mongo db
const sessionStore = new MongoStore({
    mongooseConnection: mongoConnection,
    collection: 'session'
})

app.use(session({
    secret:'figure this out later',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // expires after 24 hours
    }
}))

require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.user = req.user

    const now = new Date()
    const offset = -4
    const gmt4Time = new Date(now.getTime() + offset * 60 * 60 * 1000)
    const formattedTime = gmt4Time.toISOString().replace('T', ' ').substring(0, 19)

    // log some general information to console for debugging
    console.log("\n\n\n\n\n");
    console.log("\x1b[31m%s\x1b[0m", "CALL TO SERVER RECEIVED!")
    
    console.log()
    console.log("time of request: "+ "\x1b[35m%s\x1b[0m", formattedTime)
    console.log("active session:", !!req.session)
    console.log("active user:", !!req.user)
    if (req.user) { 
        console.log("   username = " + "\x1b[32m%s\x1b[0m", req.user.username)
        console.log("        _id =", req.user._id)
    }
    console.log("requested url: " + "\x1b[36m%s\x1b[0m", req.url)
    console.log("requested method: "+ "\x1b[36m%s\x1b[0m", req.method)
    console.log()

    next()
})

app.use('/server', (req, res, next) => {
    console.log("request made from client")
    next()
})

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