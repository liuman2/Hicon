
var glob = require('glob');
var path = require('path');
var join = path.join;

module.exports = function(grunt) {
  // Project configuration.
  var config = {
    pkg: grunt.file.readJSON('package.json'),
    opt: {
      /*'root': './',
       'assets': '<%= opt.root%>/static',
       'js': '<%= opt.assets%>/javascripts',
       'jssrc': '<%= opt.js%>/src',
       'jsdist': '<%= opt.js%>/dist',
       'sass': '<%= opt.assets%>/stylesheets/sass',
       'css': '<%= opt.assets%>/stylesheets/css',*/

      // 静态文件根路径
      'client': './client',
      // 输出路径
      'dist': './dist',
      // style
      'sass': '<%= opt.client%>/sass',
      'css': '<%= opt.dist%>/css',
      // 组件库根路径
      'vendor': '<%= opt.client%>/vendor',
      // 临时路径
      'temp': '<%= opt.dist%>/temp'
    },
    jshint: {
      options: {
        reporterOutput: 'report.txt',
        force: true
      },
      files : ['client/js/*.js']
    }
  };
  grunt.util._.extend(config, loadConfig('./tasks/options/'));
  grunt.initConfig(config);

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-contrib-jshint');

  // By default, lint and run all tests.
  grunt.registerTask('jshint', 'jshint');

  // load all grunt custom tasks
  grunt.loadTasks('tasks');
};

function loadConfig(configPath) {
  var config = {};

  glob.sync('*', { cwd: configPath })
      .forEach(function(configFile) {
        var prop = configFile.replace(/\.js$/, '');
        config[prop] = require(join(__dirname, configPath, configFile));
      });

  return config;
}
