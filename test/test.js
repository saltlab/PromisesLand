var converter = require('../lib/converter');
var assert = require("assert");
var fs = require("fs");
var winston = require('winston');
var compareAst = require('compare-ast');

/* Test basic refactorings with no third party libraries and no chaining. */
describe('Basic', function() {

	/* A contrived example. */
	describe('simple.js', function() {
		it('the refactored code should match the expected', function() {

			/* Get the file names. */
			var original = fs.readFileSync("./input/simple.js");
			var expected = fs.readFileSync("./input/simple-refactored.js");
		
			/* Run the refactoring on the file. */
			var actual = converter.refactorPromises(original);

			/* Check the refactoring is correct. */
			winston.info('\n--------\nActual Output:\n--------\n'+actual);
            winston.info('\n--------\nExpected Output:\n--------\n'+expected);

            /*This method throws Unmatched ASTs error */
            compareAst(actual,expected);

		});
	});
});
