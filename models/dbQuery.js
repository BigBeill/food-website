const connection = require('../config/connectDB')

function makeQuery(query){
    return new Promise((resolve, reject) => {
        connection.query(query, function (err, result) {
            err ? reject(err): resolve(result);
        })
    })
}

module.exports = makeQuery