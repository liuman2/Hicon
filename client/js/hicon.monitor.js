var hicon = hicon || {};
var viewModelMonitor = null;

hicon.monitor = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;

        self.currentPond = ko.observable({
            Name: ''
        });

        self.userInfo = null;
        self.fishery = null;
    };

    view.init = function() {
        viewModelMonitor = new view.defineModel();
        ko.applyBindings(viewModelMonitor, document.getElementById("monitor"));
    };

    view.show = function (e) {
        var curentPond = hicon.sessionStorage.getJson('CURRENT_POND');
        curentPond.MonitorDtuNo = view.data.getMonitorDtuNo(curentPond);

        viewModelMonitor.fishery = view.data.getFishData();
        curentPond.Altitude = viewModelMonitor.fishery.Altitude || '';
        curentPond.Latitude = viewModelMonitor.fishery.Latitude || '';
        curentPond.Longitude = viewModelMonitor.fishery.Longitude || '';
        curentPond.Name = curentPond.Name || '监测主机';

        viewModelMonitor.currentPond(curentPond);

        // 用户信息
        var userInfo = hicon.localStorage.getJson('USER_INFO');
        viewModelMonitor.userInfo = userInfo;

        $("#ddlPondType").find("option[value='" + viewModelMonitor.currentPond().PondType + "']").prop('selected', true);
        $("#ddlFishType").find("option[value='" + viewModelMonitor.currentPond().FishType + "']").prop('selected', true);
    };

    view.aftershow = function (e) {

    };

    view.data = {
        // 获取检测主机编号
        getMonitorDtuNo: function(curentPond) {
            var dtus = curentPond.Dtus || [];
            if(!dtus.length) {
                return '';
            }
            var moniorDtus = $.grep(dtus, function(d) {
                return d.DType == 0;
            });
            if(!moniorDtus.length) {
                return '';
            }

            return moniorDtus[0].DtuNO;
        },
        // 获取渔场信息
        getFishData: function() {
            var basic = hicon.localStorage.getJson('FISHERY_BASIC');
            return basic;
        },
        // 保存鱼池信息
        savePondData: function(callback) {

            viewModelMonitor.currentPond().PondType = $('#ddlPondType').val();
            viewModelMonitor.currentPond().FishType = $('#ddlFishType').val();

            App.showLoading();

            return hicon.server.ajax({
                url: 'FishPondModify',
                type: 'post',
                data:  {
                    UserID: viewModelMonitor.userInfo.UserID,
                    Pond: viewModelMonitor.currentPond()
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '更新鱼池信息失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        callback(0);
                        return;
                    }
                    callback(1);
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '更新鱼池信息失败',
                        type: 'error'
                    };
                    callback(0);
                    hicon.utils.noty(cfg);
                }
            });
        },
        // 添加监测主机
        addDtuNo: function(callback) {
            App.showLoading();
            return hicon.server.ajax({
                url: 'DtuAdd',
                type: 'post',
                data: {
                    UserID: viewModelMonitor.userInfo.UserID,
                    FisheryID: viewModelMonitor.fishery.FisheryID,
                    PondID: viewModelMonitor.currentPond().PondID,
                    dtus: [$.trim($('#monitorDtuNo').val())]
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '添加监测主机失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        callback();
                        return;
                    }
                    callback();
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '添加监测主机失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    callback();
                }
            });
        },
        // 更换Dtu
        changeDtu: function(oldDtuNo, callback) {
            App.showLoading();
            return hicon.server.ajax({
                url: 'PondChangeDtu',
                type: 'post',
                data: {
                    UserID: viewModelMonitor.userInfo.UserID,
                    PondID: viewModelMonitor.currentPond().PondID,
                    DtuNO1: oldDtuNo,
                    DtuNO2: $.trim($('#monitorDtuNo').val())
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '更换监测主机失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        callback();
                        return;
                    }
                    callback();
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '更换监测主机失败',
                        type: 'error'
                    };
                    callback();
                    hicon.utils.noty(cfg);
                }
            });
        },
        afterSave: function() {
            var cfg = {
                text: '保存成功, 需要重新登录',
                type: 'success',
                callack: {
                    afterClose: function() {
                        location.href = "index.html";
                    }
                }
            };

            hicon.utils.noty(cfg);
        },
        // 保存海拔信息等
        modifyFishery: function() {
            if (!$('#regAltitudeMonitor').val()) {
                view.data.afterSave();
                return;
            };
            viewModelMonitor.fishery.Altitude = $('#regAltitudeMonitor').val();
            // viewModelMonitor.fishery.Latitude || '';
            // viewModelMonitor.fishery.Longitude || '';

            hicon.server.ajax({
                url: 'FisheryModify',
                type: 'post',
                data: {
                    UserID: viewModelMonitor.userInfo.UserID,
                    Fishery: viewModelMonitor.fishery
                },
                success: function(data) {
                    App.hideLoading();
                    view.data.afterSave();
                },
                error: function() {
                    App.hideLoading();
                    view.data.afterSave();
                }
            });
        }
    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
        },
        save: function() {
            if($.trim($('#monitorDtuNo').val()) && $.trim($('#monitorDtuNo').val()).substring(0,1) != '0') {
                var cfg = {
                    text: '您输入的编号不属于监测主机，无法保存',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if(!$('#regAltitudeMonitor').val()) {
                var cfg = {
                    text: '请输入海拔',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if(!$('#txtPondName').val()) {
                var cfg = {
                    text: '请输入鱼池名称',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if(!$('#txtPondDepth').val()) {
                var cfg = {
                    text: '请输入鱼池水深',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if (!$('#ddlPondType').val()) {
                var cfg = {
                    text: '请输入类型',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if (!$('#ddlFishType').val()) {
                var cfg = {
                    text: '请输入养殖种类',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if (viewModelMonitor.currentPond().Salinity != undefined && viewModelMonitor.currentPond().Salinity != null) {
                viewModelMonitor.currentPond().Salinity = viewModelMonitor.currentPond().Salinity - 0;
                var r = /^\d+$/.test(viewModelMonitor.currentPond().Salinity-0),
                    isValidSalinity = true;
                if (!r) {
                    isValidSalinity = false;
                }

                if (viewModelMonitor.currentPond().Salinity < 0) {
                    isValidSalinity = false;
                }

                if (viewModelMonitor.currentPond().Salinity > 40) {
                    isValidSalinity = false;
                }

                if (!isValidSalinity) {
                    var cfg = {
                        text: '盐度为0到40的整数',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                    return;
                }

                viewModelMonitor.currentPond().Salinity = parseFloat(viewModelMonitor.currentPond().Salinity);
            } else {
                viewModelMonitor.currentPond().Salinity = 0;
            }

            var curentPond = hicon.sessionStorage.getJson('CURRENT_POND');
            var oldDtuNo = view.data.getMonitorDtuNo(curentPond);
            viewModelMonitor.currentPond().Dtus = viewModelMonitor.currentPond().Dtus || [];

            view.data.savePondData(function(r) {
                if ($.trim($('#monitorDtuNo').val())) {
                    // 保存检测主机
                    if (!oldDtuNo) {
                        // 新增检测主机
                        view.data.addDtuNo(function() {
                            view.data.modifyFishery();
                        });
                    } else {
                        if(oldDtuNo.substring(0,1) != $.trim($('#monitorDtuNo').val()).substring(0,1)) {
                            var cfg = {
                                text: '您输入的编号不属于监测主机，无法保存',
                                type: 'error'
                            };
                            hicon.utils.noty(cfg);
                            return;
                        }

                        view.data.changeDtu(oldDtuNo, function() {
                            view.data.modifyFishery();
                        });
                    }
                } else {
                    view.data.modifyFishery();
                }
            });
        },
        itemClick: function(e) {
            var commandKey = commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
            switch(commandKey) {
                case 'barcodeScan':
                    cordova.plugins.barcodeScanner.scan(
                        function (result) {
                            if(result.text) {
                                e.target.closest("li").find('input').val(result.text);
                            }
                        },
                        function (error) {
                            // alert("Scanning failed: " + error);
                        }
                    );
                    break;
                case 'currentPosition':
                    App.showLoading();
                    viewModelMonitor.currentPond().Altitude = 0;

                    if(hicon.utils.os.android) {
                        window.nativeApp.checkGps(function() {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                viewModelMonitor.currentPond().Latitude = position.coords.latitude;
                                viewModelMonitor.currentPond().Longitude = position.coords.longitude;
                                hicon.utils.getElevationForLocations(position.coords.latitude, position.coords.longitude, function(altitude) {
                                    App.hideLoading();
                                    if(altitude != -1) {
                                        viewModelMonitor.currentPond().Altitude = altitude;
                                        $('#regAltitudeMonitor').val(altitude);
                                    } else {
                                        viewModelMonitor.currentPond().Altitude = 0;
                                        $('#regAltitudeMonitor').val(0);
                                    }
                                });

                            }, function(error) {
                                App.hideLoading();
                                viewModelMonitor.currentPond().Altitude = 0;
                                $('#regAltitudeMonitor').val(0);
                                var cfg = {
                                    text: '获取失败,请重试',
                                    type: 'error'
                                };
                                hicon.utils.noty(cfg);
                            }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
                        });
                    } else {
                        navigator.geolocation.getCurrentPosition(function(position) {
                            viewModelMonitor.currentPond().Latitude = position.coords.latitude;
                            viewModelMonitor.currentPond().Longitude = position.coords.longitude;


                            hicon.utils.getElevationForLocations(position.coords.latitude, position.coords.longitude, function(altitude) {
                                App.hideLoading();
                                if(altitude != -1) {
                                    viewModelMonitor.currentPond().Altitude = altitude;
                                    $('#regAltitudeMonitor').val(altitude);
                                } else {
                                    viewModelMonitor.currentPond().Altitude = 0;
                                    $('#regAltitudeMonitor').val(0);
                                }
                            });

                        }, function(error) {
                            App.hideLoading();
                            viewModelMonitor.currentPond().Altitude = 0;
                            $('#regAltitudeMonitor').val(0);
                            var cfg = {
                                text: '获取失败,请重试',
                                type: 'error'
                            };
                            hicon.utils.noty(cfg);
                        }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
                    }
                    break;
            }
        }
    };

    return view;
}());
