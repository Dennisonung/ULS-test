module.exports = {
    name: 'Logging',
    description: 'Logging Module.',
    run: function () {
        const fs = require('fs')
        const util = require('util')
        const logFilePath = "latest.log";
        fs.writeFileSync(logFilePath, "");
        function createLogFunction(original) {
            return function (obj) {
                original(obj);
                fs.appendFile(logFilePath, obj.toString() + "\n", function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
        let _log = createLogFunction(console.log);
        let _warn = createLogFunction(console.warn);
        let _error = createLogFunction(console.error);
        console.log = function (obj) {
            if (typeof (obj) == "object") {
                obj = util.inspect(obj, {
                    "colors": true
                });
            } else if (obj === undefined) {
                obj = "undefined";
            }
            _log("[LOG] " + obj.toString());
        }
        console.debug = function (obj) {
            if (typeof (obj) == "object") {
                obj = util.inspect(obj, {
                    "colors": true
                });
            } else if (obj === undefined) {
                obj = "undefined";
            }
            _log("[DEBUG] " + obj.toString());
        }
        console.info = function (obj) {
            _log("[INFO] " + obj.toString());
        }
        console.warn = function (obj) {
            _warn("[WARN] " + obj.toString());
        }
        console.error = function (obj) {
            _error("[ERROR] " + obj.toString());
        }
    }
}    