const express = require('express')
const app = express()

const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

app.set('view engine', 'ejs')

app.use(express.static('./public'))

const indexRouter = require('./routes/index')
app.use('/', indexRouter)
app.use('/home', indexRouter)
app.use('/index', indexRouter)

const loginRouter = require('./routes/login')
app.use('/login', loginRouter)

const registerRouter = require('./routes/register')
app.use('/register', registerRouter)

const profileRouter = require('./routes/profile')
app.use('/profile', profileRouter)

app.listen(3000)