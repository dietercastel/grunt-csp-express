# grunt-csp-express

> Tool to extract urls of a project for use in the Content-Security-Policy.

## Features

- Enabled by [Grunt](http://gruntjs.com/).
- Exclude directories
- Exclude files
- Option to add extra regex 
- AngularJS support (tested with v1.3)
- Designed to work with [content-security-policy](https://github.com/samuelerdtman/content-security-policy)
- url usage "guessing" (add to img-src for img tags etc.)
- Warnings for: inline scripts, styles, html import usage and serverside template usage with express.

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
Default value: `"."`

It specifies in what directory grunt (using grep) will look for urls.
It's also used as path where the resulting csp.json file will be stored.

#### options.filename
Type: `String`
Default value: `"/csp.json"`

It specifies the output filename and should always start with a "/".
Path is to the `expressDir` option.

#### options.excludeDirs
Type: `[String]`
Default value: `["bin","node_modules",".git","test"]`

Specifies which directories to exclude from tag/url searching.

#### options.excludeFiles
Type: `[String]`
Default value: `["csp.json,Gruntfile.js,package.json,.gitignore"]`

Specifies which files to exclude from tag/url searching.

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
	  default_options: { //target with default_options uses '.' as directory

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

```js
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    makecsp: {
	  options { //task options
		  filename : "/overriddenname.txt"
	  },
	  custom_options: { //options for this target
		  filename : "/customname.json",
		  expressDir : "/my/custom/dir"
	  }
	}
  });

  // This plugin provides the necessary task.
  grunt.loadNpmTasks('grunt-csp-express');

  // By default, just run makecsp with target custom_options
  grunt.registerTask('default', ['makecsp:custom_options']);
};
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### v0.1.4
- Added warnings for serverside template usage.
- Empty directives are now set to 'none' by default.
- Updated tests accordingly.

### v0.1.3
- Introduced warnings for: inline script, style and html import usage.
- Made default-src default to 'none' to be as restrictive as possible.
- Made connect-src default to 'self' because AngularJS needs it for templates.
- Updated tests accordingly.
- Updated logs accordingly with colored warnings!

### v0.1.2
- Code and log cleanup.
- Support for --verbose run with Grunt
- option.expressDir now has default value '.'
- Introduced 3 tests 
- Updated documentation accordingly. 

### v0.1.1
- Fixed bug related to wildcards for files/directories.
- Updated documentation to include some example.
- Fixed wrong meta-information.

### v0.1
- Initial release with very basic functionality.


## Planned features

This is currently very much a work-in-progress.
I'd like to get rid of the `grep` usage and vastly improve performance by using faster node.js features.
I'm still quite unexperienced with node.js development so I obviously still have a lot to learn. 

## Similar Projects

I recently found [contentsecure](https://github.com/Munter/contentsecure) which has a very similar goal.
I was not aware of this when creating this initial release.
I will look further into this and see whether it's beneficial to integrate/merge/improve both projects.
