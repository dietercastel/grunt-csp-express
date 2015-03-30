# grunt-csp-express

> Tool to extract urls of a project for use in the Content-Security-Policy.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-csp-express --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-csp-express');
```

## The "makecsp" task

### Overview
In your project's Gruntfile, add a section named `makecsp` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  makecsp: {
    options: {
      // Task-specific options go here.
	  // expressDir is required for makekcsp
	  expressDir: "."
    },
	//Overrides options previously specified
	//But at least one target is needed!!
    your_target: {
      // Target-specific file lists and/or options go here.
		options: {
		  // Target-specific options go here.
		  expressDir: "/path/to/my/target"
		},
    },
  },
});
```

### Options

#### options.expressDir
Type: `String`
Default value: `undefined`

Setting this option is required!!
It specifies in what directory grunt (and grep) will look for urls.
It's also used as path where the resulting csp.json file will be stored.


### Usage Examples

#### Default Options
Below is an example Gruntfile.js if you just want to use makecsp in the current project directory.
Using this as your entire grunt file when following the getting started guide mentioned above should work.
If grunt and it's depedencies are installed just run `grunt` in your project directory.

```js
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    makecsp: {
	  default_options: { //target with default_options
		  options: {
			  expressDir: "/vagrant/sae-server"
		  }
	  }
	}
  });

  // This plugin provides the necessary task.
  grunt.loadNpmTasks('grunt-csp-express');

  // By default, just run makecsp 
  grunt.registerTask('default', ['makecsp']);
};
```

#### Custom Options
You can specify custom options in the options object of the task or each target.
The target options override the task options.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### v0.1.1
Fixed bug related to wildcards for files/directories.
Updated documentation to include some example.
Fixed wrong meta-information.

### v0.1
Initial release with very basic functionality.
