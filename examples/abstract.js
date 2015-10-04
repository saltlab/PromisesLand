function indirectAsyncFunc(arg0, arg1, callback) {

    assert.ok(arg1, 'arg1 is required');

    knownAsyncFunc(arg0, function (err, data) {
        if (err) {
            return callback(err);
        }

        intermediate_result = '...';

        var result = someSyncCall(arg0);
        callback(null, result);


    });
}

