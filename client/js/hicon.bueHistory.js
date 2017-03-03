var hicon = hicon || {};
var viewModelHistory = null;

hicon.bueHistory = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;

    self.currentPond = ko.observable({
      code: '',
      name: '未选择'
    });
    self.list = ko.observableArray([]);
  };

  view.init = function() {
    viewModelHistory = new view.defineModel();
    ko.applyBindings(viewModelHistory, document.getElementById('buehistory'));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {
    setTimeout(function() {
      $('#history-tip').remove();
    }, 15000)

    var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
    if (currentPond) {
      viewModelHistory.currentPond(currentPond);

      hicon.db.getHistoryByPondCode(currentPond.code, function(result) {
        result = result || [];
        if (result.length) {
          $.each(result, function(i, item) {
            item.day = moment(item.dateCreated).format('MM-DD');
            item.time = moment(item.dateCreated).format('HH:mm');
          })
        }

        viewModelHistory.list(result);
      }, null);
    }
  };

  view.events = {
    doBack: function() {
      hicon.navigation.bueMain();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      switch (commandKey) {
        case 'close':
          $('#history-tip').remove();
          break;
        case 'select':
          hicon.navigation.buePondSelect();
          break;
        case 'oxygen':
          hicon.sessionStorage.item('BUE_CURVE_AI', 'oxygen');
          hicon.navigation.bueCurve();
          break;
        case 'water':
          hicon.sessionStorage.item('BUE_CURVE_AI', 'water');
          hicon.navigation.bueCurve();
          break;
        case 'ph':
          hicon.sessionStorage.item('BUE_CURVE_AI', 'ph');
          hicon.navigation.bueCurve();
          break;
        case 'saturation':
          hicon.sessionStorage.item('BUE_CURVE_AI', 'saturation');
          hicon.navigation.bueCurve();
          break;
        case 'hpa':
          hicon.sessionStorage.item('BUE_CURVE_AI', 'hpa');
          hicon.navigation.bueCurve();
          break;
      }
    },
  };

  return view;
}());
