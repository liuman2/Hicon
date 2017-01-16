var hicon = hicon || {};
var viewModelDeviceCurve = null;

hicon.deviceCurve = (function () {

    var view = {};

    view.defineModel = function () {
        var self = this;
        self.currentDevice = null;
    };

    view.init = function() {
        viewModelDeviceCurve = new view.defineModel();
        ko.applyBindings(viewModelDeviceCurve, document.getElementById("deviceCurve"));
    };

    view.show = function (e) {

    };

    view.aftershow = function (e) {
        viewModelDeviceCurve.currentDevice = hicon.sessionStorage.getJson('CURRENT_DEVICE');
        $('#txtDeviceCurveDay').val(hicon.utils.dateFormat(new Date(), 'yyyy-mm-dd'));
        view.data.search();
    };

    view.data = {
        search: function() {
            App.showLoading();
            view.data.getData().done(function(data) {
                view.data.showChart(data);
            });
        },
        getData: function(aiSn) {
            var date = $('#txtDeviceCurveDay').val();

            var userInfo = hicon.localStorage.getJson('USER_INFO');
            return hicon.server.ajax({
                url: 'DeviceDateGet',
                type: 'post',
                data: {
                    UserID: userInfo.UserID,
                    PondID: viewModelDeviceCurve.currentDevice.PondID,
                    DtuNO: viewModelDeviceCurve.currentDevice.DtuNO,
                    DeviceNO: viewModelDeviceCurve.currentDevice.DeviceNO,
                    date: date
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

        showChart: function(data) {
            App.hideLoading();

            if (!data.length) {
                var cfg = {
                    text: '当前无数据',
                    layout: 'center',
                    timeout: 2000,
                    type: 'information'
                };
                hicon.utils.noty(cfg);
            }


            var rptData = [],
                curve1 = [],
                xqd = new Date($('#txtDeviceCurveDay').val().replace(/-/gi, '/')),
                categories = [];
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
            ];
            for (var i = 0, max = data.length; i < max; i++) {
                var curve = data[i];
                var dt = new Date(curve.Stamp.replace(/-/gi, '/'));

                if (i == 0 && dt.getHours() > 0) {
                    var x0 = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 1),
                        y0 = null;
                    curve1.push([x0, y0]);
                }

                var x = Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds()),
                    y = curve.Action;

                curve1.push([x, y]);

                if (i == (max-1) && dt.getHours() < 23) {
                    var x1 = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59),
                        y1 = null;
                    curve1.push([x1, y1]);
                }
            }

            rptData.push({
                name: '运行状况',
                data: curve1,
                step: true
            });

            var plotLines = [{
                color: '#ddd',
                value: 1,
                width: 1
            },{
                color: '#ddd',
                value: 0,
                width: 1
            }]

            var qd = new Date($('#txtDeviceCurveDay').val().replace(/-/gi, '/'));
            var pointStart =  Date.UTC(qd.getFullYear(),qd.getUTCMonth(),qd.getUTCDate(),qd.getUTCHours(),qd.getUTCMinutes(),qd.getUTCSeconds());

            $(function () {
                $('#deviceCurveChart').highcharts({
                    chart: {
                        animation: false
                    },
                    plotOptions: {
                        series: {
                            animation: false,
                            lineWidth: 0.5,
                            pointStart: pointStart,
                            pointInterval: 3600 * 1000
                        }
                    },
                    title: {
                        text: viewModelDeviceCurve.currentDevice.Name,
                        x: -20 //center
                    },
                    subtitle: {
                        text: '运行状况曲线图',
                        x: -20
                    },
                    xAxis: {
                        categories: categories,
                        gridLineWidth: 0,
                        minTickInterval: 3600000,
                        labels: {
                            formatter: function() {
                                return Highcharts.dateFormat('%H', this.value);
                            }
                        },
                        type: 'datetime'
                    },
                    yAxis: {
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        title: {
                            enabled: false
                        },
                        // plotLines: plotLines,
                        labels: {
                            formatter: function () {
                                //return this.value > 0 ? '开' : '关';
                                if (this.value == 0) {
                                    return '关';
                                } else if (this.value == 1) {
                                    return '开';
                                } else {
                                    return '';
                                }
                            }
                        },
                        tickInterval: 1,
                        min: -1,
                        max: 2

                    },
                    tooltip: {
                        formatter: function () {
                            var dt = new Date(this.x-3600 * 1000*8),
                                h = dt.getHours(),
                                m = dt.getMinutes();

                            var  s = '<b>' + (h < 9 ? '0'+h : h) + '时' + (m < 9 ? '0'+m : m)+ '分</b>';
                            s += '<br/>' + this.series.name + ': ' +
                                    (this.y > 0 ? '开': '关') ;
                            return s;
                        }
                    },
                    legend: {
                        enabled: false
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
            hicon.navigation.controller();
        },
        prev: function(e) {
            var dt = $('#txtDeviceCurveDay').val();
            $('#txtDeviceCurveDay').val(hicon.utils.addDays(dt, -1));

            view.data.search();
        },
        next: function(e) {
            var dt = $('#txtDeviceCurveDay').val();
            $('#txtDeviceCurveDay').val(hicon.utils.addDays(dt, 1));

            view.data.search();
        }
    };

    return view;
}());
