/*Example taken from: http://stackoverflow.com/questions/20641074/how-to-refactor-a-callback-pyramid-into-promise-based-version*/

importDataSet('myFile.csv')
    .then(function () {
        return importDataSet('myFile.csv')
    }).then(function () {
        return DataSet.find({title: 1})
    }).then(function (result) {
        result.length.should.be.equal(2);
        result[0].title.should.startWith('myFile');
        result[1].title.should.startWith('myFile');
        result[0].title.should.not.be.equal(result[0].title);
        done();
    });