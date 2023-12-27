const express = require('express')
const app = express()

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