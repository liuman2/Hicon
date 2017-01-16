
module.exports = exports = {
  dist: {
    options: {
      optimizationLevel: 3
    },
    files: [{
      expand: true,
      cwd: '<%= opt.client %>/img/',
      src: ['**/*.{png,jpg,gif}'],
      dest: '<%= opt.dist %>/img/'
    }]
  }
};