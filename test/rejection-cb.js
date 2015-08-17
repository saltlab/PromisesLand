function renderTweetsFlow() {
    getUser(function (errA, valueA) {
        if (errA) {
            console.error(errA);
            return;
        }
        console.log('success happened');
        getTweets(valueA, function (errB, valueB) {
            console.log(valueB);
        });
    });
}