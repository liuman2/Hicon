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

    }
  };
  return view;
}());
