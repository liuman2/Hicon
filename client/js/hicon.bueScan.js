var hicon = hicon || {};
var viewModelBueScan = null;

hicon.bueSacn = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.bueDevices = ko.observableArray([]);
  };

  view.init = function() {
    viewModelBueScan = new view.defineModel();
    ko.applyBindings(viewModelBueScan, document.getElementById("buescan"));
  };

  view.show = function(e) {
    var _devices = [];
    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    ble.startScan([], function(device) {
      if (bueDevice) {
        if (bueDevice.id == device.id) {
          ble.stopScan();
          hicon.navigation.bueMain();
          return;
        }
      }
      _devices.push(device);
      viewModelBueScan.bueDevices(_devices);
    }, function() {
      console.log('scan failed')
    });

    setTimeout(ble.stopScan,
      30000,
      function() {
        if (!_devices.length) {
          var cfg = {
            text: '没有扫描到蓝牙设备',
            type: 'error'
          };
          hicon.utils.noty(cfg);
        }
      },
      function() {
        var cfg = {
          text: '没有扫描到蓝牙设备',
          type: 'error'
        };
        hicon.utils.noty(cfg);
      }
    );
  };

  view.aftershow = function(e) {};

  view.events = {
    skip: function() {
      ble.stopScan();
      hicon.navigation.bueMain();
    },
    doBack: function() {
      // hicon.navigation.main();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

      switch (commandKey) {
        case 'deviceClick':
          var device = ko.dataFor(e.target.closest("li")[0]);
          hicon.localStorage.saveJson('BUE_DEVICE', device);
          ble.stopScan();
          hicon.navigation.bueMain();
          break;
      }
    }
  };
  return view;
}());
