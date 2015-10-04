/*Example taken from http://stackoverflow.com/questions/28432401/replacing-callbacks-with-promises-in-node-js?rq=1*/
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'db'
});

exports.getUsers = function (callback) {
    connection.connect(function () {
        connection.query('SELECT * FROM Users', function (err, result) {
            if (!err) {
                callback(result);
            }
        });
    });
};


/*Usage*/
var dbCon = require('./dbConnection.js');
dbCon.getUsers(console.log);