/**
 * build
 */

module.exports = exports = function(grunt) {
  grunt.registerTask('build', function() {
    // 任务目标
    var target = grunt.option('target');
    distTask();
  });

  // dist
  var distTask = function() {
    // clear dist
    grunt.task.run('clean:dist');

    // temp
    grunt.task.run('blendpage:dist');

    // js
    grunt.task.run('uglify:dist');

    // html
    grunt.task.run('htmlmin:dist');

    // css build
    grunt.task.run('sass:dist');

    // add css vendor-prefix
    grunt.task.run('autoprefixer:dist');

    // vendor
    grunt.task.run('copy:vendor');

    // img
    grunt.task.run('imagemin:dist');

    // temp
    grunt.task.run('clean:temp');
  }
};
