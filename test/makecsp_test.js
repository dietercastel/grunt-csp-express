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
    var expected = grunt.file.readJSON('test/expected/default_options.json');
	exec('grunt makecsp:default_options', execOptions, function(error, stdout){
		var actual = grunt.file.readJSON('csp.json');
		test.deepEqual(actual, expected, 'Should create a file called csp.json without any urls in it.');
		test.done();
	});
  },
  doubles: function(test){
    test.expect(9);
    var expected = grunt.file.readJSON('test/expected/doubles.json');
	var expectedNbOfWarnings = 7;
	var nbOfWarnings = 0;
	var scriptWarns = 0;
	var styleWarns = 0;
	var eventWarns = 0;
	var evalWarns = 0;
	var jsurlWarn = false;
	var isupWarn = false;
	var templateWarn = 0;
	var doublesPath = "test/fixtures/doubles/doubles.html:";
	var templPath = "test/fixtures/doubles/javascripts/serversidetemplate.js:";
	var scriptLN = [11,14,17,37];
	var styleLN = [20,23,26];
	var eventLN = [30,31,32,33];
	var evalLN = [38,39];
	var templLN = [2,3,4,5];
	exec('grunt makecsp:doubles', execOptions, function(error, stdout){
		var actual = grunt.file.readJSON('tmp/doubles.json');
		test.deepEqual(actual, expected, 'Should create the correct tmp/doubles.json file without doubles.');
		stdout.split(/\r?\n/).forEach(function(line){
			if(line.indexOf("WARNING:") > -1){
				nbOfWarnings++;			
			};
			if(line.indexOf("http://isup.me,http://isup.me,http://isup.me") > -1){
				isupWarn = true;
			}
			if(line.indexOf("javascript:alert(") > -1){
				jsurlWarn = true;
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
			eventLN.forEach(function(ln){
				if(line.indexOf(doublesPath+ln) > -1){
					eventWarns++;	
				}
			});
			evalLN.forEach(function(ln){
				if(line.indexOf(doublesPath+ln) > -1){
					evalWarns++;	
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
		test.ok(jsurlWarn, "There should be a warning for javascript url usage.");
		test.equal(scriptWarns, scriptLN.length, 'There should be ' + scriptLN.length +' script warnings for lines: ' + scriptLN);
		test.equal(styleWarns, styleLN.length, 'There should be ' + styleLN.length +' style warnings for lines: ' + styleLN);
		test.equal(eventWarns, eventLN.length, 'There should be ' + eventLN.length +' inline event warnings for lines: ' + eventLN);
		test.equal(evalWarns, evalLN.length, 'There should be ' + evalLN.length +' inline eval warnings for lines: ' + evalLN);
		test.equal(templateWarn, templLN.length, 'There should be ' + templLN.length +' server-side template engine warnings for lines: ' + templLN);

		test.done();
	});
  },
  sae: function(test){
    test.expect(1);
    var expected = grunt.file.readJSON('test/expected/sae_csp.json');
	exec('grunt makecsp:sae', execOptions, function(error, stdout){
		var actual = grunt.file.readJSON('/vagrant/sae-server/csp.json');
		test.deepEqual(actual, expected, 'Should create the correct csp.json file in /vagrant/sae-server/csp.json.');
		test.done();
	});
  }
};
