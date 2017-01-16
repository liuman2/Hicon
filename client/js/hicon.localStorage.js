var hicon = hicon || {};

hicon.localStorage = (function () {

    var localStorage = {
        item: function (name, value) {
            var val = null;
            if (this.hasSupportForLocalStorage()) {
                if (value || value == "") {
                    try {
                        window.localStorage.setItem(name, value);
                    } catch (e) {
                        if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
                            window.localStorage.removeItem(name);
                            window.localStorage.setItem(name, value);
                        } else {
                            throw e;
                        }
                    }



                    val = value;
                } else {
                    val = window.localStorage.getItem(name);
                }
            }

            return val;
        },
        array: function (key, list) {
            if (this.hasSupportForLocalStorage()) {
                if (list !== undefined && $.isArray(list)) {
                    window.localStorage.setItem(key, JSONH.stringify(list));
                } else {
                    window.localStorage.getItem(key);
                }
            }
        },
        booleanItem: function (name, value) {
            var isBoolean = false;
            if (this.hasSupportForLocalStorage()) {
                if (value || value == "") {
                    if (value === true || value === "true" || value === "1") {
                        isBoolean = true;
                    }

                    try {
                        window.localStorage.setItem(name, isBoolean);
                    } catch (e) {
                        if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
                            window.localStorage.removeItem(name);
                            window.localStorage.setItem(name, isBoolean);
                        } else {
                            throw e;
                        }
                    }

                } else {
                    isBoolean = window.localStorage.getItem(name) == "true";

                }
            }
            return isBoolean;
        },
        /**
        *
        * @param {String} name
        * @return {Boolean}
        */
        removeItem: function (name) {
            if (this.hasSupportForLocalStorage()) {
                window.localStorage.removeItem(name);
            } else {
                return false;
            }
            return true;
        },
        hasSupportForLocalStorage: function () {
            return (window.localStorage && window.localStorage.length);
        },

        getJson: function (key) {
            try {
                var jsonText = window.localStorage.getItem(key);
                return JSON.parse(jsonText);
            } catch (e) {
                return null;
            }
        },
        saveJson: function (key, value) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
                    window.localStorage.removeItem(key);
                    window.localStorage.setItem(key, JSON.stringify(value));
                } else {
                    throw e;
                }
            }
        }
    };

    return localStorage;
}());
