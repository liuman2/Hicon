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

    // ble.scan([], 10, function(scanDevice) {
    //   console.log(JSON.stringify(scanDevice));

    //   var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    //   if (bueDevice) {
    //     if (bueDevice.id == scanDevice.id) {
    //       hicon.navigation.bueMain();
    //       return;
    //     }
    //   }
    //   var _devices = [];
    //   _devices.push(scanDevice);
    //   viewModelBueScan.bueDevices(_devices);
    // }, function() {
    //   console.log(1111111111)
    // });

    var scanDevice = {
      "name": "TI SensorTag",
      "id": "BD922605-1B07-4D55-8D09-B66653E51BBA",
      "rssi": -79,
    };
    var _devices = [];
    _devices.push(scanDevice);
    viewModelBueScan.bueDevices(_devices);
  };

  view.aftershow = function(e) {

  };

  view.events = {
    skip: function() {
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
          hicon.navigation.bueMain();
          break;
      }
    }
  };
  return view;
}());
