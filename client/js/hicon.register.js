var hicon = hicon || {};
var viewModelRegister = null;

hicon.register = (function () {

    var view = {};

    view.defineModel = function() {
        var self = this;

        self.latitude = 0;
        self.longitude = 0;
        // self.altitude = 0; // 海拔
    };

    view.init = function() {
        viewModelRegister = new view.defineModel();
        ko.applyBindings(viewModelRegister, document.getElementById("register"));
    };

    view.show = function (e) {
        if (hicon.utils.main && !hicon.utils.main.isOnLine()) {
           var cfg = {
                text: '请检查您的网络是否正常',
                type: 'error'
            };

            hicon.utils.noty(cfg);
        }

        var $select = $('#register').find('select');
        if ($select.length) {
            var $province = $select.eq(0),
                $city = $select.eq(1),
                $county = $select.eq(2);

            var provinceChangeCb = function() {
                $city.add($county);
            };

            var cityChangeCb = function() {
            };

            hicon.area.addressInit($province, $city, $county, '请选择省份', '请选择城市', '请选择县/区', provinceChangeCb, cityChangeCb);
        }

        $('#userNO').val('');
        $('#token').val('');
        $('#regPassword').val('');
        $('#confirmRegPassword').val('');
        $('#fisheryName').val('');
        $('#fisheryOwner').val('');
        $('#regProvince').val('');
        $('#regProvince').trigger('change');
        $('#regCity').val('');
        $('#regCounty').val('');
        $('#regAddress').val('');
        $('#regLongitude').val('');
        $('#regLatitude').val('');
    };

    view.aftershow = function() {

        viewModelRegister.latitude = 0;
        viewModelRegister.longitude = 0;
        // viewModelRegister.altitude = 0;

        document.addEventListener("deviceready", function() {
            view.getLocation();
        }, false);
    };

    view.getLocation = function() {
        App.showLoading();
        if(hicon.utils.os.android) {
            window.nativeApp.checkGps();
        }

        navigator.geolocation.getCurrentPosition(function(position) {
            App.hideLoading();
            viewModelRegister.latitude = position.coords.latitude;
            viewModelRegister.longitude = position.coords.longitude;
            $('#regLongitude').val(viewModelRegister.longitude);
            $('#regLatitude').val(viewModelRegister.latitude);
        }, function(error) {
            App.hideLoading();
            var cfg = {
                text: '获取失败,请重试',
                type: 'error'
            };
            hicon.utils.noty(cfg);
        }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
    };

    view.events = {
        doBack: function() {
            hicon.navigation.login();
        },
        doRegister: function() {
            var isValid = view.registerValidate();
            if (!isValid) {
                return false;
            }

            var data = view.collectData();
            App.showLoading();
            hicon.server.ajax({
                url: 'UserRegist',
                type: 'post',
                data: {
                    Token: data.token,
                    Pwd: data.password,
                    User: {
                        UserID: 0,
                        UserNO: data.userNo,
                        IsMain: true,
                        FisheryID: 0,
                        LastStamp: null,
                        UType: 1,
                        Params: null
                    },
                    Fs: {
                        FisheryID: 0,
                        AreaID: 0,
                        Province: data.province,
                        City: data.city,
                        Zone: data.county,
                        Name: data.fisheryName,
                        Address: data.address,
                        Head: data.fisheryOwner,
                        PondTotal: 0,
                        TotalAcreage: 0,
                        Longitude: data.Longitude,
                        Latitude: data.Latitude
                    }
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '注册失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    } else {
                        hicon.navigation.login();
                    }
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '注册失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        },
        doGetValidateCode: function(e) {
            if (!$('#userNO').val()) {
                var cfg = {
                    text: '请输入手机号',
                    type: 'error'
                };

                hicon.utils.noty(cfg);
                return;
            }

            var button = $(e.target).data("kendoMobileButton");
            hicon.server.ajax({
                url: 'GetToken',
                type: 'post',
                data: {
                    mobile: $('#userNO').val()
                },
                success: function(data) {
                },
                error: function() {
                }
            });
            button.enable(false);

            var t = 180;
            var timerLoop = setInterval(function() {
                if (t <= 0) {
                    clearInterval(timerLoop);
                    $(e.target).text('获取验证码');
                    button.enable(true);
                    return;
                }
                t > 0 && $(e.target).text(t + '秒后再试一次');
                t--;
            }, 1000);
        },
        getCurrentPosition: function() {
            var cfg = {
                text: '如果您不是在养殖场注册，请您到养殖场后，务必进入“渔场资料”中</br>点击“修改当前经纬度”进行经纬度修正，以进一步提高水质监测的准确性',
                layout: 'center',
                timeout: 3000,
                type: 'information'
            };
            hicon.utils.noty(cfg);
            view.getLocation();
        }
    };

    view.collectData = function() {
        return {
            userNo: $('#userNO').val(),
            token: $('#token').val(),
            password: $('#regPassword').val(),
            confirmRegPassword: $('#confirmRegPassword').val(),
            fisheryName: $('#fisheryName').val(),
            fisheryOwner: $('#fisheryOwner').val(),
            province: $('#regProvince').val(),
            city: $('#regCity').val(),
            county: $('#regCounty').val(),
            address: $('#regAddress').val(),
            Longitude: $('#regLongitude').val(),
            Latitude: $('#regLatitude').val()
            // Altitude: $('#regAltitude').val()
        }
    }

    view.registerValidate = function() {

        var data = view.collectData();

        var valMsg = [];
        if (!data.fisheryName) {
            valMsg.push('渔场名称不能为空');
        };

        if (!data.fisheryOwner) {
            valMsg.push('负责人不能为空');
        };

        if (!data.province) {
            valMsg.push('请选择省份');
        }
        if (!data.city) {
            valMsg.push('请选择城市');
        }
        if (!data.county) {
            valMsg.push('请选择县/区');
        }
        if (!data.address) {
            valMsg.push('渔场所在地址不能为空');
        }
        if (!data.Longitude) {
            valMsg.push('经度不能为空');
        }
        if (!data.Latitude) {
            valMsg.push('纬度不能为空');
        }
        if (!data.userNo) {
            valMsg.push('请输入手机号');
        }
        if (!data.token) {
            valMsg.push('请输入验证码');
        }
        if (!data.password) {
            valMsg.push('请输入密码');
        }
        if (!data.confirmRegPassword) {
            valMsg.push('请输入确认密码');
        }
        if (data.password && data.confirmRegPassword && (data.password != data.confirmRegPassword)) {
            valMsg.push('两次输入的密码不一致');
        }

        if (valMsg.length > 0) {
            var cfg = {
                text: valMsg[0],
                type: 'error'
            };
            hicon.utils.noty(cfg);
            return false;
        }

        return true;
    }

    return view;
}());
