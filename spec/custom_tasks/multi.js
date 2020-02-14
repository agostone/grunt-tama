'use strict';

/**
 * Sample multi task
 */
module.exports = function(grunt) {
  grunt.registerMultiTask('multi', 'multi task', function() {
    console.log('multi task was executed - option: ' + this.options().name + '!');
  });
};