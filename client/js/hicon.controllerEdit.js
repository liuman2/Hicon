var hicon = hicon || {};
var viewModelControllerEdit = null;

hicon.controllerEdit = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.currentPond = ko.observable({
            Name: ''
        });

        self.controlCommand = null;
        self.title = ko.observable();
        self.btnCaption = ko.observable();
        self.controllerList = ko.observableArray([]);

        self.userInfo = null;
        self.fishery = null;
    };

    view.init = function() {
        viewModelControllerEdit = new view.defineModel();
        ko.applyBindings(viewModelControllerEdit, document.getElementById("controllerEdit"));
    };

    view.show = function (e) {
        var pond = hicon.sessionStorage.getJson('CURRENT_POND');
        var controlCommand = hicon.sessionStorage.item('CURRENT_CONTROLLER_COMMAND');

        viewModelControllerEdit.currentPond(pond);
        viewModelControllerEdit.controlCommand = controlCommand;

        viewModelControllerEdit.userInfo = hicon.localStorage.getJson('USER_INFO');
        viewModelControllerEdit.fishery = hicon.localStorage.getJson('FISHERY_BASIC');

        var items = [];
        switch (controlCommand) {
            case 'oxyg':
                viewModelControllerEdit.title(pond.Name+'(增氧)');
                viewModelControllerEdit.btnCaption('添加增氧遥控器');
                items = view.data.getDtusByType(1);
                break;
            case 'pump':
                viewModelControllerEdit.title(pond.Name+'(水泵)');
                viewModelControllerEdit.btnCaption('添加水泵遥控器');
                items = view.data.getDtusByType(2);
                break;
            case 'feed':
                viewModelControllerEdit.title(pond.Name+'(投饵)');
                viewModelControllerEdit.btnCaption('添加投饵遥控器');
                items = view.data.getDtusByType(3);
                break;
        }
        viewModelControllerEdit.controllerList([]);
        if(items.length) {
            $.map(items, function(item) {
                item.dataSource = 'original';
                item.guid = hicon.utils.newGuid();
                item.oldDtu = item.DtuNO;
                viewModelControllerEdit.controllerList.push(item);
            });
        }
    };

    view.aftershow = function (e) {

    };

    view.data = {
        getDtusByType: function(type) {
            var items = $.grep(viewModelControllerEdit.currentPond().Dtus, function(d) {
                return d.DType == type;
            });
            return items;
        },
        changeDtus: function(modifyDuts) {

            for (var i = 0; i < modifyDuts.length; i++) {
                var dtu = modifyDuts[i];
                hicon.server.ajax({
                    url: 'PondChangeDtu',
                    type: 'post',
                    data: {
                        UserID: viewModelControllerEdit.userInfo.UserID,
                        PondID: viewModelControllerEdit.currentPond().PondID,
                        DtuNO1: dtu.oldDtu,
                        DtuNO2: dtu.newDtu
                    },
                    success: function(data) {
                    },
                    error: function() {
                    }
                });
            };


        },
        addDtus: function(dtus) {
            //
            hicon.server.ajax({
                url: 'DtuAdd',
                type: 'post',
                data: {
                    UserID: viewModelControllerEdit.userInfo.UserID,
                    FisheryID: viewModelControllerEdit.fishery.FisheryID,
                    PondID: viewModelControllerEdit.currentPond().PondID,
                    dtus: dtus
                },
                success: function(data) {
                    App.hideLoading();
                    if (!data.Result) {
                        var cfg = {
                            text: data.ErrorMsg ? data.ErrorMsg: '添加失败',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    }

                    hicon.utils.noty({
                        text: '添加成功',
                        type: 'success'
                    });
                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '添加失败',
                        type: 'error'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        }
    };

    view.events = {
        doBack: function() {
            hicon.navigation.main();
        },
        save: function() {
            // DeviceModify

            var newDtus = [],
                modifyDtus = [];

            var dtype = 1;
            switch (viewModelControllerEdit.controlCommand) {
                case 'oxyg':
                    dtype = 1;
                    break;
                case 'pump':
                    dtype = 2;
                    break;
                case 'feed':
                    dtype = 3;
                    break;
            }

            var mapControllType = true,
                errorNo = '';

            $.map(viewModelControllerEdit.controllerList(), function(c) {
                var tempDtuNo = $('input[data-guid="' + c.guid +'"]').val();

                if (c.dataSource == 'original' && c.oldDtu != tempDtuNo && $.trim(tempDtuNo)) {
                    modifyDtus.push({
                        oldDtu: c.oldDtu,
                        newDtu: $.trim(tempDtuNo)
                    });

                    if($.trim(tempDtuNo).substring(0, 1) != dtype) {
                        errorNo = tempDtuNo;
                    }
                }
                if (c.dataSource == 'new' && $.trim(tempDtuNo)) {
                    newDtus.push($.trim(tempDtuNo));
                    if($.trim(tempDtuNo).substring(0, 1) != dtype) {
                        errorNo = tempDtuNo;
                    }
                }
            });

            if (errorNo) {
                var names = ['增氧机', '水泵', '投饵机']
                var cfg = {
                    text: '输入的'+ errorNo +'不属于' + names[dtype-1] + ',无法保存',
                    type: 'error'
                };

                hicon.utils.noty(cfg);
                return;
            };

            if (!newDtus.length && !modifyDtus.length) {
                hicon.navigation.main();
                return;
            };

            if (newDtus.length) {
                view.data.addDtus(newDtus);
            };

            if (modifyDtus.length) {
                view.data.changeDtus(modifyDtus);
            };
        },
        itemClick: function(e) {
            var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
            var controller = ko.dataFor(e.target.closest("li")[0]);

            switch(commandKey) {
                case 'barcodeScan':
                    hicon.utils.confirm({
                        message: '请确定是否在' + viewModelControllerEdit.currentPond().Name + '下添加遥控器?',
                        ok: function() {
                            cordova.plugins.barcodeScanner.scan(
                                function (result) {
                                    if(result.text) {
                                        e.target.closest("li").find('input').val(result.text);
                                    }
                                },
                                function (error) {
                                }
                            );
                        }
                    });
                    break;
                case 'add':
                    var dtype = 1;
                    switch (viewModelControllerEdit.controlCommand) {
                        case 'oxyg':
                            dtype = 1;
                            break;
                        case 'pump':
                            dtype = 2;
                            break;
                        case 'feed':
                            dtype = 3;
                            break;
                    };

                    viewModelControllerEdit.controllerList.push({
                        dataSource: 'new',
                        guid: hicon.utils.newGuid(),
                        DType: dtype,
                        DtuNO: '',
                        IsLogin: false,
                        LoginTime: ''
                    })
                    break;
                case 'delete':
                    if (controller.dataSource != 'new') {
                        var cfg = {
                            text: '已添加的遥控器不能删除',
                            type: 'error'
                        };

                        hicon.utils.noty(cfg);
                        return;
                    };

                    hicon.utils.confirm({
                        message: '请确定是否删除该遥控器?',
                        ok: function() {
                            var position = -1;
                            $.each(viewModelControllerEdit.controllerList(), function(i, item) {
                                if (item.guid == controller.guid) {
                                    position = i;
                                };
                            });
                            viewModelControllerEdit.controllerList().splice(position, 1);
                            $(e.target.closest("li")[0]).remove();
                        }
                    });
                    break;
                case 'save':
                    view.events.save();
                    break;
            }
        }
    };

    return view;
}());
