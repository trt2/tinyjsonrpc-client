'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JqueryRequestTransport = function () {
    function JqueryRequestTransport() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, JqueryRequestTransport);

        this._params = _extends({}, params);
    }

    _createClass(JqueryRequestTransport, [{
        key: 'request',
        value: function request(requestData) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'POST',
                    dataType: 'text', // Parse JSON ourselves as en empty response is valid.
                    contentType: 'application/json',
                    url: _this._params.endpoint,
                    data: JSON.stringify(requestData),
                    cache: false,
                    processData: false
                }).done(function (response) {
                    if (typeof response === 'string' || response instanceof String) {
                        try {
                            if (response === '') {
                                resolve(null);
                            } else {
                                resolve(JSON.parse(response));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(Error('Unable to parse server response'));
                    }
                }).fail(function (response) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(response);
                    }

                    reject(Error('Response error, status=' + response.status));
                });
            });
        }
    }]);

    return JqueryRequestTransport;
}();

exports.default = JqueryRequestTransport;