# Transfering

## Create a new transfer

Create an empty link transfer.

```shell
curl https://dev.wetransfer.com/v1/transfers \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"name": "Little kittens"}'
```

### HTTP Request

`POST https://dev.wetransfer.com/v1/transfers`

### Headers

name | type | required | description
---- | ---- | -------- | -----------
`x-api-key` | _String_ | Yes | Private API key
`Authorization` | _String_ | Yes | Bearer JWT authorization token

### Parameters

name | type | required | description
---- | ---- | -------- | -----------
`name` | _String_ | Yes | Something about cats or coffee, most probably
`description` | _String_ | No | A description, if needed

### Response

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

Creates a new empty transfer. The `shortened_url` property contains a URL for WeTransfer, where you can access the resulting transfer.

## Send items to a transfer

Once a transfer has been created you can then add items to it.

```shell
curl https://dev.wetransfer.com/v1/transfers/{transfer_id}/items \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"items": [{"local_dentifier": "delightful-cat", "content_identifier": "file", "filename": "kittie.gif", "filesize": 1024}]}'
```

#### HTTP Request

`POST https://dev.wetransfer.com/v1/transfers/{transfer_id}/items`

#### Headers

name | type | required | description
---- | ---- | -------- | -----------
`x-api-key` | _String_ | Yes | Private API key
`Authorization` | _String_ | Yes | Bearer JWT authorization token

#### Parameters

name | type | required | description
---- | ---- | -------- | -----------
`items` | _Array(Item)_ | Yes | A list of items to send to an existing transfer

#### Item object

name | type | required | description
---- | ---- | -------- | -----------
`filename` | _String_ | Yes | The name of the file you want to show on items list
`filesize` | _Integer_ | Yes | File size in bytes. Must be accurate. No fooling. Don't let us down.
`content_identifier` |	_String_ | Yes | Mandatory but must read "file".
`local_identifier` | _String_ | Yes | Unique identifier to identify the item locally (to your system).

#### Response

```json
[{
  "id": "random-hash",
  "content_identifier": "file",
  "local_identifier": "kittie.gif",
  "meta": {
    "multipart_parts": 3,
    "multipart_upload_id": "some.random-id--"
  },
  "name": "kittie.gif",
  "size": 195906,
  "upload_id": "more.random-ids--",
  "upload_expires_at": 1520410633
}]

```

It will return an object for each item you want to add to the transfer. Each item must be split into chunks, and uploaded to a pre-signed S3 URL, provided by the following endpoint.

## Request upload URL

To be able to upload a file, it must be split into chunks, and uploaded to different presigned URLs. This route can be used to fetch presigned upload URLS for each of a file's parts.

```shell
curl "https://dev.wetransfer.com/v1/files/{file_id}/uploads/{part_number}/{multipart_upload_id}" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

#### HTTP Request

`GET https://dev.wetransfer.com/v1/files/{file_id}/uploads/{part_number}/{multipart_upload_id}`

#### Headers

name | type | required | description
---- | ---- | -------- | -----------
`x-api-key` | _String_ | Yes | Private API key
`Authorization` | _String_ | Yes | Bearer JWT authorization token

#### Parameters

name | type | required | description
---- | ---- | -------- | -----------
`file_id` | _String_ | Yes | The public ID of the file to upload, returned when adding items.
`part_number` | _Number_ | Yes | Which part number of the file you want to upload. It will be limited to the maximum `multipart_parts` response.
`multipart_upload_id` | _Number_ | Yes | The upload ID issued by AWS S3.

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
If the requester tries to request an upload URL for a file that is not in one of the requester's transfers, we will respond with 401 UNAUTHORIZED.

##### 400 (Bad request)
If a request is made for a part, but no `multipart_upload_id` is provided; we will respond with a 400 BAD REQUEST as all consecutive parts must be uploaded with the same `multipart_upload_id`.

## File upload

```shell
curl -T "./path/to/kittie.gif" https://dev.wetransfer.com/a-very-long-signed-endpoint
```

## Complete a file upload

After the file upload is successful, the file must be marked as complete.

```shell
curl -X https://dev.wetransfer.com/v1/files/{file_id}/uploads/complete \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

#### HTTP Request

`POST https://dev.wetransfer.com/v1/files/{file_id}/uploads/complete`

#### Headers

name | type | required | description
---- | ---- | -------- | -----------
`x-api-key` | _String_ | Yes | Private API key
`Authorization` | _String_ | Yes | Bearer JWT authorization token

#### Parameters

name | type | required | description
---- | ---- | -------- | -----------
`file_id` | _String_ | Yes | The public ID of the file to upload, returned when adding items.
