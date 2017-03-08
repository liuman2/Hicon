(function(g, b, d) {
  var c = b.head || b.getElementsByTagName("head"),
    D = "readyState",
    E = "onreadystatechange",
    F = "DOMContentLoaded",
    G = "addEventListener",
    H = setTimeout;

  function f() {

    $LAB.setGlobalDefaults({
      UsePreloading: false
    });

    var afterKendoApplicationInit = function() {

      $LAB.script("vendor/knockout/knockout.js")
        .script("js/hicon.server.js")
        .script("js/hicon.utils.js")
        .script("js/hicon.localStorage.js")
        .script("js/hicon.sessionStorage.js")
        .script('js/hicon.nativeApp.js')
        .script("js/hicon.navigation.js").wait(function() {

          document.addEventListener("deviceready", function() {
            document.addEventListener("backbutton", function(e) {
              if ($('.ZebraDialog').length) {
                $('.ZebraDialog_Button_0').trigger('click');
                return;
              }

              var hash = window.location.hash.toLowerCase();
              try {
                if (hash.indexOf('login') >= 0) {
                  hicon.utils.confirm({
                    message: '您确定要退出程序？',
                    ok: function() {
                      navigator.app.exitApp();
                    }
                  });
                  return false;
                }
                if (hash.indexOf('#view/register.html') >= 0) {
                  hicon.navigation.login();
                  return false;
                }
                if (hash.indexOf('#view/retrieve.html') >= 0) {
                  hicon.navigation.login();
                  return false;
                }
                if (hash.indexOf('#view/main.html') >= 0 || hash.indexOf('#view/buemain.html')) {
                  if (!$('#modalview-water').closest('.km-modalview-root').is(":hidden")) {
                    hicon.main.events.modalWaterClose();
                    return;
                  }

                  hicon.utils.confirm({
                    message: '您确定要退出程序？',
                    ok: function() {
                      navigator.app.exitApp();
                    }
                  });
                  return false;
                }
                if (hash.indexOf('#view/pondedit.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/pond.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/devicecurve.html') >= 0) {
                  hicon.navigation.controller();
                  return false;
                }
                if (hash.indexOf('curve.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('timer.html') >= 0) {
                  hicon.navigation.controller();
                  return false;
                }
                if (hash.indexOf('timeradd.html') >= 0) {
                  if ($(".dwbg") && $(".dwbg").length > 0) {
                    if ($('#ddlTimerPeriod').val() == '0') {
                      $("#dtTimerDay").scroller("getInst").hide();
                    } else {
                      $("#dtTimerTime").scroller("getInst").hide();
                    }
                    return;
                  }

                  hicon.navigation.timer();
                  return false;
                }
                if (hash.indexOf('#view/basic.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/devicelog.html') >= 0) {
                  hicon.navigation.controller();
                  return false;
                }
                if (hash.indexOf('log.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/subaccount.html') >= 0) {
                  if (!$('#modalview-sub').closest('.km-modalview-root').is(":hidden")) {
                    hicon.subAccount.events.cancel();
                    return;
                  }

                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/modifypwd.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/about.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/controller.html') >= 0) {
                  if (!$('#modalview-time').closest('.km-modalview-root').is(":hidden")) {
                    hicon.controller.events.modalStartTimeClose();
                    return;
                  }

                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/monitor.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }
                if (hash.indexOf('#view/controlleredit.html') >= 0) {
                  hicon.navigation.main();
                  return false;
                }

                if (hash.indexOf('#view/subaccountpond.html') >= 0) {
                  hicon.navigation.subAccount();
                  return false;
                }
                if (hash.indexOf('#view/pondselect.html') >= 0) {
                  hicon.navigation.subAccountPond();
                  return false;
                }
              } catch (e) {
                navigator.app.exitApp();
              }
            }, false);

            document.addEventListener("resume", function() {
              try {
                hicon.utils.checkAppVersion(false);
              } catch (e) {}
            }, false);

            try {
              window.plugins.jPushPlugin.init();
            } catch (e) {

            }
          }, false);

          kendo.mobile.application.hideLoading();
          hicon.navigation.login();

          hicon.utils.checkAppVersion(false);
        });
    }

    $LAB
      .script("vendor/jquery/jquery.min.js").wait()
      .script("vendor/noty/jquery.noty.packaged.min.js")
      .script("vendor/kendo/kendo.mobile.min.js")
      .script("vendor/moment/moment.js")
      .script("vendor/zebraDialog/zebra_dialog.js").wait(function() {
        window.App = new kendo.mobile.Application($(document.body), {
          transition: "slide",
          platform: "ios7",
          skin: "nova",
          statusBarStyle: "blue",
          init: function() {
            kendo.UserEvents.defaultThreshold(kendo.support.mobileOS.device === 'android' ? 0 : 20);
            kendo.mobile.application.showLoading();
            afterKendoApplicationInit();
          }
        });

      });
  }
  H(function() {
    if ("item" in c) {
      if (!c[0]) { H(arguments.callee, 25);
        return }
      c = c[0] }
    var a = b.createElement("script"),
      e = false;
    a.onload = a[E] = function() {
      if ((a[D] && a[D] !== "complete" && a[D] !== "loaded") || e) {
        return false }
      a.onload = a[E] = null;
      e = true;
      f() };

    a.src = "vendor/lab/LAB.min.js";

    c.insertBefore(a, c.firstChild)
  }, 0);
  if (b[D] == null && b[G]) { b[D] = "loading";
    b[G](F, d = function() { b.removeEventListener(F, d, false);
      b[D] = "complete" }, false) }
})(this, document);
