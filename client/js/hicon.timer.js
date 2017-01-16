var hicon = hicon || {};
var viewModelTimer = null;

hicon.timer = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.timerList = ko.observableArray([]);
        self.device = {
            pondId: '',
            deviceNo: '',
            name:''
        };
    };

    view.init = function() {
        viewModelTimer = new view.defineModel();
        ko.applyBindings(viewModelTimer, document.getElementById("timer"));
    };

    view.show = function (e) {

    };

    view.aftershow = function (e) {

        viewModelTimer.device = hicon.sessionStorage.getJson('CURRENT_DEVICE');
        view.data.timerGet();
    };

    view.data = {
        timerGet: function() {
            App.showLoading();

            var userInfo = hicon.localStorage.getJson('USER_INFO');

            return hicon.server.ajax({
                url: 'TimerGets',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    PondID: viewModelTimer.device.PondID,
                    DtuNO: viewModelTimer.device.DtuNO,
                    DeviceNO: viewModelTimer.device.DeviceNO
                },
                success: function(data) {

                    $.map(data, function(d) {
                        if(d.Span == 0) {
                            d.SpanDesc = '24小时常开';
                        } else if (d.Span > 0){
                            if (d.Span < 60) {
                                d.SpanDesc = d.Span + '分钟';
                            } else {
                                if (!isNaN(d.Span)) {
                                    var hasDot = (((d.Span/60) + '').indexOf('.') != -1) ? true : false;
                                    if (hasDot) {
                                        d.SpanDesc = ((d.Span/60) == 0.5 ? '半' : (d.Span/60)).toFixed(2) + '小时';
                                    } else {
                                        d.SpanDesc = ((d.Span/60) == 0.5 ? '半' : (d.Span/60)) + '小时';
                                    }
                                } else {
                                    d.SpanDesc = ((d.Span/60) == 0.5 ? '半' : (d.Span/60)) + '小时';
                                }                
                            }
                            // d.SpanDesc = ((d.Span/60) == 0.5 ? '半' : (d.Span/60)) + '小时';
                        } else {
                            d.SpanDesc = '';
                        } 
                    })
                    viewModelTimer.timerList(data);
                    App.hideLoading();
                },
                error: function() {
                    App.hideLoading();
                }
            });
        },
    };

    view.events = {
        doBack: function() {
            // hicon.sessionStorage.saveJson('CURRENT_DEVICE', viewModelTimer.device);
            hicon.navigation.controller();
        },
        add: function() {
            // pondId, deviceNo, name
            // hicon.sessionStorage.saveJson('CURRENT_DEVICE', viewModelTimer.device);
            hicon.navigation.timerAdd();
        },
        itemClick: function(e) {
            var t = ko.dataFor(e.target.closest("li")[0]),
                commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
            switch(commandKey) {
                case 'trash':
                    hicon.utils.confirm({
                        message: '请确定是否要删除?',
                        ok: function() {
                            var userInfo = hicon.localStorage.getJson('USER_INFO');
                            hicon.server.ajax({
                                url: 'TimerDelete',
                                type: 'post',
                                data: {
                                    UserID: userInfo.UserID,
                                    TimerID: t.TimerID
                                },
                                success: function(data) {
                                    view.data.timerGet();
                                    var cfg = {
                                        text: data.Result ? '删除成功' : (data.ErrorMsg ? data.ErrorMsg: '删除失败'),
                                        type: data.Result ? 'success' : 'error'
                                    };
                                    hicon.utils.noty(cfg);
                                },
                                error: function() {
                                    var cfg = {
                                        text: '删除失败',
                                        type: data.Result ? 'success' : 'error'
                                    };
                                    hicon.utils.noty(cfg);
                                }
                            });
                        }
                    });
                    break;
            }
        }
    };

    return view;
}());
