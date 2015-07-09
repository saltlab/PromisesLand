var promise = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…

  if ( 1===1 /* everything turned out fine */) {
    resolve("Stuff worked!");
  }
  else {
    reject(Error("It broke"));
  }
});

promise.then(function( message ) {
  console.log( message );
},
function( err ) {
  console.log( err );
});