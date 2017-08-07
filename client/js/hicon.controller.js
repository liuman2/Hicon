
var hicon = hicon || {};

var viewModelController = null;

hicon.controller = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        // 水质参数列表
        self.waterList = ko.observableArray([]);
        // 机器参数列表
        self.deviceList = ko.observableArray([]);
        // 当前水质
        self.currentWater = ko.observable();
        self.title = ko.observable();
        self.initWaterModalDone = false;
        self.deviceAvailableList = [];
        self.currentPond = null;
        self.viewScroller = null;
        self.userInfo = null;
        self.controllerCommand = null;
        self.initTimerModalDone = false;
        self.curentController = null;

        self.sysIntervals = ko.observableArray([]);
        self.isFeed = ko.observable(true);
    };

    view.init = function() {
        viewModelController = new view.defineModel();
        ko.applyBindings(viewModelController, document.getElementById("controller"));
    };

    view.show = function (e) {
        var page = e.view;
        viewModelController.viewScroller = page.scroller;
        var userInfo = hicon.localStorage.getJson('USER_INFO');
        var controllerCommand = hicon.sessionStorage.item('CURRENT_CONTROLLER_COMMAND');

        viewModelController.userInfo = hicon.localStorage.getJson('USER_INFO');
        viewModelController.currentPond = hicon.sessionStorage.getJson('CURRENT_POND');
        viewModelController.controllerCommand = controllerCommand;

        var curentController = hicon.sessionStorage.getJson('CURRENT_CONTROLLER');
        viewModelController.curentController = curentController;

        var controllerCommand = hicon.sessionStorage.item('CURRENT_CONTROLLER_COMMAND');
        if (controllerCommand != 'feed') {
            viewModelController.isFeed(false);
            var sysIntervals = hicon.localStorage.getJson('SYS_TIMER_INTERVAL');
            viewModelController.sysIntervals(sysIntervals);
        } else {
            viewModelController.isFeed(true);
        }

        var typeName = '';
        switch(viewModelController.controllerCommand) {
            case 'oxyg':
                typeName = '增氧机';
                break;
            case 'pump':
                typeName= '水泵';
                break;
            case 'feed':
                typeName= '投饵机';
                break;
        }

        curentController.clsName = hicon.utils.getDeviceCls(typeName);
        viewModelController.deviceList(curentController);

        viewModelController.title(curentController.Name + '(' + typeName + ')');

        if (curentController.IsAuto) {
            $('#radio1'+curentController.DeviceNO).prop('checked', true);
        } else {
             $('#radio2'+curentController.DeviceNO).prop('checked', true);
        }

        view.data.setEnableBtnStatus(curentController.IsStopped);

        view.data.getLastestDeviceData();
        setInterval(function() {
            if(location.hash.indexOf('controller.html') >= 0) {
                view.data.getLastestDeviceData();
            }
        }, 2* 60 * 1000);

        if (false === viewModelController.initTimerModalDone) {
            try {
                ko.applyBindings(viewModelController, document.getElementById('modalview-time'));
            } catch (e) {

            }
            viewModelController.initTimerModalDone = true;
        }
    };

    view.aftershow = function(e) {
        hicon.server.ajax({
            url: 'GetParam',
            type: 'post',
            data: {
                UserID: viewModelController.userInfo.UserID,
                PondID: viewModelController.currentPond.PondID,
                FisheryID: viewModelController.userInfo.FisheryID,
                DtuNO: viewModelController.curentController.DtuNO,
                ParamKey: 'VoiceNotify'
            },
            success: function(data) {
                App.hideLoading();
                if (!data) {
                    data = 0;
                }
                var notifyCheck = (data-0) || 0;
                $('#dtuNotify').prop('checked', notifyCheck);
            },
            error: function() {
                App.hideLoading();
            }
        })
    };

    view.data = {
        getDevices: function() {
            App.showLoading();

            return hicon.server.ajax({
                url: 'DeviceGets',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    PondID: viewModelController.currentPond.PondID
                },
                success: function(data) {
                    App.hideLoading();
                },
                error: function() {
                    App.hideLoading();
                }
            });
        },
        getLastestDeviceData: function() {
            hicon.server.ajax({
                url: 'DeviceGetLastData',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    PondID: viewModelController.currentPond.PondID,
                    DtuNO: viewModelController.curentController.DtuNO,
                    DeviceNO: viewModelController.curentController.DeviceNO
                },
                success: function(data) {
                    data.DtuNO = viewModelController.curentController.DtuNO;
                    var d = data;
                    var action = $('a[data-command-key="start"][data-device-no="'+ d.DeviceNO +'"]');
                    action.attr('data-action', d.Action);
                    action.find('span[class="km-text"]').text(d.Action == 1 ? '机器停止' : '机器启动');
                    action.attr('data-icon', d.Action == 0 ? 'stop' : 'play');
                    if (d.Action == 1) {
                        action.find('span').first().removeClass('km-paly').addClass('km-stop');
                        action.css('color','red');
                    } else {
                       action.find('span').first().removeClass('km-stop').addClass('km-paly');
                       action.css('color','#fff');
                    }

                    var status = $('td[data-cell="device-status"][data-device-no="'+ d.DeviceNO +'"]');
                    status.html(d.Action == 0 ? '<div><div class="warn_red_img" style="display: inline-block; width: auto;"><span class="red" style="margin-left: 25px;">已停止</span></div></div>' : '<div><div class="warn_green_img" style="display: inline-block; width: auto;"><span class="limegreen" style="margin-left: 25px;">已启动</span></div>\
                                    </div>')
                },
                error: function() {

                }
            });
        },
        setEnableBtnStatus: function(isStopped) {
            $('#btnEnabledDevice').find('span').last().text(isStopped ? '启用机器' : '停用机器');
            $('#btnEnabledDevice').attr('data-icon', isStopped ? 'play' : 'stop');
            if (isStopped) {
                $('#btnEnabledDevice').find('span').first().removeClass('km-stop').addClass('km-paly');
                $('#btnEnabledDevice').css('color','#fff');
            } else {
                $('#btnEnabledDevice').find('span').first().removeClass('km-paly').addClass('km-stop');
                $('#btnEnabledDevice').css('color','red');
            }

            $('#btnEnabledDevice').data('data-stop', isStopped);
            $('#pond-d-params').find('input[type="radio"]').attr('disabled', isStopped);
            $('#pond-d-params').find('input[type="checkbox"]').attr('disabled', isStopped);
            $('#dtuNotify').attr('disabled', isStopped);
        },
        deviceControl: function() {
            App.showLoading();
            var action = $('a[data-command-key="start"][data-device-no="'+ viewModelController.curentController.DeviceNO +'"]');
            hicon.server.ajax({
                url: 'DeviceControl',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    PondID: viewModelController.currentPond.PondID,
                    DtuNO: viewModelController.curentController.DtuNO,
                    DeviceNO: viewModelController.curentController.DeviceNO,
                    Action: action.attr('data-action') == 1 ? 0 : 1,
                    Minutes: action.attr('data-action') == 0 ? ($('#ddlStartTime').val() - 0) : 0
                },
                success: function(data) {
                    var msg = '';
                    if (action.attr('data-action') == 1) {
                        msg = '停止'
                    } else {
                        msg = '启动'
                    }
                    var cfg = {
                        text: data.Result ? (msg + '成功') : (data.ErrorMsg ? data.ErrorMsg: (msg + '失败')),
                        type: data.Result ? 'success' : 'error'
                    };
                    hicon.utils.noty(cfg);

                    App.hideLoading();

                    setTimeout(function() {
                        view.data.getLastestDeviceData();
                    },1500);

                },
                error: function() {
                    App.hideLoading();
                }
            });
        }
    };

    view.events = {
        dtuNotify: function() {
            hicon.server.ajax({
                url: 'SetParam',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    PondID: viewModelController.currentPond.PondID,
                    FisheryID: viewModelController.userInfo.FisheryID,
                    DtuNO: viewModelController.curentController.DtuNO,
                    ParamKey: 'VoiceNotify',
                    ParamValue: $('#dtuNotify').prop('checked') ? 1 : 0
                },
                success: function() {
                    App.hideLoading();
                },
                error: function() {
                    App.hideLoading();
                }
            })
        },
        doBack: function() {
            hicon.navigation.main();
        },
        deviceClick: function(e) {
            var device = viewModelController.curentController, // ko.dataFor(e.target.closest("li")[0]),
                commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;


            switch(commandKey) {
                case 'add':
                    $("#modalview-device").kendoMobileModalView('open');
                    break;
                case 'start':
                    if (viewModelController.curentController.IsStopped) {
                        var cfg = {
                            text: '设备已停用，无法启动',
                            type:'error'
                        };
                        hicon.utils.noty(cfg);
                        return;
                    };

                    if($(e.target).closest('a').attr('data-action') == 0) {
                        $("#modalview-time").kendoMobileModalView('open');
                    } else {
                        view.data.deviceControl();
                    }
                    break;
                case 'timer':
                    hicon.sessionStorage.saveJson('CURRENT_DEVICE', device);
                    hicon.navigation.timer();
                    break;
                case 'trash':
                    if($('#ul-pond-d-params').find('li').length == 1) {
                        var cfg = {
                            text: '最后一个设备，不能删除',
                            type: 'error'
                        };
                        hicon.utils.noty(cfg);
                        return;
                    }

                    hicon.utils.confirm({
                        message: '请确定是否要删除?',
                        ok: function() {
                            App.showLoading();
                            hicon.server.ajax({
                                url: 'DeviceDelete',
                                type: 'post',
                                data: {
                                    UserID: viewModelController.userInfo.UserID,
                                    PondID: device.PondID,
                                    DeviceNO: device.DeviceNO
                                },
                                success: function(data) {
                                    App.hideLoading();
                                    e.target.closest('li').remove();
                                },
                                error: function() {
                                    App.hideLoading();
                                    var cfg = {
                                        text: '删除失败',
                                        type: 'error'
                                    };
                                    hicon.utils.noty(cfg);
                                }
                            });
                        }
                    });
                    break;
                case 'device-chart':
                    hicon.sessionStorage.saveJson('CURRENT_DEVICE', device);
                    hicon.navigation.deviceCurve();
                    break;
                case 'events':
                    hicon.sessionStorage.saveJson('CURRENT_DEVICE', device);
                    hicon.navigation.deviceLog();
                    break;
                case 'stop':
                    hicon.utils.confirm({
                        message: '您确定要停用机器？',
                        ok: function() {
                            var currentStop = $('#btnEnabledDevice').data('data-stop');
                            hicon.server.ajax({
                                url: 'DeviceStop',
                                type: 'post',
                                data: {
                                    UserID: viewModelController.userInfo.UserID,
                                    PondID: viewModelController.currentPond.PondID,
                                    DtuNO: device.DtuNO,
                                    DeviceNO: device.DeviceNO,
                                    IsStopped: currentStop ? 0 : 1
                                },
                                success: function(data) {
                                    var cfg = {
                                        text: data.Result ? '保存成功' : (data.ErrorMsg ? data.ErrorMsg: '保存失败'),
                                        type: data.Result ? 'success' : 'error'
                                    };
                                    hicon.utils.noty(cfg);
                                    if (data.Result) {
                                        view.data.setEnableBtnStatus(!currentStop);
                                        viewModelController.curentController.IsStopped = !currentStop;
                                    };
                                },
                                error: function() {
                                }
                            });
                        }
                    });
                    break;
            }

        },
        saveDevice: function() {
            if ($('#device-available-list').val() == '') {
                var cfg = {
                    text: '请选择机器',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            var alreadyExist = false;
            for (var i = 0; i < viewModelController.deviceList().length; i++) {
                var d = viewModelController.deviceList()[i];
                if (d.Name == $('#device-available-list').val()) {
                    alreadyExist = true;
                    break;
                }
            }

            if (alreadyExist) {
                var cfg = {
                    text: '该机器已存在',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            hicon.server.ajax({
                url: 'DeviceAdd',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    model: {
                        PondID: viewModelController.currentPond.PondID,
                        DeviceNO: 0,
                        Name: $('#device-available-list').val(),
                        IsAuto: 0
                    }
                },
                success: function(data) {
                    if (data.Result) {
                        $("#modalview-water").kendoMobileModalView('close');
                    } else {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '保存失败',
                            type: 'error'
                        };
                        hicon.utils.noty(cfg);
                    }

                    view.data.getDevices().done(function(dts) {

                        for (var i = 0; i < dts.length; i++) {
                             dts[i].clsName = hicon.utils.getDeviceCls(dts[i].Name.toLowerCase());
                        }

                        viewModelController.deviceList(dts);
                        view.data.getLastestDeviceData();
                        $("#modalview-device").kendoMobileModalView('close');
                    });
                },
                error: function() {
                }
            });
        },
        deviceAuto: function(e) {
            var isAuto = $(arguments[1].target).data('radio-index');
            hicon.server.ajax({
                url: 'DeviceSetIsAuto',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    PondID: viewModelController.currentPond.PondID,
                    DtuNO: viewModelController.curentController.DtuNO,
                    DeviceNO: viewModelController.curentController.DeviceNO,
                    IsAuto: isAuto
                },
                success: function(data) {
                    var cfg = {
                        text: data.Result ? '保存成功' : (data.ErrorMsg ? data.ErrorMsg: '保存失败'),
                        type: data.Result ? 'success' : 'error'
                    };

                    viewModelController.curentController.IsAuto = isAuto;
                    hicon.sessionStorage.saveJson('CURRENT_CONTROLLER', viewModelController.curentController);

                    hicon.utils.noty(cfg);
                },
                error: function() {
                }
            });
        },
        deviceSetTimer: function(e) {
            hicon.server.ajax({
                url: 'DeviceSetIsTimer',
                type: 'post',
                data: {
                    UserID: viewModelController.userInfo.UserID,
                    PondID: viewModelController.currentPond.PondID,
                    DtuNO: viewModelController.curentController.DtuNO,
                    DeviceNO: viewModelController.curentController.DeviceNO,
                    IsTimer: $(arguments[1].target).prop('checked') ? 1 : 0
                },
                success: function(data) {
                    var cfg = {
                        text: data.Result ? '保存成功' : (data.ErrorMsg ? data.ErrorMsg: '保存失败'),
                        type: data.Result ? 'success' : 'error'
                    };
                    hicon.utils.noty(cfg);
                },
                error: function() {
                }
            });
        },
        selectButton: function(e) {
            var index = this.current().index();
            viewModelController.viewScroller.reset();
            if (index == 0) {
                $('#pond-d-params').hide();
                $('#pond-w-params').show();
            } else {
                $('#pond-w-params').hide();
                $('#pond-d-params').show();

            }
        },
        start: function() {

            if (viewModelController.isFeed()) {
                var r = /^\d+$/.test($('#ddlStartTime').val()-0);
                if (!r) {
                    var cfg = {
                        text: '时长只能输入整数',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    return;
                }
                if ($('#ddlStartTime').val() == '') {
                    var cfg = {
                        text: '请输入时长',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    return;
                }

                if ($('#ddlStartTime').val()-0 == 0) {
                    var cfg = {
                        text: '提示: 0 表示24小时常开',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    // return;
                }
            } else {
                if($('#ddlStartTime').val() === '') {
                    hicon.utils.noty({
                        text: '请选择启动时长',
                        type: 'error'
                    });
                    return;
                }
            }

            view.data.deviceControl();
            $("#modalview-time").kendoMobileModalView('close');
        },
        modalStartTimeClose: function() {
            $("#modalview-time").kendoMobileModalView('close');
        }
    }

    return view;
}());
