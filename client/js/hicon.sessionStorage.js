var hicon = hicon || {};

hicon.sessionStorage = (function () {
    var sessionStorage = {
        /**
        * @param {String} key
        * @param {String} value
        * @return {String}
        */
        item: function (key, value) {
            var val = null;
            if (this.hasSupportSessionStorage()) {
                if (value === undefined) {
                    val = window.sessionStorage.getItem(key);
                }
                else {
                    window.sessionStorage.setItem(key, value);
                    val = value;
                }
            }

            return val;
        },
        /**
        *
        * @param {String} key
        * @return {Boolean}
        */
        removeItem: function (key) {
            if (!key) {
                return false;
            }

            if (!this.hasSupportSessionStorage()) {
                return false;
            }

            window.sessionStorage.removeItem(key);
            return true;
        },
        getJson: function (key) {
            try {
                var jsonText = window.sessionStorage.getItem(key);
                return JSON.parse(jsonText);
            } catch (e) {
                return null;
            }
        },
        saveJson: function (key, value) {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        },
        hasSupportSessionStorage: function () {
            if (window.sessionStorage) {
                return true;
            }
            return false;
        }
    };
    return sessionStorage;
}());
