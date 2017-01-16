
module.exports = exports = {
  options: {
    idleading:'module/',
    alias:'<%= pkg.spm.alias%>'
  },
  dist: {
    files : [{
      expand:true,
      cwd:'<%= opt.js %>/jstmp',
      src : ['**/*.js', '!_branch/**/*.js'],
      dest : '<%= opt.js %>/build'
    }]
  }
};