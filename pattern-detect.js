var fs = require("fs");

ArgumentParser = require('argparse').ArgumentParser;

var converter = require('./lib/converter');

var funcsToNodify = [];
var convert_count = 0;


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
    ['-c', '--chains'],
    {
        nargs: 0,
        help: 'flatten nested callbacks to chains'
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
    ['-e', '--errorfirst'],
    {
        nargs: 0,
        help: 'check only for error first',
    }
);

argParser.addArgument(
    ['-t', '--type'],
    {help: 'Should be one of npm, hybrid'}
);

var r = argParser.parseKnownArgs();
var args = r[0],
    func_name_suffix = args.suffix,
    flatten_chains = args.chains,
    check_only_error_first = args.errorfirst,
    files = r[1];

path = files[0];

var text = fs.readFileSync(path, "utf8");

var output = converter.refactorPromises(text);

console.log(''+convert_count+' instances converted.');


console.log(output);
//console.log(suffix);
