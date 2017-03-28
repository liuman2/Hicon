var hicon = hicon || {};
var viewModelDtuList = null;

hicon.dtuList = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.initPondModalDone = false;
    self.pond = ko.observable({
      Name: '',
      Dtus: []
    });
    // self.dtus = ko.observableArray([]);
  };

  view.init = function() {
    viewModelDtuList = new view.defineModel();
    ko.applyBindings(viewModelDtuList, document.getElementById('dtuList'));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {
    var pond = hicon.localStorage.getJson('POND_DTUS');
    viewModelDtuList.pond(pond);
  };

  view.events = {
    doBack: function() {
      window.history.back();
    },
    itemClick: function(e) {
      var dtu = ko.dataFor(e.target.closest("li")[0]);

      hicon.utils.confirm({
        message: '您确定要解除绑定?',
        ok: function() {
          hicon.server.ajax({
            url: 'RemoveBindDtu',
            type: 'post',
            data: {
              UserID: viewModelMain.userInfo.UserID,
              PondID: viewModelDtuList.pond().PondID,
              DtuNO: dtu.DtuNO
            },
            success: function(data) {
              $(e.target.closest("li")).remove();
              var cfg = {
                text: '解除绑定成功',
                type: 'success'
              };
              hicon.utils.noty(cfg);
            },
            error: function() {
              var cfg = {
                text: '解除绑定失败',
                type: 'error'
              };
              hicon.utils.noty(cfg);
            }
          });
        }
      });

    }
  };

  return view;
}());
