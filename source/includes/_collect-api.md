# Collect API

Intro about the collect API

## Create a new collection

Collections can be crecated with or without items. One the collection has been created, items can be added at any time.

```shell
curl https://dev.wetransfer.com/v2/collections \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"name": "My very first collection!"}'
```

```ruby
collection = client.create_collection(name: 'My very first collection!', description: 'Something about cats, most probably.') do |builder|
  builder.add_file(name: File.basename(__FILE__), io: File.open(__FILE__, 'rb'))
  builder.add_file(name: 'cat-picture.jpg', io: StringIO.new('cat-picture'))
  builder.add_file(name: 'README.txt', io: File.open('/path/to/local/readme.txt', 'rb'))
  builder.add_file_at(path: __FILE__)
end
```

```javascript
const collection = await apiClient.collection.create({
  name: 'My very first collection!',
  description: 'Something about cats, most probably.'
});
```

```php
<?php
$collection = \WeTransfer\Collection::create(
    'My very first collection!',
    'Something about cats, most probably.'
);
```

<h3 id="collection-create-object" class="call"><span>POST</span> /collections</h3>

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

Creates a new empty collection.

<aside class="warning"><strong>Note:</strong> The <code>shortened_url</code> in the response is the URL you will use to access the collection you create! It is not returned at the end of the upload flow, rather when you create the empty collection. </aside>

## Add items to a collection

<h3 id="collection-send-items" class="call"><span>POST</span> /collections/{collection_id}/items</h3>

Once a collection has been created you can then add items to it.

```shell
curl https://dev.wetransfer.com/v1/collections/{collection_id}/items \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"items": [{"local_identifier": "delightful-cat", "content_identifier": "file", "filename": "kittie.gif", "filesize": 1024}]}'
```

```javascript
const fileItems = await apiClient.collection.addFiles(collection, [{
  filename: 'kittie.gif',
  filesize: 1024
}]);

const linkItems = await apiClient.collection.addLinks(collection, [{
  url: 'https://wetransfer.com',
  meta: {
    title: 'WeTransfer'
  },
}]);
```

```php
<?php
\WeTransfer\Collection::addLinks($collection, [
    [
        'url' => 'https://en.wikipedia.org/wiki/Japan',
        'meta' => [
            'title' => 'Japan'
        ]
    ]
]);

\WeTransfer\Collection::addFiles($collection, [
    [
        'filename' => 'Japan-01.jpg',
        'filesize' => 13370099
    ]
]);
```

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | must be application/json       |

#### Parameters

| name    | type          | required | description                                       |
| ------- | ------------- | -------- | ------------------------------------------------- |
| `items` | _Array(Item)_ | Yes      | A list of items to send to an existing collection |

#### Item object

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

It will return an object for each item you want to add to the collection. Each item must be split into chunks, and uploaded to a pre-signed S3 URL, provided by the following endpoint.

**Important**
Chunks _must_ be 6 megabytes in size, except for the very last chunk, which can be smaller. Sending too much or too little data will result in a 400 Bad Request error when you finalise the file.

## Request upload URL

<h3 id="collection-request-upload-url" class="call"><span>GET</span> /files/{file_id}/uploads/{part_number}/{multipart_upload_id}</h3>

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

If the requester tries to request an upload URL for a file that is not in one of the requester's collections, we will respond with 401 UNAUTHORIZED.

##### 400 (Bad request)

If a request is made for a part, but no `multipart_upload_id` is provided; we will respond with a 400 BAD REQUEST as all consecutive parts must be uploaded with the same `multipart_upload_id`.

## File upload

<h3 id="collection-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

Please note: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

```shell
curl -T "./path/to/kittie.gif" "https://signed-s3-upload-url"
```

```javascript
// Depending on your application, you will read the file using fs.readFile
// or it will be a file uploaded to your service.
const files = [[/* Buffer */], [/* Buffer */]];
await Promise.all(collectionItems.map((item, index) => {
  return apiClient.collection.uploadFile(item, files[index]);
}));
```

```php
<?php
foreach($collection->getFiles() as $file) {
  \WeTransfer\File::upload($file, fopen(realpath('./path/to/your/files.jpg'), 'r'));
}
```

## Complete a file upload

<h3 id="collection-complete-upload" class="call"><span>POST</span> /files/{file_id}/uploads/complete</h3>

After the file upload is successful, the file must be marked as complete.

```shell
curl -X https://dev.wetransfer.com/v1/files/{file_id}/uploads/complete \
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