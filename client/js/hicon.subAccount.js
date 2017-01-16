var hicon = hicon || {};
var viewModelSubAccount = null;

hicon.subAccount = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.accountList = ko.observableArray([]);
    };

    view.init = function() {
        viewModelSubAccount = new view.defineModel();
        ko.applyBindings(viewModelSubAccount, document.getElementById("subAccount"));
    };

    view.show = function (e) {

    };

    view.aftershow = function (e) {
        view.data.getSubAccount();
    };

    view.data = {
        getSubAccount: function() {

            App.showLoading();
            var userInfo = hicon.localStorage.getJson('USER_INFO');

            return hicon.server.ajax({
                url: 'UserGets',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    FisheryID: userInfo.FisheryID
                },
                success: function(data) {
                    viewModelSubAccount.accountList(data);
                    App.hideLoading();
                },
                error: function() {
                    App.hideLoading();
                }
            });
        }
    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
        },
        itemClick: function(e) {
            var account = ko.dataFor(e.target.closest("li")[0]),
                commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

            switch(commandKey) {
                case 'trash':
                    if (account.IsMain) {
                        var cfg = {
                            text: '主帐号不能删除',
                            type: 'error'
                        };
                        hicon.utils.noty(cfg);
                        return;
                    }
                    hicon.utils.confirm({
                        message: '请确定是否要删除?',
                        ok: function() {
                            var userInfo = hicon.localStorage.getJson('USER_INFO');
                            hicon.server.ajax({
                                url: 'UserDelete',
                                type: 'post',
                                data: {
                                    UserID: userInfo.UserID,
                                    DelUserID: account.UserID
                                },
                                success: function(data) {
                                    var cfg = {
                                        text: data.Result ? '删除成功' : (data.ErrorMsg ? data.ErrorMsg: '删除失败'),
                                        type: data.Result ? 'success' : 'error'
                                    };
                                    hicon.utils.noty(cfg);
                                    if (data.Result) {
                                        e.target.closest("li").remove();
                                    }
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
                case 'main':
                    if (account.IsMain) {
                        var cfg = {
                            text: '已经是主帐号',
                            type: 'error'
                        };
                        hicon.utils.noty(cfg);
                        return;
                    }
                    hicon.utils.confirm({
                        message: '确定设置为主帐号?',
                        ok: function() {
                            var userInfo = hicon.localStorage.getJson('USER_INFO');
                            hicon.server.ajax({
                                url: 'UserSetMain',
                                type: 'post',
                                data: {
                                    UserID: userInfo.UserID,
                                    MainUserID: account.UserID
                                },
                                success: function(data) {
                                    view.data.getSubAccount();
                                    var cfg = {
                                        text: data.Result ? '设置成功，需要重新登录' : (data.ErrorMsg ? data.ErrorMsg: '设置失败'),
                                        type: data.Result ? 'success' : 'error',
                                        callack: {
                                            afterClose: function() {
                                                if (data.Result) {
                                                    location.href = "index.html";
                                                }
                                            }
                                        }
                                    };
                                    hicon.utils.noty(cfg);
                                },
                                error: function() {
                                    var cfg = {
                                        text: '设置失败',
                                        type: data.Result ? 'success' : 'error'
                                    };
                                    hicon.utils.noty(cfg);
                                }
                            });
                        }
                    });
                    break;
                case 'setting':
                    hicon.sessionStorage.item('CHILD_USER_ID', account.UserID);
                    if (typeof(viewModelSubAccountPond) !== 'undefined') {
                        viewModelSubAccountPond.pondList([]);
                    };
                    hicon.navigation.subAccountPond();
                    break;
            }
        },
        add: function() {

            $('#newSubAccount').val('');
            $('#newSubPwd').val('');
            $('#newConfirmSubPwd').val('');

            $("#modalview-sub").kendoMobileModalView('open');
        },
        cancel: function() {
            $("#modalview-sub").kendoMobileModalView('close');
        },
        save: function() {

            var userInfo = hicon.localStorage.getJson('USER_INFO');

            var user = {
                UserID: 0,
                UserNO: $('#newSubAccount').val(),
                IsMain: false,
                FisheryID: userInfo.FisheryID,
            },
            pwd = $('#newSubPwd').val(),
            confirmPwd = $('#newConfirmSubPwd').val();

            var valMsg = [];
            if (!user.UserNO) {
                valMsg.push('请输入手机号');
            }
            if (!pwd) {
                valMsg.push('请输入密码');
            }
            if (!confirmPwd) {
                valMsg.push('请输入确认密码');
            }
            if (pwd && confirmPwd && (pwd != confirmPwd)) {
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
                url: 'UserAdd',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    User: user,
                    Pwd: pwd
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '新增失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    } else {
                        view.data.getSubAccount();
                        $("#modalview-sub").kendoMobileModalView('close');
                    }
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '新增失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        }
    };

    return view;
}());
