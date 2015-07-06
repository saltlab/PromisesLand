var compareAst = require('compare-ast');

template = 'system.call(input, function cbfunc(err, result) {
                    if (!err) {
                        callback(null,addresses[0]);
                    } else {
                        callback(err);
                    }
                });'
sourceCode = 'dns.resolve4(host, function resolve4Cb(err, addresses) {
                    if (!err) {
                        callback(null,addresses[0]);
                    } else {
                        callback(err);
                    }
                });'

console.log(compareAst(
			template,
			sourceCode,
			{ varPattern: /\S*/ }
		));