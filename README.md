# grunt-tama [![NPM version](https://badge.fury.io/js/grunt-tama.png)](http://badge.fury.io/js/grunt-tama) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

TAsk MAnager for Grunt (based on the idea of jit-grunt by Shotaro Tsubouchi - https://github.com/shootaroo)

Features:
- Structuring task configurations into files
- Specifying extra plugin path(s)
- Structuring custom task(s) into files
- Lazy loading tasks, only when grunt really needs them
- "Targeting" basic task(s) (impersonating basic task(s) as multi task(s))

## Install
Not registered as a node package, yet.

## Usage
Remove any `grunt.loadNpmTasks`, `grunt.loadTasks` from your gruntfile.js
and add `require('grunt-tama')(grunt, {<tama options>})` instead.

```js
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
```js
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
$ node grunt --test=run

## Building Tama
$ node grunt

## TODO
- Unit tests
- Regsiter in NPM
- Auto packer, uploader to NPM

## License
The MIT License (MIT)

Copyright &copy; 2013 [Shards](https://github.com/shards)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
