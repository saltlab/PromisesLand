function nestedFlow() {
    a(function (errA, valueA) {
        b(valueA, function (errB, valueB) {
            c(valueB, function (errC, valueC) {
                if (errC) {

                    console.log("uh oh")
                }
                console.log(valueC);
            });
        });
    });
}