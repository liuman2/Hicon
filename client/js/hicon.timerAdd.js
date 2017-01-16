var hicon = hicon || {};
var viewModelTimerAdd = null;

hicon.timerAdd = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.timerList = ko.observableArray([]);
        self.sysIntervals = ko.observableArray([]);
        self.device = null;
        self.isFeed = ko.observable(true);
    };

    view.init = function() {
        viewModelTimerAdd = new view.defineModel();
        ko.applyBindings(viewModelTimerAdd, document.getElementById("timerAdd"));

        var currYear = (new Date()).getFullYear();
        var opt={};
        opt.date = {preset : 'date'};
        //opt.datetime = { preset : 'datetime', minDate: new Date(2012,3,10,9,22), maxDate: new Date(2014,7,30,15,44), stepMinute: 5  };
        opt.datetime = {preset : 'datetime'};
        opt.time = {preset : 'time'};
        opt.default = {
            theme: 'android-ics light', //皮肤样式
            display: 'modal', //显示方式
            mode: 'scroller', //日期选择模式
            lang:'zh',
            startYear:currYear - 10, //开始年份
            endYear:currYear + 10 //结束年份
        };

        var optDateTime = $.extend(opt['datetime'], opt['default']);
        var optTime = $.extend(opt['time'], opt['default']);
        $("#dtTimerDay").mobiscroll(optDateTime).datetime(optDateTime);
        $("#dtTimerTime").mobiscroll(optTime).time(optTime);
    };

    view.show = function (e) {
        $("#dtTimerDay").val('');
        $("#dtTimerTime").val('');

        viewModelTimerAdd.device = hicon.sessionStorage.getJson('CURRENT_DEVICE');

        var controllerCommand = hicon.sessionStorage.item('CURRENT_CONTROLLER_COMMAND');
        if (controllerCommand != 'feed') {
            viewModelTimerAdd.isFeed(false);
            var sysIntervals = hicon.localStorage.getJson('SYS_TIMER_INTERVAL');
            viewModelTimerAdd.sysIntervals(sysIntervals);
        } else {
            viewModelTimerAdd.isFeed(true);
        }


        if($('#ddlTimerPeriod').val() == '0') {
            $('#liTimerDay').show();
            $('#liTimerTime').hide();
        } else {
            $('#liTimerDay').hide();
            $('#liTimerTime').show();
        }
    };

    view.aftershow = function (e) {

    };

    view.data = {

    };

    view.events = {
        doBack: function() {
            hicon.navigation.timer();
        },
        change: function(e) {
            if($('#ddlTimerPeriod').val() == '0') {
                $('#liTimerDay').show();
                $('#liTimerTime').hide();
            } else {
                $('#liTimerDay').hide();
                $('#liTimerTime').show();
            }
        },
        save: function() {
            var time = '';
            if($('#ddlTimerPeriod').val() == '0') {
                // time = $('#dtTimerDay').val().replace('T', ' ');
                time = $('#dtTimerDay').val();
            } else {
                time = $('#dtTimerTime').val();
            }

            if (!time) {
                var cfg = {
                    text: '请输入开始时间',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if (viewModelTimerAdd.isFeed()) {
                var r = /^\d+$/.test($('#ddlTimerSpan').val()-0);
                if (!r) {
                    var cfg = {
                        text: '时长只能输入整数',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    return;
                }
                if ($('#ddlTimerSpan').val()-0 == 0) {
                    var cfg = {
                        text: '提示: 0 表示24小时常开',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    // return;
                }
            }

            var userInfo = hicon.localStorage.getJson('USER_INFO');
            var data = {
                UserID: userInfo.UserID,
                Tmr: {
                    TimerID: 0,
                    PondID: viewModelTimerAdd.device.PondID,
                    DtuNO: viewModelTimerAdd.device.DtuNO,
                    DeviceNO: viewModelTimerAdd.device.DeviceNO,
                    BeginTime: time,
                    Span: $('#ddlTimerSpan').val(),
                    IsEveryDay: $('#ddlTimerPeriod').val() == '1'
                }
            };

            App.showLoading();
            hicon.server.ajax({
                url: 'TimerAdd',
                type: 'post',
                data: data,
                success: function(data) {
                    App.hideLoading();

                    if (!data.Result) {
                        var cfg = {
                            text: '新增失败',
                            type: 'error'
                        };
                        hicon.utils.noty(cfg);
                        return;
                    }

                    hicon.navigation.timer();
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '保存失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        }
    };

    return view;
}());
