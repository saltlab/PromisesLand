/* The async function. */
function getUserDetails(user, cb) {
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
        cb('error', user);
    });
}

/* Promise wrapper. */
function getUserDetailsPromised(param0) {
    return new Promise(function (resolve, reject) {
        getUserDetails(param0, function(err,data){
                    if(err !== null)
                        return reject(err);
                    resolve(data);
                });
    });
}

/* Create the promise and register the handler. */
getUserDetailsPromised("mjackson").then(function (details) {
    console.log(details);
});
