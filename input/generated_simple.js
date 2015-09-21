
function getUserDetailsAsync(param){
        return new Promise(function(resolve,reject){
            getUserDetails(param,function(err,data){
                if(err !== null)
                    return reject(err);
                resolve(data);
            });
        });
    }

getUserDetailsAsync("mjackson").then(function (details) {
    console.log(details);
});
function getUserDetails(user, cb) {
    process.nextTick(function () {
        cb('error', null);
    });
}
;
