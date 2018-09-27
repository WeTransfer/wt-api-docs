# Authorization

### API keys - where and how
To use our APIs you must provide your API key with every request. Create an API key on our <a href="https://developers.wetransfer.com/" target="_blank">developers portal</a> - currently we require you to have a github account to login. Once you've done so make sure you're on the
dashboard page, and select "Create new application" to start generating an API key.

Once you have a key or keys, please make sure that you keep them in a secret place, and do not share it on Github, other version control systems, or in client side code. If you need to delete and recreate your key (for whatever reason) click on the key in your dashboard, and select "Delete" under actions. NOTE: This will destroy your currently existing key, so you may want to create a new application / key and add the new key to any running systems before deleting the old one.

<aside class="notice">
In all of our examples remember to replace <code>your_api_key</code> with your own API key. Also, we require a <code>Content-Type: application/json</code> header on every request, otherwise you will receive an "Unsupported Content-Type" error.
</aside>

When you or a user starts your app / script / etc, it/they will need to authorize using the endpoint below.

<h3 id="send-request" class="call"><span>POST</span> /authorize</h3>

Besides the API Key and the Content-Type header, a JSON Web Token (JWT) must be included on all requests <em>other than the authorize request</em>. You may want to submit an authorisation request per-user of your application, containing a unique user identifier. We recommend making these user identifiers random and non-sequential, so long as they mean something to your application or internal systems. In our example below we used Ruby's `SecureRandom.uuid` to generate an identifier.

These JWTs can be used to retrieve boards, and will identify the user to our backend systems. Do not allow (unless your application depends on this functionality) different users to share a unique_identifier, as this will mean that user Alice can access user Bob's transfers. If you do not include the identifier, anyone using your application can potentially access any other boards created by your application.

To retrieve a JWT, send a request including your API key to the following endpoint:

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/authorize" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"user_identifier":"5eb6b98e-ddaa-4f5b-9d03-7bd4d91aa05f"}'
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

| name           | type   | required | description              |
| -------------- | ------ | -------- | ------------------------ |
| `x-api-key`    | String | Yes      | Private API key          |
| `Content-Type` | String | Yes      | Must be application/json |

#### Body

| name              | type   | required | description                                        |
| ----------------- | ------ | -------- | -------------------------------------------------- |
| `user_identifier` | String | No       | A unique (per user of your application) identifier |


#### Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqdXN0IGEgc2FtcGxlIHRva2VuLCB0aGUgYWN0dWFsIG9uZSB3aWxsIGhhdmUgZGlmZmVyZW50IGNvbnRlbnQiLCJuYW1lIjoiQW5nZWxhIEJlbm5ldHQiLCJpYXQiOjE1MTYyMzkwMjJ9.fd14EeU1vbj40WtHIYaDwpCOE972DKnrrP8mffioEdg"
}
```

| name      | type    | description                                                |
| --------- | ------- | ---------------------------------------------------------- |
| `success` | Boolean | Successful request, or not.                                |
| `token`   | String  | A JWT token valid for one year, if authorization succeeded |

The token returned here must be sent with subsequent requests. It is not recommended to share this token across clients - if your app is installed on a new device it should at the very least re-authorise on startup.
