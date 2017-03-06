var hicon = hicon || {};
var viewModelBueMain = null;

hicon.bueMain = (function() {
  function toHexString(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  // 转ASCII
  function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  // function hexStringToByte(str) {
  //   var a = [];
  //   for (var i = 0; i < str.length; i += 2) {
  //     a.push("0x" + str.substr(i, 2));
  //   }
  //   return a;
  // }

  function getHexString(hex) {
    if (hex.length == 40) {
      // 检测类型:01-溶氧, 02-PH
      var typeId = hex.substr(0, 6);
      return {
        type: typeId.toLowerCase() == '55aa01' ? 'ox' : 'ph',
        value: {
          ox: hex.substr(6, 8),
          ph: hex.substr(6, 8),
          water: hex.substr(14, 8),
          power: hex.substr(22, 8),
          hpa: parseInt(hex.substr(30, 4), 16), // 气压值
          sat: parseInt(hex.substr(34, 4), 16), // 饱和度
          salt: parseInt(hex.substr(38, 2), 16), // 盐度
        }
      }
    } else if (hex.length == 4) {
      return {
        type: 'pond',
        value: parseInt(hex.substr(0, 2), 16)
      }
    }
  }

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
  };

  view.init = function() {
    viewModelBueMain = new view.defineModel();
    ko.applyBindings(viewModelBueMain, document.getElementById("buemain"));
  };

  view.show = function(e) {
    viewModelBueMain.autoCheckingHex = '';
    viewModelBueMain.autoCheckingIsSame = false;
  };

  view.aftershow = function(e) {
    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    if (bueDevice) {
      ble.connect(bueDevice.id, null, null);
      viewModelBueMain.bueDevice = bueDevice;
    }

    var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
    if (currentPond) {
      viewModelBueMain.currentPond(currentPond);
    }

    view.bueLib.checkingStatus();
    setInterval(function() {
      view.bueLib.checkingStatus();
    }, 1000 * 30);

    setTimeout(function() {
      view.bueLib.internalChecking();
    }, 3000)
  };

  view.events = {
    doBack: function() {},
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
          if (viewModelBueMain.isMonitoring()) {
            return;
          }

          if (!viewModelBueMain.oxDeviceOnline()) {
            hicon.utils.alert({
              message: '没检测到溶氧传感器',
              ok: function() {
              }
            })
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
            })
            return;
          }

          // viewModelBueMain.oxDeviceOnline(false);
          // viewModelBueMain.pHDeviceOnline(false);


          var bueDeviceId = viewModelBueMain.bueDevice.id;

          if (!viewModelBueMain.deviceOnline()) {
            setTimeout(function() {
              hicon.utils.confirm({
                message: '未连接上设备是否重新连接?',
                ok: function() {
                  ble.scan([], 5000, function(device) {
                    if (bueDeviceId == device.id) {
                      // ble.stopScan();
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

          $('#btnOxMonitor').html('溶氧检测中...');
          viewModelBueMain.isMonitoring(true);
          view.bueLib.startCheck('55aa21');
          break;
        case 'monitorPh':
          if (viewModelBueMain.isMonitoring()) {
            return;
          }

          if (!viewModelBueMain.pHDeviceOnline()) {
            hicon.utils.alert({
              message: '没检测到pH传感器',
              ok: function() {
              }
            })
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
            })
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
                      // ble.stopScan();
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

          $('#btnPhMonitor').html('pH检测中...');
          viewModelBueMain.isMonitoring(true);
          view.bueLib.startCheck('55aa23');
          break;
      }
    }
  };

  view.bueLib = {
    startNotification: function(successCallback, failureCallback) {
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      if (!bueDeviceId) {
        return;
      }

      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      var success = function(response) {
        var hexData = toHexString(response);
        successCallback(hexData);
      };
      var failure = function() {
        console.log(JSON.stringify(arguments))
        failureCallback()
      };
      ble.startNotification(bueDeviceId, service_uuid, characteristic_uuid, success, failure);
    },
    stopNotification: function() {
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      ble.stopNotification(bueDeviceId, service_uuid, characteristic_uuid, null, null);
    },
    writeWithoutResponse: function(data) {
      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      var success = function(response) {

      };
      var failure = function(response) {

      }
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      ble.writeWithoutResponse(bueDeviceId, service_uuid, characteristic_uuid, data, success, failure);
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

      var sendData = stringToBytes(hex2a(data));

      var bueDeviceId = viewModelBueMain.bueDevice.id;
      ble.write(bueDeviceId, service_uuid, characteristic_uuid, sendData, success, failure);
    },
    startCheck: function(sendData) {
      view.bueLib.write(sendData, function(data) {
        if (data.success) {
          view.bueLib.startNotification(function(hexResult) {
            console.log('startCheck:' + hexResult)
            if (hexResult.length < 5 && (hexResult.substring(0, 4).toLowerCase() != '55aa01' || hexResult.substring(0, 4).toLowerCase() != '55aa02')) {
              return;
            }

            var HexObj = getHexString(hexResult);
            view.bueLib.stopNotification();
            console.log('HexObj = ' + JSON.stringify(HexObj))
            if (HexObj.type == 'ox') {
              setTimeout(function() {
                $('#btnOxMonitor').html('开始测溶氧');
              }, 500);
            }
            if (HexObj.type == 'ph') {
              setTimeout(function() {
                $('#btnPhMonitor').html('开始测pH');
              }, 500);
            }
            viewModelBueMain.isMonitoring(false);
            var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
            HexObj.pondCode = currentPond.code;
            view.bueLib.saveCheckData(HexObj, false);
          }, function() {
            console.log('failed');
            view.bueLib.stopNotification();

            if (HexObj.type == 'ox') {
              $('#btnOxMonitor').html('检测溶氧失败');
              setTimeout(function() {
                $('#btnOxMonitor').html('开始测溶氧');
                viewModelBueMain.isMonitoring(false);
              }, 600);
            }
            if (HexObj.type == 'ph') {
              $('#btnPhMonitor').html('检测pH失败');
              setTimeout(function() {
                $('#btnPhMonitor').html('开始测pH');
                viewModelBueMain.isMonitoring(false);
              }, 600);
            }
          })
        } else {
          view.bueLib.stopNotification();
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
    saveCheckData: function(checkData, isInternal) {
      console.log(JSON.stringify(checkData))
      hicon.db.getPondByCode(checkData.pondCode, function(pond) {
        if (pond == null) {
          hicon.db.insertPond({
            code: checkData.pondCode,
            name: '',
            salt: isNaN(checkData.value.salt) ? '' : checkData.value.salt
          });
        }
      });

      var hex = {
        ox: checkData.value.ox,
        water: checkData.value.water,
        ph: checkData.value.ph,
      };
      console.log(JSON.stringify(hex))
      window.nativeApp.Hex2Float(hex, function(data) {
        var appData = JSON.parse(data);
        console.log(JSON.stringify(data))
        var newDate = new Date();
        hicon.db.insertHistory({
          code: checkData.pondCode,
          dateCreated: moment(newDate).format('YYYY-MM-DD HH:mm'),
          oxygen: isNaN(appData.ox) ? '' : appData.ox,
          water: isNaN(appData.water) ? '' : appData.water,
          ph: isNaN(appData.ph) ? '' : appData.ph,
          saturation: isNaN(checkData.value.sat) ? '' : checkData.value.sat,
          hpa: isNaN(checkData.value.hpa) ? '' : checkData.value.hpa
        });

        if (!isInternal) {
          console.log("isInternal")
          console.log("data.ox " + appData.ox)
          viewModelBueMain.checkingData({
            ox: appData.ox,
            water: appData.water,
            ph: appData.ph,
            salt: checkData.value.salt,
            hpa: checkData.value.hpa,
            sat: checkData.value.sat,
            pondCode: '',
            power: '--'
          });
          console.log(JSON.stringify(viewModelBueMain.checkingData()))
        }
      });
    },
    internalChecking: function() {
      var startAutoChecking = function() {
        if (viewModelBueMain.isMonitoring()) {
          return;
        }
        var bueDevice = viewModelBueMain.bueDevice;
        if (!bueDevice) {
          return;
        }

        var bueDeviceId = bueDevice.id;

        if (!viewModelBueMain.deviceOnline()) {
          return;
        }

        var isChecking = false;

        var monitorData = {
          pondCode: null,
          ox: null,
          ph: null,
          water: null,
          power: null,
          hpa: null,
          sat: null,
          salt: null
        };

        if (isChecking) {
          return;
        }

        isChecking = true;
        view.bueLib.startNotification(function(hexResult) {
          console.log('startNotification: ' + hexResult);
          if (hexResult.length > 10 && hexResult.substr(0, 6) == '55aa09') {
            console.log('startNotification: ' + hexResult);

            viewModelBueMain.oxDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(6, 2), 16));
            viewModelBueMain.pHDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(8, 2), 16));
            return;
          }

          var hexObj = getHexString(hexResult);
          if (hexObj.type == 'ox' || hexObj.type == 'ph') {

            if (hexResult != viewModelBueMain.autoCheckingHex) {
              viewModelBueMain.autoCheckingHex = hexResult;
              viewModelBueMain.autoCheckingIsSame = false;
            } else {
              viewModelBueMain.autoCheckingIsSame = true;
            }

            monitorData.ox = hexObj.value.ox;
            monitorData.ph = hexObj.value.ph;
            monitorData.water = hexObj.value.water;
            monitorData.power = hexObj.value.power;
            monitorData.hpa = isNaN(hexObj.value.hpa) ? '' : hexObj.value.hpa;
            monitorData.sat = isNaN(hexObj.value.sat) ? '' : hexObj.value.sat;
            monitorData.salt = isNaN(hexObj.value.salt) ? '' : hexObj.value.salt;
          }

          if (hexObj.type == 'pond') {
            monitorData.pondCode = hexObj.value;
            view.bueLib.stopNotification();
            isChecking = false;
            if (viewModelBueMain.autoCheckingIsSame) {
              view.bueLib.saveCheckData(monitorData, true);
            }
          }
        }, function() {
          isChecking = false;
          console.log('auto checking failed');
        })
      }
      setInterval(function() {
        startAutoChecking();
      }, 1000 * 30);

      startAutoChecking();
    },
    checkDeviceStatus: function() {
      if (viewModelBueMain.isMonitoring()) {
        return;
      }

      console.log('55aa08 ');
      view.bueLib.write('55aa08', function(data) {
        console.log('device status response: ' + JSON.stringify(data));
        if (!data.success) {
          viewModelBueMain.oxDeviceOnline(false);
          viewModelBueMain.pHDeviceOnline(false);
          return;
        }

        // var hexData = toHexString(data.response);
        // console.log('device status: ' + hexData);
        // if (hexData.length < 10) {
        //   viewModelBueMain.oxDeviceOnline(false);
        //   viewModelBueMain.pHDeviceOnline(false);
        //   return;
        // }
        // // 0X55 0XAA 0X09  O1 H1
        // // 55aa09 O1 H1
        // if (hexData.toLowerCase().substr(0, 6) != '55aa09') {
        //   viewModelBueMain.oxDeviceOnline(false);
        //   viewModelBueMain.pHDeviceOnline(false);
        //   return;
        // }
        // viewModelBueMain.oxDeviceOnline(!!parseInt(hexData.toLowerCase().substr(6, 2), 16));
        // viewModelBueMain.pHDeviceOnline(!!parseInt(hexData.toLowerCase().substr(8, 2), 16));
      })
    },
    checkingStatus: function() {
      if (viewModelBueMain.isMonitoring()) {
        return;
      }

      console.log('checkingStatus')
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
            console.log('deviceOnline 1')
            viewModelBueMain.deviceOnline(true);
            view.bueLib.checkDeviceStatus();
          },
          function() {
            console.log('deviceOnline 0')
            viewModelBueMain.deviceOnline(false);
            ble.scan([], 5000, function(device) {
              if (bueDevice.id == device.id) {
                // ble.stopScan();
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
