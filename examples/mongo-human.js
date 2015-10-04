/**
 * Example taken from https://dzone.com/articles/using-promises-nodejs-apps
 */

app.get('/api/students', function (request, response) {
    mongoOps.getAllStudentsAsync()
        .then(function (data) {
            response.send(data);
        }, function (err) {
            response.send(500, {error: err});
        });
});


exports.getAllStudentsAsync = function getAllStudentsAsync() {
    return new Promise(function (resolve, reject) {
        mongoDbObj.students.find()
            .toArray(function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
    });
};


