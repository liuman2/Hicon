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

    // function parseHexString(str) {
    //   var result = [];
    //   while (str.length >= 8) {
    //     result.push(parseInt(str.substring(0, 8), 16));

    //     str = str.substring(8, str.length);
    //   }
    //   return result;
    // }
    // function createHexString(arr) {
    //   var result = "";
    //   var z;
    //   for (var i = 0; i < arr.length; i++) {
    //     var str = arr[i].toString(16);

    //     z = 8 - str.length + 1;
    //     str = Array(z).join("0") + str;

    //     result += str;
    //   }
    //   return result;
    // }

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
            //
            view.bueLib.write('', function(data) {
              console.log(data)
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
                  hicon.navigation.bueScan);
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
                hicon.navigation.bueScan);
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
            hicon.navigation.bueScan);
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
  ble.write(bueDeviceId, service_uuid, characteristic_uuid, data, success, failure);
}
}
return view;
}());
