(function () {
    var NativeApp = function () { };

    // Returns a jQuery deferred object, or pass a success and fail callbacks if you don't want to use jQuery
    NativeApp.prototype.getAltitude = function (success, fail) {
        return cordova.exec(success, null, "NativeApp", "getLocation", []);
    };

    NativeApp.prototype.updateApp = function (success, fail) {
        return cordova.exec(success, null, "NativeApp", "updateApp", []);
    };

    NativeApp.prototype.checkGps = function (success, fail) {
        return cordova.exec(success, null, "NativeApp", "checkGps", []);
    };

    window.nativeApp = new NativeApp();

}());
