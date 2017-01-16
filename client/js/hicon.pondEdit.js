var hicon = hicon || {};
var viewModelPondEdit = null;

hicon.pondEdit = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;

        self.currentPond = ko.observable({
            PondID: 0,
            FisheryID: 0,
            Name: '',
            PondType: null,
            Description: '',
            Acreage: null,
            FishType: null,
            Salinity: null,
            Status: 1,
            DtuNO1: '',
            DtuNO2: ''
        });

        self.title = ko.observable('新增鱼池');
    };

    view.init = function() {
        viewModelPondEdit = new view.defineModel();
        ko.applyBindings(viewModelPondEdit, document.getElementById("pondEdit"));
    };

    view.show = function (e) {
        viewModelPondEdit.currentPond({
            PondID: 0,
            FisheryID: 0,
            Name: '',
            PondType: null,
            Description: '',
            Acreage: null,
            FishType: null,
            Salinity: null,
            Status: 1,
            DtuNO1: '',
            DtuNO2: ''
        });

        var currentPond = hicon.sessionStorage.getJson('CURRENT_POND');
        if (currentPond) {

            if (currentPond.Dtus && currentPond.Dtus.length > 0) {

                currentPond.DtuNO1 = currentPond.Dtus[0].DtuNO;
                if(currentPond.Dtus.length > 1) {
                    currentPond.DtuNO2 = currentPond.Dtus[1].DtuNO;
                } else {
                    currentPond.DtuNO2 ='';
                }
            } else {
                currentPond.DtuNO1 = '';
                currentPond.DtuNO2 = '';
            }

            viewModelPondEdit.currentPond(currentPond);
        }

        $("#ddlPondType").find("option[value='" + viewModelPondEdit.currentPond().PondType + "']").prop('selected', true);
        $("#ddlFishType").find("option[value='" + viewModelPondEdit.currentPond().FishType + "']").prop('selected', true);
        viewModelPondEdit.title(viewModelPondEdit.currentPond().PondID == 0 ? '新增鱼池' : '修改鱼池');
    };

    view.aftershow = function (e) {

    };

    view.data = {

    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
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
            }
        },
        save: function() {
            if (!viewModelPondEdit.currentPond().Name) {
                var cfg = {
                    text: '请输入名称',
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
            viewModelPondEdit.currentPond().PondType = $('#ddlPondType').val();

            if (!$('#ddlFishType').val()) {
                var cfg = {
                    text: '请输入养殖种类',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }
            viewModelPondEdit.currentPond().FishType = $('#ddlFishType').val();

            if (!viewModelPondEdit.currentPond().DtuNO1) {
                var cfg = {
                    text: '请输入设备编号',
                    type: 'error'
                };
                hicon.utils.noty(cfg);
                return;
            }

            if (viewModelPondEdit.currentPond().Salinity != undefined && viewModelPondEdit.currentPond().Salinity != null) {
                viewModelPondEdit.currentPond().Salinity = viewModelPondEdit.currentPond().Salinity - 0;
                var r = /^\d+$/.test(viewModelPondEdit.currentPond().Salinity-0),
                    isValidSalinity = true;
                if (!r) {
                    isValidSalinity = false;
                }

                if (viewModelPondEdit.currentPond().Salinity < 0) {
                    isValidSalinity = false;
                }

                if (viewModelPondEdit.currentPond().Salinity > 40) {
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

                viewModelPondEdit.currentPond().Salinity = parseFloat(viewModelPondEdit.currentPond().Salinity);

            } else {
                viewModelPondEdit.currentPond().Salinity = 0;
            }

            var dtus = [];
            dtus.push({
                DtuNO: viewModelPondEdit.currentPond().DtuNO1
            });
            if (viewModelPondEdit.currentPond().DtuNO2) {
                dtus.push({
                    DtuNO: viewModelPondEdit.currentPond().DtuNO2
                });
            }

            viewModelPondEdit.currentPond().Dtus = dtus;

            var userInfo = hicon.localStorage.getJson('USER_INFO');
            var data = {
                UserID: userInfo.UserID,
                Pond: viewModelPondEdit.currentPond()
            };

            App.showLoading();
            hicon.server.ajax({
                url: viewModelPondEdit.currentPond().PondID ? 'FishPondModify' : 'FishPondAdd',
                type: 'post',
                data: data,
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
                            text: '保存成功',
                            type: 'success',
                            callack: {
                                afterClose: function() {
                                    hicon.navigation.main();
                                }
                            }
                        };

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
        }
    };

    return view;
}());
