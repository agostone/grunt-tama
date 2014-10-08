'use strict';

/**
 * @module grunt-tama
 */

// Privates vars
var _ = require('lodash-node');
var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');
var instance = null;
var events = require('events');
var util = require('util');

/**
 * grunt-tama module
 *
 * @class
 */
function GruntTama(grunt, config) {

  events.EventEmitter.call(this);

  // Public vars
  this.extraPluginPaths = [];
  this.customTaskPaths = [];
  this.taskMaps = {};
  this.basicAsMultiTask = false;
  this.grunt = grunt;

  // Configuring & initializing
  if (_.isArray(config.extraPluginPaths)) {
    this.extraPluginPaths = config.extraPluginPaths;
  }

  if (_.isArray(config.customTaskPaths)) {
    this.customTaskPaths = config.customTaskPaths;
  }

  if (_.isObject(config.taskMaps)) {
    this.taskMaps = config.taskMaps;
  }

  if (_.isObject(config.eventListeners)) {
    this._initializeListeners(config.eventListeners);
  }

  if (_.isArray(config.basicAsMultiTask) || config.basicAsMultiTask === true) {
    this.basicAsMultiTask = config.basicAsMultiTask;
  }

  this.emit('beforeHooks', config);

  this._hookRegisterTask();
  this._hookTaskPlusArgs();

  if (_.isString(config.configPath)) {

    this.emit('beforeInitConfig', config);
    this.grunt.initConfig(this._loadConfig(config.configPath));
  }

  this.emit('afterInitialized', config);
}

// Inheritance
util.inherits(GruntTama, events.EventEmitter);

/**
 * Initializes event listeners
 *
 * @param {Object} listeners Event listeners
 */
GruntTama.prototype._initializeListeners = function(listeners) {
  var listener;

  for (listener in listeners) {

    // If listener is a function
    if (_.isFunction(listeners[listener])) {
      listeners[listener](this);

    // If listener is a string, trying to require it
    } else if (_.isString(listeners[listener])) {
      require(path.resolve(listeners[listener]))(this);
    }
  }
};

/**
 * Reads a file (json, js, coffee, ls) and returns its content as an Object
 *
 * @param {string} file File to read
 * @return {Object}
 */
GruntTama.prototype._readFile = function(file) {

  var extension = path.extname(file);

  // YAML file
  if (extension.match(/ya?ml/)) {
    var config = fs.readFileSync(file, 'utf8');
    return yaml.safeLoad(config);
  }

  // JS / JSON / CoffeeScript
  if (extension.match(/json|js|coffee|ls/)) {
    return require(file);
  }

  return false;
};

/**
 * Loads and merges task configuration files
 *
 * @param {string} configPath Path to the config files
 * @returns {Object}
 */
GruntTama.prototype._loadConfig = function(configPath) {

  var tama = this;
  var config = {};
  var configFiles = this.grunt.file.expand({cwd: configPath}, '**/*.{js,json,yml,yaml,coffee,ls}');

  configFiles.forEach(function(configFile) {

    var contents = tama._readFile(path.resolve(configPath + '/' + configFile));
    var basename = path.basename(configFile, path.extname(configFile));

    if (contents) {

      // If config files contents is a function, calling it.
      if (_.isFunction(contents)) {
        contents = contents(tama.grunt);
      }

      if (!config[basename]) {
        config[basename] = {};
      }

      // Storing the config options
      config[basename] = _.merge(config[basename], contents);
    }
  });

  return config;
};

/**
 * Hooks grunts registerTask and registerMultiTask functions
 */
GruntTama.prototype._hookRegisterTask = function() {
  /* jshint validthis:true */

  /**
   * Replaces the original registerTask function
   *
   * @param {string} taskName Task name the task is about to be registered with
   */
  function tamaRegisterTask(taskName) {

    var emitArguments = ['beforeRegisterTask'].concat(Array.prototype.slice.apply(arguments));

    tama.emit.apply(tama, emitArguments);

    // If task should be handled as a multi task
    if (tama.basicAsMultiTask === true ||
        (_.isArray(tama.basicAsMultiTask) && tama.basicAsMultiTask.indexOf(taskName) >= 0)
    ) {
      tama.grunt.registerMultiTask.apply(this, arguments);
    } else {
      originalRegisterTask.apply(this, arguments);
    }

    emitArguments[0] = 'afterRegisterTask';
    tama.emit.apply(tama, emitArguments);
  }

  /**
   * Replaces the original registerMultiTask function
   */
  function registerMultiTask() {
    tama.grunt.registerTask = originalRegisterTask;
    originalRegisterMultiTask.apply(this, arguments);
    tama.grunt.registerTask = tamaRegisterTask;
  }

  var tama = this;
  var originalRegisterTask = this.grunt.registerTask;
  var originalRegisterMultiTask = this.grunt.registerMultiTask;

  this.grunt.registerTask = tamaRegisterTask;
  this.grunt.registerMultiTask = registerMultiTask;
};

/**
 * Hooks grunt.util.task.Tasks _taskPlusArgs function
 */
