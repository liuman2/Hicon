var hicon = hicon || {};
var viewModelBueMain = null;

hicon.bueMain = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.bueOnline = ko.observable(false);
    self.netWorkOnline = ko.observable(hicon.utils.main.isOnLine());
    self.deviceOnline = ko.observable(false);
    self.oxDeviceOnline = ko.observable(false);
    self.pHDeviceOnline = ko.observable(false);
    self.currentPond = ko.observable({
      code: '',
      name: '未选择'
    });

    self.service_uuid = hicon.utils.os.ios ? 'ffe0' : '0000ffe0-0000-1000-8000-00805f9b34fb';
    self.characteristic_uuid = hicon.utils.os.ios ? 'ffe1' : '0000ffe1-0000-1000-8000-00805f9b34fb';
    self.bueDevice = {
      id: ''
    }

    self.checkingData = ko.observable({
      pondCode: '--',
      ox: '--',
      ph: '--',
      water: '--',
      power: '--',
      hpa: '--',
      sat: '--',
      salt: '--',
    });

    self.isMonitoring = ko.observable(false);
    self.autoCheckingHex = '';
    self.autoCheckingIsSame = '';
    // self.isStartNotification = false;
    self.isDisconnect = false;
  };

  view.init = function() {
    viewModelBueMain = new view.defineModel();
    ko.applyBindings(viewModelBueMain, document.getElementById("buemain"));

    viewModelBueMain.autoCheckingHex = '';
    viewModelBueMain.autoCheckingIsSame = false;
    // viewModelBueMain.isStartNotification = false;

    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    if (bueDevice) {
      ble.connect(bueDevice.id, null, null);
      viewModelBueMain.bueDevice = bueDevice;
    }

    setTimeout(function() {
      view.bueLib.checkingStatus();
    }, 600);
    setInterval(function() {
      if (viewModelBueMain.isDisconnect) {
        return;
      }
      view.bueLib.checkingStatus();
    }, 1000 * 10);

    setInterval(function() {
      view.bueLib.stopNotification();
      if (viewModelBueMain.isDisconnect) {
        return;
      }
      view.bueLib.startNotification();
    }, 1000 * 5);
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {
    var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
    if (currentPond) {
      viewModelBueMain.currentPond(currentPond);
    }
  };

  view.events = {
    logout: function() {
      viewModelBueMain.isDisconnect = true;

      var userLogout = function() {
        var user = hicon.localStorage.getJson('USER_INFO');
        if (!user) {
          window.location.href = "index.html";
          window.location.reload();
          return;
        }
        hicon.server.ajax({
          url: 'UserLogoff',
          type: 'post',
          data: {
            UserID: user.UserID
          },
          success: function(data) {
            window.location.href = "index.html";
            window.location.reload();
          },
          error: function() {
            window.location.href = "index.html";
            window.location.reload();
          }
        });
      };

      if (viewModelBueMain.bueDevice) {
        var service_uuid = viewModelBueMain.service_uuid;
        var characteristic_uuid = viewModelBueMain.characteristic_uuid;

        ble.stopNotification(viewModelBueMain.bueDevice.id, service_uuid, characteristic_uuid, null, null);
        ble.stopScan();
        ble.disconnect(viewModelBueMain.bueDevice.id, function() {
          userLogout();
        }, function() {
          userLogout();
        });
      } else {
        userLogout();
      }
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      switch (commandKey) {
        case 'select':
          hicon.navigation.buePondSelect();
          break;
        case 'pond':
          hicon.navigation.buePond();
          break;
        case 'history':
          hicon.navigation.bueHistory();
          break;
        case 'monitorOx':
          view.bueLib.startCheck('55aa21');
          break;
        case 'monitorPh':
          view.bueLib.startCheck('55aa23');
          break;
      }
    }
  };

  view.bueLib = {
    analysisHex: function(hexStr) {
      if (!viewModelBueMain.isMonitoring()) {
        // 自动检测
        if (hexStr == viewModelBueMain.autoCheckingHex) {
          return;
        }
        viewModelBueMain.autoCheckingHex = hexStr;
      }

      var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
      var HexObj = hicon.utils.getHexString(hexStr);
      console.log('HexObj: ' + JSON.stringify(HexObj));

      var hex = {
        ox: HexObj.ox,
        water: HexObj.water,
        ph: HexObj.ph
      };

      window.nativeApp.Hex2Float(hex, function(data) {
        var appData = JSON.parse(data);
        console.log('app data: ' + JSON.stringify(data));

        if (HexObj.power && !isNaN(HexObj.power)) {
          HexObj.power = (HexObj.power / 100).toFixed(2);
        }

        var decimalObj = {
          pondCode: viewModelBueMain.isMonitoring() ? currentPond.code : HexObj.pondCode,
          ox: ((isNaN(appData.ox) ? '' : appData.ox) - 0.0).toFixed(2),
          ph: ((isNaN(appData.ph) ? '' : appData.ph) - 0.0).toFixed(2),
          water: ((isNaN(appData.water) ? '' : appData.water) - 0.0).toFixed(2),
          salt: HexObj.salt,
          hpa: HexObj.hpa,
          sat: HexObj.sat,
          power: HexObj.power,
        };

        if (viewModelBueMain.isMonitoring()) {
          viewModelBueMain.checkingData(decimalObj);
        }

        view.bueLib.saveCheckData(decimalObj);
      })
    },
    saveCheckData: function(checkData) {
      hicon.db.getPondByCode(checkData.pondCode, function(pond) {
        if (pond == null) {
          hicon.db.insertPond({
            code: checkData.pondCode,
            name: '',
            salt: isNaN(checkData.salt) ? '' : checkData.salt
          });
        }
      });

      var newDate = new Date();
      hicon.db.insertHistory({
        code: checkData.pondCode,
        dateCreated: moment(newDate).format('YYYY-MM-DD HH:mm'),
        oxygen: checkData.ox,
        water: checkData.water,
        ph: checkData.ph,
        saturation: checkData.sat,
        hpa: checkData.hpa
      });

      if (viewModelBueMain.isMonitoring()) {
        $('#btnOxMonitor').html('开始测溶氧');
        $('#btnPhMonitor').html('开始测pH');
        viewModelBueMain.isMonitoring(false);
      }
    },
    doNotificationResponse: function(hexResult) {
      console.log('notificaton result: ' + hexResult);
      var prefixStr = hexResult.substr(0, 6).toLowerCase();
      switch (prefixStr) {
        case '55aa01':
        case '55aa02':
          view.bueLib.analysisHex(hexResult);
          break;
        case '55aa09':
          viewModelBueMain.oxDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(6, 2), 16));
          viewModelBueMain.pHDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(8, 2), 16));
          break;
      }
    },
    startNotification: function() {
      console.log('startNotification ... ')
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      if (!bueDeviceId) {
        return;
      }

      if (!viewModelBueMain.deviceOnline()) {
        return;
      }

      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;

      var success = function(response) {
        console.log('startNotification success ')
        var hexData = hicon.utils.toHexString(response);
        view.bueLib.doNotificationResponse(hexData);
      };

      var failure = function() {
        console.log('startNotification failure ')
        if (viewModelBueMain.isMonitoring()) {
          $('#btnOxMonitor').html('开始测溶氧');
          $('#btnPhMonitor').html('开始测pH');
          viewModelBueMain.isMonitoring(false);
        }
      };
      ble.startNotification(bueDeviceId, service_uuid, characteristic_uuid, success, failure);
    },
    stopNotification: function() {
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      ble.stopNotification(bueDeviceId, service_uuid, characteristic_uuid, null, null);
    },
    write: function(data, callback) {
      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      var success = function(response) {
        callback({
          success: true,
          response: response
        });
      };
      var failure = function(response) {
        console.log('write fail')
        console.log(console.log(JSON.stringify(response)))
        callback({
          success: false
        });
      }

      var sendData = hicon.utils.stringToBytes(hicon.utils.hex2a(data));
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      ble.write(bueDeviceId, service_uuid, characteristic_uuid, sendData, success, failure);
    },
    startCheck: function(sendData) {
      if (viewModelBueMain.isMonitoring()) {
        return;
      }

      var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
      if (!currentPond) {
        hicon.utils.alert({
          message: '请选择池塘',
          ok: function() {
            hicon.navigation.buePondSelect();
          }
        })
        return;
      }
      var bueDevice = viewModelBueMain.bueDevice;
      if (!bueDevice) {
        hicon.utils.alert({
          message: '您还没选择设备',
          ok: function() {
            hicon.navigation.bueScan();
          }
        });
        return;
      }
      var bueDeviceId = viewModelBueMain.bueDevice.id;

      if (!viewModelBueMain.deviceOnline()) {
        setTimeout(function() {
          hicon.utils.confirm({
            message: '未连接上设备是否重新连接?',
            ok: function() {
              ble.scan([], 5000, function(device) {
                if (bueDeviceId == device.id) {
                  ble.connect(bueDeviceId, null, null);
                }
              }, function() {
                console.log('scan failed')
              });
            }
          });
        }, 400);
        return;
      }

      var isDeviceOnLine = true;
      switch (sendData) {
        case '55aa21':
          if (!viewModelBueMain.oxDeviceOnline()) {
            setTimeout(function() {
              hicon.utils.alert({
                message: '没检测到溶氧传感器',
                ok: function() {}
              })
            }, 400)

            isDeviceOnLine = false;
          } else {
            $('#btnOxMonitor').html('溶氧检测中...');
          }
          break;
        case '55aa23':
          if (!viewModelBueMain.pHDeviceOnline()) {
            setTimeout(function() {
              hicon.utils.alert({
                message: '没检测到pH传感器',
                ok: function() {}
              })
            }, 400)

            isDeviceOnLine = false;
          } else {
            $('#btnPhMonitor').html('pH检测中...');
          }
          break;
      }
      if (!isDeviceOnLine) {
        return;
      }
      viewModelBueMain.isMonitoring(true);
      view.bueLib.write(sendData, function(data) {
        if (!data.success) {
          if (sendData == '55aa21') {
            $('#btnOxMonitor').html('检测溶氧失败');
            setTimeout(function() {
              $('#btnOxMonitor').html('开始测溶氧');
              viewModelBueMain.isMonitoring(false);
            }, 600);
          }

          if (sendData == '55aa23') {
            $('#btnPhMonitor').html('检测pH失败');
            setTimeout(function() {
              $('#btnPhMonitor').html('开始测pH');
              viewModelBueMain.isMonitoring(false);
            }, 600);
          }
        }
      })
    },
    checkDeviceStatus: function() {
      if (viewModelBueMain.isMonitoring()) {
        return;
      }
      view.bueLib.write('55aa08', function(data) {
        console.log('device status response: ' + JSON.stringify(data));
        if (!data.success) {
          viewModelBueMain.oxDeviceOnline(false);
          viewModelBueMain.pHDeviceOnline(false);
        }
      })
    },
    checkingStatus: function() {
      console.log('checkingStatus 0')
      if (viewModelBueMain.isMonitoring()) {
        return;
      }

      console.log('checkingStatus 1')
        // 检测蓝牙状态
      ble.isEnabled(function() {
        viewModelBueMain.bueOnline(true);
      }, function() {
        viewModelBueMain.bueOnline(false);
      });

      // 检测网络状态
      viewModelBueMain.netWorkOnline(hicon.utils.main.isOnLine());

      // 传感器状态
      var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
      if (bueDevice) {
        ble.isConnected(
          bueDevice.id,
          function() {
            console.log('Peripheral isConnected true');
            viewModelBueMain.deviceOnline(true);
            view.bueLib.checkDeviceStatus();
            // if (!viewModelBueMain.isStartNotification) {

            //   viewModelBueMain.isStartNotification = true;
            // }
          },
          function() {
            console.log('Peripheral isConnected false')
            viewModelBueMain.deviceOnline(false);
            ble.scan([], 8000, function(device) {
              console.log('scan ...')
              if (bueDevice.id == device.id) {
                ble.connect(bueDevice.id, null, null);
              }
            }, function() {
              console.log('scan failed')
            });
          }
        );
      }
    }
  }
  return view;
}());
