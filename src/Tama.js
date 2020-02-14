'use strict';

const {isArray, isObject, isString, isFunction, merge} = require('lodash');
const {basename, extname, resolve} = require('path');
const {existsSync} = require('fs');

class Tama {
    constructor(config) {
        // Public vars
        this.extraPluginPaths = [];
        this.customTaskPaths = [];
        this.taskMaps = {};
        this.basicAsMultiTask = false;
        this.configPath = undefined;

        // Configuring & initializing
        if (isArray(config.extraPluginPaths)) {
            this.extraPluginPaths = config.extraPluginPaths;
        }

        if (isArray(config.customTaskPaths)) {
            this.customTaskPaths = config.customTaskPaths;
        }

        if (isObject(config.taskMaps)) {
            this.taskMaps = config.taskMaps;
        }

        if (isArray(config.basicAsMultiTask) || config.basicAsMultiTask === true) {
            this.basicAsMultiTask = config.basicAsMultiTask;
        }

        if (!isString(config.configPath) || !existsSync(config.configPath)) {
            throw new Error('configPath should point to a valid directory!');
        }

        this.configPath = config.configPath;
    }

    initConfig(grunt) {
        this._hookRegisterTask(grunt);
        this._hookTaskPlusArgs(grunt);

        grunt.initConfig(this._loadConfig(this.configPath, grunt));

        return grunt;
    }

    /**
     * Loads and merges task configuration files
     *
     * @param {string} configPath Path to the config files
     * @returns {Object}
     */
    _loadConfig(configPath, grunt) {

        const config = {};
        const configFiles = grunt.file.expand({cwd: configPath}, '**/*.{js,json,coffee,ls}');

        configFiles.forEach((configFile) => {
            const taskname = basename(configFile, extname(configFile));
            let contents = require(`${configPath}/${configFile}`);

            if (contents) {
                // If config files contents is a function, calling it.
                if (isFunction(contents)) {
                    contents = contents(grunt);
                }

                // Storing the config options
                config[taskname] = !config[taskname] ? {} : contents;
            }
        }, this);

        return config;
    };

    /**
     * Hooks grunts registerTask and registerMultiTask functions
     */
    _hookRegisterTask(grunt) {
        /**
         * Replaces the original registerTask function
         *
         * @param {string} taskName Task name the task is about to be registered with
         */
        function tamaRegisterTask(taskName) {
            // If task should be handled as a multi task
            if (self.basicAsMultiTask === true ||
                (isArray(self.basicAsMultiTask) && self.basicAsMultiTask.indexOf(taskName) >= 0)
            ) {
                grunt.registerMultiTask.apply(this, arguments);
            } else {
                originalRegisterTask.apply(this, arguments);
            }
        }

        /**
         * Replaces the original registerMultiTask function
         */
        function registerMultiTask() {
            grunt.registerTask = originalRegisterTask;
            originalRegisterMultiTask.apply(this, arguments);
            grunt.registerTask = tamaRegisterTask;
        }

        const self = this;
        const originalRegisterTask = grunt.registerTask;
        const originalRegisterMultiTask = grunt.registerMultiTask;

        grunt.registerTask = tamaRegisterTask;
        grunt.registerMultiTask = registerMultiTask;
    };

    /**
     * Hooks grunt.util.task.Tasks _taskPlusArgs function
     */
    _hookTaskPlusArgs(grunt) {
        /**
         * Replaces the original taskPlusArgs function
         *
         * @param {string} taskName Target task name
         * @returns {Object}
         */
        function taskPlusArgs(taskName) {
            let taskDefinition;
            let plugin = self._getTaskMap(taskName);

            // If there is task map
            if (plugin !== false) {
                taskName = plugin.slice(1).join(':');
                plugin = plugin[0];
            }

            // Trying to get the task and args
            taskDefinition = originalTaskPlusArgs.call(grunt.task, taskName);

            // If getting task and args failed, trying to load the task
            if (!taskDefinition.task) {

                // If there was no task map
                if (plugin === false) {
                    plugin = taskDefinition.args[0];
                }

                // If loading plugin and task failed
                if (!self._loadPlugin(grunt, plugin) || !(taskDefinition = originalTaskPlusArgs.call(grunt.task, taskName))) {
                    self._error(taskName);
                }
            }

            return taskDefinition;
        }

        const self = this;

        // Storing the original taskPlusArg function
        const originalTaskPlusArgs = grunt.util.task.Task.prototype._taskPlusArgs;

        // Injecting Tamas taskPlusArg function
        grunt.util.task.Task.prototype._taskPlusArgs = taskPlusArgs;
    };

    /**
     * Loads a custom task or node module plugin
     *
     * @param {string} pluginName Name of the plugin to load
     */
    _loadPlugin(grunt, pluginName) {
        let pluginTaskPath;
        const glob = grunt.file.expand;
        const lookupPaths = this.customTaskPaths;
        const self = this;

        // Trying custom task paths first
        lookupPaths.every(function (taskPath) {

            pluginTaskPath = glob({cwd: taskPath}, '**/' + pluginName + '.*');

            // If custom task found, loading and breaking every
            if (pluginTaskPath.length > 0) {
                pluginTaskPath = resolve(`${taskPath}/${pluginTaskPath[0]}`);
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

        console.log(require);

        // Trying local node_modules and global modul paths
        lookupPaths = require. [

            // Process module path
            process.cwd() + '/node_modules',

            // Global module path
            path.dirname(process.execPath) + '/node_modules'

            // Extra plugin paths and user home modules / libraries, etc.
        ].concat(this.extraPluginPaths).concat(require.main.constructor.globalPaths);

        // Searching for plugin tasks
        lookupPaths.every(function (pluginPath) {

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
    _error(taskName) {
        const log = this.grunt.log.writeln;

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
     * Returns with the plugin and task name for the requested task map
     *
     * @param {string} taskName Requested task name
     * @return {Array}
     */
    _getTaskMap(taskName) {

        const pluginTask = false;
        const map;
        const alias;
        const parts = this.grunt.util.task.Task.prototype.splitArgs(taskName);
        const args = [];

        for (const index = parts.length; index > 0; index--) {

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
}

module.exports = Tama;
