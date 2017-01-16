var hicon = hicon || {};
var viewModelBasic = null;

hicon.basic = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.basic = ko.observable({
            Name: '',
            Head: '',
            Address: ''
        });

        // self.latitude = 0;
        // self.longitude = 0;
        // self.altitude = 0; // 海拔
    };

    view.init = function() {
        viewModelBasic = new view.defineModel();
        ko.applyBindings(viewModelBasic, document.getElementById("basic"));
    };

    view.show = function (e) {
        var basic = hicon.localStorage.getJson('FISHERY_BASIC');
        if (!basic) {
            var cfg = {
                text: '渔场信息获取失败，请重新登录',
                type: 'error'
            };
            hicon.utils.noty(cfg);
        }
        viewModelBasic.basic(basic);
    };

    view.aftershow = function (e) {
        var $select = $('#basic').find('select');
        if ($select.length) {
            var $province = $select.eq(0),
                $city = $select.eq(1),
                $county = $select.eq(2);

            var provinceChangeCb = function() {
                $city.add($county);
            };

            var cityChangeCb = function() {
            };

            var provinceText = viewModelBasic.basic().Province || '请选择省份',
                cityText = viewModelBasic.basic().City || '请选择城市',
                countyText = viewModelBasic.basic().Zone || '请选择县/区';

            hicon.area.addressInit($province, $city, $county, provinceText, cityText, countyText, provinceChangeCb, cityChangeCb);
        }
    };

    view.data = {

    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
        },
        save: function() {
            if (!viewModelBasic.basic().Name) {
                var cfg = {
                    text: '请输入名称',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if (!viewModelBasic.basic().Head) {
                var cfg = {
                    text: '请输入负责人',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            viewModelBasic.basic().Province = $('#ddlProvince').val();
            viewModelBasic.basic().City = $('#ddlCity').val();
            viewModelBasic.basic().Zone = $('#ddlCounty').val();

            viewModelBasic.basic().Longitude = $('#txtBscLongitude').val() || 0;
            viewModelBasic.basic().Latitude = $('#txtBscLatitude').val() || 0;
            // viewModelBasic.basic().Altitude = $('#txtBscAltitude').val() || 0;

            var userInfo = hicon.localStorage.getJson('USER_INFO');
            App.showLoading();
            hicon.server.ajax({
                url: 'FisheryModify',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    Fishery: viewModelBasic.basic()
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '保存失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    } else {
                        var cfg = {
                            text: '保存成功, 需要重新登录',
                            type: 'success',
                            callack: {
                                afterClose: function() {

                                    var loginInfo = hicon.localStorage.getJson('LOGIN_USER');
                                    loginInfo.autoLogin = false;
                                    hicon.localStorage.saveJson('LOGIN_USER', loginInfo);

                                    location.href = "index.html";
                                }
                            }
                        };

                        // TODO: 更新localstorage

                        hicon.utils.noty(cfg);
                    }
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
        },
        getCurrentPosition: function() {
            App.showLoading();
            if(hicon.utils.os.android) {
                window.nativeApp.checkGps(function() {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        App.hideLoading();
                        $('#txtBscLatitude').val(position.coords.latitude);
                        $('#txtBscLongitude').val(position.coords.longitude);
                    }, function(error) {
                        App.hideLoading();
                        var cfg = {
                            text: '获取失败,请重试',
                            type: 'error'
                        };
                        hicon.utils.noty(cfg);
                    }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
                });
            } else {
                navigator.geolocation.getCurrentPosition(function(position) {
                    App.hideLoading();
                    $('#txtBscLatitude').val(position.coords.latitude);
                    $('#txtBscLongitude').val(position.coords.longitude);
                }, function(error) {
                    App.hideLoading();
                    var cfg = {
                        text: '获取失败,请重试',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
            }
        }
    };

    return view;
}());
