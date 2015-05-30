/*
 * grunt-csp-express
 * https://github.com/dietercastel/grunt-csp-express
 *
 * Copyright (c) 2015 Dieter Castel
 * Licensed under the MIT license.
 */

'use strict';
var sh = require('execSync');
var util = require('util');
var description = 'Creates a csp.json file to be used with content-security-policy.';
var noExpressDir ="Set the expressDir option in your Gruntfile.js to a valid path."; 

//Options as used by content-security-policy
// Other options are:
// policy["report-only"] 
// var otheroptions = ["report-uri", "sandbox", ];
var srcs = [
// "default-src",
	"script-src",
	"object-src",
	"style-src",
	"img-src",
	"media-src",
	"frame-src",
	"font-src",
	"connect-src" ];

//Regex related declarations.
var selfRegex=/( src=| href=){1}("|')((\/)?[^:]+(\/)?)+("|')/i; 
var httpRegex=/http:\/\/[a-z0-9-]+((\.[a-z0-9-]+)*)+(:[0-9]+)?(\/)?/i; 
var httpsRegex=/https:\/\/[a-z0-9-]+((\.[a-z0-9-]+)*)+(:[0-9]+)?(\/)?/i; 

var inlinescriptW = {
	"regex" : "<script>",
	"message" : "You are using inline script(s) which is bad practice and will break when using CSP." +
		"\n Extract the inline script(s) into (a) seperate file(s) and include those.",
	"extraflag" : " -w"
};
var inlinestyleW = {
	"regex" : "<style>",
	"message" : "You are using inline style(s) which is bad practice and will break when using CSP." +
		"\n Extract the inline style(s) into (a) seperate file(s) and include those.",
	"extraflag" : " -w"
};
var javascripturlW= {
	"regex" : "javascript:",
	"message" : "You are probably using a javascript protocol url which is bad practice and will break when using CSP. Extract the execution of code into a javascript file and include those.",
	"extraflag" : ""
};
var htmlimportW = {
	"regex" : "<link rel=.import|ng-include",
	"message" : "You are using html import(s) which could lead to a CSP circumvention in chrome!",
	"extraflag" : ""
};
var templateW = {
	"regex" : "app.set\\\(.view engine|app.render\\\(|res.render\\\(",
	"message" : "Using both AngularJS and a serverside templating engine is discouraged as it can lead to unexpected XSS vulnerabilities!",
	"extraflag" : ""
};

var warnings =  [
	inlinescriptW,
	inlinestyleW,
	javascripturlW,
	htmlimportW,
	templateW
];

function onlyUnique(value, index, self) { 
	return self.indexOf(value) === index;
}

module.exports = function(grunt) {

	grunt.registerMultiTask('makecsp', description, function() {
		//This are the prototypical options
		//Can be overridden by gruntfile
		var options = this.options({
			filename: "/csp.json",
			excludeDirs: ["bin","node_modules",".git","test"],
			excludeFiles: ["csp.json,Gruntfile.js,package.json,.gitignore"],
			expressDir: ".",
			extraRegexs: { //For each tag an optional extra regex.
				// "default-src":"url\\\(",
				"script-src":"",
				"object-src":"",
				"style-src":"<link rel=.stylesheet",
				"img-src":"",
				"media-src":"",
				"frame-src":"<iframe (ng-)?src=",
				"font-src":"",
				"connect-src": "url:" // add $resource ?
				} 
		});

		//Check whether a proper path is set.
		if(options["expressDir"] === undefined){
			//Might include actual fs.exists here.
			grunt.log.error(noExpressDir);
			grunt.fail.fatal(noExpressDir);
			return;
		}
		grunt.log.writeln("Running makecsp with:\n" + util.inspect(options));

		var policy = {
		"default-src" : "'none'"
		};

		var basecommand ='grep -Enr ';

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
		var startRegexArg =' "'; 
		// Close double quote plus space
		var endRegexArg ='" '; 
		grunt.log.writeln("basecommand ="+ basecommand);

		//Iterate over all options and look for tags related to the option.
		srcs.forEach(function(src) {
			//Extract tag except for default-src
			var tag = src.substring(0,src.length-4);
			var baseTagRegex ='<'+tag+' (ng-)?src=';
			// if(src === "default-src"){
			// 	baseTagRegex ='<link rel=.import|ng-include';
			// }
			//Process extra regexs
			var extraRegex= "";
			if(options["extraRegexs"][src] !== ""){
				extraRegex = "|"+options["extraRegexs"][src];
			}
			var tagregex = baseTagRegex+extraRegex;
			grunt.log.writeln("\nTag: " + tag);
			grunt.log.writeln("Tagregex=" + tagregex);

			// Build and run the grep command.
			// Space plus open double quote
			var runCommand = basecommand + startRegexArg + tagregex + endRegexArg + options["expressDir"];
			var returnObject = sh.exec(runCommand);
			var stdout = returnObject.stdout;


			//Proccess each found line looking for urls.
			var addSelf = false;
			if(src==="connect-src"){
				//Loading angular templates from self!!
				addSelf = true;	
			}
			var matchedHTTP = [];
			var matchedHTTPS = []; 
			grunt.verbose.writeln('Checking:\n'+ runCommand);
			grunt.verbose.writeln('Output:');
			grunt.verbose.writeln("____________________________________________________________________");
			grunt.verbose.write(stdout);
			grunt.verbose.writeln("========Iteratation over each line=======");
			stdout.split(/\r?\n/).forEach(function (line) {
				grunt.verbose.writeln("matching http:");
				grunt.verbose.write(line);
				var httpRes = line.match(httpRegex);
				grunt.verbose.writeln(httpRes);
				if(httpRes !== null){
					matchedHTTP = matchedHTTP.concat(httpRes[0]);
					grunt.verbose.write(matchedHTTP);
				}
				grunt.verbose.writeln("matching https:");
				grunt.verbose.write(line);
				var httpsRes = line.match(httpsRegex);
				grunt.verbose.writeln(httpsRes);
				if(httpsRes !== null){
					matchedHTTPS = matchedHTTPS.concat(httpsRes[0]);
					grunt.verbose.write(matchedHTTPS);
				}
				grunt.verbose.writeln("matching self:");
				var selfRes= line.match(selfRegex);
				grunt.verbose.writeln(selfRes);
				if(selfRes !== null){
					addSelf = true;
				}
			});
			grunt.verbose.writeln("____________________________________________________________________");
			if(matchedHTTP.length !== 0){
				grunt.log.writeln("WARNING: Matched HTTP (UNSECURE CONNECTION): "['red']);
				grunt.log.writeln(matchedHTTP);
			}
			grunt.log.writeln("matchedHTTPS:" + matchedHTTPS);
			var allURLs;
			if(matchedHTTPS === []){
				allURLs = matchedHTTP;
			}else{
				if(matchedHTTP === []){
					var errorString = "No urls found";
					grunt.log.error(errorString);
					grunt.fail.warn(errorString);
				} else {
					allURLs = matchedHTTPS.concat(matchedHTTP);
				}
			}
			if(addSelf){
				allURLs = ["'self'"].concat(allURLs);
			}
			grunt.verbose.writeln("allURLs (non-uniqued)" + allURLs);
			if(allURLs.length !== 0){
				policy[src] = allURLs.filter(onlyUnique);
			} else{
				policy[src]	= "'none'";
			}
			grunt.verbose.write("Policy so far: " + util.inspect(policy));
			//Mention line numbers of HTTP resources?
		});
		//Create a nice json from it and write it to disk
		var stringJson = JSON.stringify(policy, null, 4);
		//DONT TRY TO WRITE WITH fs while using grunt!!!!
		grunt.log.writeln("Found policy: " + stringJson ['green']);
		var outputFilename = options["expressDir"]+options["filename"];
		grunt.file.write(outputFilename, stringJson);
		grunt.log.ok("File written to: " + outputFilename);

		// basecommand += exDirRes + '--exclude="*.log" ' + '--exclude={'+ options['excludeFiles'].toString()+ '}';
		// var startRegexArg =' "'; 
		// // Close double quote plus space
		// var endRegexArg ='" '; 
		
		//TODO: warning for server-side templates??
		warnings.forEach(function(warning){
			var runCommand = basecommand + startRegexArg + warning["regex"] + endRegexArg + options["expressDir"] + warning.extraflag;
			var returnObject = sh.exec(runCommand);
			if(returnObject.code === 0){
				var stdout = returnObject.stdout;
				grunt.log.writeln("WARNING: "['red'].bold +warning["message"] ['red'].bold);
				stdout.split(/\r?\n/).forEach(function(line){
					grunt.log.writeln(line ['yellow']);
				});
				grunt.log.writeln("____________________________________________________________________" ['red']);
			}
		});

	});
};
