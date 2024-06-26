
# Authorization

### API keys - where and how

To use our APIs you must provide your API key with every request.

<s>
Create an API key on our <a href="https://developers.wetransfer.com/" target="_blank">developers portal</a> - currently we require you to have a GitHub or Google account to login.
</s>
<div class="shutdown-text">Unfortunately, the public API is closed. New accounts cannot be created</div>

Once you've done so make sure you're on the dashboard page, and select "Create new application" to start generating an API key.

Once you have a key (or multiple keys), please make sure that you keep them in a secret place, and do not share them. If you need to delete and recreate your key (for whatever reason) click on the key in your dashboard, and select "Delete" under actions. NOTE: This will destroy your currently existing key, so you may want to create a new application / key and add the new key to any running systems before deleting the old one.

<aside class="notice">
In all of our examples remember to replace `your_api_key` with your own API key. Also, we require a <code>Content-Type: application/json</code> header on every POST and PUT request, otherwise you will receive an "Unsupported Content-Type" error.
</aside>

When you or a user starts your app / script / etc, it/they will need to authorize using the endpoint below.

### Key Limits

Any API key is limited to 1000 requests per 24 hours. All requests to the public API count towards this limit.

<h3 id="send-request" class="call"><span>POST</span> /authorize</h3>

Besides the API Key and the Content-Type header, a JSON Web Token (JWT) must be included on all requests **other than the authorize request**. You may want to submit an authorization request per-user of your application, containing a unique user identifier. We recommend making these user identifiers random and non-sequential, so long as they mean something to your application or internal systems.

These JWTs can be used to interact with the API, and will identify the user to our backend systems. Do not allow (unless your application depends on this functionality) different users to share a unique_identifier, as this will mean that user Alice can access user Bob's transfers. If you do not include the identifier, anyone using your application can potentially access any other transfers and boards created by your application.

Where the API key can be seen as the key to the front door of a house, the `user_identifier` can be used to create an isolated room within that house.

If you don't use a user identifier when authenticating, you can interact with all boards and transfers you create for your API key. On the other hand, if Alice and Bob are two users using the same API key, but using different `user_identifier`s, they can interact with their *own* boards and transfers only, *not* with the other boards and transfers created with the same API key, for other users.

To retrieve a JWT, send a request including your API key to the following endpoint:

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/authorize" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR PRIVATE API KEY GOES HERE" \
  -d '{"user_identifier":"5eb6b98e-ddaa-4f5b-9d03-7bd4d91aa05f"}'
```

```javascript
const createWTClient = require('@wetransfer/js-sdk');

// Please keep in mind that authorization is performed when the client is initialized.
const wtClient = await createWTClient('/* YOUR PRIVATE API KEY GOES HERE */');

// When using the SDK, there is no need to call authorize manually.
// The method is available though, in case you need to access the JWT.
const auth = await wtClient.authorize();
```

```ruby
# Using the WeTransfer Ruby SDK...
require 'we_transfer_client'

# Create a WeTransfer client that authorizes requests on your api_key
client = WeTransfer::Client.new(api_key: 'YOUR PRIVATE API KEY GOES HERE')

# Or, by hand.
# If you aren't using the WeTransfer gem, you could POST yourself:
require 'faraday'

faraday = Faraday.new('https://dev.wetransfer.com')
response = faraday.post(
  '/v2/authorize',
  '{}',
  {
    'Content-Type' => 'application/json',
    'x-api-key' => 'YOUR PRIVATE API KEY GOES HERE',
  }
)
```

```swift
// The client is configured with your private API key
// The SDK performs the authorize request once, right before the actual transfer or board creation request
WeTransfer.configure(with: WeTransfer.Configuration(apiKey: "YOUR PRIVATE API KEY GOES HERE"))
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

##### 200 (OK)

If you successfully authenticate, this endpoint will return an HTTP response with a status code of `200` and a body as below.

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqdXN0IGEgc2FtcGxlIHRva2VuLCB0aGUgYWN0dWFsIG9uZSB3aWxsIGhhdmUgZGlmZmVyZW50IGNvbnRlbnQiLCJuYW1lIjoiQW5nZWxhIEJlbm5ldHQiLCJpYXQiOjE1MTYyMzkwMjJ9.fd14EeU1vbj40WtHIYaDwpCOE972DKnrrP8mffioEdg"
}
```

The token returned here must be sent with subsequent requests. It is not recommended to share this token across clients - if your app is installed on a new device it should at the very least re-authorize on startup.
The (optional) `user_identifier` attribute is very well suited to create different tokens for different clients, using the same API key.

##### 403 (Forbidden)

If you send an API key that is invalid, or you don't send an API key at all, this endpoint will return an HTTP response with a status code of `403` and a body as below.

```json
{
  "success": false,
  "message": "Forbidden: invalid API Key. See https://developers.wetransfer.com/documentation"
}
```
