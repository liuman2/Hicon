var hicon = hicon || {};
var viewModelBueCurve = null;

hicon.bueCurve = (function() {

  var view = {};

  view.defineModel = function() {
    var self = this;
    self.searchType = 0;
    self.currentAi = null;
    self.curve1 = [];
    self.reportName = '';
  };

  view.init = function() {
    viewModelBueCurve = new view.defineModel();
    ko.applyBindings(viewModelBueCurve, document.getElementById("bueCurve"));
  };

  view.show = function(e) {

  };

  view.aftershow = function(e) {
    $('#txtCurveDayBue').val(hicon.utils.dateFormat(new Date(), 'yyyy-mm-dd'));
    viewModelBueCurve.currentAi = hicon.sessionStorage.getJson('BUE_CURVE_AI');
    viewModelBueCurve.curve1 = [];
    if (!viewModelBueCurve.currentAi) {
      return;
    }
    view.data.search();
  };

  view.data = {
    search: function() {
      view.data.getData(function(d1) {
        viewModelBueCurve.curve1 = d1;
        view.data.showChart();
      });
    },
    getData: function(callback) {
      var date = $('#txtCurveDayBue').val();
      var currentPond = hicon.localStorage.getJson('BUE_CURRET_POND');
      var pondCode = currentPond.code;
      var dateStart = moment(date).format('YYYY-MM-DD 00:00');
      var dateend = moment(date).format('YYYY-MM-DD 23:59');

      var query = {
        code: currentPond.code,
        start: moment(date).format('YYYY-MM-DD 00:00'),
        end: moment(date).format('YYYY-MM-DD 23:59'),
        field: viewModelBueCurve.currentAi
      }

      hicon.db.searchHistory(query, function(result) {
        result = result || [];
        callback(result);
      }, function() {
        callback([]);
      });
    },

    showChart: function() {
      if (viewModelBueCurve.curve1.length == 0) {
        var cfg = {
          text: '当前无数据',
          layout: 'center',
          timeout: 800,
          type: 'information'
        };
        hicon.utils.noty(cfg);
      }
      // 溶氧 0 - 20
      // 水温 0 - 40
      // 饱和度 0-250

      var yMin = 0,
        yMax = 250,
        lower = 4,
        upper = 19;

      switch (viewModelBueCurve.currentAi) {
        case 'oxygen':
          yMin = 0;
          yMax = 20;
          lower = 4;
          upper = 19;
          viewModelBueCurve.reportName = '溶解氧';
          break;
        case 'water':
          yMin = 0;
          yMax = 40;
          lower = 20;
          upper = 30;
          viewModelBueCurve.reportName = '水温';
          break;
        case 'ph':
          yMin = 0;
          yMax = 20;
          lower = 6;
          upper = 9;
          viewModelBueCurve.reportName = 'pH';
          break;
        case 'saturation':
          yMin = 0;
          yMax = 250;
          lower = 60;
          upper = 150;
          viewModelBueCurve.reportName = '溶解氧饱和度';
          break;
        case 'hpa':
          yMin = 0;
          yMax = 500;
          lower = 60;
          upper = 150;
          viewModelBueCurve.reportName = '气压';
          break;
      }

      var yTickInterval = Math.floor((yMax - yMin) / 10);

      var rptData = [],
        curve1 = [];

      var xqd = new Date($('#txtCurveDayBue').val().replace(/-/gi, '/'));
      var categories = [];

      if (viewModelBueCurve.searchType == 0) {
        categories = [
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 0, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 2, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 4, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 6, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 8, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 10, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 12, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 14, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 16, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 18, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 20, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 22, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), xqd.getUTCDate(), 23, 59, 59)
        ]
      } else {
        categories = [
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 1, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 2, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 3, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 4, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 5, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 6, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 7, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 8, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 9, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 10, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 11, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 12, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 13, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 14, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 15, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 16, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 17, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 18, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 19, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 20, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 21, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 22, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 23, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 24, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 25, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 26, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 27, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 28, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 29, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 30, 0, 0),
          Date.UTC(xqd.getFullYear(), xqd.getUTCMonth(), 31, 0, 0),
        ]
      }
      for (var i = 0, max = viewModelBueCurve.curve1.length; i < max; i++) {

        var curve = viewModelBueCurve.curve1[i];
        var dt = new Date(curve.Stamp.replace(/-/gi, '/'));

        var x = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()),
          y = curve.AiValue;

        curve1.push([x, y]);
      }

      rptData.push({
        // name: '上层',
        color: 'rgb(5,250,224)',
        data: curve1
      });

      // 基准线
      var plotLines = [];

      plotLines.push({
        color: 'rgb(255,0,0)',
        dashStyle: 'Dash',
        value: lower || 0,
        width: 2
      });
      plotLines.push({
        color: 'rgb(255,0,0)',
        dashStyle: 'Dash',
        value: upper || 0,
        width: 2
      });

      var qd = new Date($('#txtCurveDayBue').val().replace(/-/gi, '/'));
      var pointStart = Date.UTC(qd.getFullYear(), qd.getUTCMonth(), qd.getUTCDate(), qd.getUTCHours(), qd.getUTCMinutes(), qd.getUTCSeconds());
      $(function() {
        Highcharts.setOptions({
          lang: {
            loading: '加载中...',
            months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            exportButtonTitle: '导出',
            printButtonTitle: '打印',
            rangeSelectorFrom: '从',
            rangeSelectorTo: '到',
            rangeSelectorZoom: "缩放",
            downloadPNG: '下载PNG格式',
            downloadJPEG: '下载JPEG格式',
            downloadPDF: '下载PDF格式',
            downloadSVG: '下载SVG格式'
          }
        });
        $('#bueCurveChart').highcharts({
          chart: {
            animation: false
          },
          plotOptions: {
            series: {
              animation: false,
              lineWidth: 0.5,
              pointStart: pointStart,
              pointInterval: (3600 * 1000) // viewModelBueCurve.searchType == 0 ? (3600 * 1000) : (3600 * 1000 * 24)
            }
          },
          title: {
            text: viewModelBueCurve.reportName,
            x: -20
          },
          subtitle: {
            text: '水质参数曲线图',
            x: -20
          },
          xAxis: {
            categories: categories,
            minTickInterval: 3600000,
            labels: {
              formatter: function() {
                return Highcharts.dateFormat('%H', this.value);
              }
            },
            type: 'datetime'
          },
          yAxis: {
            title: {
              enabled: false
            },
            plotLines: plotLines,
            tickInterval: yTickInterval,
            min: yMin,
            max: yMax
          },
          legend: {
            floating: true,
            align: 'right',
            verticalAlign: 'top',
            borderWidth: 0,
            x: -10,
            y: 0
          },
          tooltip: {
            headerFormat: '<span style="font-size: 14px">{point.key}</span><br/>',
            xDateFormat: '时间: %H时%M分', // viewModelBueCurve.searchType == 0 ? '时间: %H时%M分' : '日期: %m月%d日',
            style: {
              fontSize: '14px'
            }
          },
          credits: {
            enabled: false
          },
          series: rptData
        });
      });
    }
  };

  view.events = {
    doBack: function() {
      hicon.sessionStorage.item('IDENTITY', 0);
      hicon.navigation.main();
    },
    selectButton: function(e) {
      var index = this.current().index();

      viewModelBueCurve.searchType = index;

      if (index == 0) {
        $('#txtCurveMonthBue').hide();
        $('#txtCurveDayBue').show();
      } else {
        $('#txtCurveDayBue').hide();
        $('#txtCurveMonthBue').show();
      }

      view.data.search();
    },
    prev: function(e) {
      var dt = $('#txtCurveDayBue').val();
      $('#txtCurveDayBue').val(hicon.utils.addDays(dt, -1));

      view.data.search();
    },
    next: function(e) {
      var dt = $('#txtCurveDayBue').val();
      $('#txtCurveDayBue').val(hicon.utils.addDays(dt, 1));

      view.data.search();
    }
  };

  return view;
}());
