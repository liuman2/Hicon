// grunt-contrib-sass
module.exports = exports = {
  dist: {
    options: {
      'sourcemap': false,
      'style': 'compressed'
    },
    files: [{
      expand: true,
      cwd: '<%= opt.sass %>',
      src: ['**/*.scss', '!vendor/*'],
      dest: '<%= opt.css %>',
      ext: '.css'
    }]
  },
  release: {
    options: {
      'sourcemap': false,
      'style': 'compressed'
    },
    files: [{
      expand: true,
      cwd: '<%= opt.sass %>',
      src: ['**/*.scss'],
      dest: '<%= opt.css %>',
      ext: '.css'
    }]
  },
  debug: {
    options: {
      'sourcemap': true,
      'style': 'nested'
    },
    files: [{
      expand: true,
      cwd: '<%= opt.sass %>',
      src: ['**/*.scss'],
      dest: '<%= opt.css %>',
      ext: '.css'
    }]
  },
  // 日期组件样式编译
  // calendar: {
  //   options: {
  //     'sourcemap': true,
  //     'style': 'nested'
  //   },
  //   files: [{
  //     expand: true,
  //     cwd: '<%= opt.vendor %>/calendar/sass',
  //     src: ['calendar.scss'],
  //     dest: '<%= opt.vendor %>/calendar/css',
  //     ext: '.css'
  //   }]
  // }
};
