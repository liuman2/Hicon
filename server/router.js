/**
 * routes
 * 路由配置
 */
var yaml = require('yamljs');
var config = yaml.load('./config.yml');

var api = require('./proxy/api');




module.exports = exports = function(app) {
    // use static data file
    if(config['use_static_data']) {
        app.use('/', require('./controllers/static'));
    }

    // http proxy
    app.use('/', api);

    // error handler
    require('./controllers/error')(app);
};
