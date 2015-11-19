var escodegen = require("escodegen");
var esprima = require("esprima");

exports.print_node = function print_node(node) {
    var str = "" + escodegen.generate(node, {parse: esprima.parse, comment: true});
    return str
}

exports.print_node_info = function print_node_info(node) {
    var str = node.type;
    if (node.loc) {
        str = str + '-' + node.loc.start.line + '-' + node.loc.start.column + '-' + node.loc.end.line + '-' + node.loc.end.column;
    }
    console.log(str);
}