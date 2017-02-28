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

    // hicon.db.getAllPond(function(result) {
    //   viewModelBuePondList.ponds(result);
    // }, null);

    viewModelBuePondList.ponds([{
      code: '001',
      name: '池1'
    },{
      code: '002',
      name: '池2'
    }]);
  };

  view.events = {
    doBack: function() {
      hicon.navigation.bueMain();
    },
    itemClick: function(e) {
      var pond = ko.dataFor(e.target.closest("li")[0]);
      hicon.localStorage.saveJson('BUE_CURRET_POND', pond);
      hicon.navigation.bueMain();
    }
  };

  return view;
}());
