'use strict';

/**
 * Tama configuration file
 */
module.exports = {
  // Path where the config file(s) resides.
  configPath: './config/tasks',

  // Extra path(s) to look plugins for besides node_modules.
  extraPluginPaths: ['./extra_plugins'],

  // Path where custom tasks resides.
  customTaskPaths: ['./custom_tasks'],

  // Task maps
  taskMaps: {
    // Mapping a basic task - which task name differs from plugin name - to an alias
    map: 'grunt-plugin1:task1',

    // Mapping a basic task - which task name differs from plugin name - to an alias with the same name
    task1: 'grunt-plugin1',

    // Mapping a multi task - which task name differs from plugin name - to an alias
    map2: 'grunt-plugin3:task2'
  },

  // Handle basic task(s) as multi task(s)
  basicAsMultiTask: ['asmulti']
};