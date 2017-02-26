var hicon = hicon || {};
var viewModelBueMain = null;

hicon.bueMain = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.bueOnline = ko.observable(false);
    self.netWorkOnline = ko.observable(hicon.utils.main.isOnLine());
    self.deviceOnline = ko.observable(false);
  };

  view.init = function() {
    viewModelBueMain = new view.defineModel();
    ko.applyBindings(viewModelBueMain, document.getElementById("buemain"));
  };

  view.show = function(e) {};

  view.aftershow = function(e) {
    var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
    if (bueDevice) {
	  console.log(JSON.stringify(bueDevice));
      ble.connect(bueDevice.id, function() {
        console.log('connect')
        console.log(JSON.stringify(arguments))
      }, function() {
        console.log('un connect')
        console.log(JSON.stringify(arguments))
      });

      ble.startStateNotifications(
        function(state) {
          console.log("Bluetooth is " + state);
        }
      );
    }

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


  };
  
    function toHexString(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }

  view.events = {
    doBack: function() {
      // hicon.navigation.main();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      switch (commandKey) {
        case 'pond':
          hicon.navigation.buePond();
          break;
        case 'history':
          hicon.navigation.bueHistory();
          break;
        case 'test':
        var bueDevice = hicon.localStorage.getJson('BUE_DEVICE');
          //ble.read(bueDevice.id, '1800', '2a00', function() {
          //  console.log(JSON.stringify(arguments))
          //}, function() {
		  //  console.log(JSON.stringify(arguments))
          //});
          
          //ble.read(bueDevice.id, '0000180a-0000-1000-8000-00805f9b34fb', '00002a24-0000-1000-8000-00805f9b34fb', function(data) {
          //  console.log()
          //  var s = String.fromCharCode.apply(null, new Uint8Array(data))
          //  console.log(s)
          //  alert(s)
          //  var a = new Uint8Array(data);
          //  console.log(JSON.stringify(a))
        	
          //}, function() {
			//console.log(JSON.stringify(arguments))
          //});
          
          ble.startNotification(bueDevice.id, '0000ffe0-0000-1000-8000-00805f9b34fb', '0000ffe1-0000-1000-8000-00805f9b34fb', function(data) {
            //var s = String.fromCharCode.apply(null, new Uint8Array(data))
            //console.log(s)
            // var  buffer = new Uint8Array(data).buffer;
            
            console.log(JSON.stringify(new Uint8Array(data)))
            
                        
			console.log(toHexString(data)); // = 04080c10

          }, function() {
			console.log(JSON.stringify(arguments))
          });
          
          break;
      }
    }
  };
  return view;
}());
