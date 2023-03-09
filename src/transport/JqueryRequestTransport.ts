import { JsonRpcRequestTransport, JsonRpcTransportRequest, JsonRpcTransportResponse } from '../TinyJsonRpcClient';

export interface JqueryRequestTransportParams {
    endpoint: string;
}

export default class JqueryRequestTransport implements JsonRpcRequestTransport {
    _params: JqueryRequestTransportParams;

    constructor(params: JqueryRequestTransportParams) {
        this._params = {...params};
    }

    request(requestData: JsonRpcTransportRequest): Promise<JsonRpcTransportResponse> {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                dataType: 'text',                   // Parse JSON ourselves as en empty response is valid.
                contentType: 'application/json',
                url: this._params.endpoint,
                data: JSON.stringify(requestData),
                cache: false,
                processData: false
            })
                .done((response) => {
                    if (typeof (response) === 'string') {
                        try {
                            if(response === '') {
                                resolve(null);
                            } else {
                                resolve(JSON.parse(response));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error('Unable to parse server response'));
                    }
                })

                .fail((response) => {
                    if(process.env.NODE_ENV !== 'production') {
                        console.log(response);
                    }                    

                    reject(new Error('Response error, status=' + response.status));
                });
        });
    }
}