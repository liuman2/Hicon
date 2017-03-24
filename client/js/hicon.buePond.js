var hicon = hicon || {};
var viewModelBuePond = null;

hicon.buePond = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.initPondModalDone = false;
    self.pond = ko.observable({
      id: null,
      code: '',
      name: '',
      salt: ''
    });
    self.ponds = ko.observableArray([]);
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

    hicon.db.getAllPond(function(result) {
      viewModelBuePond.ponds(result);
    }, null);
  };

  view.events = {
    doBack: function() {
      hicon.navigation.bueMain();
    },
    itemClick: function(e) {
      var commandKey = e.target ? e.target.closest("[data-command-key]").data("command-key") : null;

      switch (commandKey) {
        case 'edit':
          break;
        case 'delete':
          break;
        case 'main':
          hicon.navigation.bueMain();
          break;
        case 'pond':
          // hicon.navigation.buePond();
          break;
        case 'history':
          hicon.navigation.bueHistory();
          break;
        case 'curve':
          var pond = ko.dataFor(e.target.closest("li")[0]);
          hicon.localStorage.saveJson('BUE_CURRET_POND', pond);
          hicon.navigation.bueHistory();
          break;
      }
    },
    addPond: function() {
      viewModelBuePond.pond({
        id: null,
        code: '',
        name: '',
        salt: ''
      });
      $("#modalview-buepond").kendoMobileModalView('open');
    },
    save: function() {
      if (!viewModelBuePond.pond().code) {
        var cfg = {
          text: '请输入池塘编号',
          type: 'error'
        };
        hicon.utils.noty(cfg);
        return;
      }

      if (!viewModelBuePond.pond().name) {
        var cfg = {
          text: '请输入池塘名称',
          type: 'error'
        };
        hicon.utils.noty(cfg);
        return;
      }

      hicon.db.getPondByCode(viewModelBuePond.pond().code, function(pond) {
        if (pond != null) {
          var cfg = {
            text: '该池塘编号已存在',
            type: 'error'
          };
          hicon.utils.noty(cfg);
          return;
        }

        hicon.db.insertPond(viewModelBuePond.pond());
        $("#modalview-buepond").kendoMobileModalView('close');
        hicon.db.getAllPond(function(result) {
          viewModelBuePond.ponds(result);
        }, null);
      })
    },
    cancel: function() {
      $("#modalview-buepond").kendoMobileModalView('close');
    }
  };

  return view;
}());
