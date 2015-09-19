 function nestedFlow() {


    a(function (errA, valueA) {
        b(valueA, function (errB, valueB) {
            function e() {
                c(valueB, function (errC, valueC) {
                    if (errC) {
                        console.log("uh oh")
                    }
                    console.log(valueC);
                });
                d(valueB, function (errC, valueC) {
                    if (errC) {
                        console.log("uh oh")
                    }
                    console.log(valueC);
                });
            }
        });
    });
}

function nestedFlow() {
    function aNew(){
        return new Promise (function (resolve,reject){
            a(function(err,data){
                if(err!=null)
                    return reject(err);
                resolve(data);
            });
        });


    }

    aNew().then().bNew().then(
        cNew().then()
    ).dNew().then()


}