'use strict';

var grunt = require('grunt');
var	path = require('path');
var exec = require('child_process').exec;
var execOptions = {
	cwd: path.join(__dirname, '..')
};

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.makecsp = {
  setUp: function(done) {
    done();
  },
  default_options: function(test) {
    test.expect(1);
    var expected = grunt.file.read('test/expected/default_options');
	exec('grunt makecsp:default_options', execOptions, function(error, stdout){
		var actual = grunt.file.read('csp.json');
		test.equal(actual, expected, 'Should create a file called csp.json without any urls in it.');
		test.done();
	});
  },
  doubles: function(test){
    test.expect(1);
    var expected = grunt.file.read('test/expected/doubles.json');
	exec('grunt makecsp:doubles', execOptions, function(error, stdout){
		var actual = grunt.file.read('tmp/doubles.json');
		test.equal(actual, expected, 'Should create the correct tmp/doubles.json file without doubles.');
		test.done();
	});
  },
  sae: function(test){
    test.expect(1);
    var expected = grunt.file.read('test/expected/sae_csp.json');
	exec('grunt makecsp:sae', execOptions, function(error, stdout){
		var actual = grunt.file.read('/vagrant/sae-server/csp.json');
		test.equal(actual, expected, 'Should create the correct csp.json file in /vagrant/sae-server/csp.json.');
		test.done();
	});
  }
};
