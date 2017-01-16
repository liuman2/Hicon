var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var domain = require('domain');
var app = express();

var pathRoot = '/..';
var pathClient = pathRoot + '/client';
var pathServer = pathRoot + '/server';

// view engine setup
app.set('views', path.join(__dirname, pathServer + '/views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());


//引入一个domain的中间件，将每一个请求都包裹在一个独立的domain中
//domain来处理异常
app.use(function (req,res, next) {
    var d = domain.create();
    //监听domain的错误事件
    d.on('error', function (err) {
        // logger.error(err);
        console.log(err);
        res.statusCode = 500;
        res.json({message: 'node服务异常'});
        // d.dispose();
    });

    d.add(req);
    d.add(res);
    d.run(next);
});


// less
/*var lessMiddleware = require('less-middleware');
 app.use(
 lessMiddleware('/less', {
 debug: true,
 pathRoot: path.join(__dirname, pathClient),
 dest: '/css'

 })
 );*/
// sass
/*app.use(
 require('node-sass').middleware({
 src: path.join(__dirname, pathClient + '/sass'),
 dest: path.join(__dirname, pathClient + '/css'),
 debug: true,
 outputStyle: 'compressed',
 prefix:  '/css'
 })
 );*/
// compass
app.use(
    require('node-compass')({
        // The output mode you wish to use. Can be expanded, nested, compressed or compact.
        mode: 'nested',
        logging: true,
        project: path.join(__dirname, pathClient),
        css: 'css',
        sass: 'sass',
        config_file: '../sass.config.rb'
    })
);


// client static
app.use(express.static(path.join(__dirname, pathClient)));
//app.use('/css', express.static(path.join(__dirname, pathClient + '/css')));
//app.use('/js', express.static(path.join(__dirname, pathClient + '/js')));


// Load routes
require('./router')(app);


module.exports = app;
