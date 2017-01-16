
var yaml = require('yamljs');
var config = yaml.load('./config.yml');

// 请求代理对象
var proxy_host = config['proxy_ip'];
var proxy_port = config['proxy_port'];
var server_prefix = config['server_prefix'];

var http = require('http');

var api = function(req, res, next) {
    var data = req.body || {};

    data = JSON.stringify(data);

    var opt = {
        method: req.method,
        host: proxy_host,
        port: proxy_port,
        path: server_prefix + req.originalUrl,
        headers: {
            "Content-Type": 'application/json; charset=UTF-8', //req.headers.accept,
            "Content-Length": Buffer.byteLength(data, 'utf-8'),
            "Cookie": req.headers.cookie
        }
    };

console.log(opt);

    var req = http.request(opt, function(serverFeedback) {
        /*if (serverFeedback.statusCode == 200) {
         var body = "";
         serverFeedback.on('data', function (data) { body += data; })
         .on('end', function () { res.send(200, body); });
         }
         else {
         res.send(500, "error");
         }*/
        var body = "";
        serverFeedback.on('data', function(data) {
            body = body ? body + data : data;
        }).on('end', function() {
            var contentType = serverFeedback.headers['content-type'],
                isImage = contentType && contentType.indexOf && contentType.indexOf('image') > -1;
            res.writeHead(serverFeedback.statusCode, serverFeedback.headers);
            if (isImage) {
                res.write(body, "binary");
            } else {
                res.write(body);
            }
            res.end();
        });
    });
    req.write(data + "\n");
    req.end();
};
module.exports = api;
