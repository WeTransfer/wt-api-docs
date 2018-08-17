# Board API

Intro about the Board API

## Flow Diagram

To help illustrate the multi-step process of using the Board API, we've made this Flow Diagram.

<section class="flow-diagram">
  <ol>
    <li class="flow-diagram__section">
      <h3>Authorize</h3>
      <p>First, we have to make sure you’re fully authorized to create a new board. You do this by sending two authentication headers with the authorize request.</p>
      <ul>
        <li class="flow-diagram__item">
          <a href="#board-send-request">
            <h4>1.1 - Send authorization request</h4>
            <code><em>POST</em> /authorize</code>
          </a>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>Create an empty board</h3>
      <p>Next up, we create an empty board object and tell it what items to expect in the next step. This is also where we retrieve the URL for the board itself.</p>
      <ul>
        <li class="flow-diagram__item">
          <a href="#create-object">
            <h4>2.1 - Create an empty transfer object</h4>
            <code><em>POST</em> /boards</code>
          </a>
        </li>
        <li class="flow-diagram__item">
          <a href="#send-items">
            <h4>2.2 - Send list of items to transfer object</h4>
            <code><em>POST</em> /boards/{board_id}/items</code>
          </a>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>Upload each file to Board Object</h3>
      <p>Then for each file part you request an upload URL that will show you where on Amazon to put it. Repeat until you’ve uploaded all parts and move on to next file.</p>
      <fieldset>
        <legend>for each part</legend>
        <ul>
          <li class="flow-diagram__item">
            <a href="#request-upload-url">
              <h4>3.1 - Request upload URL for part</h4>
              <code><em>GET</em> /files/{file_id}/uploads/{part_number}/{multipart_upload_id}</code>
            </a>
          </li>
          <li class="flow-diagram__item">
            <a href="#upload-part">
              <h4>3.2 - Upload part</h4>
              <code><em>PUT</em> {signed_s3_url}</code>
            </a>
          </li>
        </ul>
      </fieldset>
      <ul>
        <li class="flow-diagram__item">
          <a href="#complete-upload" class="call">
            <h4>3.3 - Complete file upload</h4>
            <code><em>POST</em> /files/{file_id}/uploads/complete</code>
          </a>
        </li>
      </ul>
    </li>
    <li class="flow-diagram__section">
      <h3>Transfer completed</h3>
    </li>
  </ol>
</section>

## Create a new board

Boards can be crecated with or without items. One the board has been created, items can be added at any time. If you don't add any items, the API will create an empty board.

```shell
curl https://dev.wetransfer.com/v2/boards \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"name": "My very first board!"}'
```

```ruby
board = client.create_board(name: 'My very first board!', description: 'Something about cats, most probably.') do |builder|
  builder.add_file(name: File.basename(__FILE__), io: File.open(__FILE__, 'rb'))
  builder.add_file(name: 'cat-picture.jpg', io: StringIO.new('cat-picture'))
  builder.add_file(name: 'README.txt', io: File.open('/path/to/local/readme.txt', 'rb'))
  builder.add_file_at(path: __FILE__)
end
```

```javascript
const board = await apiClient.board.create({
  name: 'My very first board!',
  description: 'Something about cats, most probably.'
});
```

```php
$board = \WeTransfer\Board::create(
    'My very first board!',
    'Something about cats, most probably.'
);
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
  "version_identifier": null,
  "state": "uploading",
  "shortened_url": "https://we.tl/s-random-hash",
  "name": "Little kittens",
  "description": null,
  "size": 0,
  "total_items": 0,
  "items": []
}
```

<aside class="warning"><strong>Note:</strong> The <code>shortened_url</code> in the response is the URL you will use to access the board you create! It is not returned at the end of the upload flow, rather when you create the empty board.</aside>

## Add items to a board

<h3 id="board-send-items" class="call"><span>POST</span> /boards/{board_id}/items</h3>

Once a board has been created you can then add items to it.

```shell
curl https://dev.wetransfer.com/v1/boards/{board_id}/items \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"items": [{"local_identifier": "delightful-cat", "content_identifier": "file", "filename": "kittie.gif", "filesize": 1024}]}'
```

```javascript
const fileItems = await apiClient.board.addFiles(board, [{
  filename: 'kittie.gif',
  filesize: 1024
}]);

const linkItems = await apiClient.board.addLinks(board, [{
  url: 'https://wetransfer.com',
  meta: {
    title: 'WeTransfer'
  },
}]);
```

```php
<?php
\WeTransfer\Board::addLinks($board, [
    [
        'url' => 'https://en.wikipedia.org/wiki/Japan',
        'meta' => [
            'title' => 'Japan'
        ]
    ]
]);

\WeTransfer\Board::addFiles($board, [
    [
        'filename' => 'Japan-01.jpg',
        'filesize' => 13370099
    ]
]);
```

### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

### Parameters

| name    | type          | required | description                                  |
| ------- | ------------- | -------- | -------------------------------------------- |
| `items` | _Array(Item)_ | Yes      | A list of items to send to an existing board |

### Item object

An item can be either a file or an URL.

**File object**

| name                 | type      | required | description                                                                                         |
| -------------------- | --------- | -------- | --------------------------------------------------------------------------------------------------- |
| `filename`           | String    | Yes      | The name of the file you want to show on items list                                                 |
| `filesize`           | _Integer_ | Yes      | File size in bytes. Must be accurate. No fooling. Don't let us down.                                |
| `content_identifier` | String    | Yes      | _Must_ be "file".                                                                                   |
| `local_identifier`   | String    | Yes      | Unique identifier to identify the item locally (to your system). _Must_ be less than 36 characters! |

**URL object**

| name                 | type   | required | description              |
| -------------------- | ------ | -------- | ------------------------ |
| `content_identifier` | String | Yes      | _Must_ be "web_content". |
| `url`                | String | Yes      | A complete URL.          |

#### Response

```json
[
  {
    "id": "random-hash",
    "content_identifier": "file",
    "local_identifier": "delightful-cat",
    "meta": {
      "multipart_parts": 3,
      "multipart_upload_id": "some.random-id--"
    },
    "name": "kittie.gif",
    "size": 195906,
    "upload_id": "more.random-ids--",
    "upload_expires_at": 1520410633
  },
  {
    "id": "random-hash",
    "content_identifier": "web_content",
    "meta": {
      "title": "WeTransfer"
    },
    "url": "https://wetransfer.com"
  }
]
```

It will return an object for each item you want to add to the board. Each item must be split into chunks, and uploaded to a pre-signed S3 URL, provided by the following endpoint.

**Important**
Chunks _must_ be 6 megabytes in size, except for the very last chunk, which can be smaller. Sending too much or too little data will result in a 400 Bad Request error when you finalise the file.

## Request upload URL

<h3 id="board-request-upload-url" class="call"><span>GET</span> /files/{file_id}/uploads/{part_number}/{multipart_upload_id}</h3>

To be able to upload a file, it must be split into chunks, and uploaded to different presigned URLs. This route can be used to fetch presigned upload URLS for each of a file's parts.

```shell
curl "https://dev.wetransfer.com/v2/files/{file_id}/uploads/{part_number}/{multipart_upload_id}" \
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

| name                  | type     | required | description                                                                                                     |
| --------------------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `file_id`             | String   | Yes      | The public ID of the file to upload, returned when adding items.                                                |
| `part_number`         | _Number_ | Yes      | Which part number of the file you want to upload. It will be limited to the maximum `multipart_parts` response. |
| `multipart_upload_id` | _Number_ | Yes      | The upload ID issued by AWS S3.                                                                                 |

#### Responses

##### 200 (OK)

```json
{
  "upload_url": "https://presigned-s3-put-url",
  "part_number": 1,
  "upload_id": "an-s3-issued-multipart-upload-id",
  "upload_expires_at": 1519988329
}
```

The Response Body contains the `upload_url`, `part_number`, `upload_id`, and `upload_expires_at`.

##### 401 (Unauthorized)

If the requester tries to request an upload URL for a file that is not in one of the requester's boards, we will respond with 401 UNAUTHORIZED.

##### 400 (Bad request)

If a request is made for a part, but no `multipart_upload_id` is provided; we will respond with a 400 BAD REQUEST as all consecutive parts must be uploaded with the same `multipart_upload_id`.

## File upload

<h3 id="board-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

Please note: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

```shell
curl -T "./path/to/kittie.gif" "https://signed-s3-upload-url"
```

```javascript
// Depending on your application, you will read the file using fs.readFile
// or it will be a file uploaded to your service.
const files = [[/* Buffer */], [/* Buffer */]];
await Promise.all(boardItems.map((item, index) => {
  return apiClient.board.uploadFile(item, files[index]);
}));
```

```php
<?php
foreach($board->getFiles() as $file) {
  \WeTransfer\File::upload($file, fopen(realpath('./path/to/your/files.jpg'), 'r'));
}
```

## Complete a file upload

<h3 id="board-complete-upload" class="call"><span>POST</span> /files/{file_id}/uploads/complete</h3>

After the file upload is successful, the file must be marked as complete.

```shell
curl -X https://dev.wetransfer.com/v2/boards/{board_id}/files/{file_id}/upload-complete \
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

| name      | type   | required | description                                                      |
| --------- | ------ | -------- | ---------------------------------------------------------------- |
| `file_id` | String | Yes      | The public ID of the file to upload, returned when adding items. |
