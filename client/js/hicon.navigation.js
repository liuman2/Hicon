var hicon = hicon || {};

hicon.navigation = (function() {

  var self = {};

  self.login = function() {
    $LAB.script('./js/hicon.login.js').wait(function() {
      App.navigate("view/login.html");
    });
  };

  self.register = function() {
    $LAB.script('./js/hicon.area.js')
      .script('./js/hicon.nativeApp.js')
      .script('./js/hicon.register.js').wait(function() {
        App.navigate("view/register.html");
      });
  };

  self.fishingList = function() {
    $LAB.script('./js/hicon.fishingList.js')
      .script('./js/hicon.nativeApp.js')
      .script('./js/hicon.area.js')
      .script('./js/hicon.basic.js')
      .script('./js/hicon.subAccount.js')
      .script('./js/hicon.modifyPwd.js')
      .script('./js/hicon.about.js')
      .script('./js/hicon.log.js').wait(function() {
        App.navigate("view/fishingList.html");
      });
  };

  self.retrieve = function() {
    $LAB.script('./js/hicon.retrieve.js').wait(function() {
      App.navigate("view/retrieve.html");
    });
  };

  self.pond = function() {
    $LAB.script('./js/hicon.pond.js').wait(function() {
      App.navigate("view/pond.html");
    });
  };

  self.pondEdit = function() {
    $LAB.script('./js/hicon.pondEdit.js').wait(function() {
      App.navigate('view/pondEdit.html');
    });
  };

  self.timer = function() {
    $LAB.script('./js/hicon.timer.js').wait(function() {
      App.navigate("view/timer.html");
    });
  };

  self.timerAdd = function() {
    $LAB
    /*.script('vendor/mobiscroll/css/mobiscroll.core-2.5.2.css').wait()
            .script('vendor/mobiscroll/css/mobiscroll.animation-2.5.2.css').wait()*/
      .script('vendor/mobiscroll/js/mobiscroll.core-2.5.2.js').wait()
      .script('vendor/mobiscroll/js/mobiscroll.core-2.5.2-zh.js').wait()
      .script('vendor/mobiscroll/js/mobiscroll.datetime-2.5.1.js').wait()
      .script('vendor/mobiscroll/js/mobiscroll.datetime-2.5.1-zh.js').wait()
      .script('./js/hicon.timerAdd.js').wait(function() {
        App.navigate("view/timerAdd.html");
      });
  };

  self.basic = function() {
    $LAB.script('./js/hicon.area.js')
      .script('./js/hicon.basic.js').wait(function() {
        App.navigate("view/basic.html");
      });
  };

  self.log = function() {
    $LAB.script('./js/hicon.log.js').wait(function() {
      App.navigate("view/log.html");
    });
  };

  self.subAccount = function() {
    $LAB.script('./js/hicon.subAccount.js').wait(function() {
      App.navigate("view/subAccount.html");
    });
  };

  self.curve = function() {
    $LAB.script("vendor/highcharts/highcharts.js").wait()
      .script("vendor/highcharts/dark-green.js").wait()
      .script('./js/hicon.curve.js').wait(function() {
        App.navigate("view/curve.html");
      });
  };

  self.deviceCurve = function() {
    $LAB.script("vendor/highcharts/highcharts.js").wait()
      .script("vendor/highcharts/dark-green.js").wait()
      .script('./js/hicon.deviceCurve.js').wait(function() {
        App.navigate("view/deviceCurve.html");
      });
  };

  self.deviceLog = function() {
    $LAB.script('./js/hicon.deviceLog.js').wait(function() {
      App.navigate("view/deviceLog.html");
    });
  };

  self.main = function() {
    $LAB.script('./js/hicon.main.js')
      .script('./js/hicon.nativeApp.js')
      .script('./js/hicon.area.js')
      .script('./js/hicon.basic.js')
      .script('./js/hicon.subAccount.js')
      .script('./js/hicon.modifyPwd.js')
      .script('./js/hicon.about.js')
      .script('./js/hicon.log.js').wait(function() {
        App.navigate("view/main.html");
      });
  };

  self.monitor = function() {
    $LAB.script('http://ditu.google.cn/maps/api/js?sensor=false&language=zh-CN&libraries=places')
      .script('./js/hicon.monitor.js').wait(function() {
        App.navigate("view/monitor.html");
      });
  };
  self.controllerEdit = function() {
    $LAB.script('./js/hicon.controllerEdit.js').wait(function() {
      App.navigate("view/controllerEdit.html");
    });
  };

  self.controller = function() {
    $LAB.script('./js/hicon.controller.js').wait(function() {
      App.navigate("view/controller.html");
    });
  };

  self.subAccountPond = function() {
    $LAB.script('./js/hicon.subAccountPond.js').wait(function() {
      App.navigate("view/subAccountPond.html");
    });
  };

  self.pondSelect = function() {
    $LAB.script('./js/hicon.pondSelect.js').wait(function() {
      App.navigate("view/pondSelect.html");
    });
  };

  self.help = function() {
    $LAB.script('./js/hicon.help.js').wait(function() {
      App.navigate("view/help.html");
    });
  };

  self.bueScan = function() {
    $LAB.script('./js/hicon.bueScan.js').wait(function() {
      App.navigate("view/bueScan.html");
    });
  };

  self.bueMain = function() {
    $LAB.script('./js/hicon.bueMain.js').wait(function() {
      App.navigate("view/bueMain.html");
    });
  };

  self.buePond = function() {
    $LAB.script('./js/hicon.buePond.js').wait(function() {
      App.navigate("view/buePond.html");
    });
  };

  self.bueHistory = function() {
    $LAB.script('./js/hicon.bueHistory.js').wait(function() {
      App.navigate("view/bueHistory.html");
    });
  };

  return self;
}());
