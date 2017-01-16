var hicon = hicon || {};
var viewModelModifyPwd = null;

hicon.modifyPwd = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
    };

    view.init = function() {
        viewModelModifyPwd = new view.defineModel();
        ko.applyBindings(viewModelModifyPwd, document.getElementById("modifyPwd"));
    };

    view.show = function (e) {
    };

    view.aftershow = function (e) {
    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
        },
        save: function() {

            var userInfo = hicon.localStorage.getJson('USER_INFO');

            var oldPwd = $('#modifyOldPassword').val(),
                modifyPassword = $('#modifyPassword').val(),
                confirmModifyPassword = $('#confirmModifyPassword').val();

            var valMsg = [];
            if (!oldPwd) {
                valMsg.push('请输入旧密码');
            }
            if (!modifyPassword) {
                valMsg.push('请输入新密码');
            }
            if (!confirmModifyPassword) {
                valMsg.push('请确认新密码');
            }
            if (modifyPassword && confirmModifyPassword && (modifyPassword != confirmModifyPassword)) {
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

            hicon.server.ajax({
                url: 'UserModifyPwd',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    OldPwd: oldPwd,
                    NewPwd: modifyPassword
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '修改失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    } else {
                        var cfg = {
                            text: '修改成功',
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

                        hicon.utils.noty(cfg);
                    }
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '修改失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        }
    };

    return view;
}());
