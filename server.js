// import express
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require ('body-parser')
const mongoConnection = require ('./config/connectMongo')
const session = require ('express-session')
const MongoStore = require('connect-mongo')(session)

//setup server
const app = express()
app.set('view engine', 'ejs')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
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
        maxAge: 1000 * 60 * 60 * 24
    }
}))

//redirect requests to routers
const indexRouter = require('./routes/index.route')
app.use('/', indexRouter)
app.use('/home', indexRouter)
app.use('/index', indexRouter)

const userRouter = require('./routes/user.route')
app.use('/user', userRouter)

//listen to port
app.listen(3000)