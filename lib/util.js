var escodegen = require("escodegen");
var esprima = require("esprima");

var core_modules = ['assert',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'constants',
    'crypto',
    'dgram',
    'dns',
    'request',
    'domain',
    'events',
    'fs',
    // 'http',
    'https',
    'module',
    'net',
    'os',
    'path',
    'process',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    '_stream_duplex',
    '_stream_passthrough',
    '_stream_readable',
    '_stream_transform',
    '_stream_writable',
    'string_decoder',
    'sys',
    'timers',
    'tls',
    'tty',
    'url',
    'util',
    'vm',
    'zlib'];

exports.print_node = function print_node(node) {
    var str = "" + escodegen.generate(node, {parse: esprima.parse, comment: true});
    return str;
};

exports.print_node_info = function print_node_info(node) {
    var str = node.type;
    if (node.loc) {
        str = str + '-' + node.loc.start.line + '-' + node.loc.start.column + '-' + node.loc.end.line + '-' + node.loc.end.column;
    }
    return str;
};

exports.isAsync = function isAsync(node) {

    var new_node = {
        "type": "CallExpression",
        "callee": node.callee,
        "arguments": []
    };
    var old_id = this.print_node(new_node).slice(0, -2);

    //console.log('async call detected:' + old_id);

    pre = old_id.substr(0, old_id.lastIndexOf("."));
    //console.log(pre);
    inthelist = new RegExp(core_modules.join("|")).test(pre);
    hasnameasync = !(/Sync$/).test(old_id);
    //console.log(inthelist + ':' + hasnameasync);
    var result = (inthelist && hasnameasync);
    if(result){console.log('async call detected:' + old_id);}
    return result;

};