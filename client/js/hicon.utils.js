var hicon = hicon || {};
hicon.utils = hicon.utils || {};


hicon.utils.noty = function(cfg) {
  return noty({
    text: cfg.text,
    type: cfg.type || 'error',
    dismissQueue: true,
    layout: cfg.layout || 'bottomCenter',
    closeWith: ['click'],
    theme: 'relax',
    maxVisible: 3,
    timeout: cfg.timeout || 3000,
    animation: {
      open: 'animated flipInX',
      close: 'animated flipOutX',
      easing: 'swing',
      speed: 500
    },
    callback: cfg.callack
  });
};

hicon.utils.aiGets = function(userId, pondId, callback) {
  hicon.server.ajax({
    url: 'AiGets',
    type: 'post',
    data: {
      UserID: userId,
      PondID: pondId
    },
    success: function(data) {
      callback(data);
    }
  });
};

hicon.utils.confirm = function(cfg) {
  $.Zebra_Dialog(cfg.message, {
    type: cfg.type || 'question',
    title: cfg.title || '请确认',
    modal: true,
    center_buttons: false,
    overlay_close: false,
    width: 250,
    height: 800,
    buttons: [{
      caption: '确定',
      callback: cfg.ok
    }, {
      caption: '取消',
      callback: cfg.cancel || $.noop
    }]
  });
};

hicon.utils.alert = function(cfg) {
  $.Zebra_Dialog(cfg.message, {
    type: cfg.type || 'question',
    title: cfg.title || '提醒',
    modal: true,
    center_buttons: false,
    overlay_close: false,
    width: 250,
    height: 800,
    buttons: [{
      caption: '确定',
      callback: cfg.ok
    }]
  });
};

hicon.utils.newGuid = function() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

hicon.utils.getAiParamCls = function(aiName) {
  if (aiName.indexOf('orp') >= 0) {
    return 'param_orp';
  }
  if (aiName.indexOf('ph') >= 0) {
    return 'param_ph';
  }
  if (aiName.indexOf('氨氮') >= 0) {
    return 'param_an';
  }
  if (aiName.indexOf('饱和度') >= 0) {
    return 'param_sat';
  }
  if (aiName.indexOf('电导率') >= 0) {
    return 'param_tds';
  }
  if (aiName.indexOf('光强度') >= 0) {
    return 'param_cd';
  }
  if (aiName.indexOf('蓝绿藻') >= 0) {
    return 'param_bga';
  }
  if (aiName.indexOf('磷酸盐') >= 0) {
    return 'param_pbs';
  }
  if (aiName.indexOf('硫化氢') >= 0) {
    return 'param_h2s';
  }
  if (aiName.indexOf('气压') >= 0) {
    return 'param_pat';
  }
  if (aiName.indexOf('溶解氧') >= 0) {
    return 'param_do';
  }
  if (aiName.indexOf('水流') >= 0) {
    return 'param_wf';
  }
  if (aiName.indexOf('水深') >= 0) {
    return 'param_wd';
  }
  if (aiName.indexOf('水位') >= 0) {
    return 'param_wl';
  }
  if (aiName.indexOf('水温') >= 0) {
    return 'param_wt';
  }
  if (aiName.indexOf('硝酸盐') >= 0) {
    return 'param_ntg';
  }
  if (aiName.indexOf('亚硝盐') >= 0) {
    return 'param_nit';
  }
  if (aiName.indexOf('盐度') >= 0) {
    return 'param_sal';
  }
  if (aiName.indexOf('叶绿素') >= 0) {
    return 'param_spad';
  }
  if (aiName.indexOf('浊度') >= 0) {
    return 'param_ntu';
  }
};

hicon.utils.getDeviceCls = function(dName) {
  if (dName.indexOf('增氧机') >= 0) {
    return 'device_zy';
  }

  if (dName.indexOf('投饵机') >= 0) {
    return 'device_te';
  }

  if (dName.indexOf('水泵') >= 0) {
    return 'device_js';
  }
};

