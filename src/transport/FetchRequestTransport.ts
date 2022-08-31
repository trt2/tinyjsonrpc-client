import { JsonRpcRequestTransport, JsonRpcTransportRequest, JsonRpcTransportResponse } from 'src/TinyJsonRpcClient';

interface FetchRequestTransportParams {
    endpoint: string;
}

class FetchRequestTransport implements JsonRpcRequestTransport {
    _params: FetchRequestTransportParams;

    constructor(params:FetchRequestTransportParams) {
        this._params = {...params};
    }

    request(requestData: JsonRpcTransportRequest): Promise<JsonRpcTransportResponse> {
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

                return JSON.parse(responseText) as JsonRpcTransportResponse;
            });        
    }
}
export {
    FetchRequestTransportParams
}

export default FetchRequestTransport;