GruntTama.prototype._hookTaskPlusArgs = function() {

  /**
   * Replaces the original taskPlusArgs function
   *
   * @param {string} taskName Target task name
   * @returns {Object}
   */
  function taskPlusArgs(taskName) {

    var thing = null;
    var plugin = tama._getTaskMap(taskName);

    // If there is task map
    if (plugin !== false) {
      taskName = plugin.slice(1).join(':');
      plugin = plugin[0];
    }

    // Trying to get the task and args
    thing = originalTaskPlusArgs.call(tama.grunt.task, taskName);

    // If getting task and args failed, trying to load the task
    if (!thing.task) {

      // If there was no task map
      if (plugin === false) {
        plugin = thing.args[0];
      }

      // If loading plugin and task failed
      if (!tama._loadPlugin(plugin) || !(thing = originalTaskPlusArgs.call(tama.grunt.task, taskName))) {
        tama._error(taskName);
      }
    }

    return thing;
  }

  var tama = this;

  // Storing the original taskPlusArg function
  var originalTaskPlusArgs = this.grunt.util.task.Task.prototype._taskPlusArgs;

  // Injecting Tamas taskPlusArg function
  this.grunt.util.task.Task.prototype._taskPlusArgs = taskPlusArgs;
};

/**
 * Loads a custom task or node module plugin
 *
 * @param {string} pluginName Name of the plugin to load
 */
GruntTama.prototype._loadPlugin = function(pluginName) {

  var pluginTaskPath = null;
  var glob = this.grunt.file.expand;
  var lookupPaths = this.customTaskPaths;
  var tama = this;

  // Trying custom task paths first
  lookupPaths.every(function(taskPath) {

    pluginTaskPath = glob({cwd: taskPath}, '**/' + pluginName + '.*');

    // If custom task found, loading and breaking every
    if (pluginTaskPath.length > 0) {
      pluginTaskPath = path.resolve(taskPath + '/' + pluginTaskPath[0]);
      tama.emit('beforeLoadCustomTask', pluginTaskPath);
      pluginTaskPath = require(pluginTaskPath);
      return false;
    }

    pluginTaskPath = null;
    return true;
  });

  // Calling custom task
  if (pluginTaskPath) {
    pluginTaskPath.call(this.grunt, this.grunt);
    return true;
  }

  // Trying local node_modules and global modul paths
  lookupPaths = [

    // Process module path
    process.cwd() + '/node_modules',

    // Global module path
    path.dirname(process.execPath) + '/node_modules'

  // Extra plugin paths and user home modules / libraries, etc.
  ].concat(this.extraPluginPaths).concat(require.main.constructor.globalPaths);

  // Searching for plugin tasks
  lookupPaths.every(function(pluginPath) {

    pluginTaskPath = glob({
      cwd: pluginPath
    }, '*' + pluginName + '/tasks');

    // If plugin tasks are found, breaking every
    if (pluginTaskPath.length > 0) {
      pluginTaskPath = path.resolve(pluginPath + '/' + pluginTaskPath[0]);
      return false;
    }

    pluginTaskPath = null;
    return true;
  });

  // Loading plugin tasks
  if (pluginTaskPath) {
    this.emit('beforeLoadModuleTasks', pluginTaskPath);
    this.grunt.loadTasks(pluginTaskPath);
    return true;
  }

  return false;
};

/**
 * Displays the grunt-tama error message
 *
 * @param {string} taskName Target tasks name
 */
GruntTama.prototype._error = function(taskName) {
  var log = this.grunt.log.writeln;

  log();
  log('grunt-tama: \''.yellow + taskName.red + '\' task cannot be loaded or is missing!'.yellow);
  log('The following error(s) may occured:');
  log('- missing or corrupted plugin');
  log('- missing or invalid task alias and/or task map');
  log('- missing or invalid custom plugin path(s)');
  log('- missing or invalid custom task path(s)');
  log();
};

/**
 * Creates the grunt-tama singleton instance
 *
 * @param {Grunt} grunt Grunt instance
 * @param {Object} config grunt-tama config object
 * @returns {GruntTama}
 */
GruntTama.instance = function(grunt, config) {
  if (instance === null) {
    instance = new GruntTama(grunt, config);
  }

  return instance;
};

/**
 * Returns with the plugin and task name for the requested task map
 *
 * @param {string} taskName Requested task name
 * @return {Array}
 */
GruntTama.prototype._getTaskMap = function(taskName) {

  var pluginTask = false;
  var map;
  var alias;
  var parts = this.grunt.util.task.Task.prototype.splitArgs(taskName);
  var args = [];

  for (var index = parts.length; index > 0; index--) {

    alias = parts.slice(0, index).join(':');
    map = this.taskMaps[alias];

    // If map found
    if (map !== undefined) {

      pluginTask = this.grunt.util.task.Task.prototype.splitArgs(map);

      if (pluginTask.length <= 1) {
        pluginTask[1] = alias;
      }

      pluginTask = pluginTask.concat(args.reverse());
      break;
    }

    args.push(parts[index - 1]);
  }

  return pluginTask;
};

/**
 * Exports the singleton method
 *
 * @alias module:grunt-tama
 */
module.exports = GruntTama.instance;
