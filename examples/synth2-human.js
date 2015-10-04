/*Example taken from http://stackoverflow.com/questions/28432401/replacing-callbacks-with-promises-in-node-js?rq=1*/

/*Refactoring 1: If database adapter API doesn't output Promises*/
exports.getUsers = function getUsers() {
    return new Promise(function (reject, resolve) {
        connection.connect(function () {
            connection.query('SELECT * FROM Users', function (err, result) {

                if (err) {
                    // Reject the Promise with an error
                    return reject(err)
                }

                // Resolve (or fulfill) the promise with data
                return resolve(result)
            });
        });
    });
};

/*Refactoring 2: If database adapter API outputs Promises*/
exports.getUsers = function () {
    return connection.connect().then(function () {
        return connection.query('SELECT * FROM Users');
    });
};

// Usage
getUsers().then(console.log);

