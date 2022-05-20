import request from 'request';
import { JsonRpcRequestTransport, JsonRpcTransportRequest, JsonRpcTransportResponse } from 'src/TinyJsonRpcClient';

export interface NodeRequestTransportParams {
    endpoint: string;
}

/**
 * params:
 *  endpoint - http://example.com/JsonRpc/Api
 */
export default class NodeRequestTransport implements JsonRpcRequestTransport {
    _params: NodeRequestTransportParams;

    constructor(params:NodeRequestTransportParams) {
        this._params = {...params};
    }
    
    request(requestData: JsonRpcTransportRequest): Promise<JsonRpcTransportResponse> {
        return new Promise((resolve, reject) => {
            request({
                    method: 'POST',
                    uri: this._params.endpoint,
                    json: requestData
                },
                (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        if(!body) {
                            resolve(null);
                        } else {
                            if(typeof body === 'string') {
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
}