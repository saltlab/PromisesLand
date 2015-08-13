var compareAst = require('compare-ast');
var esprima = require("esprima");
var escodegen = require("escodegen");
var estraverse = require("estraverse");
var escope = require("escope");
var fs = require("fs");
var promisify = require("es6-promisify");

ArgumentParser = require('argparse').ArgumentParser;

var funcsToNodify = [];

var argParser = new ArgumentParser({
    addHelp: true,
    description: 'ACFG generator'
});

argParser.addArgument(
    [ '-d','--directory' ],
    { nargs: 0,
        help: 'give directory path' }
);

argParser.addArgument(
    [ '-p','--pkgs' ],
    { nargs: 0,
        help: 'analyze pkgs as well' }
);

argParser.addArgument(
    [ '-s','--suffix' ],
    { nargs: 0,
        help: 'suffix for refactored function names',
        defaultValue: 'Promised' }
);



argParser.addArgument(
    [ '-t','--type' ],
    { help: 'Should be one of npm, hybrid'}
);


var r = argParser.parseKnownArgs();
var args = r[0],
    func_name_suffix = args.suffix,
    files = r[1];

template = 'system.call(input, function cbfunc(err, result) {\
                    if (!err) {\
                        callback(null,addresses[0]);\
                    } else {\
                        callback(err);\
                    }\
                });'
sourceCode = 'dns.resolve4(host, function resolve4Cb(err, addresses) {\
                    if (!err) {\
                        callback(null,addresses[0]);\
                    } else {\
                        callback(err);\
                    }\
                });'

//console.log(compareAst(
//			template,
//			sourceCode,
//			{ varPattern: /\S*/ }
//		));

path = files[0];

var text = fs.readFileSync(path, "utf8");

function curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(this, args.concat(
            Array.prototype.slice.call(arguments)));
    };
}

function callbackReplacer(matcher, replacer, node) {
    if(matcher(node)) {
        // create a call to .then()
        return replacer(node);
    }
}

function hasNodeCallback(node) {
    var args = node.arguments;
    return node.type === "CallExpression" &&
        args.length &&
        args[args.length - 1].type === "FunctionExpression" &&
        args[args.length - 1].params.length === 2;
}

function replaceNodeCallback(node) {
    // the called function
    var func = node;
    funcsToNodify.push(func.callee.name);
    func.callee.name += func_name_suffix;
    // arguments to called function
    var args = func.arguments;
    // the last argument is the callback we need to turn into promise
    // handlers
    var callback = args.pop();

    // TODO retain comments
    return {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": func,
            "property": {
                "type": "Identifier",
                "name": "then"
            }
        },
        "arguments": callbackToThenArguments(callback)
    };
}

function callbackToThenArguments(callback) {
    var thenArgs = [callback];

    var errorArg = callback.params.shift();

    var errback = getErrorHandler(callback, errorArg);
    if (errback) {
        thenArgs.push(errback);
    }

    return thenArgs;
}

function getErrorHandler(callback, errorArg) {
    var errorArgName = errorArg.name;
    if (callback.body.type === 'BlockStatement') {
        var body = callback.body.body;
        for (var i = 0, len = body.length; i < len; i++) {
            // Only matches
            // if (error) ...
            // TODO: think about matching if (err !== null) and others
            if (
                body[i].type === "IfStatement" &&
                body[i].test.type === 'Identifier' &&
                body[i].test.name === errorArgName
            ) {
                var handler = body.splice(i, 1)[0].consequent;

                if (handler.type !== "BlockStatement") {
                    handler = {
                        "type": "BlockStatement",
                        "body": [handler]
                    };
                }

                return {
                    "type": "FunctionExpression",
                    "id": null,
                    // give the new function the same error argument
                    "params": [errorArg],
                    "defaults": [],
                    // the body is the body of the if
                    "body": handler,
                    "rest": null,
                    "generator": false,
                    "expression": false
                };
            }

        }
    }
}


