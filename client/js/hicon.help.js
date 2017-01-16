var hicon = hicon || {};
var viewModelHelp = null;

hicon.help = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
  };

  view.init = function() {
    viewModelHelp = new view.defineModel();
    ko.applyBindings(viewModelHelp, document.getElementById("help"));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {

  };

  view.events = {
    doBack: function() {
      // hicon.navigation.login();
      history.back();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      if (!commandKey) {
        return;
      }
      window.open('http://m.xmhicon.com/help/'+ commandKey +'.mp4', "_blank");
    }
  };

  return view;
}());
