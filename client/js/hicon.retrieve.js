var hicon = hicon || {};


hicon.retrieve = (function () {
    var view = {};

    view.show = function (e) {
        $('#retrieveToken').show();
        $('#retrieveReset').hide();

        $('#retriMobile').val('');
        $('#retriToken').val('');
    };

    view.events = {
        doBack: function() {
            hicon.navigation.login();
        },
        getToken: function(e) {
            if (!$('#retriMobile').val()) {
                var cfg = {
                    text: '请输入手机号',
                    type: 'error'
                };

                hicon.utils.noty(cfg);
                return;
            }

            if (!$('#retriMobile').val()) {
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
                    mobile: $('#retriMobile').val()
                },
                success: function(data) {
                },
                error: function() {
                }
            });
            button.enable(false);

            var t = 60;
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
        next: function() {
            var mobile = $('#retriMobile').val(),
                token = $('#retriToken').val();

            if (!mobile || !token) {
                var cfg = {
                    text: !mobile ? '请输入手机号': '请输入验证码',
                    type: 'error',
                    callack: {
                        afterShow: function() {
                            if (!mobile) {
                                $('#retriMobile').focus();
                            } else {
                                $('#retriToken').focus();
                            }
                        },
                        afterClose: function() {
                            if (!mobile) {
                                $('#retriMobile').focus();
                            } else {
                                $('#retriToken').focus();
                            }
                        }
                    }
                };

                hicon.utils.noty(cfg);

                return;
            };

            $('#retrieveToken').hide();
            $('#retrieveReset').show();
        },
        reset: function() {

            var newPwd = $('#retriPassword').val(),
                confirmPwd = $('#retriConfirmPassword').val(),
                msgList = [];

            if (!newPwd || !confirmPwd) {
                msgList.push(!newPwd ? '请输入新密码' : '请确认新密码');
            }
            if (newPwd != confirmPwd) {
                msgList.push('两次密码不一致');
            }
            if (msgList.length) {
                var cfg = {
                    text: msgList[0],
                    type: 'error'
                };

                hicon.utils.noty(cfg);
                return;
            }

            var mobile = $('#retriMobile').val(),
                token = $('#retriToken').val();

            App.showLoading();

            hicon.server.ajax({
                url: 'UserPwdReset',
                type: 'post',
                data: {
                    UserID: 0,   // TODO
                    MobileCode: mobile,
                    Token: token,
                    NewPwd: newPwd
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '重置失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    }

                    hicon.navigation.login();
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '重置失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        }
    };

    return view;
}());
