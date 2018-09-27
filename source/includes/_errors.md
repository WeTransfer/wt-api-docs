# Errors

In working with the WeTransfer API you might come across some errors. Here are some of the most common, and what you can do about them.

## Most common errors

<section class="error_container">
  <div class="error">
    <div class="error__title">401 Unauthorized</div>
    <code class="error__code">{"message":"Unauthorized"}</code>
    <div class="two-col">
      <div class="col">
        <span>Explanation:</span>
        <p>You've forgotten to send us your API key, or it's being improperly sent.</p>
      </div>
      <div class="col">
        <span>Solution:</span>
        <p>Make sure that you're sending your API key with each request - see the example code, or add a header like so: <code>`x-api-key: your_api_key`</code>.</p>
      </div>
    </div>
  </div>

  <div class="error">
    <div class="error__title">404 Resource not found</div>
    <code class="error__code">{"message":"Resource not found"}</code>
    <div class="two-col">
      <div class="col">
        <span>Explanation</span>
        <p>The endpoint you are trying to hit doesn't exist.</p>
      </div>
      <div class="col">
        <span>Solution</span>
        <p>Check that you've spelled the endpoint correctly, and remember that our API is versioned - dev.wetransfer.com/authorize won't work, but dev.wetransfer.com/v2/authorize will.</p>
      </div>
    </div>
  </div>

  <div class="error">
    <div class="error__title">415 Unsupported Content-Type header</div>
    <code class="error__code">{"message":"Unsupported Content-Type header. Please set Content-Type to 'application/json'."</code>
    <div class="two-col">
      <div class="col">
        <span>Explanation:</span>
        <p>You've sent a request to the API without a `Content-Type` set, or incorrectly set.</p>
      </div>
      <div class="col">
        <span>Solution:</span>
        <p>Make sure that you're sending a <code>Content-Type: application/json</code> header with each request.</p>
      </div>
    </div>
  </div>

  <div class="error">
    <div class="error__title">405 Unsupported HTTP Method</div>
    <code class="error__code">{"message":"The HTTP method or resources may not be supported."}</code>
    <div class="two-col">
      <div class="col">
        <span>Explanation:</span>
        <p>You've sent a request to an endpoint using the wrong HTTP method. For example, you've sent a POST request to an endpoint that expects a GET.</p>
      </div>
      <div class="col">
        <span>Solution:</span>
        <p>Make sure that you're using the correct HTTP verb for each endpoint.</p>
      </div>
    </div>
  </div>

  <div class="error">
    <div class="error__title">429 API Rate Limit</div>
    <code class="error__code">{"message":"Limit Exceeded Exception"} or 429 response</code>
    <div class="two-col">
      <div class="col">
        <span>Explanation:</span>
        <p>You've exceeded your rate limit.</p>
      </div>
      <div class="col">
        <span>Solution:</span>
        <p>Try again but with fewer requests in a given time period, wait until tomorrow, or even better: email us (developers@wetransfer.com) and we can talk extending the limit.</p>
      </div>
    </div>
  </div>

  <div class="error">
    <div class="error__title">400 Expected X to be Y</div>
    <code class="error__code">{"message":"Expected 1200 to be 3243214"}</code>
    <div class="two-col">
      <div class="col">
        <span>Explanation:</span>
        <p>If the size of the file you send does not match the size of the file you told us to expect, you'll see this message when you send a /complete request.</p>
      </div>
      <div class="col">
        <span>Solution:</span>
        <p>Check that you're properly computing the size of the file, or that you're uploading all the required chunks (before sending the complete call).</p>
      </div>
    </div>
  </div>
</section>

## A note about file upload errors

Because file uploads go directly to S3, any errors during this step of the process will be returned in XML. Please see the <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">official S3 documentation</a> for details of individual AWS S3 responses.

## Error codes

The WeTransfer API uses the following conventional error codes:

| Code  | Meaning                                                                                   |
| ----- | ----------------------------------------------------------------------------------------- |
| `400` | Bad Request -- Your request is invalid.                                                   |
| `403` | Forbidden -- Your API key is wrong.                                                       |
| `404` | Not Found -- The specified resource could not be found.                                   |
| `405` | Method Not Allowed -- You tried to access a transfer with an invalid method.              |
| `406` | Not Acceptable -- You requested a format that isn't json.                                 |
| `410` | Gone -- The transfer requested has been removed from our servers.                         |
| `418` | I'm a teapot.                                                                             |
| `429` | Too Many Requests -- You're requesting too many things! Slow down!                        |
| `500` | Internal Server Error -- We had a problem with our server. Try again later.               |
| `503` | Service Unavailable -- We're temporarily offline for maintenance. Please try again later. |
