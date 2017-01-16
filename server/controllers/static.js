/*!
 * 数据临时获取控制器
 */
var router = require('express').Router();
var fs = require('fs');
var path = require('path');

// root
var root = path.join(__dirname, '../../static/data');

// read static data file
var files = fs.readdirSync(root);

files.forEach(function(file){
    // if not js file out
    if(!file.search(/\.js/ig)) { return; }

    // get controller, use filename to define controller
    var controller = file.replace(/\.js/ig, '');

    // require module
    var mod = require(root + '/' + controller);

    // read action, use exports content to define action
    for(var action in mod) {
        (function (action) {
            // set request url
            var url = '/' + controller + '/' + action;
            // get target
            var target = mod[action];
            // add router
            router.use(url, function(req, res, next) {
                // send data to client
                switch (typeof target){
                    case 'function': // function
                        var data = (req.method == 'POST' ? req.body : req.query);
                        res.send(target(data));
                        break;
                    case 'object': // json
                        res.send(target);
                        break;
                    default:
                        res.send('unknow target');
                        break;
                }
            });
        })(action);
    }
});


module.exports = router;