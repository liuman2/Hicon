
module.exports = exports = {
  options: {
    include:'relative'
  },
  dist: {
    files : [{
      expand: true,
      cwd: '<%= opt.js %>/build',
      src: ['**/*.js','!**/*-debug.js'],
      dest: '<%= opt.js %>/merge'
    }]
  }
};