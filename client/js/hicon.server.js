var hicon = hicon || {};

hicon.server = (function() {

    var proxies = {};

    proxies.ajax = function(options) {
        if (hicon.utils.main && !hicon.utils.main.isOnLine()) {
            var cfg = {
                text: '请检查您的网络是否正常',
                type: 'error'
            };
            hicon.utils.noty(cfg);

            if ($.isFunction(options.error)) {
                options.error();
            }
            return;
        }

        var config = {
            url:  '/service.svc/'+options.url, /*'http://www.xmhicon.net:8732/service.svc/'+options.url,*/
            data: JSON.stringify(options.data),
            type: options.type || 'GET',
            cache: false,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",

            error: function (jqXHR, textStatus, errorThrown) {
                if (errorThrown === "Unauthorized") {
                    //TODO Use utility function for this?
                    window.location.href = "";
                } else {
                    if ($.isFunction(options.error)) {
                        options.error();
                    }
                }
            }
        };

        if ($.isFunction(options.success)) {
            config.success = options.success;
        }
        return $.ajax(config);
    };

    return proxies;
}());
