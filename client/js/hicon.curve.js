var hicon = hicon || {};
var viewModelCurve = null;

hicon.curve = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.searchType = 0;
        self.currentAi = null;
        self.curve1 = [];
        self.curve2 = [];
    };

    view.init = function() {
        viewModelCurve = new view.defineModel();
        ko.applyBindings(viewModelCurve, document.getElementById("curve"));
    };

    view.show = function (e) {

    };

    view.aftershow = function (e) {
        viewModelCurve.currentAi = hicon.sessionStorage.getJson('CURRENT_AI');
        viewModelCurve.curve1 = [];
        viewModelCurve.curve2 = [];

        var buttongroup = $("#select-period").data("kendoMobileButtonGroup");
        buttongroup.select(0);
        viewModelCurve.searchType = 0;

        $('#txtCurveMonth').val(hicon.utils.dateFormat(new Date(), 'yyyy-mm'));
        $('#txtCurveDay').val(hicon.utils.dateFormat(new Date(), 'yyyy-mm-dd'));

        $('#txtCurveMonth').hide();
        $('#txtCurveDay').show();

        if (!viewModelCurve.currentAi.items) {
            return;
        }
        if (viewModelCurve.currentAi.items.length == 0) {
            return;
        }

        view.data.search();
        var cfg = {
            text: '触摸屏幕曲线可查看数值',
            layout: 'top',
            timeout: 3000,
            type: 'information'
        };
        hicon.utils.noty(cfg);
    };

    view.data = {
        search: function() {
            App.showLoading();
            view.data.getData(viewModelCurve.currentAi.items[0].AiSN).done(function(d1) {
                viewModelCurve.curve1 = d1;

                if (viewModelCurve.currentAi.items.length > 1) {
                    view.data.getData(viewModelCurve.currentAi.items[1].AiSN).done(function(d2) {
                        viewModelCurve.curve2 = d2;

                        view.data.showChart();
                    });
                } else {
                    view.data.showChart();
                }
            });
        },
        getData: function(aiSn) {
            var url = viewModelCurve.searchType == 0 ? 'AiDataGetByDay' : 'AiDataGetByMonth',
                date = viewModelCurve.searchType == 0 ? $('#txtCurveDay').val() : $('#txtCurveMonth').val();

            var userInfo = hicon.localStorage.getJson('USER_INFO');
            return hicon.server.ajax({
                url: url,
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    PondID: viewModelCurve.currentAi.PondID,
                    AiSN: aiSn,
                    Date: date
                },
                success: function(data) {

                },
                error: function() {
                    App.hideLoading();
                    var cfg = {
                        text: '数据获取失败',
                        layout: 'center',
                        timeout: 2000,
                        type: 'information'
                    };
                    hicon.utils.noty(cfg);
                }
            });
        },

        showChart: function() {
            App.hideLoading();
            if (viewModelCurve.curve1.length == 0 && viewModelCurve.curve2.length == 0) {
                var cfg = {
                    text: '当前无数据',
                    layout: 'center',
                    timeout: 2000,
                    type: 'information'
                };
                hicon.utils.noty(cfg);
            }

            var hasTwoItems = viewModelCurve.currentAi.items.length > 1;
            var yMin = hasTwoItems ? viewModelCurve.currentAi.items[1].Y_Min : viewModelCurve.currentAi.items[0].Y_Min,
                yMax = hasTwoItems ? viewModelCurve.currentAi.items[1].Y_Max : viewModelCurve.currentAi.items[0].Y_Max,
                yTickInterval = Math.floor((yMax - yMin) / 10);

            var rptData = [],
                curve1 = [],
                curve2 = [];

            var xqd = new Date($(viewModelCurve.searchType == 0 ? '#txtCurveDay' : '#txtCurveMonth').val().replace(/-/gi, '/'));
            var categories = [];

            if(viewModelCurve.searchType == 0) {
                categories = [
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 0, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 2, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 4, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 6, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 8, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 10, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 12, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 14, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 16, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 18, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 20, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 22, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(),xqd.getUTCDate(), 23, 59, 59 )
                ]
            } else {
                categories = [
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 1, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 2, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 3, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 4, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 5, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 6, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 7, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 8, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 9, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 10, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 11, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 12, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 13, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 14, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 15, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 16, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 17, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 18, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 19, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 20, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 21, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 22, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 23, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 24, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 25, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 26, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 27, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 28, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 29, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 30, 0, 0 ),
                    Date.UTC(xqd.getFullYear(),xqd.getUTCMonth(), 31, 0, 0 ),
                ]
            }
            for (var i = 0, max = viewModelCurve.curve1.length; i < max; i++) {

                var curve = viewModelCurve.curve1[i];
                var dt = new Date(curve.Stamp.replace(/-/gi, '/'));

                var x = Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds()),
                    y = curve.AiValue;

                curve1.push([x, y]);
            }

            rptData.push({
                name: '上层',
                color: 'rgb(5,250,224)',
                data: curve1
            });

            // 基准线
            var plotLines = [];

            if (hasTwoItems) {
                for (var j = 0, max = viewModelCurve.curve2.length; j < max; j++) {
                    var curve = viewModelCurve.curve2[j];
                    var dt = new Date(curve.Stamp.replace(/-/gi, '/'));
                    var x = Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds()),
                        y = curve.AiValue;

                    curve2.push([x, y]);
                }

                rptData.push({
                    name: '下层',
                    color: 'rgb(216,240,9)',
                    data: curve2
                });

                plotLines.push({
                    color: 'rgb(255,0,0)',
                    dashStyle: 'Dash',
                    value: (viewModelCurve.currentAi.items[1].Lower != null ? viewModelCurve.currentAi.items[1].Lower : (viewModelCurve.currentAi.items[0].Lower || 0)),
                    width: 2
                });
                plotLines.push({
                    color: 'rgb(255,0,0)',
                    dashStyle: 'Dash',
                    value: (viewModelCurve.currentAi.items[1].Upper != null ? viewModelCurve.currentAi.items[1].Upper : (viewModelCurve.currentAi.items[0].Upper || 0)),
                    width: 2
                });
            } else {
                plotLines.push({
                    color: 'rgb(255,0,0)',
                    dashStyle: 'Dash',
                    value: viewModelCurve.currentAi.items[0].Lower  || 0,
                    width: 2
                });
                plotLines.push({
                    color: 'rgb(255,0,0)',
                    dashStyle: 'Dash',
                    value: viewModelCurve.currentAi.items[0].Upper  || 0,
                    width: 2
                });
            }

            var qd = new Date($(viewModelCurve.searchType == 0 ? '#txtCurveDay' : '#txtCurveMonth').val().replace(/-/gi, '/'));
            var pointStart =  Date.UTC(qd.getFullYear(),qd.getUTCMonth(),qd.getUTCDate(),qd.getUTCHours(),qd.getUTCMinutes(),qd.getUTCSeconds());
            $(function () {
                Highcharts.setOptions({
                    lang: {
                        loading: '加载中...',
                        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月','8月', '9月', '10月', '11月', '12月'],
                        shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月','8月', '9月', '10月', '11月', '12月'],
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
                $('#curveChart').highcharts({
                    chart: {
                        animation: false
                    },
                    plotOptions: {
                        series: {
                            animation: false,
                            lineWidth: 0.5,
                            pointStart: pointStart,
                            pointInterval: viewModelCurve.searchType == 0 ? (3600 * 1000) : (3600 * 1000 * 24)
                        }
                    },
                    title: {
                        text: viewModelCurve.currentAi.AiParam,
                        x: -20
                    },
                    subtitle: {
                        text: '水质参数曲线图',
                        x: -20
                    },
                    xAxis: {
                        categories: categories,
                        minTickInterval: viewModelCurve.searchType == 0 ? (3600000) : (86400000),
                        labels: {
                            formatter: function() {
                                return viewModelCurve.searchType == 0 ? Highcharts.dateFormat('%H', this.value) : Highcharts.dateFormat('%m-%d', this.value);
                            }
                        },
                        // endOnTick: true,
                        // startOnTick: true,
                        // showLastLabel: true,
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
                        xDateFormat: viewModelCurve.searchType == 0 ? '时间: %H时%M分' : '日期: %m月%d日',
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

            viewModelCurve.searchType = index;

            if (index == 0) {
                $('#txtCurveMonth').hide();
                $('#txtCurveDay').show();
            } else {
                $('#txtCurveDay').hide();
                $('#txtCurveMonth').show();
            }

            view.data.search();
        },
        prev: function(e) {
            if(viewModelCurve.searchType == 0) {
                var dt = $('#txtCurveDay').val();
                $('#txtCurveDay').val(hicon.utils.addDays(dt, -1));
            } else {
                var dt = $('#txtCurveMonth').val()+'-01';
                var ndt = hicon.utils.dateFormat((new Date(hicon.utils.addMonths(dt.replace(/-/gi, '/'), -1).replace(/-/gi, '/'))), 'yyyy-mm');
                $('#txtCurveMonth').val(ndt+'');
            }

            view.data.search();
        },
        next: function(e) {
            if(viewModelCurve.searchType == 0) {
                var dt = $('#txtCurveDay').val();
                $('#txtCurveDay').val(hicon.utils.addDays(dt, 1));
            } else {
                var dt = $('#txtCurveMonth').val()+'-01';
                var ndt = hicon.utils.dateFormat((new Date(hicon.utils.addMonths(dt.replace(/-/gi, '/'), 1).replace(/-/gi, '/'))), 'yyyy-mm');
                $('#txtCurveMonth').val(ndt+'');
            }

            view.data.search();
        }
    };

    return view;
}());
