# Tiny JSON-RPC Client

A fairly simple JSON-RPC client (compared to the one it replaced) with support for batch calls.

## Usage

The library may be used to make single JSON-RPC calls to server, or make batch calls.

Basic usage of single and batch calls:
```
import TinyJsonRpcClient, { getResponseFromId, getResultOrThrowOnError, JsonRpcResponseError } from '@trt2/tinyjsonrpc-client';
import FetchRequestTransport from '@trt2/tinyjsonrpc-client/lib/transport/FetchRequestTransport';


const jsonRpcClient = new TinyJsonRpcClient(
    new FetchRequestTransport({endpoint:'/Api/JsonRpc'})
);

// Make single call
jsonRpcClient.call('my.rpc.method', {someParam1: 'value1', someParam2: 123})
    .then(getResultOrThrowOnError)
    .then((response) => {
        console.log(response);
        return response;
    })
    .catch((e) => {
        console.log(e);
    });

// The following may alternatively be used to make single call:
// jsonRpcClient.callObj({method: 'my.rpc.method', params: {someParam1: 'value1', someParam2: 123})


// Make batch call
jsonRpcClient.callBatch([
        {method: 'my.rpc.method1', params: {someParam: 'value1'}, id: 'result1'}
        {method: 'my.rpc.method2', params: {someParam: 123}, id: 'result2'}
    ])
    .then((batchResult) => {
        const result1 = getResponseFromId(batchResult, 'result1');
        const result2 = getResponseFromId(batchResult, 'result2');

        if(result1) {
            if(result1.result) {
                console.log('result1 success: ', result1.result)
            } else {
                console.log('result1 error: ', result1.error)
            }
        }

        if(result2) {
            if(result2.result) {
                console.log('result2 success: ', result2.result)
            } else {
                console.log('result2 error: ', result2.error)
            }
        }
    })
    .catch((e) => {
        // Something went wrong with call
        console.log(e);
    });
```


## TinyJsonRpcClient Method Parameters
The TinyJsonRpcClient class has the following methods:

`constructor(transport)`

- transport - Initalize the TinyJsonRpcClient with this transport. TinyJsonRpcClient comes with the following transports:
  - FetchRequestTransport - Transport using the fetch function.
  - JqueryRequestTransport - Transport using jquery ajax() function.
  - NodeRequestTransport - Transport for using node request (server side).

`callBatch(batch=[])`

- batch - Array of call objects `{method: 'mymethod', params: {myparam:1}, id: 'myid'}`

Returns a promise. If id is not specified, the calls will be made as notifications with no returned result.

`call(method, params, notification=false)`

- method - Name of JSON-RPC method to call
- params - (Optional) An object or array of parameters.
- notification - Is this a notification call (default: false)

Returns a promise.

`callObj(callObj, notification=false)`

Basically the same as a batch call but with a single call object.

Returns a promise.

## Helper Functions

`function getResponseFromId(id, batchResult)`

Get result associated with the given id from the result of a batch call.

`function getResultOrThrowOnError(response)`

Return the result of a call, or convert error response into `JsonRpcResponseError` exception.
