var id = 300;

function getdata(number,cb){
	cb(null, number);
	process.nextTick(function() {cb(null,number+1);}); 
} 

function callback (err, num) {
	if (!err){
	console.log(num);
	}
}
console.log('at the start')
getdata(id,callback);
console.log('at the end')

function fn1(){
    console.log('fn1');
}

function fn2(){
    console.log('fn2');
}

setTimeout(fn1,1000);
setTimeout(function fn3(){console.log('hi');},1000);
setTimeout(fn2,999);