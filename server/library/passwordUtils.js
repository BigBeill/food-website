const crypto = require('crypto')

/*
generates salt and hashed password for provided password

expected input:
    password = int

returns:
    {
        salt: string
        hash: string
    }
*/
function genPassword(password){
    var salt = crypto.randomBytes(32).toString('hex')
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')

    return {
        salt: salt,
        hash: genHash
    }
}

/*
checks if password provided matches the hashed password once salt and hash have been added

expected input:
    password = string
    hash = string
    salt = string

return:
    bool
*/
function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === hashVerify
}

module.exports.validPassword = validPassword
module.exports.genPassword = genPassword