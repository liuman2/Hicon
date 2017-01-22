var hicon = hicon || {};
var viewModelBuePond = null;

hicon.buePond = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.initPondModalDone = false;
  };

  view.init = function() {
    viewModelBuePond = new view.defineModel();
    ko.applyBindings(viewModelBuePond, document.getElementById('buepond'));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {
    if (false === viewModelBuePond.initPondModalDone) {
      try {
        ko.applyBindings(viewModelBuePond, document.getElementById("modalview-buepond"));
      } catch (e) {

      }
      viewModelBuePond.initPondModalDone = true;
    }
  };

  view.events = {
    doBack: function() {
      hicon.navigation.bueMain();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

      switch (commandKey) {

      }
    },
    addPond: function() {
      $("#modalview-buepond").kendoMobileModalView('open');
    },
    save: function() {
      // TODO:
      $("#modalview-buepond").kendoMobileModalView('close');
    },
    cancel: function() {
      $("#modalview-buepond").kendoMobileModalView('close');
    }
  };

  return view;
}());
