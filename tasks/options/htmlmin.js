
module.exports = exports = {
  dist: {
    options: {
      removeComments: true,
      collapseWhitespace: true
    },
    files : [{
      expand: true,
      cwd: '<%= opt.temp %>/view',
      src: ['**/*.html'],
      dest: '<%= opt.dist %>/view',
      ext: '.html'
    }]
  }
};
