# Errors

In working with the WeTransfer API you might come across some errors. Here are some of the most common, and what you can do about them.

## Most common errors

Error | Message | Explanation | Solution
------|---------|-------------|----------
Missing Authentication Token |`{"message":"Missing Authentication Token"}` | Despite what you might think, this actually just means that you're hitting an endpoint that doesn't exist. | Check that you've spelled the endpoint correctly, and remember that our API is versioned - dev.wetransfer.com/authorize won't work, but dev.wetransfer.com/v1/authorize will.
Forbidden |`{"message":"Forbidden"}` | You've forgotten to send us your API key, or it's being improperly sent. | Make sure that you're sending your API key with each request - see the example code, or add a header like so: `X-API-KEY: <your api key>`.
Unsupported Media Type |`{"message":"Unsupported Media Type"}` | You've sent a request to the API without a `Content-Type` set, or incorrectly set. | Make sure that you're sending a `Content-Type: application/json` header with each request.
Unsupported HTTP Method |`{"message":"Unsupported HTTP method"}` | You've sent a request to an endpoint using the wrong HTTP method. For example, you've sent a POST request to an endpoint that expects a GET. | Make sure that you're using the correct HTTP verb for each endpoint.
API Rate Limit |`{"message":"Limit Exceeded Exception"}` or a 429 response | You've exceeded your rate limit. | Try again but with fewer requests in a given time period, wait until tomorrow, or even better: email us (developers@wetransfer.com) and we can talk extending the limit.
Expected X to be Y | `{"message":"Expected 1200 to be 3243214"}`| If the size of the file you send does not match the size of the file you told us to expect, you'll see this message when you send a /complete request. | Check that you're properly computing the size of the file, or that you're uploading all the required chunks (before sending the complete call).

## A note about file upload errors

Because file uploads go directly to S3, any errors during this step of the process will be returned in XML. Please see the <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">official S3 documentation</a> for details of individual AWS S3 responses.

## Error codes

The WeTransfer API uses the following conventional error codes:

Code | Meaning
---- | -------
`400` | Bad Request -- Your request is invalid.
`403` | Forbidden -- Your API key is wrong.
`404` | Not Found -- The specified resource could not be found.
`405` | Method Not Allowed -- You tried to access a transfer with an invalid method.
`406` | Not Acceptable -- You requested a format that isn't json.
`410` | Gone -- The transfer requested has been removed from our servers.
`418` | I'm a teapot.
`429` | Too Many Requests -- You're requesting too many things! Slow down!
`500` | Internal Server Error -- We had a problem with our server. Try again later.
`503` | Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
