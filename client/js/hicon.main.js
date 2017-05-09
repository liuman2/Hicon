var hicon = hicon || {};

var viewModelMain = null;

hicon.main = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.userInfo = null;
    self.viewScroller = null;

    self.tabIndex = ko.observable();
    // 渔场信息
    self.fishery = ko.observable({
      AreaID: 0,
      FisheryID: 0,
      Name: '',
      Province: '',
      City: '',
      TotalAcreage: ''
    });

    // 鱼池列表
    self.pondList = ko.observableArray([]);
    self.currentIndexPond = ko.observable();
    self.currentPond = ko.observable({
      Name: ''
    });

    // 水质参数列表
    self.waterList = ko.observableArray([]);
    self.currentWater = ko.observable();
    self.initWaterModalDone = false;
    self.initSaturationModalDone = false;

    // 设备列表
    self.deviceZYList = ko.observableArray([]); // 增氧设备
    self.deviceSBList = ko.observableArray([]); // 水泵设备
    self.deviceTEList = ko.observableArray([]); // 投饵设备

    self.currentpH = ko.observable();

    var currentAi = null;
  };

  view.init = function() {
    viewModelMain = new view.defineModel();
    ko.applyBindings(viewModelMain, document.getElementById("main"));
  };

  view.show = function(e) {
    var page = e.view;
    viewModelMain.viewScroller = page.scroller;

    view.data.initGroupButton();

    // 用户信息
    var userInfo = hicon.localStorage.getJson('USER_INFO');
    viewModelMain.userInfo = userInfo;

    if (!userInfo) {
      hicon.localStorage.removeItem('LOGIN_USER');
      location.href = "index.html";
      return;
    };

    App.showLoading();

    // 获取渔场信息和鱼池列表
    view.data.getFishery().done(function(data) {
      App.hideLoading();
      viewModelMain.fishery(data);
      hicon.localStorage.saveJson('FISHERY_BASIC', data);

      view.data.getFishPonds();
    }).fail(function() {
      App.hideLoading();
      var cfg = {
        text: '获取渔场信息失败',
        type: 'error'
      };

      hicon.utils.noty(cfg);
    });
  };

  view.aftershow = function(e) {

  };

  view.data = {
    getPondAllData: function() {

    },
    initGroupButton: function() {
      var identity = hicon.sessionStorage.item('IDENTITY');
      var loginUser = hicon.localStorage.getJson('LOGIN_USER');
      var buttongroup = $("#tabButtonGroup").data("kendoMobileButtonGroup");
      var index = (identity || 0) - 0 + 1;
      buttongroup.select(index);
      view.data.showTabView(index);
    },
    // 获取渔场信息
    getFishery: function() {
      return hicon.server.ajax({
        url: 'FisheryGet',
        type: 'post',
        data: {
          UserID: viewModelMain.userInfo.UserID,
          FisheryID: viewModelMain.userInfo.FisheryID
        }
      });
    },
    // 获取鱼池列表
    getFishPonds: function() {
      hicon.server.ajax({
        url: 'FishPondGets',
        type: 'post',
        data: {
          UserID: viewModelMain.userInfo.UserID,
          FisheryID: viewModelMain.userInfo.FisheryID
        },
        success: function(data) {
          App.hideLoading();

          $('.f-zx').text('设备在线:0'); // 在线总数
          if (!data && data.length) {
            return;
          }
          if (!data.length) {
            return;
          }

          var onlineTotal = 0;
          $.each(data, function(i, d) {
            var dtus = d.Dtus;

            d.DTU_0_Desc = '';
            d.DTU_1_Desc = '';
            d.DTU_2_Desc = '';

            if (dtus && dtus.length) {
              var isLogin = false;

              $.each(dtus, function(i, dtu) {
                if (dtu.IsLogin) {
                  isLogin = true;
                }
              });
              d.online = isLogin;

              var dtu_0_onlines = $.grep(dtus, function(row) {
                  return row.DtuNO.substring(0, 1) == '1' && row.IsLogin;
                }),
                dtu_0_offlines = $.grep(dtus, function(row) {
                  return row.DtuNO.substring(0, 1) == '1' && !row.IsLogin;
                }),
                dtu_1_onlines = $.grep(dtus, function(row) {
                  return row.DtuNO.substring(0, 1) == '2' && row.IsLogin;
                }),
                dtu_1_offlines = $.grep(dtus, function(row) {
                  return row.DtuNO.substring(0, 1) == '2' && !row.IsLogin;
                }),
                dtu_2_onlines = $.grep(dtus, function(row) {
                  return row.DtuNO.substring(0, 1) == '3' && row.IsLogin;
                }),
                dtu_2_offlines = $.grep(dtus, function(row) {
                  return row.DtuNO.substring(0, 1) == '3' && !row.IsLogin;
                });

              if (dtu_0_onlines.length || dtu_0_offlines.length) {
                d.DTU_0_Desc = '增氧遥控器： <span class="' + (dtu_0_onlines.length ? "limegreen" : "red") + '">' + dtu_0_onlines.length + '</span>台在线, <span class="' + (dtu_0_offlines.length ? "red" : "limegreen") + '">' + dtu_0_offlines.length + '</span>台离线';
              }
              if (dtu_1_onlines.length || dtu_1_offlines.length) {
                d.DTU_1_Desc = '水泵遥控器： <span class="' + (dtu_1_onlines.length ? "limegreen" : "red") + '">' + dtu_1_onlines.length + '</span>台在线, <span class="' + (dtu_1_offlines.length ? "red" : "limegreen") + '">' + dtu_1_offlines.length + '</span>台离线';
              };
              if (dtu_2_onlines.length || dtu_2_offlines.length) {
                d.DTU_2_Desc = '投饵遥控器： <span class="' + (dtu_2_onlines.length ? "limegreen" : "red") + '">' + dtu_2_onlines.length + '</span>台在线, <span class="' + (dtu_2_offlines.length ? "red" : "limegreen") + '">' + dtu_2_offlines.length + '</span>台离线';
              };

            } else {
              d.online = false;
            }

            if (d.online) {
              onlineTotal++;
            }
          });

          viewModelMain.pondList(data);

          $('#onlineNum').text('设备在线: ' + onlineTotal);
          $('#deviceNum').text('设备总数: ' + data.length);

          var index = hicon.sessionStorage.item('CURRENT_INDEX_POND') || 0;

          if (data && data.length) {
            // 暂时这么处理
            if (data.length > index) {
              viewModelMain.currentIndexPond(index - 0);
              viewModelMain.currentPond(data[index - 0]);
            } else {
              viewModelMain.currentIndexPond(0);
              viewModelMain.currentPond(data[0]);
            }

            view.data.getCurrentPondAis();

            view.data.getDevicesByPondId();
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },

    // 获取设备信息
    getDevicesByPondId: function() {
      return hicon.server.ajax({
        url: 'DeviceGets',
        type: 'post',
        data: {
          UserID: viewModelMain.userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID
        },
        success: function(data) {
          var deviceZY = $.grep(data, function(d) {
            return (d.DtuNO != '' && d.DtuNO.substring(0, 1) === '1');
          });

          var deviceSB = $.grep(data, function(d) {
            return (d.DtuNO != '' && d.DtuNO.substring(0, 1) === '2');
          });

          var deviceTE = $.grep(data, function(d) {
            return (d.DtuNO != '' && d.DtuNO.substring(0, 1) === '3');
          });

          viewModelMain.deviceZYList(deviceZY);
          viewModelMain.deviceSBList(deviceSB);
          viewModelMain.deviceTEList(deviceTE);

          view.data.getLastestDeviceData();

          setInterval(function() {
            if (location.hash.indexOf('main.html') >= 0) {
              view.data.getLastestDeviceData();
            }
          }, 2 * 60 * 1000);
        },
        error: function() {}
      });
    },

    showTabView: function(index) {
      $('div[data-view="view"]').hide();
      $($('div[data-view="view"]')[index]).show();
      viewModelMain.tabIndex(index);
    },
    // 获取水质参数列表
    getCurrentPondAis: function() {
      App.showLoading();

      hicon.server.ajax({
        url: 'AiGets',
        type: 'post',
        data: {
          UserID: viewModelMain.userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID
        },
        success: function(data) {
          App.hideLoading();

          var getUnitByName = function(_aiName) {
            switch (_aiName) {
              case '溶解氧':
                return 'mg/L';
              case '水温':
                return '℃';
              case '溶解氧饱和度':
                return '%';
              default:
                return '';
            }
          };
          // viewModelMain.viewScroller.reset();
          if (!data.length) {
            viewModelMain.waterList([]);
            if (!$('#noWaterParamData').length) {
              $("#ul-pond-w-params").append('<li class="sm-li" id="noWaterParamData"><span>无水质参数数据</span></li>')
            }

            return;
          }

          if ($('#noWaterParamData').length) {
            $('#noWaterParamData').remove();
          }

          var params = [];
          $.each(data, function(i, item) {
            var items = $.grep(params, function(p) {
              return p.AiParam == item.AiParam
            })
            if (items.length <= 0) {
              params.push({
                AiParam: item.AiParam,
                PondID: item.PondID,
                AiType: item.AiType
              });
            }
          });

          for (var i = 0, max = params.length; i < max; i++) {
            var param = params[i];

            param.clsName = hicon.utils.getAiParamCls(param.AiParam.toLowerCase());

            param.items = [];
            for (var j = 0, l = data.length; j < l; j++) {
              var ai = data[j];

              if (ai.AiParam == param.AiParam) {
                param.items.push({
                  AiSN: ai.AiSN,
                  FixPos: ai.FixPos,
                  LowerLimit: ai.LowerLimit,
                  UpperLimit: ai.UpperLimit,
                  Lower: ai.Lower,
                  Upper: ai.Upper,
                  LowerHysteresis: ai.LowerHysteresis,
                  UpperHysteresis: ai.UpperHysteresis,
                  LowerDevice: ai.LowerDevice,
                  LowerAction: ai.LowerAction,
                  UpperDevice: ai.UpperDevice,
                  UpperAction: ai.UpperAction,
                  AiType: ai.AiType,
                  Y_Max: ai.Y_Max,
                  Y_Min: ai.Y_Min
                })
              }
            }

            param.RefValue = (param.items.length > 1) ? (param.items[1].Lower + '-' + param.items[1].Upper) : (param.items[0].Lower + '-' + param.items[0].Upper)
            param.Unit = getUnitByName(param.AiParam);
          }

          viewModelMain.waterList(params);
          view.data.getLatestAiData();

          if (false === viewModelMain.initWaterModalDone) {
            try {
              ko.applyBindings(viewModelMain, document.getElementById("modalview-water"));
            } catch (e) {

            }
            viewModelMain.initWaterModalDone = true;
          }

          if (false === viewModelMain.initSaturationModalDone) {
            try {
              ko.applyBindings(viewModelMain, document.getElementById("modalview-saturation"));
            } catch (e) {

            }
            viewModelMain.initSaturationModalDone = true;
          }

          setInterval(function() {
            if (location.hash.indexOf('main.html') >= 0) {
              view.data.getLatestAiData();
            }
          }, 5 * 60 * 1000);
        },
        error: function() {
          App.hideLoading();
        }
      });
    },
    // 获取水质参数实时数据
    getLatestAiData: function() {
      hicon.server.ajax({
        url: 'AiGetLastDatas',
        type: 'post',
        data: {
          UserID: viewModelMain.userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID
        },
        success: function(data) {
          $.each(data, function(i, d) {
            var tdAiVal = $('td[data-aisn="' + d.AiSN + '"][data-role="ai-value"]');
            var tdAiTime = $('td[data-aisn="' + d.AiSN + '"][data-role="ai-time"]');
            var levelName = '';
            if (tdAiVal.data('level') == 0) {
              levelName = '上: ';
            } else if (tdAiVal.data('level') == 1) {
              levelName = '下: ';
            }
            tdAiVal.text(levelName + d.AiValue);
            $('td[data-aisn="' + d.AiSN + '"][data-role="ai-warm"]').html(d.Warn > 0 ? '<div>\
                                            <div class="warn_red_img"></div>\
                                        </div>' : '<div>\
                                            <div class="warn_green_img"></div>\
                                        </div>');
            tdAiTime.text(d.Stamp);
          });
        },
        error: function() {}
      });
    },
    // 获取设备实时数据
    getLastestDeviceData: function() {
      hicon.server.ajax({
        url: 'DeviceGetLastDatas',
        type: 'post',
        data: {
          UserID: viewModelMain.userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID
        },
        success: function(data) {
          for (var i = 0, max = data.length; i < max; i++) {
            var d = data[i];

            var actionLi = $('li[data-device-no="' + d.DeviceNO + '"][data-dtu-no="' + d.DtuNO + '"]');
            var statusDiv = $(actionLi.find('.img-status'));

            if (actionLi.hasClass('enabled')) {
              switch (d.Action) {
                case 0:
                  statusDiv.addClass('warn_red_img').removeClass('warn_green_img');
                  break;
                case 1:
                  statusDiv.addClass('warn_green_img').removeClass('warn_red_img');
                  break;
              }
            } else {
              statusDiv.addClass('warn_gray_img').removeClass('warn_green_img').removeClass('warn_red_img');
            }
          }
        },
        error: function() {}
      });
    }
  };

  view.events = {
    selectButton: function(e) {
      var index = this.current().index();
      viewModelMain.viewScroller.reset();
      hicon.sessionStorage.item('IDENTITY', (index - 1));
      view.data.showTabView(index);
    },
    pondItemClick: function(e) {
      var pond = ko.dataFor(e.target.closest("li")[0]),
        commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

      switch (commandKey) {
        case 'edit':
          if (pond) {
            hicon.sessionStorage.saveJson('CURRENT_POND', pond);
          }
          hicon.navigation.pondEdit();
          break;
        case 'unlock':
          hicon.localStorage.saveJson('POND_DTUS', pond);
          hicon.navigation.dtuList();
          break;
        case 'delete':
          if (pond.Dtus.length) {
            var cfg = {
              text: '该鱼池已经绑定了设备无法删除',
              type: 'error'
            };
            hicon.utils.noty(cfg);
            return;
          }

          hicon.utils.confirm({
            message: '请确定是否要删除?',
            ok: function() {
              hicon.server.ajax({
                url: 'FishPondDelete',
                type: 'post',
                data: {
                  UserID: viewModelMain.userInfo.UserID,
                  PondID: pond.PondID
                },
                success: function(data) {
                  $(e.target.closest("li")).remove();
                  var cfg = {
                    text: '删除成功',
                    type: 'success'
                  };
                  hicon.utils.noty(cfg);
                },
                error: function() {
                  var cfg = {
                    text: '删除失败',
                    type: 'error'
                  };
                  hicon.utils.noty(cfg);
                }
              });
            }
          });
          break;
        case 'modify':
          hicon.navigation.basic();
          break;
        case 'pondClick':
          // alert(0)
          var position = viewModelMain.pondList().indexOf(pond);
          viewModelMain.currentIndexPond(position);
          viewModelMain.currentPond(viewModelMain.pondList()[position]);
          view.data.getCurrentPondAis();
          view.data.getDevicesByPondId();
          hicon.sessionStorage.item('CURRENT_INDEX_POND', position);

          var loginUser = hicon.localStorage.getJson('LOGIN_USER');
          var buttongroup = $("#tabButtonGroup").data("kendoMobileButtonGroup");
          var index = (loginUser.identity || 0) - 0 + 1;
          buttongroup.select(index);
          view.data.showTabView(index);
          break;
      }
    },
    waterItemClick: function(e) {
      var ai = ko.dataFor(e.target.closest("li")[0]),
        commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

      switch (commandKey) {
        case 'setting':
          // 设置水质参数
          viewModelMain.currentWater(ai);

          if (ai.items.length > 1) {
            currentAi = ai.items[1];
          } else {
            currentAi = ai.items[0];
          }

          // 上限标准
          $('#water-stander-up').val(currentAi.Upper);
          // 下限标准
          $('#water-stander-down').val(currentAi.Lower);
          // 上限启动临界值
          $('#water-start-up').val(currentAi.UpperLimit);
          // 下限启动临界值
          $('#water-start-down').val(currentAi.LowerLimit);

          $("#modalview-water").kendoMobileModalView('open');
          break;
        case 'oxygen_setting':
          // 设置水质参数
          viewModelMain.currentWater(ai);

          if (ai.items.length > 1) {
            currentAi = ai.items[1];
          } else {
            currentAi = ai.items[0];
          }

          hicon.server.ajax({
            url: 'PondGetOxygenControl',
            type: 'post',
            data: {
              UserID: viewModelMain.userInfo.UserID,
              PondID: viewModelMain.currentPond().PondID
            },
            success: function(data) {
              App.hideLoading();
              console.log(data)
              $('#oxygen-check').prop('checked', data);

              // 上限标准
              $('#oxygen-stander-up').val(currentAi.Upper);
              // 下限标准
              $('#oxygen-stander-down').val(currentAi.Lower);
              // 上限启动临界值
              $('#oxygen-start-up').val(currentAi.UpperLimit);



              // 下限标准
              $('#oxygen-start-down').val(currentAi.LowerLimit);
              // 下限启动临界值
              $('#oxygen-stop-down').val(currentAi.LowerHysteresis);

              $("#modalview-oxygen").kendoMobileModalView('open');
            },
            error: function() {
              App.hideLoading();
              // 上限标准
              $('#oxygen-stander-up').val(currentAi.Upper);
              // 下限标准
              $('#oxygen-stander-down').val(currentAi.Lower);
              // 上限启动临界值
              $('#oxygen-start-up').val(currentAi.UpperLimit);

              // 下限标准
              $('#oxygen-start-down').val(currentAi.LowerLimit);
              // 下限启动临界值
              $('#oxygen-stop-down').val(currentAi.LowerHysteresis);

              $("#modalview-oxygen").kendoMobileModalView('open');
            }
          });
          break;
        case 'line-chart':
          hicon.sessionStorage.saveJson('CURRENT_AI', ai);
          hicon.navigation.curve();
          break;
        case 'saturation_setting':
          viewModelMain.currentWater(ai);
          hicon.server.ajax({
            url: 'GetAi80',
            type: 'post',
            data: {
              UserID: viewModelMain.userInfo.UserID,
              PondID: viewModelMain.currentPond().PondID
            },
            success: function(data) {
              App.hideLoading();

              // 上限启动临界值
              $('#saturation-start-up').val(data.UpTop);
              // 下限启动临界值
              $('#saturation-start-down').val(data.DownLower);

              $('#saturation-check').prop('checked', data.MainCtrl);

              $('#saturation-top-down').val(data.DownStop);

              $("#modalview-saturation").kendoMobileModalView('open');
            },
            error: function() {
              App.hideLoading();
              var cfg = {
                text: '参数获取失败',
                type: 'error'
              };
              hicon.utils.noty(cfg);
            }
          });
          break;
        case 'phCheck':
          if ($('#lbPhCheck').html() != '校准') {
            return;
          }
          viewModelMain.currentpH(ai);
          $("#modalview-phCheck").kendoMobileModalView('open');
          break;
        case 'phSetting':
          viewModelMain.currentpH(ai);
          if (ai.items.length > 1) {
            currentAi = ai.items[1];
          } else {
            currentAi = ai.items[0];
          }
           // 上限标准
          $('#ph-stander-up').val(currentAi.Upper);
          // 下限标准
          $('#ph-stander-down').val(currentAi.Lower);
          // 上限启动临界值
          $('#ph-start-up').val(currentAi.UpperLimit);

          // 下限标准
          $('#ph-start-down').val(currentAi.LowerLimit);
          // 下限启动临界值
          $('#ph-stop-down').val(currentAi.LowerHysteresis);

          $("#modalview-ph").kendoMobileModalView('open');
          break;
      }
    },
    controlItemClick: function(e) {

      var /*commandKey = e.touch ? e.touch.target.closest("[data-command-key]").data("command-key") : null,*/
        controller = ko.dataFor(e.sender.element[0]);

      hicon.sessionStorage.saveJson('CURRENT_POND', viewModelMain.currentPond());
      hicon.sessionStorage.saveJson('CURRENT_CONTROLLER', controller);
      hicon.sessionStorage.item('CURRENT_CONTROLLER_COMMAND', ['oxyg', 'pump', 'feed'][viewModelMain.tabIndex() - 2]);

      hicon.navigation.controller();
    },
    // 新增鱼池
    addPond: function(e) {
      // hicon.navigation.pondEdit();
      hicon.utils.confirm({
        message: '确定添加鱼池吗?',
        ok: function() {
          if (viewModelMain.tabIndex() != 0) {
            view.data.showTabView(0);
          }
          App.showLoading();
          hicon.server.ajax({
            url: 'FishPondAdd',
            type: 'post',
            data: {
              UserID: viewModelMain.userInfo.UserID,
              Pond: {
                PondID: 0,
                FisheryID: viewModelMain.fishery().FisheryID,
                Name: '池' + (viewModelMain.pondList().length + 1)
              }
            },
            success: function(data) {
              App.hideLoading();
              if (!data.Result) {
                var cfg = {
                  text: data.ErrorMsg ? data.ErrorMsg : '添加失败',
                  type: 'error'
                };

                hicon.utils.noty(cfg);
                return;
              } else {
                var cfg = {
                  text: '保存成功',
                  type: 'success'
                };

                hicon.utils.noty(cfg);
                view.data.getFishPonds();
                if (viewModelMain.tabIndex() != 0) {
                  view.data.showTabView(0);
                }
              }
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
      });
    },
    prev: function() {
      if (viewModelMain.currentIndexPond() == 0) {
        return;
      }

      viewModelMain.currentIndexPond(viewModelMain.currentIndexPond() - 1);
      viewModelMain.currentPond(viewModelMain.pondList()[viewModelMain.currentIndexPond()]);
      view.data.getCurrentPondAis();
      view.data.getDevicesByPondId();

      hicon.sessionStorage.item('CURRENT_INDEX_POND', viewModelMain.currentIndexPond());
    },

    next: function() {
      if (viewModelMain.currentIndexPond() == (viewModelMain.pondList().length - 1)) {
        return;
      }

      viewModelMain.currentIndexPond(viewModelMain.currentIndexPond() + 1);
      viewModelMain.currentPond(viewModelMain.pondList()[viewModelMain.currentIndexPond()]);
      view.data.getCurrentPondAis();
      view.data.getDevicesByPondId();

      hicon.sessionStorage.item('CURRENT_INDEX_POND', viewModelMain.currentIndexPond());
    },
    monitor: function(e) {
      hicon.sessionStorage.saveJson('CURRENT_POND', viewModelMain.currentPond());
      hicon.navigation.monitor();
    },
    controller: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      hicon.sessionStorage.saveJson('CURRENT_POND', viewModelMain.currentPond());
      hicon.sessionStorage.item('CURRENT_CONTROLLER_COMMAND', commandKey);
      hicon.navigation.controllerEdit();
    },
    modalWaterClose: function() {
      $("#modalview-water").kendoMobileModalView('close');
    },
    modalSaturationClose: function() {
      $("#modalview-saturation").kendoMobileModalView('close');
    },
    modalOxygenClose: function() {
      $("#modalview-oxygen").kendoMobileModalView('close');
    },
    modalPHSettingClose: function() {
      $("#modalview-ph").kendoMobileModalView('close');
    },
    modalPHClose: function() {
      $("#modalview-phCheck").kendoMobileModalView('close');
    },

    setDefault: function() {
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      App.showLoading();
      hicon.server.ajax({
        url: 'AiSetDefault',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID,
          AiSN: viewModelMain.currentWater().items.length == 1 ? viewModelMain.currentWater().items[0].AiSN : viewModelMain.currentWater().items[1].AiSN
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            // $("#modalview-water").kendoMobileModalView('close');

            view.data.getCurrentPondAis();

            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1500);

            hicon.utils.aiGets(userInfo.UserID, viewModelMain.currentPond().PondID, function(ais) {
              var items = $.grep(ais, function(_ai) {
                return viewModelMain.currentWater().AiParam == _ai.AiParam
              });

              var _currentAi = null;

              if (items.length > 1) {
                _currentAi = items[1];
              } else {
                _currentAi = items[0];
              }

              if (_currentAi != null) {
                // 上限标准
                $('#water-stander-up').val(_currentAi.Upper);
                // 下限标准
                $('#water-stander-down').val(_currentAi.Lower);
                // 上限启动临界值
                $('#water-start-up').val(_currentAi.UpperLimit);
                // 下限启动临界值
                $('#water-start-down').val(_currentAi.LowerLimit);
              }
            });
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '恢复默认值失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },
    setOxygenDefault: function() {
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      App.showLoading();
      hicon.server.ajax({
        url: 'AiSetDefault',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID,
          AiSN: viewModelMain.currentWater().items.length == 1 ? viewModelMain.currentWater().items[0].AiSN : viewModelMain.currentWater().items[1].AiSN
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            view.data.getCurrentPondAis();
            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1500);

            hicon.utils.aiGets(userInfo.UserID, viewModelMain.currentPond().PondID, function(ais) {
              var items = $.grep(ais, function(_ai) {
                return viewModelMain.currentWater().AiParam == _ai.AiParam
              });

              var _currentAi = null;

              if (items.length > 1) {
                _currentAi = items[1];
              } else {
                _currentAi = items[0];
              }

              if (_currentAi != null) {
                // 上限标准
                $('#oxygen-stander-up').val(_currentAi.Upper);
                // 下限标准
                $('#oxygen-stander-down').val(_currentAi.Lower);
                // 上限启动临界值
                $('#oxygen-start-up').val(_currentAi.UpperLimit);

                $('#oxygen-start-down').val(_currentAi.LowerLimit);
                $('#oxygen-stop-down').val(_currentAi.LowerHysteresis);
              }
            });
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '恢复默认值失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },

    setPHDefault: function() {
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      App.showLoading();
      hicon.server.ajax({
        url: 'AiSetDefault',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID,
          AiSN: viewModelMain.currentpH().items.length == 1 ? viewModelMain.currentpH().items[0].AiSN : viewModelMain.currentpH().items[1].AiSN
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            view.data.getCurrentPondAis();
            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1500);

            hicon.utils.aiGets(userInfo.UserID, viewModelMain.currentPond().PondID, function(ais) {
              var items = $.grep(ais, function(_ai) {
                return viewModelMain.currentpH().AiParam == _ai.AiParam
              });

              var _currentAi = null;

              if (items.length > 1) {
                _currentAi = items[1];
              } else {
                _currentAi = items[0];
              }

              if (_currentAi != null) {
                // 上限标准
                $('#ph-stander-up').val(_currentAi.Upper);
                // 下限标准
                $('#ph-stander-down').val(_currentAi.Lower);
                // 上限启动临界值
                $('#ph-start-up').val(_currentAi.UpperLimit);

                $('#ph-start-down').val(_currentAi.LowerLimit);
                $('#ph-stop-down').val(_currentAi.LowerHysteresis);
              }
            });
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '恢复默认值失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },

    saveWater: function() {
      App.showLoading();
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      hicon.server.ajax({
        url: 'AiModify',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          model: {
            PondID: viewModelMain.currentPond().PondID,
            AiSN: viewModelMain.currentWater().items.length == 1 ? viewModelMain.currentWater().items[0].AiSN : viewModelMain.currentWater().items[1].AiSN,
            AiParam: viewModelMain.currentWater().AiParam,
            FixPos: viewModelMain.currentWater().items.length == 1 ? viewModelMain.currentWater().items[0].FixPos : viewModelMain.currentWater().items[1].FixPos,

            LowerLimit: $('#water-start-down').val(),
            UpperLimit: $('#water-start-up').val(),
            Lower: $('#water-stander-down').val(),
            Upper: $('#water-stander-up').val(),

            AiType: 0
          }
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            currentAi.LowerLimit = $('#water-start-down').val();
            currentAi.UpperLimit = $('#water-start-up').val();
            currentAi.Lower = $('#water-stander-down').val();
            currentAi.Upper = $('#water-stander-up').val();

            // $("#modalview-water").kendoMobileModalView('close');
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '修改成功',
              type: 'success'
            };
            hicon.utils.noty(cfg);

            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1000)
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '保存失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },
    saveSaturation: function() {
      App.showLoading();

      var userInfo = hicon.localStorage.getJson('USER_INFO');
      hicon.server.ajax({
        url: 'AiModify80',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID,
          uptop: $('#saturation-start-up').val() || 0,
          downlower: $('#saturation-start-down').val() || 0,
          downstop: $('#saturation-top-down').val() || 0,
          control: $('#saturation-check').prop('checked'),
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            // $("#modalview-saturation").kendoMobileModalView('close');

            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '修改成功',
              type: 'success'
            };
            hicon.utils.noty(cfg);

            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1000)

          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '保存失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },

    saveOxygen: function() {
      App.showLoading();
      var userInfo = hicon.localStorage.getJson('USER_INFO');

      // PondSetOxygenControl

      hicon.server.ajax({
        url: 'PondSetOxygenControl',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID,
          isoxygen: $('#oxygen-check').prop('checked')
        },
        success: function() {
          console.log(arguments)
        }
      });

      hicon.server.ajax({
        url: 'AiModify',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          model: {
            PondID: viewModelMain.currentPond().PondID,
            AiSN: viewModelMain.currentWater().items.length == 1 ? viewModelMain.currentWater().items[0].AiSN : viewModelMain.currentWater().items[1].AiSN,
            AiParam: viewModelMain.currentWater().AiParam,
            FixPos: viewModelMain.currentWater().items.length == 1 ? viewModelMain.currentWater().items[0].FixPos : viewModelMain.currentWater().items[1].FixPos,
            LowerLimit: $('#oxygen-start-down').val() || null,
            LowerHysteresis: $('#oxygen-stop-down').val() || null,

            UpperLimit: $('#oxygen-start-up').val(),
            Lower: $('#oxygen-stander-down').val(),
            Upper: $('#oxygen-stander-up').val(),


            AiType: 0
          }
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            currentAi.LowerLimit = $('#oxygen-start-down').val();
            currentAi.LowerHysteresis = $('#oxygen-stop-down').val();

            currentAi.UpperLimit = $('#oxygen-start-up').val();
            currentAi.Lower = $('#oxygen-stander-down').val();
            currentAi.Upper = $('#oxygen-stander-up').val();

            // $("#modalview-water").kendoMobileModalView('close');
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '修改成功',
              type: 'success'
            };
            hicon.utils.noty(cfg);

            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1000)
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '保存失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },

    savePHSetting: function() {
      App.showLoading();
      var userInfo = hicon.localStorage.getJson('USER_INFO');

      // hicon.server.ajax({
      //   url: 'PondSetOxygenControl',
      //   type: 'post',
      //   data: {
      //     UserID: userInfo.UserID,
      //     PondID: viewModelMain.currentPond().PondID,
      //     isoxygen: $('#oxygen-check').prop('checked')
      //   },
      //   success: function() {
      //     console.log(arguments)
      //   }
      // });

      hicon.server.ajax({
        url: 'AiModify',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          model: {
            PondID: viewModelMain.currentPond().PondID,
            AiSN: viewModelMain.currentpH().items.length == 1 ? viewModelMain.currentpH().items[0].AiSN : viewModelMain.currentpH().items[1].AiSN,
            AiParam: viewModelMain.currentpH().AiParam,
            FixPos: viewModelMain.currentpH().items.length == 1 ? viewModelMain.currentpH().items[0].FixPos : viewModelMain.currentpH().items[1].FixPos,
            LowerLimit: $('#ph-start-down').val() || null,
            LowerHysteresis: $('#ph-stop-down').val() || null,

            UpperLimit: $('#ph-start-up').val(),
            Lower: $('#ph-stander-down').val(),
            Upper: $('#ph-stander-up').val(),


            AiType: 0
          }
        },
        success: function(data) {
          App.hideLoading();
          if (data.Result) {
            currentAi.LowerLimit = $('#ph-start-down').val();
            currentAi.LowerHysteresis = $('#ph-stop-down').val();

            currentAi.UpperLimit = $('#ph-start-up').val();
            currentAi.Lower = $('#ph-stander-down').val();
            currentAi.Upper = $('#ph-stander-up').val();

            // $("#modalview-water").kendoMobileModalView('close');
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '修改成功',
              type: 'success'
            };
            hicon.utils.noty(cfg);

            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1000)
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '保存失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },

    setSaturationDefault: function() {
      // Ai80SetDefault
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      App.showLoading();
      hicon.server.ajax({
        url: 'Ai80SetDefault',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID
        },
        success: function(data) {
          App.hideLoading();
          console.log(data)
          if (data.Result) {
            view.data.getCurrentPondAis();

            setTimeout(function() {
              view.data.getLastestDeviceData();
            }, 1500);

            hicon.server.ajax({
              url: 'GetAi80',
              type: 'post',
              data: {
                UserID: userInfo.UserID,
                PondID: viewModelMain.currentPond().PondID
              },
              success: function(data) {
                App.hideLoading();

                // 上限启动临界值
                $('#saturation-start-up').val(data.UpTop);
                // 下限启动临界值
                $('#saturation-start-down').val(data.DownLower);

                $('#saturation-check').prop('checked', data.MainCtrl);

                $('#saturation-top-down').val(data.DownStop);

                $("#modalview-saturation").kendoMobileModalView('open');
              },
              error: function() {
                App.hideLoading();
              }
            });

          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '恢复默认值失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          App.hideLoading();
        }
      });
    },
    savePHCheck: function() {
      // App.showLoading();
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      $('#lbPhCheck').html('校准中...');
      hicon.server.ajax({
        url: 'AiAdjust',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          PondID: viewModelMain.currentPond().PondID,
          AiSN: viewModelMain.currentpH().items.length == 1 ? viewModelMain.currentpH().items[0].AiSN : viewModelMain.currentpH().items[1].AiSN,
          adval: $('#PHCheck').val()
        },
        success: function(data) {
          // App.hideLoading();
          $('#lbPhCheck').html('校准')
          if (data.Result) {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '校准成功',
              type: 'success'
            };
            hicon.utils.noty(cfg);
          } else {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '校准失败',
              type: 'error'
            };
            hicon.utils.noty(cfg);
          }
        },
        error: function() {
          // App.hideLoading();
          $('#lbPhCheck').html('校准');
          var cfg = {
            text: data.ErrorMsg ? data.ErrorMsg : '校准失败',
            type: 'error'
          };
          hicon.utils.noty(cfg);
        }
      });

      $("#modalview-phCheck").kendoMobileModalView('close');
    }
  };

  view.drawer = {
    beforeShow: function(e) {
      if (App.view().id != "view/main.html") {
        e.preventDefault();
      }

      if (!viewModelMain.userInfo.IsMain) {
        $('li[data-icon="contacts"]').remove();
      };
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      switch (commandKey) {
        case 'basic':
          hicon.navigation.basic();
          break;
        case 'event':
          hicon.navigation.log();
          break;
        case 'subAccount':

          break;
        case 'password':
          break;
        case 'about':
          break;
        case 'logout':
          hicon.server.ajax({
            url: 'UserLogoff',
            type: 'post',
            data: {
              UserID: viewModelMain.userInfo.UserID
            },
            success: function(data) {
              App.hideLoading();
              if (!data.Result) {
                var cfg = {
                  text: data.ErrorMsg ? data.ErrorMsg : '退出失败',
                  type: 'error'
                };

                hicon.utils.noty(cfg);
                return;
              } else {
                location.href = "index.html";
              }
            },
            error: function() {
              location.href = "index.html";
            }
          });
          break;
      }
    }
  };

  return view;
}());
