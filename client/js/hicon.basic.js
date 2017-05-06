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
        hicon.server.ajax({
            url: 'AreaGetProvinces',
            type: 'post',
            data: {
                UserID: 0
            },
            success: function(data) {
                var $province = $('#ddlProvince');
                $province.append("<option value=''>请选择省份</option>");
                for(var i=0; i<data.length; i++)
                {
                    var item = data[i];
                    var selected='';
                    if (viewModelBasic.basic().Province == item.Name) {
                        selected = 'selected'
                    }
                    $province.append("<option " + selected + " value='"+ item.AreaID +"'>" + item.Name + "</option>");
                    if (selected) {
                        hicon.basic.events.provinceChange();
                    }
                }
            },
            error: function() {
            }
        });
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
            viewModelBasic.basic().AreaID = viewModelBasic.basic().Zone;

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
        },
        provinceChange: function() {
            $("#ddlCity").empty();
            $("#ddlCounty").empty();
            $("#ddlCity").append("<option value=''>请选择城市</option>");
            $("#ddlCounty").append("<option value=''>请选择县</option>");
            var provinceId = $("#ddlProvince").val();
            if (!provinceId) {
                return;
            }

            hicon.server.ajax({
                url: 'AreaGetCities',
                type: 'post',
                data: {
                    AreaID: provinceId - 0,
                    UserID: 0
                },
                success: function(data) {
                    var $select = $('#ddlCity');
                    for(var i=0; i<data.length; i++)
                    {
                        var item = data[i];
                        var selected='';
                        if (viewModelBasic.basic().City == item.Name) {
                            selected = 'selected'
                        }
                        $select.append("<option " + selected + " value='"+ item.AreaID +"'>" + item.Name + "</option>");
                        if (selected) {
                            hicon.basic.events.cityChange();
                        }
                    }
                },
                error: function() {
                }
            });
        },
        cityChange: function() {
            $("#ddlCounty").empty();
            $("#ddlCounty").append("<option value=''>请选择县</option>");
            var cityId = $("#ddlCity").val();
            if (!cityId) {
                return;
            }

            hicon.server.ajax({
                url: 'AreaGetCounties',
                type: 'post',
                data: {
                    AreaID: cityId - 0,
                    UserID: 0
                },
                success: function(data) {
                    console.log(JSON.stringify(data))
                    var $select = $('#ddlCounty');
                    for(var i=0; i<data.length; i++)
                    {
                        var item = data[i];
                        var selected='';
                        if (viewModelBasic.basic().Zone == item.Name) {
                            selected = 'selected'
                        }
                        $select.append("<option " + selected + " value='"+ item.AreaID +"'>" + item.Name + "</option>");
                    }
                },
                error: function() {
                }
            });
        }
    };

    return view;
}());