function thenFlattener(node) {
    if (isThenCallWithThenCallAsLastStatement(node)) {
        var resolvedFn = node.arguments[0];
        var body = resolvedFn.body.body;
        var lastStatement = body[body.length - 1];

        var functionCall = lastStatement.expression.callee.object;
        var thenArguments = lastStatement.expression.arguments;

        // escope only works with full programs, so lets make one out of
        // our FunctionExpression
        var program = {
            "type": "Program",
            "body": [{
                "type": "ExpressionStatement",
                "expression": resolvedFn
            }]
        };


        var root = escope.analyze(program);
        // List of all the identifiers used that were not defined in the
        // resolvedFn scope
        var parentIdentifiers = root.scopes[1].through;
        // List of all the identifiers used that were not defined in the `then`
        // resolved handler scope
        var resolveIdentifiers = root.acquire(thenArguments[0]).through;

        // If the `then` handler references variables from outside of its scope
        // that its parent doesn't, then they must have been captured from
        // the parent, and we cannot flatten, so just return the original node
        for (var i = resolveIdentifiers.length - 1; i >= 0; i--) {
            if (parentIdentifiers.indexOf(resolveIdentifiers[i]) === -1) {
                return node;
            }
        }

        // same for rejection handler
        if (thenArguments.length >= 2) {
            var rejectIdentifiers = root.acquire(thenArguments[1]).through;
            for (i = rejectIdentifiers.length - 1; i >= 0; i--) {
                if (parentIdentifiers.indexOf(rejectIdentifiers[i]) === -1) {
                    return node;
                }
            }
        }

        // Change last statement to just return the function call
        body[body.length - 1] = {
            type: "ReturnStatement",
            argument: functionCall
        };


        // Wrap the outer function call in a MemberExpression, so that we can
        // call then(thenArguments) on the result (which is the return value,
        // which is the return value of functionCall)
        return thenFlattener({
            type: "CallExpression",
            callee: {
                type: "MemberExpression",
                computed: false,
                object: node,
                property: {
                    type: "Identifier",
                    name: "then"
                }
            },
            arguments: thenArguments
        });
    } else {
        return node;
    }
}

function isThenCallWithThenCallAsLastStatement(node) {
    var callee, firstArg, firstArgBody;
    if (doesMatch(node, {
            type: "CallExpression",
            callee: {
                type: "MemberExpression",
                property: {
                    type: "Identifier",
                    name: "then"
                }
            },
            arguments: [
                {
                    type: "FunctionExpression",
                    body: {
                        type: "BlockStatement"
                    }
                }
            ]
        })) {
        var body = node.arguments[0].body.body;
        var lastStatement = body[body.length - 1];
        return doesMatch(lastStatement, {
            type: "ExpressionStatement",
            expression: {
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                    property: {
                        type: "Identifier",
                        name: "then"
                    }
                }
            }
        });
    }

    return false;
}

function doesMatch(object, matchObject) {
    if (!object || matchObject === null || typeof matchObject !== "object") {
        return object === matchObject;
    }

    return Object.keys(matchObject).every(function(prop) {
        return doesMatch(object[prop], matchObject[prop]);
    });
}

var convert = function(code) {

    // Parse
    var ast = esprima.parse(code, {  loc: true,
        range: true,
        raw: true,
        tokens: true,
        comment: true });

    // Add comments to nodes.
    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);


    estraverse.replace(ast, {
        leave: curry(callbackReplacer,  hasNodeCallback, replaceNodeCallback)
    });
    estraverse.replace(ast, {
        enter: thenFlattener
    });

    // generate
    return escodegen.generate(ast, { parse: esprima.parse, comment: true });
};

function Nodify(value, index, ar) {

    var template = '\nfunction x5v2'+func_name_suffix+'(param){\n\
        return new Promise(function(resolve,reject){\n\
            x5v2(param,function(err,data){\n\
                if(err !== null)\n\
                    return reject(err);\n\
                resolve(data);\n\
            });\n\
        });\n\
    }\n'

    str_replaced = template.replace(/x5v2/g, value);
    console.log(str_replaced)
}

var suffix = convert(text);

funcsToNodify.forEach(Nodify);
console.log(suffix);
