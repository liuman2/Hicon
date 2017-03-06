var hicon = hicon || {};

var modelViewLogin = null;

hicon.login = (function() {

  var view = {};
  view.show = function(e) {

    document.addEventListener("deviceready", function() {
      window.plugins.jPushPlugin.getRegistrationID(function(regId) {
        if (regId) {
          hicon.localStorage.item('REG_ID', regId);
        }
      });
    });

    var loginUser = hicon.localStorage.getJson('LOGIN_USER');
    if (loginUser) {
      $('#username').val(loginUser.username);
      $('#password').val(loginUser.password);
      $('#chkRember').prop('checked', loginUser.password != '');
      if (loginUser.identity != null) {
        $('#identity').val(loginUser.identity);
      };
    }
  };

  view.events = {
    doLogin: function() {
      var isValid = view.loginValidate();
      if (!isValid) {
        return false;
      }
      App.showLoading();
      hicon.server.ajax({
        url: 'UserLogin',
        type: 'post',
        data: {
          UserNO: $('#username').val(),
          Pwd: $('#password').val(),
          ClientType: hicon.utils.os.ios ? 2 : 1,
          ClientName: hicon.localStorage.item('REG_ID') || '',
          Lang: 'cn'
        },
        success: function(data) {
          App.hideLoading();
          if (!data.Result) {
            var cfg = {
              text: data.ErrorMsg ? data.ErrorMsg : '登录失败，请稍后再试。',
              type: 'error'
            };

            hicon.utils.noty(cfg);
            return;
          }

          // 设置设备别名
          if (hicon.utils.isNativeApp()) {
            window.plugins.jPushPlugin.setAlias($.trim($('#username').val()));
          }

          var loginUser = {
            username: $('#username').val(),
            password: $('#chkRember').prop('checked') ? $('#password').val() : '',
            identity: $('#identity').val(),
            autoLogin: false
          };

          hicon.localStorage.saveJson('LOGIN_USER', loginUser);
          hicon.sessionStorage.item('IDENTITY', $('#identity').val());
          var user = data.Model;
          hicon.localStorage.saveJson('USER_INFO', user);

          if ($('#identity').val() == 99) {
            $LAB.script("js/hicon.db.js").wait(function() {
              ble.enable();
              hicon.navigation.bueScan();
            });
            return;
          }

          hicon.sessionStorage.item('CURRENT_INDEX_POND', 0);
          hicon.navigation.main();
          view.getTimerInterval(user.UserID)
        },
        error: function() {
          App.hideLoading();
          var cfg = {
            text: '服务器访问失败，请稍后再试。',
            type: 'error'
          };
          hicon.utils.noty(cfg);
        }
      });
    },

    doRegister: function() {
      hicon.navigation.register();
    },

    retrieve: function() {
      hicon.navigation.retrieve();
    },
    help: function() {
      hicon.navigation.help();
    }
  };

  view.loginValidate = function() {
    var username = $('#username').val(),
      password = $('#password').val(),
      identity = $('#identity').val();

    var msg = '';
    if (!identity) {
      msg = '请选择登录身份';
    }
    if (!password) {
      msg = '请输入密码';
    }
    if (!username) {
      msg = '请输入用户名';
    }

    if (msg) {
      var cfg = {
        text: msg,
        type: 'error'
      };

      hicon.utils.noty(cfg);

      return false;
    };
    return true;
  };

  view.getTimerInterval = function(userId) {
    var inters = [{
      "Description": "24小时常开",
      "Val": 0
    }, {
      "Description": "半小时",
      "Val": 30
    }, {
      "Description": "1小时",
      "Val": 60
    }, {
      "Description": "1.5小时",
      "Val": 90
    }, {
      "Description": "2小时",
      "Val": 120
    }, {
      "Description": "2.5小时",
      "Val": 150
    }, {
      "Description": "3小时",
      "Val": 180
    }, {
      "Description": "4小时",
      "Val": 240
    }, {
      "Description": "5小时",
      "Val": 300
    }];

    hicon.server.ajax({
      url: 'SysTimerGets',
      type: 'post',
      data: {
        UserID: userId
      },
      success: function(data) {
        if (!data.length) {
          data = inters;
        };
        hicon.localStorage.saveJson('SYS_TIMER_INTERVAL', data);
      },
      error: function() {
        hicon.localStorage.saveJson('SYS_TIMER_INTERVAL', inters);
      }
    });
  };

  modelViewLogin = kendo.observable({
    autoLogin: function(e) {
      var isAutoLogin = $(e.target).prop('checked');
      if (isAutoLogin) {
        $('#chkRember').prop('checked', true);
      }
    }
  });

  return view;
}());
