
module.exports = exports = {
  options: {
    force:true
  },
  dist: {
    src: ["<%= opt.dist %>"]
  },
  temp: {
    src: ["<%= opt.dist %>/temp"]
  }
};