var hicon = hicon || {};
var viewPondSelect = null;

hicon.pondSelect = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.pondList = ko.observableArray([]);
        self.userInfo = null;
    };

    view.init = function() {
        viewPondSelect = new view.defineModel();
        ko.applyBindings(viewPondSelect, document.getElementById("pondSelect"));
    };

    view.show = function (e) {
        view.data.getPonds();
    };

    view.aftershow = function (e) {

    };

    view.data = {
        getPonds: function() {

            App.showLoading();
            viewPondSelect.userInfo = hicon.localStorage.getJson('USER_INFO');

            return hicon.server.ajax({
                url: 'FishPondGets',
                type: 'post',
                data: {
                    UserID: viewPondSelect.userInfo.UserID,
                    FisheryID: viewPondSelect.userInfo.FisheryID
                },
                success: function(data) {
                    var ponds = [];
                    if (data.length > 0) {

                        $.each(data, function(i, d) {
                            d.selected = false;

                            if (viewModelSubAccountPond.pondList().length > 0) {
                                var existPonds = $.grep(viewModelSubAccountPond.pondList(), function(p) {
                                    return p.PondID == d.PondID;
                                });

                                if (!existPonds.length) {
                                    ponds.push(d);
                                }
                            } else {
                                ponds.push(d);
                            }
                        });
                    };

                    viewPondSelect.pondList(ponds);
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
            hicon.navigation.subAccountPond();
        },
        itemClick: function(e) {
            var account = ko.dataFor(e.target.closest("li")[0]),
                commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

            switch(commandKey) {
                case 'cancel':
                    hicon.navigation.subAccountPond();
                    break;
                case 'ok':
                    if (viewPondSelect.pondList().length) {
                        $.each(viewPondSelect.pondList(), function(i, d) {
                            if (d.selected) {
                                viewModelSubAccountPond.pondList.push(d);
                            };
                        });
                    }

                    hicon.navigation.subAccountPond();
                    break;
            }
        }
    };

    return view;
}());
