// imports
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require ('body-parser')
const mongoConnection = require ('./config/connectMongo')
const session = require ('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const flash = require('connect-flash')

//setup server
const app = express()
app.set('view engine', 'ejs')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(express.json());
app.use(flash())

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

    console.log()
    console.log(req.session)
    console.log(req.user)

    next()
})

app.use('/server', (req, res, next) => {
    console.log("request made from client")
    next()
})

const userRouter = require('./routes/user.route')
app.use('/user', userRouter)

const recipeRouter = require('./routes/recipe.route')
app.use('/recipe', recipeRouter)

//listen to port
const PORT = 4000
app.listen(PORT, () => {console.log("Server started on port " + PORT)})