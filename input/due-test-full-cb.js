var fs = require('fs');
var source = __dirname;

fs.readdir(source, function(err, files) {
  if (err) throw 'Error finding files: ' + err;

  var total = 0,
      pending = files.length;

  files.forEach(function(filename, fileIndex) {

    fs.stat(source + '/' + filename, function(err, stat) {
      if (err) throw 'Error looking for file: ' + err;

      var control = 0;

      if (stat.isFile())
        fs.readFile(source + '/' + filename, function(err, file) {
          if (err) throw 'Error opening file: ' + err;
          
          control++; // use control

          var lines = String(file).split('\n'),
              number = lines.reduce(function(n, line) {
                return n + (line.length > 0 ? 1 : 0);
              }, 0);

          console.log(filename, ' : \t\t', number);

          total += number;
          pending--;
          if (pending === 0)
            console.log('TOTAL : \t\t', total);
        });
      else
        pending--;
    });
  });
});