class FetchRequestTransport {
    constructor(params = {}) {
        this._params = {...params};
    }

    request(requestData) {
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

                return JSON.parse(responseText);
            });        
    }
}

export default FetchRequestTransport;