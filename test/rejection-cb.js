function renderTweetsFlow() {
    getUser(function (errA, valueA) {
        if (errA) {
            console.error(errA);
            return;
        }
        getTweets(valueA, function (errB, valueB) {
            console.log(valueB);
        });
    });
}