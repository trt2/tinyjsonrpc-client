'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchRequestTransport = function () {
    function FetchRequestTransport() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, FetchRequestTransport);

        this._params = _extends({}, params);
    }

    _createClass(FetchRequestTransport, [{
        key: 'request',
        value: function request(requestData) {
            return fetch(this._params.endpoint, {
                method: 'POST',
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'no-cache',
                redirect: 'follow',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(requestData)
            }).then(function (responseObj) {
                if (responseObj.status === 200) {
                    return responseObj;
                }

                throw new Error('Received status code ' + responseObj.status);
            }).then(function (responseObj) {
                return responseObj.text();
            }).then(function (responseText) {
                if (responseText === '') {
                    return null;
                }

                return JSON.parse(responseText);
            });
        }
    }]);

    return FetchRequestTransport;
}();

exports.default = FetchRequestTransport;