
module.exports = exports = {
  dist: {
    files : [{
      expand: true,
      cwd: '<%= opt.temp %>/',
      src: ['**/*.js', '!**/_*.js'],
      dest: '<%= opt.dist %>/'
    }]
  }
};