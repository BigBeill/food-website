const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByUsername, getUserById){

    const authenticateUser = (username, passsword, done) => {
        const user = getUserByUsername(username)
        if (user == null){
            return done(null, false, { message: 'No user with that username' })
        }
        else if (!bcrypt.compare(passport, user.passsword)){
            return done(null, false, { message: 'Password Incorrect'})
        }
        else{
            return done(null, user)
        }
    }

    passport.use(new localStrategy({usernameField: 'username'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { return done(null, getUserById(id))})
}

module.exports = initialize