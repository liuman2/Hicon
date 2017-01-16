var hicon = hicon || {};
var viewModelLogs = null;

hicon.log = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.logList = ko.observableArray([]);
    };

    view.init = function() {
        viewModelLogs = new view.defineModel();
        ko.applyBindings(viewModelLogs, document.getElementById("log"));
    };

    view.show = function (e) {

    };

    view.aftershow = function (e) {

    };

    view.data = {

    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
        },
        doSearch: function() {
            var dt1 = $('#dtEventStart').val(),
                dt2 = $('#dtEventEnd').val();

            if (!dt1 || !dt2) {
                var cfg = {
                    text: !dt1 ? '请输入开始日期': '请输入结束日期',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return false;
            }

            App.showLoading();
            var userInfo = hicon.localStorage.getJson('USER_INFO');
            hicon.server.ajax({
                url: 'EventGets',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    FisheryID: userInfo.FisheryID,
                    dt1: dt1,
                    dt2: dt2
                },
                success: function(data) {
                    App.hideLoading();
                    viewModelLogs.logList(data);
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '查询失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        }
    };

    return view;
}());
