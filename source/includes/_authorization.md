# Authorization

<h3 id="send-request" class="call"><span>POST</span> /authorize</h3>

To be able to use our APIs, you must provide a secret api key on every request. You can create a key on our [Developer Portal](https://developers.wetransfer.com/). Please make sure that you keep your API key in a secret place, and it's not shared on CVS repositories or client side code.

Our APIs expect the API key to be included as a header on every API requests. Please provide the API key using `x-api-key` header, like in the following examples:

<aside class="notice">
You must replace <code>your_api_key</code> with your secret API key.
</aside>

Besides the API Key, a JSON Web Token (JWT) must be included on subsequent requests. To retrieve a JWT, send a request, including your API token to the following endpoint:


```shell
curl -X POST \
  https://dev.wetransfer.com/v1/authorize \
  -H "x-api-key: your_api_key"
```

```ruby
# Please keep in mind that authorization is performed when the client is initialized.
@client = WeTransfer::Client.new(api_key: '# YOUR PRIVATE API KEY GOES HERE')
```

```javascript
const createWTClient = require('@wetransfer/js-sdk');
// Please keep in mind that authorization is performed when the client is initialized.
const apiClient = await createWTClient('/* YOUR PRIVATE API KEY GOES HERE */');

// When using the SDK, there is no need to call authorize manually.
// The method is available though, in case you need to access the JWT.
const auth = await apiClient.authorize();
```

#### Headers

name | type | required | description
---- | ---- | -------- | -----------
`x-api-key` | String | Yes | Private API key

#### Response

```json
{
  "success": true,
  "token": "A valid JWT token here"
}
```

name | type | description
---- | ---- | -----------
`success` | Boolean | Successful request, or not.
`token` | String | A one year valid JWT token, if authorization went well
