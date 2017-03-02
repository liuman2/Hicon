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

  function hexStringToByte(str) {
    var a = [];
    for (var i = 0; i < str.length; i += 2) {
      a.push("0x" + str.substr(i, 2));
    }
    return a;
  }

  function hex2decimal(hex) {
    var arrs = hexStringToByte(hex);
    // parseInt(h,16)
    if (hex.length > 4) {
      // 检测类型:01-溶氧, 02-PH
      var typeId = hex.substr(4, 2);
      return {
        type: typeId == '01' ? 'ox' : 'ph',
        value: {
          ox: parseInt(arrs[3] + '' + arrs[4] + '' + arrs[5] + '' + arrs[6], 16),
          ph: parseInt(arrs[3] + '' + arrs[4] + '' + arrs[5] + '' + arrs[6], 16),
          water: parseInt(arrs[7] + '' + arrs[8] + '' + arrs[9] + '' + arrs[10], 16),
          power: parseInt(arrs[11] + '' + arrs[12] + '' + arrs[13] + '' + arrs[14], 16),
          hpa: parseInt(arrs[15] + '' + arrs[16], 16), // 气压值
          sat: parseInt(arrs[17] + '' + arrs[18], 16), // 饱和度
          salt: parseInt(arrs[19], 16), // 盐度
        }
      }
    } else {
      return {
        type: 'pond',
        value: parseInt(arrs[0], 16)
      }
    }
  }

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.bueOnline = ko.observable(false);
    self.netWorkOnline = ko.observable(hicon.utils.main.isOnLine());
    self.deviceOnline = ko.observable(false);
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
  };

  view.init = function() {
    viewModelBueMain = new view.defineModel();
    ko.applyBindings(viewModelBueMain, document.getElementById("buemain"));
  };

  view.show = function(e) {};

  view.aftershow = function(e) {
    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    setInterval(function() {
      // 检测蓝牙状态
      ble.isEnabled(function() {
        viewModelBueMain.bueOnline(true);
      }, function() {
        viewModelBueMain.bueOnline(false);
      });

      // 检测网络状态
      viewModelBueMain.netWorkOnline(hicon.utils.main.isOnLine());

      // 传感器状态
      if (bueDevice) {
        ble.isConnected(
          bueDevice.id,
          function() {
            viewModelBueMain.deviceOnline(true);
          },
          function() {
            viewModelBueMain.deviceOnline(false);
          }
        );
      }
    }, 1000);

    view.bueLib.internalChecking();

    var device = hicon.localStorage.getJson('BUE_DEVICE');
    if (device) {

      ble.connect(device.id, function() {
        console.log('connect')
        console.log(JSON.stringify(arguments))
      }, function() {
        console.log('un connect')
        console.log(JSON.stringify(arguments))
      });

      viewModelBueMain.bueDevice = device;
    }
    var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
    if (currentPond) {
      viewModelBueMain.currentPond(currentPond);
    }
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
        case 'monitor':
          if ($('#btnMonitor').html() != '开始测水') {
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

          var bueDeviceId = viewModelBueMain.bueDevice.id;
          if (!bueDeviceId) {
            hicon.utils.alert({
              message: '您还没选择设备',
              ok: function() {
                hicon.navigation.bueScan();
              }
            })
            return;
          }

          var monitorData = {
            pondCode: currentPond.code,
            ox: null,
            ph: null,
            water: null,
            power: null,
            hpa: null,
            sat: null,
            salt: null
          };

          var startCheck = function(sendData) {
            view.bueLib.write(sendData, function(data) {
              if (data.success) {
                view.bueLib.startNotification(function(hexResult) {
                  if (hexResult.length < 5 && hexResult.substring(0, 4).toLowerCase() != '55aa01') {
                    var decResult = hex2decimal(hexResult);

                    return;
                  }

                  // 检测返回 hex转decimal
                  var decResult = hex2decimal(hexResult);
                  if (decResult.type == 'ox') {
                    view.bueLib.stopNotification();
                    monitorData.ox = decResult.value.ox;
                    monitorData.water = decResult.value.water;
                    monitorData.power = decResult.value.power;
                    monitorData.hpa = decResult.value.hpa;
                    monitorData.sat = decResult.value.sat;
                    monitorData.salt = decResult.value.sat;
                    viewModelBueMain.checkingData(monitorData);
                    setTimeout(function() {
                      $('#btnMonitor').html('pH检测中...');
                      startCheck('55aa23');
                    }, 1000);
                  }
                  if (decResult.type == 'ph') {
                    view.bueLib.stopNotification();
                    monitorData.ph = decResult.value.ph;
                    viewModelBueMain.checkingData(monitorData);
                    $('#btnMonitor').html('开始测水');
                    view.bueLib.saveCheckData(monitorData);
                  }
                }, function() {
                  console.log('failed');
                  if (sendData == '55aa21') {
                    view.bueLib.stopNotification();
                    $('#btnMonitor').html('溶氧检测失败...');
                    setTimeout(function() {
                      $('#btnMonitor').html('pH检测中...');
                      startCheck('55aa23');
                    }, 2000);
                  }
                  if (sendData == '55aa23') {
                    view.bueLib.stopNotification();
                    $('#btnMonitor').html('pH检测失败...');
                    setTimeout(function() {
                      $('#btnMonitor').html('开始测水');
                      viewModelBueMain.checkingData(monitorData);
                      view.bueLib.saveCheckData(monitorData);
                    }, 2000);
                  }
                })
              }
            })
          }

          $('#btnMonitor').html('溶氧检测中...');
          //检测溶氧
          var checkCode = '55aa21';
          startCheck(checkCode);
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
        callback({
          success: false
        });
      }

      var sendData = stringToBytes(hex2a(data));

      var bueDeviceId = viewModelBueMain.bueDevice.id;
      ble.write(bueDeviceId, service_uuid, characteristic_uuid, sendData, success, failure);
    },
    saveCheckData: function(checkData) {
      hicon.db.getPondByCode(checkData.pondCode, function(pond) {
        if (pond == null) {
          hicon.db.insertPond({
            code: checkData.pondCode,
            name: '',
            salt: checkData.salt || ''
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
    },
    internalChecking: function() {
      var startAutoChecking = function() {
        if ($('#btnMonitor').html() != '开始测水') {
          return;
        }
        var bueDeviceId = viewModelBueMain.bueDevice.id;
        if (!bueDeviceId) {
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
          // 检测返回 hex转decimal
          var decResult = hex2decimal(hexResult);
          if (decResult.type == 'ox') {
            monitorData.ox = decResult.value.ox;
            monitorData.ph = null;
            monitorData.water = decResult.value.water;
            monitorData.power = decResult.value.power;
            monitorData.hpa = decResult.value.hpa;
            monitorData.sat = decResult.value.sat;
            monitorData.salt = decResult.value.sat;
          }
          if (decResult.type == 'ph') {
            monitorData.ox = null;
            monitorData.ph = decResult.value.ph;
            monitorData.water = decResult.value.water;
            monitorData.power = decResult.value.power;
            monitorData.hpa = decResult.value.hpa;
            monitorData.sat = null;
            monitorData.salt = decResult.value.sat;
          }

          if (decResult.type == 'pond') {
            monitorData.pondCode = decResult.value;
            view.bueLib.stopNotification();
            isChecking = false;
            if (monitorData.ox != 0 || monitorData.ph != 0) {
              view.bueLib.saveCheckData(monitorData);
            }
          }
        }, function() {
          isChecking = false;
          console.log('auto checking failed');
        })
      }
      setInterval(function() {
        startAutoChecking();
      }, 1000 * 60);

      startAutoChecking();
    }
  }

  return view;
}());
