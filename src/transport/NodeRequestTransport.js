const request = require('request');

/**
 * params:
 *  endpoint - http://example.com/JsonRpc/Api
 */
class NodeRequestTransport {
    constructor(params = {}) {
        this._params = {...params};
    }
    
    request(requestData) {
        return new Promise((resolve, reject) => {
            request({
                    method: 'POST',
                    uri: this._params.endpoint,
                    json: requestData
                },
                (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        if(body === '' || body === undefined) {
                            resolve(null);
                        } else {
                            if(typeof body === 'string' || body instanceof String) {
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

exports.default = NodeRequestTransport;