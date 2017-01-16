var hicon = hicon || {};
var viewModelDeviceLog = null;

hicon.deviceLog = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.logList = ko.observableArray([]);
        self.title = ko.observable();
    };

    view.init = function() {
        viewModelDeviceLog = new view.defineModel();
        ko.applyBindings(viewModelDeviceLog, document.getElementById("deviceLog"));
    };

    view.show = function (e) {

    };

    view.aftershow = function (e) {
        viewModelDeviceLog.currentDevice = hicon.sessionStorage.getJson('CURRENT_DEVICE');
        viewModelDeviceLog.title(viewModelDeviceLog.currentDevice.Name + '日志');
        $('#txtDeviceLogDay').val(hicon.utils.dateFormat(new Date(), 'yyyy-mm-dd'));
        view.data.search();
    };

    view.data = {
        search: function() {
            view.data.getData();
        },
        getData: function() {
            var date = $('#txtDeviceLogDay').val();
            App.showLoading();
            var userInfo = hicon.localStorage.getJson('USER_INFO');
            hicon.server.ajax({
                url: 'DeviceControlLog',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    PondID: viewModelDeviceLog.currentDevice.PondID,
                    DtuNO: viewModelDeviceLog.currentDevice.DtuNO,
                    DeviceNO: viewModelDeviceLog.currentDevice.DeviceNO,
                    date: date
                },
                success: function(data) {
                    App.hideLoading();
                    data = data || [];
                    $.each(data, function(i, d) {
                        d.ActionDesc = d.Action == 0 ? '停止' : '启动';                    
                        switch(d.CtrType-0) {
                            case 1:
                                d.CtrTypeDesc = '自动';
                                break;
                            case 2:
                                d.CtrTypeDesc = '定时';
                                break;
                            case 3:
                                d.CtrTypeDesc = '手动';
                                break;
                        }                   
                    }); 
                    viewModelDeviceLog.logList(data);                    
                },
                error: function() {
                    App.hideLoading();
                }
            });
        }
    };

    view.events = {
        doBack: function() {
            hicon.navigation.controller();
        },
        prev: function(e) {
            var dt = $('#txtDeviceLogDay').val();
            $('#txtDeviceLogDay').val(hicon.utils.addDays(dt, -1));

            view.data.search();
        },
        next: function(e) {
            var dt = $('#txtDeviceLogDay').val();
            $('#txtDeviceLogDay').val(hicon.utils.addDays(dt, 1));

            view.data.search();
        }
    };

    return view;
}());
