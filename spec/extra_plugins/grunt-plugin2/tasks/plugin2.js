'use strict';
/**
 * Sample plugin where task name is identical with the plugin name.
 */
module.exports = function(grunt) {
  grunt.registerTask('plugin2', 'grunt-plugin2 task', function() {
    console.log('grunt-plugin2 task was executed!');
  });
};