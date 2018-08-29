# Board API

The Board API is the latest addition to our Public API. It was built with our [iOS](https://itunes.apple.com/app/apple-store/id765359021?pt=10422800&ct=wetransfer-developer-portal&mt=8) and [Android](https://play.google.com/store/apps/details?id=com.wetransfer.app.live&referrer=utm_source%3Dwetransfer%26utm_medium%3Ddeveloper-portal) apps in mind, but it's also suitable for web/desktop users. It is designed for collecting content rather than transmitting content from A to B (though it can do that, too) and it supports both files and links.

Note that boards are "live" indefinitely, so long as they are being viewed. If a board is not accessed for 3 months / 90 days it is deleted.

## Create a new board

Boards are created without items. One the board has been created, items can be added at any time. If you don't add any items, the API will create an empty board.

```shell
curl https://dev.wetransfer.com/v2/boards \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"name": "Little kittens"}'
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

<h3 id="board-create-object" class="call"><span>POST</span> /boards</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name          | type   | required | description                                   |
| ------------- | ------ | -------- | --------------------------------------------- |
| `name`        | String | Yes      | Something about cats or coffee, most probably |
| `description` | String | No       | A description, if needed                      |

#### Response

```json
{
  "id": "random-hash",
  "name": "Little kittens",
  "description": null,
  "state": "uploading",
  "url": "https://we.tl/s-random-hash",
  "items": []
}
```

<aside class="warning"><strong>Note:</strong> The <code>url</code> in the response is the URL you will use to access the board you create! It is not returned at the end of the upload flow, rather right now when you create the empty board.</aside>

## Add links to a board

Once a board has been created you can then add links to it.

```shell
curl https://dev.wetransfer.com/v2/boards/{board_id}/links \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d '[{"url": "https://wetransfer.com/", "meta": {"title": "WeTransfer"}}]'
```

```ruby
# TBD
```

```javascript
const linkItems = await apiClient.board.addLinks(board, [{
  url: 'https://wetransfer.com/',
  meta: {
    title: "WeTransfer"
  }
}]);
```

```php
<?php
// TBD
```

<h3 id="board-send-links" class="call"><span>POST</span> /boards/{board_id}/links</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name    | type        | required | description                                  |
| ------- | ----------- | -------- | -------------------------------------------- |
| `links` | Array(Link) | Yes      | A list of links to send to an existing board |

#### File object

| name   | type   | required | description                                |
| ------ | ------ | -------- | ------------------------------------------ |
| `url`  | String | Yes      | The complete URL of the link               |
| `meta` | Hash   | Yes      | An object containing the metadata of the link |

#### Meta

| name   | type   | required | description                                |
| ------ | ------ | -------- | ------------------------------------------ |
| `title`  | String | Yes      | The title of the link. Can be custom.    |


#### Response

```json
[
  {
    "id": "random-hash",
    "url": "https://wetransfer.com/",
    "meta": {
      "title": "WeTransfer"
    },
    "type": "link"
  }
]
```

## Add files to a board

Once a board has been created you can then add files to it.

```shell
curl https://dev.wetransfer.com/v2/boards/{board_id}/files \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d '[{"name": "kittie.gif", "size": 1024}]'
```

```ruby
# TBD
```

```javascript
const fileItems = await apiClient.board.addFiles(board, [{
  name: 'kittie.gif',
  size: 1024
}]);
```

```php
<?php
// TBD
```

<h3 id="board-send-files" class="call"><span>POST</span> /boards/{board_id}/files</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name    | type        | required | description                                  |
| ------- | ----------- | -------- | -------------------------------------------- |
| `files` | Array(File) | Yes      | A list of files to send to an existing board |

#### File object

| name   | type   | required | description                                                         |
| ------ | ------ | -------- | ------------------------------------------------------------------- |
| `name` | String | Yes      | The name of the file you want to show on items list                 |
| `size` | Number | Yes      | File size in bytes. Must be accurate. No fooling. Don't let us down |

#### Response

```json
[
  {
    "id": "random-hash",
    "name": "kittie.gif",
    "size": 195906,
    "multipart": {
      "id": "some.random-id--",
      "part_numbers": 1,
      "chunk_size": 195906
    },
    "type": "file"
  }
]
```

It will return an object for each file you want to add to the board. Each file must be split into chunks, and uploaded to a pre-signed S3 URL, provided by the following endpoint.

**Important**

Chunks _must_ be 6 megabytes in size, except for the very last chunk, which can be smaller. Sending too much or too little data will result in a 400 Bad Request error when you finalise the file.

<h2 id="board-request-upload-url">Request upload URL</h2>

<h3 class="call"><span>GET</span> /boards/{board_id}/files/{file_id}/uploads/{part_number}/{multipart_upload_id}</h3>

To be able to upload a file, it must be split into chunks, and uploaded to different presigned URLs. This route can be used to fetch presigned upload URLS for each of a file's parts. These upload URLs are essentially limited access to a storage bucket hosted with Amazon. They are valid for an hour and must be re-requested if they expire.

```shell
curl "https://dev.wetransfer.com/v2/boards/{board_id}/files/{file_id}/uploads/{part_number}/{multipart_upload_id}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name                  | type   | required | description                                                                                                           |
| --------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `board_id`            | String | Yes      | The public ID of the board where you added the files                                                                  |
| `file_id`             | String | Yes      | The public ID of the file to upload, returned when adding items                                                       |
| `part_number`         | Number | Yes      | Which part number of the file you want to upload. It will be limited to the maximum `multipart.part_numbers` response |
| `multipart_upload_id` | Number | Yes      | The upload ID issued by AWS S3, which is available at `multipart.part_numbers`                                        |

#### Responses

##### 200 (OK)

```json
{
  "url": "https://presigned-s3-put-url"
}
```

The Response Body contains the presigned S3 upload `url`.

##### 401 (Unauthorized)

If the requester tries to request an upload URL for a file that is not in one of the requester's boards, we will respond with 401 UNAUTHORIZED.

##### 400 (Bad request)

If a request is made for a part, but no `multipart_upload_id` is provided; we will respond with a 400 BAD REQUEST as all consecutive parts must be uploaded with the same `multipart_upload_id`.

<h2 id="board-file-upload">File Upload</h2>

<h3 id="board-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

Please note: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

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
```

<h2 id="board-complete-file-upload">Complete a file upload</h2>

<h3 id="board-complete-upload" class="call"><span>POST</span> /files/{file_id}/uploads/complete</h3>

After all of the file parts have been uploaded, the file must be marked as complete.

```shell
curl -X https://dev.wetransfer.com/v2/boards/{board_id}/files/{file_id}/upload-complete \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

<h3 id="board-complete-upload" class="call"><span>POST</span> /boards/{board_id}/files/{file_id}/uploads/complete</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name       | type   | required | description                                                     |
| ---------- | ------ | -------- | --------------------------------------------------------------- |
| `board_id` | String | Yes      | The public ID of the board where you added the files            |
| `file_id`  | String | Yes      | The public ID of the file to upload, returned when adding items |
