# Transfer API

The Transfer API is classic WeTransfer. You might know it well (or you're about to). Use it to upload files, get the link and share magic. We've been using this behind the scenes for ages (an internal version of it powers our <a href="https://itunes.apple.com/app/wetransfer/id1114922065?ls=1&mt=12" target="blank">macOS app</a> and our <a href="https://we.tl/wtclient" target="_blank">Command Line Client</a> and now we're opening it up to you and all your users.

Transfers created through the APIs stick around for 7 days and then vanish forever. They also have a 2GB limit. For now the Transfer API is not connected to Plus accounts, so you'll need to store the transfer link somewhere - just like a web link transfer, there's no way to get the link back if it gets misplaced.

A transfer request consists of the endpoint itself, the headers, and the body, which can contain a message and must contain a list of file objects. The files themselves need a name and a size in bytes - you'll need to compute the size yourself. Most languages provide a way to do this.

Transfers must be created with files. Once the transfer has been created and finalized, the transfer is locked and cannot be further modified.

## Create a new transfer

When you create a transfer, you must include at least one file in the transfer create request.

Creating a transfer is to inform the API that you want to create a transfer (with at least one file), but you aren't sending the files already.

What you are sending is the `message`, a property that describes what this transfer is about, and a collection of file `name`s and their `size`. This allows the API to set up a place where your files can be uploaded to in a later state. Make sure the size of the file is accurate. Please don't lie to us; we will not be able to handle your files in a later stage...

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/transfers" \
  -H "Content-Type: application/json" \
  -H "x-api-key: REPLACE_WITH_YOUR_API_KEY" \
  -H "Authorization: Bearer REPLACE_WITH_YOUR_TOKEN" \
  -d '
    {
      "message":"My very first transfer!",
      "files":[
        {
          "name":"big-bobis.jpg",
          "size":195906
        },
        {
          "name":"kitty.jpg",
          "size":369785
        }
      ]
    }'
```

```javascript
const transfer = await wtClient.transfer.create({
  message: 'My very first transfer!',
  files: [
    {
      name: 'big-bobis.jpg',
      size: 195906
    },
    {
      name: 'kitty.jpg',
      size: 369785
    }
  ]
});
```

```ruby
# In the current Ruby SDK (version 0.9.x), you can only create a transfer
# and upload the files in one go. This behavior will be split in the upcoming
# major (version 1.0) release.

client = WeTransfer::Client.new(api_key: wetransfer_api_key)

client.create_transfer_and_upload_files(message: 'My very first transfer!') do |builder|
  # Add as many files as you need, using `add_file`, or `add_file_at`
  builder.add_file(name: 'big-bobis.jpg', io: File.open('/path/to/cat_image.jpg', 'rb'))
  builder.add_file_at(path: '/path/to/kitty.jpg')
end

# Access the transfer in your browser:
puts "The transfer can be viewed on #{transfer.url}"
```

<h3 id="transfer-create-object" class="call"><span>POST</span> /transfers</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | Must be application/json       |

#### Parameters

| name      | type        | required | description                                        |
| --------- | ----------- | -------- | -------------------------------------------------- |
| `message` | String      | No      | Something about cats or coffee, most probably. Defaults to an empty string |
| `files`   | Array       | Yes      | A list of file objects to be added to the transfer |

#### File object

| name   | type   | required | description |
| ------ | ------ | -------- | --- |
| `name` | String | Yes      | The name of the file you want to show on items list |
| `size` | Number | Yes      | File size in bytes. **Must** be accurate. No fooling. Don't let us down! |

#### Response

##### 201 (Created)

After a successful request where a transfer has been created, this endpoint will return an HTTP response with a status code of `201` and a body as below.

```json
{
  "success" : true,
  "message" : "My very first transfer!",
  "files" : [
    {
      "multipart" : {
        "part_numbers" : 1,
        "chunk_size" : 195906
      },
      "size" : 195906,
      "type" : "file",
      "name" : "big-bobis.jpg",
      "id" : "c964caf6c54343f3b6e9610cb4ac5ea220181019143517"
    },
    {
      "multipart" : {
        "part_numbers" : 1,
        "chunk_size" : 369785
      },
      "size" : 369785,
      "type" : "file",
      "id" : "e7f74773661f2be2bec90e6322864abd20181019143517",
      "name" : "kitty.jpg"
    }
  ],
  "url" : null,
  "id" : "32a6ef6003f1429be0cf1674dd8fbdef20181019143517",
  "state" : "uploading"
}
```

##### 400 (Bad Request)

If the body in the request to this endpoint is not valid json, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "Unexpected token ! in JSON at position 0. See https://developers.wetransfer.com/documentation"
}
```

It will list the actual error in the JSON, the above result is just a response to a json string that starts with an exclamation point.

If you set the message for your transfer to something other than a string, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"transfer.message\" must be a string. See https://developers.wetransfer.com/documentation"
}
```

If you forget to send the `files` in the JSON of your request, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"transfer.files\" must contain at least 1 items. See https://developers.wetransfer.com/documentation"
}
```

## Request upload URLs

If you look at that response above, you see some pointers that are needed now. All files should be uploaded to a specific place. You just have to get the place from our API. To do that, you ask the API based on the `transfer.id`, each and every `file.id`, and for each part (based on the `file.multipart.part_numbers` property).

To be able to upload a file, it must be split into parts and then each part will be uploaded to pre-signed AWS S3 URLs.

This endpoint can be used to get pre-signed upload URLS for each of a file's parts. These upload URLs are essentially limited access to a storage bucket hosted with Amazon. NOTE: They are valid for an **hour** and must be re-requested if they expire.

```shell
curl -i -X GET "https://dev.wetransfer.com/v2/transfers/{transfer_id}/files/{file_id}/upload-url/{part_number}" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

```javascript
const file = transfer.files[0];

for (
  let partNumber = 0;
  partNumber < file.multipart.part_numbers;
  partNumber++
) {
  // Get the upload url for the chunk we want to upload
  const uploadURL = await wtClient.transfer.getFileUploadURL(
    transfer.id,
    file.id,
    partNumber + 1
  );

  console.log(uploadURL.url)
}
```

```ruby
# This functionality is currently not enabled in the SDK.
```

<h3 id="transfer-request-upload-url" class="call"><span>GET</span> /transfers/{transfer_id}/files/{file_id}/upload-url/{part_number}</h3>

Transfer chunks must be 5 megabytes (or more specifically: 5242880 bytes) in size, except for the very last chunk, which can be smaller. Sending too much or too little data will result in a `400 Bad Request` error when you finalize the file.

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | Must be application/json       |

#### Parameters

| name          | type   | required | description                                                                                                           |
| ------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `transfer_id` | String | Yes      | The public ID of the transfer                                                                                         |
| `file_id`     | String | Yes      | The public ID of the file to upload, returned the transfer was created                                                |
| `part_number` | Number | Yes      | Which part number of the file you want to upload. It will be limited to the maximum `multipart.part_numbers` response |

#### Response

##### 200 (OK)

```json
{
  "success": true,
  "url": "https://presigned-s3-put-url"
}
```

The Response Body contains the pre-signed S3 upload `url`.

##### 404 (Not found)

If you try to request an upload URL for a file that is not in the transfers,, this endpoint will return an HTTP response with a status code of `404` and a body as below.

```json
{
  "success" : false,
  "message" : "Invalid transfer or file id. See https://developers.wetransfer.com/documentation"
}
```

##### 417 (Expectation Failed)

The API starts counting chunks from number `1`, not `0`. If you request to upload part `0`, this endpoint will return an HTTP response with a status code of `417` and a body as below.

```json
{
  "success" : false,
  "message" : "Chunk numbers are 1-based. See https://developers.wetransfer.com/documentation"
}
```

<h2 id="transfer-file-upload">File Upload</h2>

<h3 id="transfer-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

Time to actually upload (chunks of) your file. With the pre-signed-upload-url you retrieved in the previous step, you can start uploading!

You will interact directly with Amazon S3. As such, we have no control over the messages sent by S3.

Important: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

```shell
curl -i -T "./path/to/big-bobis.jpg" "https://signed-s3-upload-url"
```

```javascript
const axios = require('axios');
const fs = require('fs');

const file = transfer.files[0];
const fileContent = fs.readFileSync('/path/to/file');

for (
  let partNumber = 0;
  partNumber < file.multipart.part_numbers;
  partNumber++
) {
  const chunkStart = partNumber * file.multipart.chunk_size;
  const chunkEnd = (partNumber + 1) * file.multipart.chunk_size;

  // Get the upload url for the chunk we want to upload
  const uploadURL = await wtClient.transfer.getFileUploadURL(
    transfer.id,
    file.id,
    partNumber + 1
  );

  // Use whichever JavaScript library you prefer to upload the chunk:
  // axios, request, fetch, XMLHttpRequest, etc.
  axios({
    url: uploadURL.url,
    method: 'put',
    data: fileContent.slice(chunkStart, chunkEnd),
  });
}
```

```ruby
# This functionality is currently not enabled in the SDK.
```

<h2 id="transfer-complete-file-upload">Complete a file upload</h2>

In the previous step, you've uploaded your file (potentially in parts) directly to S3. The WeTransfer API has no idea when that is complete. This call informs your transfer object that all the uploading for your file is done.

Again, to inform the API about this event, you need both the transfer id and the file id. Not only that, you currently also have to inform this endpoint on the amount of part numbers.

```shell
curl -i -X PUT "https://dev.wetransfer.com/v2/transfers/{transfer_id}/files/{file_id}/upload-complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"part_numbers":1}'
```

```javascript
await wtClient.transfer.completeFileUpload(transfer, file);
```

```ruby
# This functionality is currently not enabled in the SDK.
```

<h3 id="transfer-complete-upload" class="call"><span>PUT</span> /transfers/{transfer_id}/files/{file_id}/upload-complete</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | Must be application/json       |

#### Parameters

| name           | type   | required | description                                                                              |
| -------------- | ------ | -------- | ---------------------------------------------------------------------------------------- |
| `transfer_id`  | String | Yes      | The public ID of the transfer                                                            |
| `file_id`      | String | Yes      | The public ID of the file to upload, returned the transfer was created                   |
| `part_numbers` | String | Yes      | Total number of parts uploaded. It must be the same as `multipart.part_numbers` response |

#### Response

##### 200 (OK)

```json
{
  "id": "random-hash",
  "retries": 0,
  "name": "big-bobis.jpg",
  "size": 195906,
  "chunk_size": 5242880
}
```

##### 417

If you try to finalize a file, but didn't actually upload all chunks, this endpoint will return an HTTP response with a status code of `417` and a body as below.

```json
{
  "success": false,
  "message": "Chunks 1 are still missing. See https://developers.wetransfer.com/documentation"
}
```

<h2 id="finalize-a-transfer">Finalize a transfer</h2>

After all files are uploaded and finalized, you can close the transfer for modification, and make it available for download.

You do that by calling this endpoint. It informs the API that everything has been completely uploaded.

```shell
curl -i -X PUT "https://dev.wetransfer.com/v2/transfers/{transfer_id}/finalize" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

```javascript
// Finalize transfer
const finalTransfer = await wtClient.transfer.finalize(transfer);

console.log(finalTransfer.url);
```

```ruby
# This functionality is currently not enabled in the SDK.
```

<h3 id="transfer-finalize" class="call"><span>PUT</span> /transfers/{transfer_id}/finalize</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name          | type   | required | description                                                     |
| ------------- | ------ | -------- | --------------------------------------------------------------- |
| `transfer_id` | String | Yes      | The public ID of the transfer where you added the files         |

#### Response

##### 200 (OK)

If all went well, the API sends you a lot of data. One of them being the `url`. That is the thing you will use to access the transfer in a browser.

```json
{
  "id": "random-hash",
  "state": "processing",
  "message": "My first transfer!",
  "url": "https://we.tl/t-12344657",
  "files": [
    {
      "id": "random-hash",
      "name": "big-bobis.jpg",
      "size": 195906,
      "multipart": {
        "part_numbers": 1,
        "chunk_size": 195906
      }
    }
  ]
}
```

<aside class="notice">
The `url` field is where you get the link you will need to access the transfer!
</aside>

<h2 id="retrieve-transfer-information"class="call">Retrieve transfer information</h2>

Once you're done, you might want to know about your transfer and all of its files. You can use your `transfer_id` and this endpoint to retrieve that information.

<h3 id="get-transfer" class="call"><span>GET</span> /transfers/{transfer_id}</h3>

```shell
curl -iX GET "https://dev.wetransfer.com/v2/transfers/{transfer_id}" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |

#### Parameters

| name | type | required | description |
| ---- | ---- | -------- | ----------- |
| `transfer_id` | String | Yes | The ID of the transfer you've finalized |

#### Response

##### 200 (OK)

```json
{
  "message": "My very first transfer!",
  "id": "random-hash",
  "state": "downloadable",
  "url": "https://we.tl/t-ABcdEFgHi12",
  "files": [
    {
      "id": "another-random-hash",
      "type": "file",
      "name": "big-bobis.jpg",
      "multipart": {
        "chunk_size": 195906,
        "part_numbers": 1
      },
      "size": 195906
    }
  ]
}
```

##### 404 (Not Found)

When you try to get information from a transfer we cannot find, or that you don't have access to, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success" : false,
  "message": "Couldn't find Transfer. See https://developers.wetransfer.com/documentation"
}
```
