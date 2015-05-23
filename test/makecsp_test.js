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
    test.expect(6);
    var expected = grunt.file.read('test/expected/doubles.json');
	var expectedNbOfWarnings = 4;
	var nbOfWarnings = 0;
	var scriptWarns= 0;
	var styleWarns= 0;
	var isupWarn = false;
	var templateWarn = 0;
	var doublesPath = "test/fixtures/doubles/doubles.html:";
	var templPath = "test/fixtures/doubles/javascripts/serversidetemplate.js:";
	var scriptLN = [11,14,17];
	var styleLN = [20,23,26];
	var templLN = [2,3,4,5];
	exec('grunt makecsp:doubles', execOptions, function(error, stdout){
		var actual = grunt.file.read('tmp/doubles.json');
		test.equal(actual, expected, 'Should create the correct tmp/doubles.json file without doubles.');
		stdout.split(/\r?\n/).forEach(function(line){
			if(line.indexOf("WARNING:") > -1){
				nbOfWarnings++;			
			};
			if(line.indexOf("http://isup.me,http://isup.me,http://isup.me") > -1){
				isupWarn = true;
			}
			scriptLN.forEach(function(ln){
				if(line.indexOf(doublesPath+ln) > -1){
					scriptWarns++;	
				}
			});
			styleLN.forEach(function(ln){
				if(line.indexOf(doublesPath+ln) > -1){
					styleWarns++;	
				}
			});
			templLN.forEach(function(ln){
				if(line.indexOf(templPath+ln) > -1){
					templateWarn++;	
				}
			});
		});
		test.equal(nbOfWarnings, expectedNbOfWarnings, 'There should be '+expectedNbOfWarnings+' occurences of "WARNING:" ');

		test.ok(isupWarn, "There should be a warning for http usage of isup.me");
		test.equal(scriptWarns, scriptLN.length, 'There should be ' + scriptLN.length +' script warnings for lines: ' + scriptLN);
		test.equal(styleWarns, styleLN.length, 'There should be ' + styleLN.length +' style warnings for lines: ' + styleLN);
		test.equal(templateWarn, templLN.length, 'There should be ' + templLN.length +' server-side template engine warnings for lines: ' + templLN);

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
