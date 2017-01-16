/**
 * 默认任务，任务说明
 */
module.exports = exports = function(grunt) {
  grunt.registerTask('default', function() {

    grunt.log.writeln('\nUsage:');
    // build
    grunt.log.writetableln(
      [36, 50],
      [
        indent('grunt build [options]', 2),
        'build front-end [development]'
      ]
    );
    grunt.log.writeln(indent('Options:', 4));
    grunt.log.writetableln(
      [36, 50],
      [
        indent('--target=<target>', 6),
        'build front-end for <target> (development|dev|production|pro)'
      ]
    );

  });
};

function indent(text, spaces) {
  spaces = new Array((spaces || 0) + 1);
  return spaces.join('\u0020') + text;
}