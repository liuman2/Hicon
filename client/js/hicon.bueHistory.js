var hicon = hicon || {};
var viewModelHistory = null;

hicon.bueHistory = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
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
    }, 10000)
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
        case 'oxygen':
          break;
        case 'temp':
          break;
        case 'ph':
          break;
        case 'saturation':
          break;
        case 'pressure':
          break;
      }
    },
  };

  return view;
}());
