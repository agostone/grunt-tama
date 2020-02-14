# grunt-tama [![NPM version](https://badge.fury.io/js/grunt-tama.png)](http://badge.fury.io/js/grunt-tama)

TAsk MAnager for Grunt

## Features
- Organize task configurations into files
- Organize task(s) into files
- Specifying extra plugin path(s)
- Lazy loading tasks, only when grunt really needs them
- "Targeting" basic task(s) (impersonating basic task(s) as multi task(s))

## Install
$ npm install git://github.com/Shards/grunt-tama.git --save-dev

## Usage
Remove any `grunt.loadNpmTasks`, `grunt.loadTasks` from your gruntfile.js
and add `require('grunt-tama')(grunt, {<tama options>})` instead.

```
module.exports = function (grunt) {
  require('grunt-tama')(grunt, {
    configPath: '<path to the config files>',
    extraPluginPaths: ['<plugin path>', '<plugin path>', ...],
    taskMaps: {<alias>: '<plugin name>:<task name>', ...}
    customTaskPaths = ['<custom task path>', '<custom task path>', ...],
    basicAsMultiTask = (true or ['<basic task name>', '<basic task name>', ...])
  });
  ...
}
```
## Options
### configPath
- Type: string
- Default: undefined
- Optional: yes

Path where the config file(s) resides.

Pattern used to find config files: `**/*.{js,json,yml,yaml,coffee,ls}`

If you decide to use this option, keep in mind that Tama will call
grunt.initiConfig automatically, so you need to remove it from your gruntfile.js.

### extraPluginPaths
- Type: array
- Default: []
- Optional: yes

Extra path(s) to look plugins for besides node_modules.

For example if you put private plugins into separate directories.

### customTaskPaths
- Type: array
- Default: []
- Optional: yes

You can remove registerTask and registerMultiTask from your gruntfile.js and put every single task into these
directories as file(s).

For example: custom1.js
```
module.exports = function (grunt) {
  grunt.registerTask('custom1', 'My custom task', function () {
    ...
  });
};
```

###taskMaps
- Type: Object
- Default: {}
- Optional: yes

With this you can create name - task maps. It's useful when autoloading a task is impossible because of differing plugin and task name.
Also good if you wish to create custom aliases without creating a custom task.

To create a taskMap, use the following pattern: `{<alias>: '<plugin name>:<task name>', ...}`

Task name is optional. If omited, it means the plugin has a task with a name identical with the alias.  

### basicAsMultiTask
- Type: boolean | array
- Default: false
- Optional: yes

This setting controls if basic task(s) should be impersonated as multi tasks.

#### Value: true
If it's set to true all basic tasks will be handled as a multi tasks.

#### Value: `['<task name>', '<task name>', ...]`
If it's set to an array of task names, only those individual tasks will be handled as multi tasks. 

## Task lookup order
Tama would look for tasks in the following locations, in this order:

1. Task file(s) in path(s) set in the customTaskPaths option.
2. Plugins in the node_modules directory of the running node process.
3. Plugins in the global node_modules directory.
3. Plugins in the path(s) set by the NODE_PATH environment variable.
4. Plugins in the logged in users .node_modules, .node_library directories.
5. Plugins in path(s) set in the extraPluginPaths option.

Pattern used to find task files: `**/<task name>.*`<br>
Pattern used to find plugin tasks: `*<plugin name>/tasks`

It is able to find coffee scripts as well as javascripts, etc.
Also directory and task name differences are not an issue.

If multiply matches found, Tama will use the first.

## Running the test
$ npm run test
