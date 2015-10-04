/*Example taken from: http://stackoverflow.com/questions/20641074/how-to-refactor-a-callback-pyramid-into-promise-based-version*/

importDataSet('myFile.csv', function () {
    importDataSet('myFile.csv', function () {
        DataSet.find({title: 1}, function (err, result) {
            result.length.should.be.equal(2);
            result[0].title.should.startWith('myFile');
            result[1].title.should.startWith('myFile');
            result[0].title.should.not.be.equal(result[0].title);
            done();
        });
    });
});
