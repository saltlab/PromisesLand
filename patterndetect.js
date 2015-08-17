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
    ['-d', '--directory'],
    {
        nargs: 0,
        help: 'give directory path'
    }
);

argParser.addArgument(
    ['-p', '--pkgs'],
    {
        nargs: 0,
        help: 'analyze pkgs as well'
    }
);

argParser.addArgument(
    ['-s', '--suffix'],
    {
        nargs: 0,
        help: 'suffix for refactored function names',
        defaultValue: 'Promised'
    }
);

argParser.addArgument(
    ['-t', '--type'],
    {help: 'Should be one of npm, hybrid'}
);

var r = argParser.parseKnownArgs();
var args = r[0],
    func_name_suffix = args.suffix,
    files = r[1];

path = files[0];

var text = fs.readFileSync(path, "utf8");

function curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
        result = args.concat(Array.prototype.slice.call(arguments));
        return fn.apply(this, result);
    };
}

function callbackReplacer(matcher, replacer, node) {
    if (matcher(node)) {
        // create a call to .then()
        return replacer(node);
    }
}

function hasNodeCallback(node) {
    var args = node.arguments;
    return node.type === "CallExpression" &&
        args.length &&
        args[args.length - 1].type === "FunctionExpression" &&
        args[args.length - 1].params.length === 2 && /err/.test(args[args.length - 1].params[0].name);
}

function replaceNodeCallback(node) {
    // the called function
    var func = node;
    old_callee_backup = node.callee;
    var new_id='';

    if(func.callee.name) {
        if (funcsToNodify.indexOf(func.callee.name) < 0) {
            funcsToNodify.push(func.callee.name);
        }
        new_id = func.callee.name + func_name_suffix;


    } else{
        var new_node = {
            "type": "CallExpression",
            "callee": node.callee,
            "arguments": []
        };
        var old_id = print_node(new_node).slice(0,-2);

        if (old_id.indexOf("(") > -1){
            return node;
        }

        var new_id = old_id.replace(/\./g , "_");

        funcsToNodify.push(new_id);
        new_id += func_name_suffix

    }

    node.callee = {
        type: 'Identifier',
        name: new_id
    };




    // arguments to called function
    var args = func.arguments;
    // the last argument is the callback we need to turn into promise
    // handlers
    var callback = args.pop();

    // TODO retain comments
    new_result = {
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
    new_result.$track = old_callee_backup;
    new_result.$track.$arg_length = func.arguments.length;
    return new_result;
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
    if (callback.body.type === "BlockStatement") {
        var body = callback.body.body;
        for (var i = 0, len = body.length; i < len; i++) {
            // Only matches
            // if (error) ...
            // TODO: think about matching if (err !== null) and others
            if (
                body[i].type === "IfStatement" &&
                body[i].test.type === "Identifier" &&
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
    setParent(node);
    if(node.$track)
    {
        var block = getEnclosingBlock(node);
        var synth_node = synthesizeNode(node.$track);
        block.body.unshift(synth_node);
    }
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
        new_result = {
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
        };

        return thenFlattener(new_result);
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

    return Object.keys(matchObject).every(function (prop) {
        return doesMatch(object[prop], matchObject[prop]);
    });
}

var convert = function (code) {

    // Parse
    var ast = esprima.parse(code, {
        loc: true,
        range: true,
        raw: true,
        tokens: true,
        comment: true
    });

    // Add comments to nodes.
    ast = escodegen.attachComments(ast, ast.comments, ast.tokens);


    estraverse.replace(ast, {
        leave: curry(callbackReplacer, hasNodeCallback, replaceNodeCallback)
    });
    estraverse.replace(ast, {
        enter: thenFlattener
    });

    // generate
    return escodegen.generate(ast, {parse: esprima.parse, comment: true});
};

function setParent(node) {
    //console.dir('setting parent')
    for (var k in node) {
        if (!node.hasOwnProperty(k))
            continue;
        if (k[0] === '$')
            continue;
        var val = node[k];
        if (!val)
            continue;
        if (typeof val === "object" && typeof val.type === "string") {
            node[k].$parent = node;
            //console.dir('seta parent')
            //print_node_info(node[k])
        }
        else if (val instanceof Array) {
            for (var i=0; i<val.length; i++) {
                var elm = val[i];
                if (elm != null && typeof elm === "object" && typeof elm.type === "string") {
                    val[i].$parent = node;
                    //console.dir('setb parent')
                    //print_node_info(val[i])
                }
            }
        }
    }
}

// Returns the block or program immediately enclosing the given node, possibly the node itself.
function getEnclosingBlock(node) {
    while  (node.type !== 'BlockStatement' &&
    node.type !== 'Program') {
        node = node.$parent;
    }
    return node;
}

function synthesizeNode(node) {
    var new_params = [];
    var new_args = [];

    for (var i = 0; i<node.$arg_length;i++){
        var new_variable = {
            "type": "Identifier",
            "name": "param"+i
        };
        new_params.push(new_variable);
        new_args.push(new_variable);
    }

    new_args.push({
        "type": "Identifier",
        "name": "g5k3d9"
    });

    new_node = {
        "type": "FunctionDeclaration",
        "id": {
            "type": "Identifier",
            "name": "req_collection_findOnePromised"
        },
        "params": new_params,
        "defaults": [],
        "body": {
            "type": "BlockStatement",
            "body": [
                {
                    "type": "ReturnStatement",
                    "argument": {
                        "type": "NewExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "Promise"
                        },
                        "arguments": [
                            {
                                "type": "FunctionExpression",
                                "id": null,
                                "params": [
                                    {
                                        "type": "Identifier",
                                        "name": "resolve"
                                    },
                                    {
                                        "type": "Identifier",
                                        "name": "reject"
                                    }
                                ],
                                "defaults": [],
                                "body": {
                                    "type": "BlockStatement",
                                    "body": [
                                        {
                                            "type": "ExpressionStatement",
                                            "expression": {
                                                "type": "CallExpression",
                                                "callee": node,
                                                "arguments": new_args
                                            }
                                        }
                                    ]
                                },
                                "generator": false,
                                "expression": false
                            }
                        ]
                    }
                }
            ]
        },
        "generator": false,
        "expression": false
    };

    if(node.name) {
        new_node.id = {
            "type": "Identifier",
            "name": node.name
        }

       // func.callee.name += func_name_suffix;
    } else {
        var pseudo_node = {
            "type": "CallExpression",
            "callee": node,
            "arguments": []
        };
        var old_id = print_node(pseudo_node).slice(0, -2);
        old_id = old_id.replace(/\./g , "_");
        new_node.id = {
            "type": "Identifier",
            "name": old_id
        }
    }
    new_node.id.name += func_name_suffix;
    return new_node;
}

function print_node(node) {
    var str = "" + escodegen.generate(node, {parse: esprima.parse, comment: true})
    return str
}

function print_node_info(node) {
    var str = node.type;
    if (node.loc) {
        str = str + '-' + node.loc.start.line + '-' + node.loc.start.column + '-' + node.loc.end.line + '-' + node.loc.end.column;
    }
    console.log(str);
}

function Nodify(value, index, ar) {

    var template = '\nfunction x5v2' + func_name_suffix + '(param){\n\
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

template = 'function(err,data){\n\
                    if(err !== null)\n\
                        return reject(err);\n\
                    resolve(data);\n\
                }'
var str_replaced = suffix.replace(/g5k3d9/g, template);

//funcsToNodify.forEach(Nodify);
console.log(str_replaced);
