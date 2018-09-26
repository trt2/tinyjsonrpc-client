const { default: TinyJsonRpcClient, JsonRpcResponseError, getResponseFromId, getResultOrThrowOnError } = require('@trt2/tinyjsonrpc-client');
const NodeRequestTransport = require('@trt2/tinyjsonrpc-client/lib/transport/NodeRequestTransport').default;


const jsonRpcClient = new TinyJsonRpcClient(new NodeRequestTransport({endpoint: 'https://example.com/Api/JsonRpc'}));
jsonRpcClient.call('example.method1', { param1: 'Hello', param2: 'World' })
    .then(getResultOrThrowOnError)
    .then((result) => {
            console.log('result: ' + JSON.stringify(result));
            return result;
    })
    .catch((e) => {
        console.log(e);
    });

jsonRpcClient.callBatch([
    { method: 'example.method1', params: { param1: 'Hello', param2: 'World' }, id: 'call1' },
    { method: 'example.method1', params: { param1: 'Hello', param2: 'World2' }, id: 'call2' },
])
.then((responseBatch) => {
    const call1 = getResponseFromId('call1', responseBatch);
    const call2 = getResponseFromId('call2', responseBatch);

    if(call1) {
        if(call1.error) {
            console.log("error call1: " + JSON.stringify(call1.error));
        } else {
            console.log("result call1: " + JSON.stringify(call1.result));
        }
    }

    if(call2) {
        if(call2.error) {
            console.log("error call2: " + JSON.stringify(call2.error));
        } else {
            console.log("result call2: " + JSON.stringify(call2.result));
        }
    }
})
.catch((e) => {
    console.log(e);
});
