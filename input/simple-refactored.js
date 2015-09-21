/* Get the first command line arg. */
function getUserDetailsPromised(param0) {
    return new Promise(function (resolve, reject) {
        getUserDetails(param0, function(err,data){
                    if(err !== null)
                        return reject(err);
                    resolve(data);
                });
    });
}
var name = process.argv[2];
/* Asynchronously print the name. */
function getUserDetails(user, cb) {
    if (user) {
        function process_nextTickPromised() {
            return new Promise(function (resolve, reject) {
                process.nextTick(function(err,data){
                    if(err !== null)
                        return reject(err);
                    resolve(data);
                });
            });
        }
        process_nextTickPromised().then(function () {
            /* Call the callback with data. */
            cb(null, user);
        });
    } else {
        /* Call the callback with error. */
        cb("Error: No name given.", null);
    }
}
/* Call the async function. */
getUserDetailsPromised(name).then(function (details) {
}, function (err) {
    /* Success handler. */
    console.log(err);
});
