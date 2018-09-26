'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JsonRpcResponseError = function JsonRpcResponseError(response) {
    _classCallCheck(this, JsonRpcResponseError);

    this.name = 'JsonRpcResponseError';
    this.message = 'JsonRpcResponseError: ' + JSON.stringify(response);
    this.stack = new Error().stack;
    this.response = response;
};

JsonRpcResponseError.prototype = Object.create(Error.prototype);

/**
 * returns undefined if response is not found
 * 
 * @param {*} id 
 * @param {*} batchResult 
 */
function getResponseFromId(id, batchResult) {
    if (batchResult) {
        for (var i = 0; i < batchResult.length; i++) {
            if (id == batchResult[i].id) {
                return batchResult[i];
            }
        }
    }

    return undefined;
}

/**
 * Could be used to convert errors to exception in promise chain
 * for single calls.
 * 
 * Example:
 * client.call('method')
 *   .then(getResultOrThrowOnError)
 *   .then(result => { ... })
 *   .catch(e => { ... })
 * 
 * @param {*} response 
 */
function getResultOrThrowOnError(response) {
    if (response) {
        if (response.error) {
            throw new JsonRpcResponseError(response.error);
        }

        return response.result;
    }

    return undefined;
}

var DUMMY_TRANSPORT = {
    request: function request() {
        return Promise.reject(Error('No JSON-RPC transport specified'));
    }
};

var TinyJsonRpcClient = function () {
    function TinyJsonRpcClient(transport) {
        _classCallCheck(this, TinyJsonRpcClient);

        this._transport = transport ? transport : DUMMY_TRANSPORT;
    }

    /**
     * batch contains an array with objects:
     * [
     *  {method: 'methodname1', params: {}, id: 'result1'}
     *  {method: 'methodname2', params: {}, id: 'result2'}
     * ]
     * 
     * params may be object, array or omitted (defaults to empty object)
     * id may be number, string or omitted. If omitted no result will be available.
     * 
     * @param {*} batch 
     */


    _createClass(TinyJsonRpcClient, [{
        key: 'callBatch',
        value: function callBatch() {
            var _this = this;

            var batch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            return this._sendRequest(batch.map(function (callObj) {
                return _this._createRequest(callObj);
            }));
        }
    }, {
        key: 'call',
        value: function call(method, params) {
            var notification = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return this.callObj({ method: method, params: params }, notification);
        }
    }, {
        key: 'callObj',
        value: function callObj(_callObj) {
            var notification = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (notification) {
                return this._sendRequest(this._createRequest(_callObj));
            }

            return this._sendRequest(this._createRequest(_extends({}, _callObj, { id: 1 })));
        }
    }, {
        key: '_createRequest',
        value: function _createRequest(_ref) {
            var method = _ref.method,
                params = _ref.params,
                id = _ref.id;

            var req = {
                jsonrpc: "2.0",
                method: method
            };

            if (params) {
                req.params = params;
            }

            if (id || Number(id) === 0) {
                req.id = id;
            }

            return req;
        }
    }, {
        key: '_sendRequest',
        value: function _sendRequest(requestData) {
            if (!this._transport) {
                return Promise.reject(Error('No JSON-RPC transport specified'));
            }

            var isBatchRequest = Array.isArray(requestData);

            return this._transport.request(requestData).then(function (result) {
                // No data, request only contained notifications etc
                if (result === null) {
                    return result;
                }

                if (isBatchRequest) {
                    // An array result means that the call was correctly made
                    if (Array.isArray(result)) {
                        return result;
                    } else {
                        if (result.error) {
                            throw Error('JSON-RPC Error: ' + JSON.stringify(result.error));
                        }

                        throw Error('JSON-RPC Error: Batch call failed');
                    }
                } else {
                    return result;
                }
            });
        }
    }]);

    return TinyJsonRpcClient;
}();

exports.JsonRpcResponseError = JsonRpcResponseError;
exports.getResponseFromId = getResponseFromId;
exports.getResultOrThrowOnError = getResultOrThrowOnError;
exports.default = TinyJsonRpcClient;