var hicon = hicon || {};
var viewModelLogs = null;

hicon.log = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.logList = ko.observableArray([]);
  };

  view.init = function() {
    viewModelLogs = new view.defineModel();
    ko.applyBindings(viewModelLogs, document.getElementById("log"));
  };

  view.show = function(e) {};

  view.aftershow = function(e) {
    $('#dtEventDay').val(hicon.utils.dateFormat(new Date(), 'yyyy-mm-dd'));
    view.events.doSearch();
  };

  view.data = {};

  view.events = {
    doBack: function() {
      hicon.navigation.main();
    },
    prev: function(e) {
      var dt = $('#dtEventDay').val();
      $('#dtEventDay').val(hicon.utils.addDays(dt, -1));
      view.events.doSearch();
    },
    next: function(e) {
      var dt = $('#dtEventDay').val();
      $('#dtEventDay').val(hicon.utils.addDays(dt, 1));
      view.events.doSearch();
    },
    doSearch: function() {
      var dt1 = $('#dtEventDay').val(),
        dt2 = $('#dtEventDay').val();

      App.showLoading();
      var userInfo = hicon.localStorage.getJson('USER_INFO');
      hicon.server.ajax({
        url: 'EventGets',
        type: 'post',
        data: {
          UserID: userInfo.UserID,
          FisheryID: userInfo.FisheryID,
          dt1: dt1,
          dt2: dt2
        },
        success: function(data) {
          App.hideLoading();
          viewModelLogs.logList(data);
        },
        error: function() {
          App.hideLoading();
          var cfg = {
            text: '查询失败',
            type: 'error'
          };
          hicon.utils.noty(cfg);
        }
      });
    }
  };

  return view;
}());
