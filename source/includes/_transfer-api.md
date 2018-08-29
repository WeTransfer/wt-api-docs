# Transfer API

The Transfer API is classic WeTransfer. You know it well (or you're about to) - upload files, get link, share magic. We've been using this behind the scenes for ages (an internal version of it powers our [macOS app](https://itunes.apple.com/app/wetransfer/id1114922065?ls=1&mt=12) and our [Command Line Client](https://we.tl/wtclient)) and now we're opening it up to you and all your users.

Transfers created through the APIs stick around for 7 days and then vanish forever. They also have a 2GB limit. For now the Transfer API is not connected to Plus accounts, so you'll need to store the transfer link somewhere - just like a web link transfer, there's no way to get the link back if it gets misplaced.

A transfer request consists of the endpoint itself, the headers, and the body, which can contain a message and must contain a list of file objects. The files themselves need a name and a size in bytes - you'll need to compute the size yourself. Most languages provide a way to do this.

## Create a new transfer

Transfers must be created with files. Once the transfer has been created and finalized, the transfer is locked and cannot be further modified.

```shell
curl https://dev.wetransfer.com/v2/transfers \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"message": "My very first transfer!","files":[{"name":"big-bobis.jpg", "size":195906}]}}'
```

```ruby
# TBD
```

```javascript
// TBD
```

```php
<?php
// TDB
```

<h3 id="transfer-create-object" class="call"><span>POST</span> /transfers</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name      | type        | required | description                                   |
| --------- | ----------- | -------- | --------------------------------------------- |
| `message` | String      | Yes      | Something about cats or coffee, most probably |
| `files`   | Array       | Yes      | A list of file objects to be added to the transfer   |

#### File object

| name   | type   | required | description                                                         |
| ------ | ------ | -------- | ------------------------------------------------------------------- |
| `name` | String | Yes      | The name of the file you want to show on items list                 |
| `size` | Number | Yes      | File size in bytes. Must be accurate. No fooling. Don't let us down |


#### Response

```json
{
  "id": "random-hash",
  "message": "Little kittens",
  "state": "uploading",
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

Creates a new transfer with specified files.

## Request upload URL

To be able to upload a file, it must be split into parts and then each part will be uploaded to presigned AWS S3 URLs. This route can be used to fetch presigned upload URLS for each of a file's parts. These upload URLs are essentially limited access to a storage bucket hosted with Amazon. NB: They are valid for an <em>hour</em> and must be re-requested if they expire.

```shell
curl "https://dev.wetransfer.com/v2/transfers/{transfer_id}/files/{file_id}/upload-url/{part_number}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

<h3 id="transfer-request-upload-url" class="call"><span>GET</span> /transfers/{transfer_id}/files/{file_id}/upload-url/{part_number}</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name          | type   | required | description                                                                                                           |
| ------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `transfer_id` | String | Yes      | The public ID of the transfer where you added the files                                                               |
| `file_id`     | String | Yes      | The public ID of the file to upload, returned when adding items                                                       |
| `part_number` | Number | Yes      | Which part number of the file you want to upload. It will be limited to the maximum `multipart.part_numbers` response |

#### Responses

##### 200 (OK)

```json
{
  "url": "https://presigned-s3-put-url"
}
```

The Response Body contains the presigned S3 upload `url`.

<!-- ##### 401 (Unauthorized)

If the requester tries to request an upload URL for a file that is not in one of the requester's transfers, we will respond with 401 UNAUTHORIZED.

##### 400 (Bad request)

If a request is made for a part, but no `multipart_upload_id` is provided; we will respond with a 400 BAD REQUEST as all consecutive parts must be uploaded with the same `multipart_upload_id`. -->

<h2 id="transfer-file-upload">File Upload</h2>

<h3 id="transfer-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

Important: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

```shell
curl -T "./path/to/kittie.gif" "https://signed-s3-upload-url"
```

```ruby
# TBD
```

```javascript
// TBD
```

```php
<?php
// TBD
```

<h2 id="transfer-complete-file-upload">Complete a file upload</h2>

Finalize a file. Once all the parts have been uploaded succesfully, you use this endpoint to tell the system that it can start splicing the parts together to form one whole file.

```shell
curl -X https://dev.wetransfer.com/v2/transfers/{transfer_id}/files/{file_id}/upload-complete \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

<h3 id="transfer-complete-upload" class="call"><span>PUT</span> /transfers/{transfer_id}/files/{file_id}/upload-complete</h3>

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
| `file_id`     | String | Yes      | The public ID of the file to upload, returned when adding items |

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

<h2 id="finalize-a-transfer">Finalize a transfer</h2>

Finalize the whole transfer. Once all the parts have been uploaded and finalized, you use this endpoint to tell the system that everything has been completely uploaded.

```shell
curl -X https://dev.wetransfer.com/v2/transfers/{transfer_id}/finalize
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
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
                "chunk_size": 60510
            }
        }
    ]
}
```

<aside class="notice">
The <code>url</code> field is where you get the link you will need to access the transfer!
</aside>

##### 400 (Bad Request)

This is returned if the transfer can no longer be written to.

##### 403 (Unauthorized)

When you try to access something you don't have access to.
