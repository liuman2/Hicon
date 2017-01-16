/**
 * `grunt-contrib-watch` 插件的相关配置
 * 主要是监视客户端文件的改动，以便自动构建，方便开发
 */

module.exports = exports = {
    options: {
        spawn: false
    },
    build: {
        files: '<%= opt.sass %>/**/*',
        tasks: ['sass:debug']
    },
    // 监控日期控件
    /*calendar: {
        files: '<%= opt.libs %>/calendar/sass/*',
        tasks: ['sass:calendar']
    }*/
};