hicon.utils.getElevationForLocations = function(lat, lng, callback) {
  var myPt = new google.maps.LatLng(lat, lng);
  var a = new google.maps.ElevationService();
  a.getElevationForLocations({
    locations: [myPt]
  }, function(results, status) {
    if (status === google.maps.ElevationStatus.OK) {
      if (results[0]) {
        callback(Math.round(results[0].elevation));
      } else {
        callback(-1)
      }
    } else {
      callback(-1)
    }
  });
};

hicon.utils.detectUA = function($, userAgent) {
  $.os = {};
  $.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
  $.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
  $.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
  $.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
  $.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
  $.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
  $.os.ios = $.os.ipad || $.os.iphone;
  $.os.blackberry = userAgent.match(/BlackBerry/) || userAgent.match(/PlayBook/) ? true : false;
  $.os.opera = userAgent.match(/Opera Mobi/) ? true : false;
  $.os.fennec = userAgent.match(/fennec/i) ? true : false;
  $.os.desktop = !($.os.ios || $.os.android || $.os.blackberry || $.os.opera || $.os.fennec);
  $.os.agent = userAgent;
  $.os.ismobile = (/iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(navigator.userAgent.toLowerCase()));
  $.os.istablet = hicon.utils.DetectOs.istablet();
};

hicon.utils.checkAppVersion = function(showMsg) {
  $.getJSON('http://m.xmhicon.com/app/app_version.json?timeStamp=' + new Date().getTime(), {
    format: "json"
  }).done(function(data) {
    var serverVersion = hicon.utils.os.android ? data.android.version : data.iOS.version,
      isForced = hicon.utils.os.android ? data.android.forced : data.iOS.forced,
      upgrateUrl = hicon.utils.os.android ? data.android.url : data.iOS.url;

    if (serverVersion != '0.1.8') {
      hicon.utils.confirm({
        message: (isForced === true || isForced === 'true') ? '发现新版本，必须升级后才能继续使用软件' : '发现新版本，是否立即升级?',
        ok: function() {
          if (hicon.utils.os.android) {
            window.nativeApp.updateApp();
          } else {
            window.open(upgrateUrl, '_blank', 'location=yes,closebuttoncaption=返回');
          }
        },
        cancel: function() {
          if (isForced === true || isForced === 'true') {
            navigator.app.exitApp();
          }
        }
      });
    } else {
      if (showMsg) {
        var cfg = {
          text: '当前已经是最新版本',
          type: 'success'
        };
        hicon.utils.noty(cfg);
      }
    }
  });
}

hicon.utils.DetectOs = {
  istablet: function() {
    if (hicon.utils.os.ipad || this.isAndroidTablet()) {
      return true;
    } else {
      return false;
    }

  },
  isAndroidTablet: function() {
    //First, let's make sure we're on an Android device.
    if (!hicon.utils.os.android)
      return false;
    var uagent = navigator.userAgent.toLowerCase();
    //Special check for the HTC Flyer 7" tablet. It should NOT report here.
    if (uagent.search("htc_flyer") > -1)
      return false;

    //Otherwise, if it's Android and does NOT have 'mobile' in it, Google says it's a tablet.
    if (uagent.search("mobile") > -1)
      return false;
    else
      return true;
  }
};

hicon.utils.detectUA(hicon.utils, navigator.userAgent);

hicon.utils.isNativeApp = function() {
  return window.cordova !== undefined;
};

