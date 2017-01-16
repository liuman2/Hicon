var hicon = hicon || {};
var viewModelSubAccountPond = null;

hicon.subAccountPond = (function() {

    var view = {};

    view.defineModel = function() {
        var self = this;
        self.pondList = ko.observableArray([]);
        self.userInfo = null;
    };

    view.init = function() {
        viewModelSubAccountPond = new view.defineModel();
        ko.applyBindings(viewModelSubAccountPond, document.getElementById("subAccountPond"));
    };

    view.show = function(e) {

    };

    view.aftershow = function(e) {
        if (viewModelSubAccountPond.pondList().length > 0) {
            return;
        };
        view.data.getPonds();
    };

    view.data = {
        getPonds: function() {

            App.showLoading();
            viewModelSubAccountPond.userInfo = hicon.localStorage.getJson('USER_INFO');
            var childUserId = hicon.sessionStorage.item('CHILD_USER_ID');

            return hicon.server.ajax({
                url: 'UserGetManagePonds',
                type: 'post',
                data: {
                    MainUserID: viewModelSubAccountPond.userInfo.UserID,
                    FisheryID: viewModelSubAccountPond.userInfo.FisheryID,
                    ChildUserID: childUserId
                },
                success: function(data) {
                    var ponds = [];
                    if (data && data.length && viewModelMain && viewModelMain.pondList() && viewModelMain.pondList().length) {
                        $.map(data, function(d) {
                            var ps = $.grep(viewModelMain.pondList(), function(p) {
                                return p.PondID == d;
                            });
                            if (ps.length) {
                                ponds.push({
                                    PondID: d,
                                    Name: ps[0].Name
                                });
                            };
                        });
                    }
                    viewModelSubAccountPond.pondList(ponds);
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
            viewModelSubAccountPond.pondList([]);
            hicon.navigation.subAccount();
        },
        itemClick: function(e) {
            var pond = ko.dataFor(e.target.closest("li")[0]),
                commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

            switch (commandKey) {
                case 'trash':
                    viewModelSubAccountPond.pondList.remove(function(p) {
                        return p.PondID === pond.PondID;
                    });
                    break;
                case 'add':
                    hicon.navigation.pondSelect();
                    break;
                case 'save':
                    var childUserId = hicon.sessionStorage.item('CHILD_USER_ID');
                    var ponds = [];

                    if (viewModelSubAccountPond.pondList().length > 0) {
                        $.each(viewModelSubAccountPond.pondList(), function(i, p) {
                            ponds.push(p.PondID);
                        })
                    };

                    hicon.server.ajax({
                        url: 'UserSetManagePonds',
                        type: 'post',
                        data: {
                            MainUserID: viewModelSubAccountPond.userInfo.UserID,
                            FisheryID: viewModelSubAccountPond.userInfo.FisheryID,
                            ChildUserID: childUserId,
                            Ponds: ponds
                        },
                        success: function(data) {
                            var cfg = {
                                text: '保存成功',
                                type: 'success'
                            };
                            hicon.utils.noty(cfg);
                        },
                        error: function() {
                            var cfg = {
                                text: '保存失败',
                                type: 'error'
                            };
                            hicon.utils.noty(cfg);
                        }
                    });
                    break;
            }
        }
    };

    return view;
}());
