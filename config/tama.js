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
  basicAsMultiTask: ['asmulti'],

  // Event listeners
  eventListeners: [
    './event_listeners/listener1.js',
    function (tama) {
      tama.on('beforeHooks', function() {
        console.log('inline listener beforeHooks handler succeed!');
      });
      tama.on('beforeInitConfig', function() {
        console.log('inline listener beforeInitConfig handler succeed!');
      });
      tama.on('beforeRegisterTask', function() {
        console.log('inline listener beforeRegisterTask handler succeed!');
      });  
      tama.on('beforeLoadCustomTask', function() {
        console.log('inline listener beforeLoadCustomTask handler succeed!');
      });
      tama.on('beforeLoadModuleTasks', function() {
        console.log('inline listener beforeLoadModuleTasks handler succeed!');
      });
    }
  ]
};