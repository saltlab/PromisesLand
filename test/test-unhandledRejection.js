'use strict'
var delay = function (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
 
delay(2000)
  .then(function (data) {
  	console.log('came here!'+data)
    data.foo = 'hello'
  })