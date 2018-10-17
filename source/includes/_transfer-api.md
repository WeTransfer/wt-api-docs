# Transfer API

The Transfer API is classic WeTransfer. You might know it well (or you're about to). Use it to upload files, get the link and share magic. We've been using this behind the scenes for ages (an internal version of it powers our <a href="https://itunes.apple.com/app/wetransfer/id1114922065?ls=1&mt=12" target="blank">macOS app</a> and our <a href="https://we.tl/wtclient" target="_blank">Command Line Client</a> and now we're opening it up to you and all your users.

Transfers created through the APIs stick around for 7 days and then vanish forever. They also have a 2GB limit. For now the Transfer API is not connected to Plus accounts, so you'll need to store the transfer link somewhere - just like a web link transfer, there's no way to get the link back if it gets misplaced.

A transfer request consists of the endpoint itself, the headers, and the body, which can contain a message and must contain a list of file objects. The files themselves need a name and a size in bytes - you'll need to compute the size yourself. Most languages provide a way to do this.

Transfers must be created with files. Once the transfer has been created and finalized, the transfer is locked and cannot be further modified.

## Create a new transfer

When you create a transfer, you must include at least one file in the transfer create request.

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/transfers" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"message":"My very first transfer!","files":[
    {"name":"big-bobis.jpg", "size":195906}, "name":"kitty.jpg", "size":369785]}'
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
| `message` | String      | Yes      | Something about cats or coffee, most probably      |
| `files`   | Array       | Yes      | A list of file objects to be added to the transfer |

#### File object

| name   | type   | required | description                                                          |
| ------ | ------ | -------- | -------------------------------------------------------------------- |
| `name` | String | Yes      | The name of the file you want to show on items list                  |
| `size` | Number | Yes      | File size in bytes. Must be accurate. No fooling. Don't let us down! |

#### Response

```json
{
  "id": "random-hash",
  "message": "My very first transfer!",
  "state": "uploading",
  "files": [
    {
      "id": "random-hash",
      "name": "big-bobis.jpg",
      "size": 195906,
      "multipart": {
        "part_numbers": 1,
        "chunk_size": 5242880
      }
    },
    {
      "id": "random-hash",
      "name": "kitty.jpg",
      "size": 369785,
      "multipart": {
        "part_numbers": 1,
        "chunk_size": 5242880
      }
    }
  ]
}
```

Creates a new transfer with specified files.

## Request upload URL

To be able to upload a file, it must be split into parts and then each part will be uploaded to presigned AWS S3 URLs. This route can be used to fetch presigned upload URLS for each of a file's parts. These upload URLs are essentially limited access to a storage bucket hosted with Amazon. NB: They are valid for an <em>hour</em> and must be re-requested if they expire.

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
  const chunkStart = partNumber * file.multipart.chunk_size;
  const chunkEnd = (partNumber + 1) * file.multipart.chunk_size;

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

Transfer chunks must be 5 megabytes in size, except for the very last chunk, which can be smaller. Sending too much or too little data will result in a 400 Bad Request error when you finalise the file.

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

#### Responses

##### 200 (OK)

```json
{
  "url": "https://presigned-s3-put-url"
}
```

The Response Body contains the presigned S3 upload `url`.

##### 404 (Not found)

If the requester tries to request an upload URL for a file that is not in one of the requester's transfers, we will respond with 404 Not found.

<h2 id="transfer-file-upload">File Upload</h2>

<h3 id="transfer-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

Important: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

```shell
curl -i -T "./path/to/big-bobis.jpg" "https://signed-s3-upload-url"
```

```javascript
// Use your favourite JS
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

Finalize a file. Once all the parts have been uploaded succesfully, you use this endpoint to tell the system that it can start splicing the parts together to form one whole file.

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
  "chunk_size": 195906
}
```

<h2 id="finalize-a-transfer">Finalize a transfer</h2>

Finalize the whole transfer. Once all the parts have been uploaded and finalized, you use this endpoint to tell the system that everything has been completely uploaded.

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

<h3 id="transfer-complete-upload" class="call"><span>PUT</span> /transfers/{transfer_id}/finalize</h3>

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

#### Responses

##### 200 (OK)

```json
{
  "id": "random-hash",
  "state": "processing",
  "message": "Little kittens",
  "url": "https://we.tl/t-smaller-random-hash",
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
The <code>url</code> field is where you get the link you will need to access the transfer!
</aside>

##### 400 (Bad Request)

This is returned if the transfer can no longer be written to, or is it ready to be downloaded.

##### 403 (Unauthorized)

When you try to access something you don't have access to.
