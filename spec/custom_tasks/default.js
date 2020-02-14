'use strict';

/**
 * Sample task alias
 */
module.exports = function(grunt) {
  grunt.registerTask('default', ['custom1', 'asmulti', 'task1', 'map', 'plugin2', 'multi:target2', 'map2:target2']);
};