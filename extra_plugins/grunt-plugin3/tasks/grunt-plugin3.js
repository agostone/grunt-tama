'use strict';

/**
 * Sample multi task plugin for taskMaps.
 *
 * The task name differs from the plugin name.
 */
module.exports = function(grunt) {
  grunt.registerMultiTask('task2', 'grunt-plugin3 task2', function() {
    console.log('grunt-plugin3 task2 was executed - option: ' + this.options().name + '!');
  });
};