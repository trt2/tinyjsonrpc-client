class JsonRpcResponseError {
    constructor(response) {
        this.name = 'JsonRpcResponseError';
        this.message = 'JsonRpcResponseError: ' + JSON.stringify(response);
        this.stack = new Error().stack;
        this.response = response;
    }
}

JsonRpcResponseError.prototype = Object.create(Error.prototype);

/**
 * returns undefined if response is not found
 * 
 * @param {*} id 
 * @param {*} batchResult 
 */
function getResponseFromId(id, batchResult) {
    if(batchResult) {
        for(let i=0;i<batchResult.length;i++) {
            if(id == batchResult[i].id) {
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
    if(response) {
        if(response.error) {
            throw new JsonRpcResponseError(response.error);
        }
        
        return response.result;
    }
    
    return undefined;
}

const DUMMY_TRANSPORT = { 
    request() {
        return Promise.reject(Error('No JSON-RPC transport specified'));
    }
};

class TinyJsonRpcClient {
    constructor(transport) {
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
    callBatch(batch=[]) {
        return this._sendRequest(batch.map(callObj => this._createRequest(callObj)));
    }

    call(method, params, notification=false) {
        return this.callObj({method, params}, notification);
    }

    callObj(callObj, notification=false) {
        if(notification) {
            return this._sendRequest(this._createRequest(callObj));
        }

        return this._sendRequest(this._createRequest({...callObj, id:1}));
    }

    _createRequest({method, params, id}) {
        let req = {
            jsonrpc: "2.0", 
            method
        };

        if(params) {
            req.params = params;
        }

        if(id || Number(id) === 0) {
            req.id = id;
        }

        return req;
    }

    _sendRequest(requestData) {
        if(!this._transport) {
            return Promise.reject(Error('No JSON-RPC transport specified'));
        }

        const isBatchRequest = Array.isArray(requestData);

        return this._transport.request(requestData)
            .then((result) => {
                // No data, request only contained notifications etc
                if(result === null) {
                    return result;
                }

                if(isBatchRequest) {
                    // An array result means that the call was correctly made
                    if(Array.isArray(result)) {
                        return result;
                    } else {
                        if(result.error) {
                            throw Error('JSON-RPC Error: ' + JSON.stringify(result.error));
                        }

                        throw Error('JSON-RPC Error: Batch call failed');
                    }
                } else {
                    return result;
                }
            });
    }
}

export { 
    JsonRpcResponseError,
    getResponseFromId,
    getResultOrThrowOnError
};

export default TinyJsonRpcClient;