var hicon = hicon || {};
var viewModelBuePondList = null;

hicon.buePondList = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.initPondModalDone = false;
    self.pond = ko.observable({
      id: null,
      code: '',
      name: ''
    });
    self.ponds = ko.observableArray([]);
  };

  view.init = function() {
    viewModelBuePondList = new view.defineModel();
    ko.applyBindings(viewModelBuePondList, document.getElementById('buepondList'));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {
    hicon.db.getAllPond(function(result) {
      viewModelBuePondList.ponds(result);
    }, null);
  };

  view.events = {
    doBack: function() {
      hicon.navigation.bueMain();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;
      hicon.navigation.bueMain();
    }
  };

  return view;
}());
