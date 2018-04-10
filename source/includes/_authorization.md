# Authorization

To be able to use our APIs, you must provide a secret api key on every request. You can create a key on our [Developer Portal](https://developers.wetransfer.com/). Please make sure that you keep your API key in a secret place, and it's not shared on CVS repositories or client side code.

Our APIs expect the API key to be included as a header on every API requests. Please provide the API key using `x-api-key` header, like in the following examples:

<aside class="notice">
You must replace <code>your_api_key</code> with your secret API key.
</aside>

Besides the API Key, a JSON Web Token (JWT) must be included on subsequent requests. To retrieve a JWT, send a request, including your API token to the following endpoint:

#### HTTP Request

```shell
curl -X POST \
  https://dev.wetransfer.com/v1/authorize \
  -H "x-api-key: your_api_key"
```

`POST https://dev.wetransfer.com/v1/authorize`

#### Headers

name | type | required | description
---- | ---- | -------- | -----------
`x-api-key` | _String_ | Yes | Private API key

#### Response

```json
{
  "success": true,
  "token": "A valid JWT token here"
}
```

name | type | description
---- | ---- | -----------
`success` | _Boolean_ | Successful request, or not.
`token` | _String_ | A one year valid JWT token, if authorization went well
