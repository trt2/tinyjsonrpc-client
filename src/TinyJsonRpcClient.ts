
export type JsonRpcId = string | number | null;

export interface JsonRpcRequest {
    id?: JsonRpcId;
    jsonrpc?: string;
    method: string;
    params?: object;
};

export interface JsonRpcResponse {
    jsonrpc: string;
    result?: any;
    error?: any;
    id: JsonRpcId;
}

export type JsonRpcTransportResponse = JsonRpcResponse | JsonRpcResponse[] | null;
export type JsonRpcTransportRequest = JsonRpcRequest | JsonRpcRequest[];

export interface JsonRpcRequestTransport {
    request: (requestData: JsonRpcTransportRequest) => Promise<JsonRpcTransportResponse>;
}

export class JsonRpcResponseError extends Error {
    response: JsonRpcResponse;

    constructor(response: JsonRpcResponse) {
        super('JsonRpcResponseError: ' + JSON.stringify(response))
        this.name = 'JsonRpcResponseError';
        this.response = response;
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else { 
            this.stack = (new Error(this.message)).stack;
        }        
    }
}

/**
 * returns undefined if response is not found
 * 
 * @param {*} id 
 * @param {*} batchResult 
 */
export function getResponseFromId(id: JsonRpcId, batchResult: JsonRpcResponse[]): JsonRpcResponse|undefined {
    if(batchResult) {
        return batchResult.find((item) => item.id == id);
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
export function getResultOrThrowOnError(response: JsonRpcResponse): any {
    if(response) {
        if(response.error) {
            throw new JsonRpcResponseError(response.error);
        }
        
        return response.result;
    }
    
    return undefined;
}

class DummyTransport implements JsonRpcRequestTransport {
    request(requestData: JsonRpcTransportRequest): Promise<JsonRpcTransportResponse> {
        return Promise.reject(new Error('No JSON-RPC transport specified'));
    }
};

export default class TinyJsonRpcClient {
    _transport: JsonRpcRequestTransport;

    constructor(transport: JsonRpcRequestTransport) {
        this._transport = transport ? transport : new DummyTransport();
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
    callBatch(batch: JsonRpcRequest[]=[]): Promise<JsonRpcResponse[] | null> {
        return this._sendRequest(batch.map(callObj => this._createRequest(callObj)))
        .then(result => {
            if(result == null) {
                return null;
            }
            
            return result as JsonRpcResponse[];
        });
    }

    call(method: string, params?: any, notification=false): Promise<JsonRpcResponse | null> {
        return this.callObj({method, params}, notification);
    }

    callObj(callObj: JsonRpcRequest, notification=false): Promise<JsonRpcResponse | null> {
        if(notification) {
            return this._sendRequestSingle(this._createRequest(callObj));
        }

        return this._sendRequestSingle(this._createRequest({...callObj, id:1}));
    }

    _createRequest({method, params, id}: JsonRpcRequest): JsonRpcRequest {
        let req: JsonRpcRequest = {
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

    _sendRequestSingle(requestData: JsonRpcRequest): Promise<JsonRpcResponse | null> {
        return this._sendRequest(requestData)
            .then(result => {
                return result as JsonRpcResponse;
            });
    }

    _sendRequest(requestData: JsonRpcTransportRequest): Promise<JsonRpcTransportResponse> {
        if(!this._transport) {
            return Promise.reject(new Error('No JSON-RPC transport specified'));
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
                            throw new Error('JSON-RPC Error: ' + JSON.stringify(result.error));
                        }

                        throw new Error('JSON-RPC Error: Batch call failed');
                    }
                } else {
                    return result;
                }
            });
    }
}
