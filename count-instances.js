var fs = require('fs');

ArgumentParser = require('argparse').ArgumentParser;

var argParser = new ArgumentParser({
    addHelp: true,
    description: 'ACFG generator'
});

argParser.addArgument(
    [ '-d','--directory' ],
    { nargs: 0,
        help: 'give directory path' }
);

var r = argParser.parseKnownArgs();
var args = r[0],
    files = r[1];

if (args.directory){
    var dirPath = files[0];
    var dirResults = [];
    var stats = fs.statSync(dirPath);

    if (stats.isDirectory()) {
        search(dirPath, dirResults);
    }

}
function search (dir, fullres, project) {
    if (!fs.existsSync(dir)) {
        return console.log('Directory ' + dir + ' does not exist.');
    }

    var haystack = fs.readdirSync(dir), path, stats;

    for (var s = 0; s < haystack.length; s++) {
        path = dir + '/' + haystack[s];
        try {
            stats = fs.statSync(path);

            if (stats.isDirectory()) {
                search(path, fullres, project);
           //} else if (path.indexOf('node_modules') >= 0 || path.indexOf('plugins') >= 0) {
           } else if ((path.match(/node_modules/g) || []).length > 1 || path.indexOf('plugins') >= 0) {
                 //console.log('Skipping file: ' + path);
            } else if ((/\.js$/).test(path)) {
              //  console.log('Analyzing file: ' + path);
                analyze(path, fullres, project);
            } else if ((/package\.json$/).test(path)) {
                //console.log('dep analyze: ' + path+' : '+project);
                if (args.pkgs){
                 //   analyzePkg(path, project);
                }
            }
        }
        catch (e) {

        }
    }
};

function analyze(path) {
// console.log('Loading.. ' + path);
var text = fs.readFileSync(path, "utf8");
var charPerLine = text.length / text.split("\n").length;
if (charPerLine > 300) {
 console.log("skipping - probably minified (" + charPerLine + " char/line); "+ path );
return;
}
try {
var ast = esprima.parse(text, {tolerant: true, loc: true, range: true});
estraverse.traverse(ast, {
enter: enter,
leave: leave
});
function enter(node) {

};
function leave(node) {

};
}
catch (e) {
// pass exception object to error handler
//console.dir(e);
}
}