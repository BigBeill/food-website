const passport = require('passport')
const LocalStrategy = require('passsport-local').Strategy
const connection = require('./connectMongo')
const User = connection.models.User

const customFields = {
    usernameField: 'uname',
    passwordField: 'pw'
}

const verifyCallback = (username, password, done) => {
    User.findOne({ username: username})
        .then((user) => {

            if (!user) { return done(null, false) }
            
            const isValid = validPassword(password, user.hash, user.salt)

            if (ifValid) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        })
        .catch((err) => {
            done(err)
        })
}

const strategy = new LocalStrategy()