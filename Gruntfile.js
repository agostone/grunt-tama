'use strict';

module.exports = function(grunt) {

  // If testing
  if (grunt.option('test') === 'run') {

    var config = require('./config/tama');

    // This is all we need, grunt-tama takes care of everything
    require('./lib/grunttama')(grunt, config);

  } else {

    // Project configuration.
    grunt.initConfig({

      jshint: {
        options: {
          jshintrc: true
        },
        all: ['Gruntfile.js', 'lib/*.js']
      },

      jscs: {
        options: {
          config: '.jscsrc'
        },
        all: ['*.js', '{lib,test}/**/*.js']
      },

      clean: ['docs/*'],

      jsdoc: {
        dist : {
          src: ['lib/*.js', 'test/*.js'],
          dest: 'docs'
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsdoc');
    // grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('default', ['jshint', 'jscs', 'clean', 'jsdoc']);
  }
};
