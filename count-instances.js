var fs = require('fs');
var esprima = require("esprima");
var escodegen = require("escodegen");
var estraverse = require("estraverse");
ArgumentParser = require('argparse').ArgumentParser;

var instanceCount = 0;
var fileCount = 0;

var dirResults = [];
var project_results = [];

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
    ['-b', '--backup'],
    {
        nargs: 0,
        help: 'create backup'
    }
);

argParser.addArgument(
    ['-r', '--restore'],
    {
        nargs: 0,
        help: 'restore to original state'
    }
);

var r = argParser.parseKnownArgs();
var args = r[0],
    files = r[1];

if (args.directory) {
    var dirPath = files[0];
    var stats = fs.statSync(dirPath);

    if (stats.isDirectory()) {
        search(dirPath);
    }

}
function search(dir) {
    if (!fs.existsSync(dir)) {
        return console.log('Directory ' + dir + ' does not exist.');
    }

    var haystack = fs.readdirSync(dir), path, stats;

    for (var s = 0; s < haystack.length; s++) {
        path = dir + '/' + haystack[s];
        try {
            stats = fs.statSync(path);

            if (stats.isDirectory()) {
                search(path);
                //} else if (path.indexOf('node_modules') >= 0 || path.indexOf('plugins') >= 0) {
            } else if ((path.match(/node_modules/g) || []).length > 1 || path.indexOf('plugins') >= 0 || path.indexOf('test') >= 0 || (/\.min\.js$/).test(path)) {
                //console.log('Skipping file: ' + path);
            } else if ((/\.js$/).test(path)) {
                // console.log('Analyzing file: ' + path);
                if (args.backup) {
                    backup(path);
                } else {
                    analyze(path);
                }
            } else if ((/\.bak$/).test(path) && args.restore) {
                restore(path);
            } else if ((/package\.json$/).test(path)) {
                //console.log('dep analyze: ' + path+' : '+project);
                if (args.pkgs) {
                    //   analyzePkg(path, project);
                }
            }
        }
        catch (e) {

        }
    }
};

function backup(path) {
    console.log('backing up..' + path);
    fs.createReadStream(path).pipe(fs.createWriteStream(path + '.bak'));
}

function restore(path) {
    console.log('restoring..' + path);
    fs.createReadStream(path).pipe(fs.createWriteStream(path.slice(0, path.indexOf(".bak"))));

}

function analyze(path) {
    console.log('Loading.. ' + path);
    var text = fs.readFileSync(path, "utf8");
    var charPerLine = text.length / text.split("\n").length;
    if (charPerLine > 300) {
        console.log("skipping - probably minified (" + charPerLine + " char/line); " + path);
        return;
    }
    try {
        fileCount++;
        var ast = esprima.parse(text, {tolerant: true, loc: true, range: true});
        estraverse.traverse(ast, {
            enter: enter,
            leave: leave
        });
        function enter(node) {
            //console.log('entering node')
            var args = node.arguments;
            if (node.type === "CallExpression"
                && args.length
                && args[args.length - 1].type === "FunctionExpression"
                && args[args.length - 1].params.length <= 4
            ) {

                print_node_info(node, path);
            }

        };
        function leave(node) {

        };
    }
    catch (e) {
// pass exception object to error handler
        console.dir(e);
    }
}

function print_node_info(node, path) {
    var str = node.type;
    if (node.loc) {
        str = str + '-' + node.loc.start.line + '-' + node.loc.start.column + '-' + node.loc.end.line + '-' + node.loc.end.column;
    }
    //console.log(str);
    // console.dir(node);

    var new_node = {
        "type": "CallExpression",
        "callee": node.callee,
        "arguments": []
    };
    var old_id = print_node(new_node).slice(0, -2);

    if ((/\.forEach$/).test(old_id) || (/\.map$/).test(old_id) || (/\.on$/).test(old_id) || (/app\./).test(old_id)) {

    } else {
        console.log(old_id);
        instanceCount++;
        if (dirResults[path]) {
            dirResults[path]++;
        } else {
            dirResults[path] = 1;
        }
        var project_name = get_project(path);
        if (project_results[project_name]) {
            project_results[project_name]++;
        } else {
            project_results[project_name] = 1;
        }
    }

}

function print_node(node) {
    var str = "" + escodegen.generate(node, {parse: esprima.parse, comment: true})
    return str
}

function get_project(path) {
    var str = path.substring(path.indexOf("node_modules/") + "node_modules".length + 1);
    str = str.substring(0, str.indexOf("/"));
    return str
}

console.log('file count:' + fileCount + ' instance count:' + instanceCount);
console.dir(dirResults);
console.dir(project_results);