var promise = new Promise(function (resolve, reject) {
    // do a thing, possibly async, then…

    if (1 === 1 /* everything turned out fine */) {
        resolve("Stuff worked!");
    }
    else {
        reject(Error("It broke"));
    }
});
var p;
promise.then(function (message) {
        console.log(message);
        p = new Promise(function (resolve, reject) {
            // do a thing, possibly async, then…

            if (1 === 1 /* everything turned out fine */) {
                resolve("boo");
            }
            else {
                reject(Error("It broke"));
            }
        });
        return p;
        //return Promise.resolve();
    },
    function (err) {
        console.log(err);
    }).then(function (message) {
        console.log('next:' + message);
    });

console.log('a')
process.nextTick(function(){
    console.log('b')
    process.nextTick(function(){console.log('c')});
});