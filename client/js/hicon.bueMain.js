var hicon = hicon || {};
var viewModelBueMain = null;

hicon.bueMain = (function() {

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
  };

  view.init = function() {
    viewModelBueMain = new view.defineModel();
    ko.applyBindings(viewModelBueMain, document.getElementById("buemain"));
  };

  view.show = function(e) {};

  view.aftershow = function(e) {
    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    // setInterval(function() {
    //   // 检测蓝牙状态
    //   ble.isEnabled(function() {
    //     viewModelBueMain.bueOnline(true);
    //   }, function() {
    //     viewModelBueMain.bueOnline(false);
    //   });

    //   // 检测网络状态
    //   viewModelBueMain.netWorkOnline(hicon.utils.main.isOnLine());

    //   // 传感器状态
    //   if (bueDevice) {
    //     ble.isConnected(
    //       bueDevice.id,
    //       function() {
    //         viewModelBueMain.deviceOnline(true);
    //       },
    //       function() {
    //         viewModelBueMain.deviceOnline(false);
    //       }
    //     );
    //   }
    // }, 1000);

    var device = hicon.localStorage.getJson('BUE_DEVICE');
    if (device) {
      viewModelBueMain.bueDevice = device;
    }
    var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
    if (currentPond) {
      viewModelBueMain.currentPond(currentPond);
    }
  };

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
          hpa: parseInt(arrs[15] + '' + arrs[16] , 16),
          sat: parseInt(arrs[17] + '' + arrs[18] , 16), // 饱和度
          salt: parseInt(arrs[19] , 16), // 盐度
        }
      }
    } else {
      return {
        type: 'pond',
        value: parseInt(arrs[0], 16)
      }
    }
  }

  view.events = {
    doBack: function() {
      // hicon.navigation.main();
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

          $('#btnMonitor').html('检测中...');
          //检测溶氧
          view.bueLib.write('55aa21', function(data) {
            if (data.success) {

            }
          });
          break;
      }
    }
  };

  view.bueLib = {
    startNotification: function() {
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

      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      var success = function(response) {
        var hexData = toHexString(data);
      };
      var failure = function() {
        console.log(JSON.stringify(arguments))
      }
      ble.startNotification(bueDevice.id, service_uuid, characteristic_uuid, success, failure);
    },
    stopNotification: function() {
      var bueDeviceId = viewModelBueMain.bueDevice.id;
      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      ble.stopNotification(bueDeviceId, service_uuid, characteristic_uuid, null, null);
    },
    writeWithoutResponse: function(data) {
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
      var service_uuid = viewModelBueMain.service_uuid;
      var characteristic_uuid = viewModelBueMain.characteristic_uuid;
      var success = function(response) {

      };
      var failure = function(response) {

      }
      ble.writeWithoutResponse(bueDeviceId, service_uuid, characteristic_uuid, data, success, failure);
    },
    write: function(data, callback) {
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

      var sendData = stringToBytes(hex2a('55aa23'));

      ble.write(bueDeviceId, service_uuid, characteristic_uuid, sendData, success, failure);
    }
  }
  return view;
}());
