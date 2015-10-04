/**
 * Example taken from https://dzone.com/articles/using-promises-nodejs-apps
 */


//In data access file
exports.getAllStudents = function getAllStudents(request, response) {
    mongoDbObj.students.find().toArray(function (err, data) {
        if (err) {
            console.log(err);
            response.send(500, {error: err});
        }
        else {
            console.log(data);
            response.send(data);
        }
    });
};


//Route
app.get('/api/students', getAllStudents);
