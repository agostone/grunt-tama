'use strict';

/**
 * Sample plugin for taskMaps.
 *
 * The task name differs from the plugin name.
 */
module.exports = function(grunt) {
  grunt.registerTask('task1', 'grunt-plugin task1', function() {
    console.log('grunt-plugin1 task1 was executed!');
  });
};