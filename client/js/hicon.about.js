var hicon = hicon || {};
var viewModelAbout = null;

hicon.about = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
  };

  view.init = function() {
    viewModelAbout = new view.defineModel();
    ko.applyBindings(viewModelAbout, document.getElementById("about"));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {

  };

  view.events = {
    doBack: function() {
      hicon.navigation.main();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

      switch (commandKey) {
        case 'checkVersion':
          hicon.utils.checkAppVersion(true);
          break;
        case 'help':
          hicon.navigation.help();
          break;
      }

    }
  };

  return view;
}());
