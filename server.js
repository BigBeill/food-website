// import express
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

//setup server
app.set('view engine', 'ejs')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

//redirect request to routers
const indexRouter = require('./routes/index.route')
app.use('/', indexRouter)
app.use('/home', indexRouter)
app.use('/index', indexRouter)

const userRouter = require('./routes/user.route')
app.use('/user', userRouter)

//listen to port
app.listen(3000)