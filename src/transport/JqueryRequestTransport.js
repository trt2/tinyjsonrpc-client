class JqueryRequestTransport {
    constructor(params = {}) {
        this._params = {...params};
    }

    request(requestData) {
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
                    if (typeof (response) === 'string' || response instanceof String) {
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
                        reject(Error('Unable to parse server response'));
                    }
                })

                .fail((response) => {
                    if(process.env.NODE_ENV !== 'production') {
                        console.log(response);
                    }                    

                    reject(Error('Response error, status=' + response.status));
                });
        });
    }
}

export default JqueryRequestTransport;