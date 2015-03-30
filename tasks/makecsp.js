/*
 * grunt-csp-express
 * https://github.com/dietercastel/grunt-csp-express
 *
 * Copyright (c) 2015 Dieter Castel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
	//npm dependancies
	var sh = require('execSync');
	var description = 'Creates a csp.json file to be used with content-security-policy.';
	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks
	// Helper function
	function onlyUnique(value, index, self) { 
		return self.indexOf(value) === index;
	}

	grunt.registerMultiTask('makecsp', description, function() {
		//This are the prototypical options
		//Can be overridden by gruntfile
		var options = this.options({
			filename: "/csp.json",
			excludeDirs: ["bin","node_modules",".git"],
			excludeFiles: ["csp.json,Gruntfile.js,package.json,.gitignore"]
		});
		
		//Check whether a proper path is set.
		if(options["expressDir"] === undefined){
			//Might include actual fs.exists here.
			var errorString ="Set the expressDir option in your Gruntfile.js to a valid path."; 
			grunt.log.error(errorString);
			grunt.fail.fatal(errorString);
			return;
		}
		grunt.log.write("Running makecsp with:\n" + JSON.stringify(options, null,4));
		//Options as used by content-security-policy
		var policy = {};
		// Other options are:
		// policy["report-only"] 
		// var otheroptions = ["report-uri", "sandbox", "default-src"];

		var srcs = ["script-src", "object-src", "style-src", "img-src", "media-src", "frame-src", "font-src", "connect-src" ];

		var basecommand ='grep -Er ';

		//Due to some strange error --exclude-dir={i1,i2,i3} does not work.
		var exDirRes = "";
		options["excludeDirs"].forEach(function(ex){
			exDirRes += '--exclude-dir="'+ ex + '" ';
		});

		//But for normal files the alternative doesn't work
		// var exFilesRes = "";
		// options["excludeFiles"].forEach(function(ex){
		// exFilesRes += '--exclude="'+ ex + '" ';
		// });
		
		// This worked for normal files
		// var basecommand ='grep -Er --exclude-dir={'+ 
		// options['excludeDirs'].toString() + 
		// '} --exclude={'+
		// options['excludeFiles'].toString()+
		// '}';

		//Handeling the wildcard is pretty hard apperantly...
		basecommand += exDirRes + '--exclude="*.log" ' + '--exclude={'+ options['excludeFiles'].toString()+ '}';

		grunt.log.writeln(basecommand);

		var httpRegex=/http:\/\/[a-z0-9-]+((\.[a-z0-9-]+)*)+(:[0-9]+)?(\/)?/i; 
		var httpsRegex=/https:\/\/[a-z0-9-]+((\.[a-z0-9-]+)*)+(:[0-9]+)?(\/)?/i; 


		grunt.log.writeln("basecommand: " + basecommand);
		srcs.forEach(function(src) {
			var tag = src.substring(0,src.length-4);
			var tagregex = ' "<'+tag+' (ng-)?src=" ';
			grunt.log.writeln("tag: " + tag);
			grunt.log.writeln("tagregex" + tagregex);
			var runCommand = basecommand + tagregex + options["expressDir"];
			grunt.log.writeln("runCommand =" + runCommand);
			var returnObject = sh.exec(runCommand);
			grunt.log.write(JSON.stringify(returnObject, null, 4));
			var stdout = returnObject.stdout;
			var matchedHTTP = [];
			var matchedHTTPS = []; 
			grunt.log.write('Checking'+ tagregex);
			grunt.log.writeln("____________________________________________________________________");
			grunt.log.write(stdout);
			var i = 0;
			stdout.split(/\r?\n/).forEach(function (line) {
				i++;
				grunt.log.writeln("matching http:");
				grunt.log.write(line);
				var httpRes = line.match(httpRegex);
				grunt.log.writeln(httpRes);
				if(httpRes !== null){
					matchedHTTP = matchedHTTP.concat(httpRes[0]);
					grunt.log.write(matchedHTTP);
				}
				grunt.log.writeln("matching https:");
				grunt.log.write(line);
				var httpsRes = line.match(httpsRegex);
				grunt.log.writeln(httpsRes);
				if(httpsRes !== null){
					matchedHTTPS = matchedHTTPS.concat(httpsRes[0]);
					grunt.log.write(matchedHTTPS);
				}
			});
			grunt.log.writeln(i);
			grunt.log.writeln("____________________________________________________________________");
			grunt.log.writeln("matchedHTTP:" + matchedHTTP);
			grunt.log.writeln("matchedHTTPS:" + matchedHTTPS);
			var allURLs = [];
			if(matchedHTTPS === undefined ){
				allURLs = matchedHTTP;
			}else{
				if(matchedHTTP === undefined){
					var errorString = "no urls found";
					grunt.log.error(errorString);
					grunt.fail.warn(errorString);
				} else {
					allURLs = matchedHTTPS.concat(matchedHTTP);
				}
			}
			grunt.log.write("Before: " + JSON.stringify(policy, null, 4));
			policy[src] = allURLs.filter(onlyUnique);
			grunt.log.write("after: " + JSON.stringify(policy, null, 4));
			grunt.log.write(allURLs);
			//Mention line numbers of HTTP resources?
			grunt.log.write("Matched HTTPS: "+ matchedHTTP);
			grunt.log.write("#WARNING# Matched HTTP (UNSECURE CONNECTION): "+ matchedHTTP);
		});

		//Create a nice json from it and write it to disk
		var stringJson = JSON.stringify(policy, null, 4);
		//DONT TRY TO WRITE WITH fs while using grunt!!!!
		grunt.log.write("LASTLY: " + stringJson);
		var outputFilename = options["expressDir"]+options["filename"];
		grunt.file.write(outputFilename, stringJson);
	});
};
