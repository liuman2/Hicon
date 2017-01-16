
module.exports = exports = {
  dist: {
    options: {
      /* delete content start */
      /* delete content end */
      reg: [
          [/(\/\*\s|<!--\s)delete\scontent\sstart(\s\*\/|\s-->)[(\S\s)]*?(\/\*\s|<!--\s)delete\scontent\send(\s\*\/|\s-->)/ig, '']
      ]
    },
    files: [{
      expand: true,
      cwd: '<%= opt.client %>',
      src: ['{module,js}/**/{*,*.*}.{html,js}'],
      dest: '<%= opt.temp %>'
    }]
  }

};