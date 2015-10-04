function indirectAsyncFunc(arg0, arg1) {
    return new Promise(function (resolve, reject) {
        var content;

        if (!arg1) {
            reject('arg1 is required');
        }

        knownAsyncFunc(arg0, arg1, function (err, data) {
            if (err) {
                return reject(err);
            }

            css = '...'

            result = someSyncCall(html, css, options);
            resolve(result);
        });
    });

}