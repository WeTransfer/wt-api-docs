# Authorization

<h3 id="send-request" class="call"><span>POST</span> /authorize</h3>

To use our APIs, you must provide a secret API key on every request. You can create a key on our [Developer Portal](https://developers.wetransfer.com/). Please make sure that you keep your API key in a secret place, and it is not shared on Github or other version control repositories or in client side code.

Our APIs expect the API key to be included as a header on every API request. Please provide the API key using `x-api-key` header, like in the following example:

<aside class="notice">
Replace <code>your_api_key</code> with your secret API key.
Also, we require a <code>Content-Type: application/json</code> header on every request, otherwise you will receive an "Unsupported Media Type" error.
</aside>

Besides the API Key and the Content-Type header, a JSON Web Token (JWT) must be included on subsequent requests. To retrieve a JWT, send a request including your API token to the following endpoint:

```shell
curl -X POST \
  https://dev.wetransfer.com/v2/authorize \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key"
```

Besides the API Key and the Content-Type header, a JSON Web Token (JWT) must be included on subsequent requests. To retrieve a JWT, send a request including your API token to the following endpoint:

```ruby
require 'we_transfer_client'

# Please keep in mind that authorization is performed when the client is initialized.
client = WeTransferClient.new(api_key: '# YOUR PRIVATE API KEY GOES HERE'))
```

```javascript
const createWTClient = require('@wetransfer/js-sdk');

// Please keep in mind that authorization is performed when the client is initialized.
const apiClient = await createWTClient('/* YOUR PRIVATE API KEY GOES HERE */');

// When using the SDK, there is no need to call authorize manually.
// The method is available though, in case you need to access the JWT.
const auth = await apiClient.authorize();
```

<h3 id="authorization" class="call"><span>POST</span> /authorize</h3>

#### Headers

| name           | type   | required | description              |
| -------------- | ------ | -------- | ------------------------ |
| `x-api-key`    | String | Yes      | Private API key          |
| `Content-Type` | String | Yes      | must be application/json |



```php
<?php
\WeTransfer\Client::setApiKey(getenv['WT_API_KEY']);

// When using the SDK, there is no need to call authorize manually.
// The method is available though, in case you need to access the JWT.
$token = \WeTransfer\Client::authorize();
```

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
`token` | String | A JWT token valid for one year, if authorization succeeded
