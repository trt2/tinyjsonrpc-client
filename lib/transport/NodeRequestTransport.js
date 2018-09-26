'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _request = require('request');

/**
 * params:
 *  endpoint - http://example.com/JsonRpc/Api
 */

var NodeRequestTransport = function () {
    function NodeRequestTransport() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, NodeRequestTransport);

        this._params = _extends({}, params);
    }

    _createClass(NodeRequestTransport, [{
        key: 'request',
        value: function request(requestData) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _request({
                    method: 'POST',
                    uri: _this._params.endpoint,
                    json: requestData
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (body === '' || body === undefined) {
                            resolve(null);
                        } else {
                            if (typeof body === 'string' || body instanceof String) {
                                resolve(JSON.parse(body));
                            } else {
                                resolve(body);
                            }
                        }
                    }

                    reject(error);
                });
            });
        }
    }]);

    return NodeRequestTransport;
}();

exports.default = NodeRequestTransport;