/*
 * grunt-csp-express
 * https://github.com/vagrant/grunt-init
 *
 * Copyright (c) 2015 Dieter Castel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp','csp.json']
    },

    // Configuration to be run (and then tested).
    makecsp: {
	  default_options : {
	  },
      doubles: {
        options: {
			filename: "/../../../tmp/doubles.json",
			expressDir: "test/fixtures/doubles"
        }
      },
      sae: {
        options: {
			expressDir: "/vagrant/sae-server"
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'nodeunit']);

  // By default, lint and run makecsp as test.
  // Add real tests here in the future
  grunt.registerTask('default', ['clean', 'jshint', 'nodeunit']);
};
