var hicon = hicon || {};
var viewModelBueMain = null;

hicon.bueMain = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
  };

  view.init = function() {
    viewModelBueMain = new view.defineModel();
    ko.applyBindings(viewModelBueMain, document.getElementById("buemain"));
  };

  view.show = function(e) {
  };

  view.aftershow = function(e) {
  };

  view.events = {
    doBack: function() {
      // hicon.navigation.main();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      switch (commandKey) {
        case 'pond':
          break;
        case 'test':
          break;
      }
    }
  };
  return view;
}());
