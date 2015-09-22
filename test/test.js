var converter = require('../lib/converter');
var assert = require("assert");
var fs = require("fs");

/* Test basic refactorings with no third party libraries and no chaining. */
describe('Basic', function() {

	/* A contrived example. */
	describe('simple.js', function() {
		it('the refactored code does not match the expected', function() {

			/* Get the file names. */
			var original = fs.readFileSync("./input/simple.js");
			var expected = fs.readFileSynd("./input/simple-refactored.js");
		
			/* Run the refactoring on the file. */
			var actual = converter.refactorPromises(fs.readFileSync(original));

			/* Check the refactoring is correct. */
			console.log(output);
			assert.equal(expected, actual);

		});
	});
});
