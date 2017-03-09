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

  };

  view.aftershow = function(e) {
    var _devices = [];
    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    if (bueDevice) {
      ble.disconnect(bueDevice.id, null, null);
    }
    ble.startScan([], function(device) {
      if (bueDevice) {
        if (bueDevice.id == device.id) {
          ble.stopScan();
          ble.connect(bueDevice.id, null, null);
          hicon.navigation.bueMain();
          return;
        }
      }
      _devices.push(device);
      viewModelBueScan.bueDevices(_devices);
    }, function() {
      console.log('scan failed')
    });

    setTimeout(ble.stopScan, 30000);
  };

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
