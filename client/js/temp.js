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

    view.bueLib.startNotification(function(hexResult) {
      view.bueLib.stopNotification();
      console.log('55aa08 startCheck:' + hexResult)
      if (hexResult.length > 10 && hexResult.substr(0, 6) == '55aa09') {
        console.log('startNotification: ' + hexResult);

        viewModelBueMain.oxDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(6, 2), 16));
        viewModelBueMain.pHDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(8, 2), 16));
        return;
      }

    }, function() {
      console.log('55aa08 failed' + JSON.stringify(arguments));
      view.bueLib.stopNotification();
    })
  })
}

startCheck: function(sendData) {
  view.bueLib.write(sendData, function(data) {
    if (data.success) {
      view.bueLib.startNotification(function(hexResult) {
        console.log('startCheck:' + hexResult)
        if (hexResult.length < 5 && (hexResult.substring(0, 4).toLowerCase() != '55aa01' || hexResult.substring(0, 4).toLowerCase() != '55aa02')) {
          return;
        }

        var HexObj = hicon.utils.getHexString(hexResult);
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
        view.bueLib.saveCheckData({
          ox: HexObj.value.ox,
          ph: HexObj.value.ph,
          water: HexObj.value.water,
          power: HexObj.value.power,
          hpa: HexObj.value.hpa,
          sat: HexObj.value.sat,
          salt: HexObj.value.salt,
          pondCode: currentPond.code
        }, false);
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
}

internalChecking: function() {
  console.log('internalChecking 01')
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
    console.log('internalChecking 02')
    isChecking = true;
    view.bueLib.startNotification(function(hexResult) {
      console.log('internalChecking 03')
      console.log('startNotification: ' + hexResult);
      if (hexResult.length >= 40 && hexResult.substr(0, 6) == '55aa09') {
        view.bueLib.stopNotification();
        return;
      }
      if (hexResult.length > 10 && hexResult.substr(0, 6) == '55aa09') {
        console.log('startNotification: ' + hexResult);

        viewModelBueMain.oxDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(6, 2), 16));
        viewModelBueMain.pHDeviceOnline(!!parseInt(hexResult.toLowerCase().substr(8, 2), 16));
        return;
      }

      var hexObj = hicon.utils.getHexString(hexResult);
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
        if (!viewModelBueMain.autoCheckingIsSame) {
          view.bueLib.saveCheckData(monitorData, true);
        }
      }
    }, function() {
      console.log('internalChecking 04')
      isChecking = false;
      console.log('auto checking failed');
    })
  }
  setInterval(function() {
    startAutoChecking();
  }, 1000 * 30);

  startAutoChecking();
  console.log('internalChecking 06')
}

saveCheckData: function(checkData, isInternal) {
  console.log(JSON.stringify(checkData))
  hicon.db.getPondByCode(checkData.pondCode, function(pond) {
    if (pond == null) {
      hicon.db.insertPond({
        code: checkData.pondCode,
        name: '',
        salt: isNaN(checkData.salt) ? '' : checkData.salt
      });
    }
  });

  var hex = {
    ox: checkData.ox,
    water: checkData.water,
    ph: checkData.ph,
  };
  console.log(JSON.stringify(hex))
  window.nativeApp.Hex2Float(hex, function(data) {
    var appData = JSON.parse(data);
    console.log(JSON.stringify(data))
    var newDate = new Date();

    hicon.db.insertHistory({
      code: checkData.pondCode,
      dateCreated: moment(newDate).format('YYYY-MM-DD HH:mm'),
      oxygen: ((isNaN(appData.ox) ? '' : appData.ox) - 0.0).toFixed(2),
      water: ((isNaN(appData.water) ? '' : appData.water) - 0.0).toFixed(2),
      ph: ((isNaN(appData.ph) ? '' : appData.ph) - 0.0).toFixed(2),
      saturation: isNaN(checkData.sat) ? '' : checkData.sat,
      hpa: isNaN(checkData.hpa) ? '' : checkData.hpa
    });

    if (!isInternal) {
      console.log("isInternal")
      console.log("data.ox " + appData.ox)
      console.log("data.ph " + appData.ph)
      console.log("data.ph " + ((isNaN(appData.ph) ? '' : appData.ph) - 0.0).toFixed(2))
      viewModelBueMain.checkingData({
        ox: ((isNaN(appData.ox) ? '' : appData.ox) - 0.0).toFixed(2),
        water: ((isNaN(appData.water) ? '' : appData.water) - 0.0).toFixed(2),
        ph: ((isNaN(appData.ph) ? '' : appData.ph) - 0.0).toFixed(2),
        salt: checkData.salt,
        hpa: checkData.hpa,
        sat: checkData.sat,
        pondCode: '',
        power: '--'
      });
      console.log(JSON.stringify(viewModelBueMain.checkingData()))
    }
  });
}
