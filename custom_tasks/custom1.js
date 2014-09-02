'use strict';

/**
 * Sample custom task
 */
module.exports = function(grunt) {
  grunt.registerTask('custom1', 'custom task', function() {
    console.log('custom1 task was executed!');
  });
};