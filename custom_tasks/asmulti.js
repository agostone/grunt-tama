'use strict';

/**
 * Sample task handled as a multi task.
 */
module.exports = function(grunt) {
  grunt.registerTask('asmulti', 'task as multi task', function() {
    console.log('asmulti task was executed!');
  });
};