'use strict';

module.exports = function(tama) {
  tama.on('beforeHooks', function(config) {
    console.log('listener1 beforeHooks handler succeed!');
  });
  tama.on('beforeInitConfig', function(config) {
    console.log('listener1 beforeInitConfig handler succeed!');
  });
  tama.on('beforeRegisterTask', function(taskName, taskDescriptionOrFunction, taskFunction) {
    console.log('listener1 beforeRegisterTask handler succeed! (' + taskName + ')');
  });  
  tama.on('beforeLoadCustomTask', function(taskFile) {
    console.log('listener1 beforeLoadCustomTask handler succeed! (' + taskFile + ')');
  });
  tama.on('beforeLoadModuleTasks', function(moduleTasksPath) {
    console.log('listener1 beforeLoadModuleTasks handler succeed! (' + moduleTasksPath + ')');
  });
};