hicon.utils.dateFormat = function() {
  // init argument
  var date, str;
  for (var i in arguments) {
    var obj = arguments[i];
    if (typeof obj === 'string') {
      str = obj;
    } else if (obj instanceof Date) {
      date = obj;
    }
  }
  date = date || new Date();
  str = str || 'yyyy-mm-dd'

  // year
  str = str.replace(/yyyy/g, date.getFullYear());

  // month
  var month = date.getMonth() + 1;
  if (month < 10) { month = "0" + month; }
  str = str.replace(/mm/g, month);

  // date
  var data = date.getDate();
  if (data < 10) { data = "0" + data; }
  str = str.replace(/dd/g, data);

  // hour
  var hour = date.getHours();
  hour = hour < 10 ? ('0' + hour) : hour;
  str = str.replace(/HH/g, hour);

  // minute
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  str = str.replace(/MM/g, minute);

  // second
  var second = date.getSeconds();
  second = second < 10 ? ('0' + second) : second;
  str = str.replace(/SS/g, second);

  var week = function() {
    var _week = '星期';
    switch (date.getDay()) {
      case 0:
        _week += '日';
        break;
      case 1:
        _week += '一';
        break;
      case 2:
        _week += '二';
        break;
      case 3:
        _week += '三';
        break;
      case 4:
        _week += '四';
        break;
      case 5:
        _week += '五';
        break;
      case 6:
        _week += '六';
        break;
      default:
        _week += '日';
        break;
    }
    return _week;
  }();
  str = str.replace(/wk/g, week);
  return str;
};

hicon.utils.getRequest = function(name, href) {
  var reg = new RegExp("(^|\\?|&|#)" + name + "=([^&#]*)(\\s|&|#|$)", "i");
  if (reg.test(href || window.location.href)) return RegExp.$2.replace(/\+/g, " ");
};

hicon.utils.addDays = function(d, m) {
  var date = new Date(d.replace(/-/gi, '/'));
  date.setDate(date.getDate() + m);
  return hicon.utils.dateFormat(date, 'yyyy-mm-dd');
};

hicon.utils.addMonths = function(d, m) {
  var date = new Date(d.replace(/-/gi, '/'));
  date.setMonth(date.getMonth() + m);

  return hicon.utils.dateFormat(date, 'yyyy-mm-dd');
};

hicon.utils.toHexString = function(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
};

hicon.utils.stringToBytes = function(str) {
  var array = new Uint8Array(str.length);
  for (var i = 0, l = str.length; i < l; i++) {
    array[i] = str.charCodeAt(i);
  }
  return array.buffer;
};

hicon.utils.hex2a = function(hexx) {
  var hex = hexx.toString(); //force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
};

hicon.utils.getHexString = function(hex) {
  //         溶氧值/ph  水温      电量  气压  饱和度  盐度  池编号  校验值
  // 55AA01  EDD23841   00809D41  00AE  03F6  0080    00    08      C8
  return {
    ox: hexResult.substr(0, 6).toLowerCase() == '55aa01' ? hex.substr(6, 8) : '00000000',
    ph: hexResult.substr(0, 6).toLowerCase() == '55aa02' ? hex.substr(6, 8) : '00000000',
    water: hex.substr(14, 8),
    power: parseInt(hex.substr(22, 4), 16),     // 电量
    hpa: parseInt(hex.substr(26, 4), 16),       // 气压值
    sat: parseInt(hex.substr(30, 4), 16),       // 饱和度
    salt: parseInt(hex.substr(34, 2), 16),      // 盐度
    pondCode: parseInt(hex.substr(36, 2), 16),  // 池编号
  }
};

hicon.utils.main = (function() {
  var self = {};
  self.isOnLine = ko.observable(navigator.connection === undefined || (navigator.connection.type != Connection.NONE && navigator.connection.type != Connection.UNKNOWN)); //ems.utils.isOnLine());
  var offlineHandler = function() {
      self.isOnLine(false);
    },
    onlineHandler = function() {
      self.isOnLine(true);
    },
    addOnlineOfflineHandlers = function() {
      document.addEventListener("offline", offlineHandler, false);
      document.addEventListener("online", onlineHandler, false);
    };

  document.addEventListener("deviceready", function() {
    document.addEventListener("resume", addOnlineOfflineHandlers, false);

    $(document).on('pause unload reload', function() {
      document.removeEventListener('offline', offlineHandler, false);
      document.removeEventListener('online', offlineHandler, false);
    });
  }, false);

  addOnlineOfflineHandlers();

  window.addEventListener('offline', offlineHandler, false);
  window.addEventListener('online', onlineHandler, false);

  return self;
}());
