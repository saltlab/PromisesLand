
function download(url, filename, callback) {
    console.log('Downloading ' + url);
    request(url, function(err, response, body) {
        if(err) {
            return callback(err);
        }
        mkdirp(path.dirname(filename), function(err) {
            if(err) {
                return callback(err);
            }
            fs.writeFile(filename, body, callback);
        });
    });
}

function spider(url, nesting, callback) {
    var filename = utilities.urlToFilename(url);
    fs.readFile(filename, 'utf8', function(err, body) {
        if(err) {
            if(err.code !== 'ENOENT') {
                return callback(err);
            }
            return download(url, filename, function(err, body) {
                if(err) {
                    return callback(err);
                }
                spiderLinks(url, body, nesting, callback);
            });
        }
        spiderLinks(url, body, nesting, callback);
    });
}

spider(process.argv[2], function(err, filename, downloaded) {
    if(err) {
        console.log(err);
    } else if(downloaded){
        console.log('Completed the download of "'+ filename +'"');
    } else {
        console.log('"'+ filename +'" was already downloaded');
    }
});