
module.exports = exports = {
  options: {
    include:'relative'
  },
  vendor: {
    files : [{
      expand: true,
      cwd: '<%= opt.client %>/vendor',
      src: ['**/*'],
      dest: '<%= opt.dist %>/vendor'
    }]
  },
  img: {
    files : [{
      expand: true,
      cwd: '<%= opt.client %>/img',
      src: ['**/*'],
      dest: '<%= opt.dist %>/img'
    }]
  }
};
