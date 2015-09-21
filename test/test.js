var assert = require("assert");
var fs = require("fs");
//var pd = require("../pattern-detect");

/* Test basic refactorings with no third party libraries and no chaining. */
describe('Basic', function() {

	/* A contrived example. */
	describe('simple.js', function() {
		it('the refactored code does not match the expected', function() {

			/* Get the file names. */
			var original = "./input/simple.js";
			var expected = "./input/simple-refactores.js";
		
			/* Run the refactoring on the file. */

			/* Check the refactoring is correct. */
			assert.equal(fs.existsSync(original), true);

		});
	});
});
