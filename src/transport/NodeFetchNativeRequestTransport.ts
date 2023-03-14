import { JsonRpcRequestTransport, JsonRpcTransportRequest, JsonRpcTransportResponse } from '../TinyJsonRpcClient';

export interface NodeFetchNativeTransportParams {
    endpoint: string;
}

/**
 * params:
 *  endpoint - http://example.com/JsonRpc/Api
 */
export default class NodeFetchNativeRequestTransport implements JsonRpcRequestTransport {
    _params: NodeFetchNativeTransportParams;

    constructor(params: NodeFetchNativeTransportParams) {
        this._params = {...params};
    }

    request(requestData: JsonRpcTransportRequest): Promise<JsonRpcTransportResponse> {
        return fetch(this._params.endpoint, {
                method: 'POST', 
                //mode: 'cors',
                //credentials: 'same-origin',
                //cache: 'no-cache',
                redirect: 'follow',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then((responseObj) => {
                if(responseObj.status === 200) {
                    return responseObj;
                }

                throw new Error('Received status code ' + responseObj.status);
            })
            .then((responseObj) => {
                return responseObj.text();
            })
            .then((responseText) => {
                if(responseText === '') {
                    return null;
                }

                return JSON.parse(responseText);
            });        
    }
}