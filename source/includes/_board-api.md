# Board API

The Board API is the latest addition to our Public API. It was originally built with our <a href="https://itunes.apple.com/app/apple-store/id765359021?pt=10422800&ct=wetransfer-developer-portal&mt=8" target="_blank">iOS</a> and , <a href="https://play.google.com/store/apps/details?id=com.wetransfer.app.live&referrer=utm_source%3Dwetransfer%26utm_medium%3Ddeveloper-portal" target="_blank">Android</a> apps in mind, but it's also suitable for web/desktop users. It is designed for collecting content rather than transmitting content from A to B (though it can do that, too). It supports both files and links. Boards can be changed - if you hold on to the board's public ID you are able to add and remove items from a board as long as it is live.

Note that boards are "live" indefinitely, so long as they are being viewed. If a board is not accessed for 90 days it is deleted!

## Create a new board

Boards are created without items. One the board has been created, items can be added at any time. If you don't add any items, the API will create an empty board.

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/boards" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '{"name": "Little kittens"}'
```

```javascript
const board = await wtClient.board.create({
  name: 'Little kittens'
});
```

```ruby
# In the current Ruby SDK (version 0.9.x), you can only create a board
# and upload the items in one go. This behavior will be split in the upcoming
# major (version 1.0) release.

client = WeTransfer::Client.new(api_key: 'YOUR PRIVATE API KEY GOES HERE')

board = client.create_board_and_upload_items(name: 'Little kittens') do |builder|
  builder.add_file(
    name: 'bobis.jpg',
    io: File.open('/path/to/kitty.jpg', 'rb')
  )
  builder.add_file_at(path: '/path/to/kitty.jpg')
  builder.add_web_url(
    url: 'http://www.wetransfer.com',
    title: 'the title that defaults to the url'
  )
end

# Access the board in your browser:
puts "The board can be viewed on #{board.url}"
```

```swift
// This does not create the board server-side, yet. The request is performed
// when files are added to the board for the first time
// (adding links will be supported in the SDK version 2.1)
let board = Board(name: "Little kittens", description: nil)
```

<h3 id="board-create-object" class="call"><span>POST</span> /boards</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | Must be application/json       |

#### Parameters

| name          | type   | required | description                    |
| ------------- | ------ | -------- | ------------------------------ |
| `name`        | String | Yes      | A name or title for your board |
| `description` | String | No       | A description of your board, if you want it |

#### Response

##### 200 (OK)

If everything goes fine, this endpoint will return an HTTP response with a status code of `200` and a body as below.

```json
{
  "id": "random-hash",
  "name": "Little kittens",
  "description": null,
  "state": "downloadable",
  "url": "https://we.tl/b-random-hash",
  "items": []
}
```

<aside class="warning">**Note**: The `url` in the response is the URL you will use to access the board you created. It is not returned at the end of the upload flow, rather only right now when you create the (empty) board.</aside>

Later you'll want to interact with your board. Add files and links to it. In order to do that, make sure to note the value of the `id` property.

##### 400 (Bad Request)

If you forget to set a name for the board, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.name\" is required. See https://developers.wetransfer.com/documentation"
}
```

If you don't send any request body (that holds a board), this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board\" must be an object. See https://developers.wetransfer.com/documentation"
}
```

## Add links to a board

A board can hold files *and* URLs. Lets have a look at how you can add URLs to your board. For that you need the `id` of the board you created earlier, unless your SDK will handle that for you.

Once a board has been created you can add links like below:

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/boards/{board_id}/links" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '[{"url": "https://wetransfer.com/", "title": "WeTransfer"}]'
```

```javascript
const linkItems = await wtClient.board.addLinks(board, [{
  url: 'https://wetransfer.com/'
}]);
```

```ruby
# This functionality is currently not enabled in the SDK.
```

```Swift
// Adding links is currently not supported in the SDK but will be added in the SDK version 2.1
```

<h3 id="board-send-links" class="call"><span>POST</span> /boards/{board_id}/links</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | Must be application/json       |

#### Request Body

| type   | required | description |
| ------ | -------- | ----------- |
| Array  | Yes      | A list of link objects(see below) to add to an existing board |

#### Link object

| name    | type   | required | description |
| ------- | ------ | -------- | ----------- |
| `url`   | String | Yes      | The complete URL of the link. _Must_ be less than 2000 characters!               |
| `title` | String | No       | The title of the page, defaults to the url. _Must_ be less than 2980 characters! |

#### Response

##### 200 (OK)

If you successfully add a link and a board, this endpoint will return an HTTP response with a status code of `200` and a body as below.

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

##### 400 (Bad Request)

If you don't send any request body (that holds the link), this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.links\" must be an array. See https://developers.wetransfer.com/documentation"
}
```

If the `url` of the link is longer that 2000 characters, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.links.url\" length must be less than or equal to 2000 characters long. See https://developers.wetransfer.com/documentation"
}
```

If the `title` of the link is longer that 2980 characters, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.links.title\" length must be less than or equal to 2980 characters long. See https://developers.wetransfer.com/documentation"
}
```

##### 404 (Not Found)

If you try to add links to a board that we cannot find, or that doesn't belong to you, this endpoint will return an HTTP response with a status code of `404` and a body as below.

```json
{
  "success": false,
  "message":"This board does not exist. See https://developers.wetransfer.com/documentation"
}
```

If you forget the fill the board_id in the request, this endpoint will return an HTTP response with a status code of `404` and a body as below.

```json
{
  "success": false,
  "message": "use correct endpoint. See https://developers.wetransfer.com/documentation"
}
```

## Add files to a board

Note that files need a name and a size in bytes - you'll need to compute the size yourself. Most languages provide a way to do this.

Once a board has been created you can add files like so:

```shell
curl -i -X POST "https://dev.wetransfer.com/v2/boards/{board_id}/files" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token" \
  -d '[{"name": "big-bobis.jpg", "size": 195906}]'
```

```javascript
const fileItems = await wtClient.board.addFiles(board, [{
  name: 'kittie.gif',
  size: 1024
}]);
```

```ruby
# This functionality is currently not enabled in the SDK.
```

```swift
let board = Board(name: "Little kittens", discription: nil)

let fileURLs: [URL] = [..] // URLs pointing to local files
let files: [File]
do {
    // Create a File object for each URL.
    // When initialization fails, an error will be thrown
    files = try fileURLs.map({ try File(url: $0) })
} catch {
    // Please handle thrown errors gracefully
}
WeTransfer.add(files, to: board) { result in
    // Handle result success or failure
}
```

<h3 id="board-send-files" class="call"><span>POST</span> /boards/{board_id}/files</h3>

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |
| `Content-Type`  | String | Yes      | Must be application/json       |

#### Parameters

| name    | required | description                                                     |
| ------- | -------- | --------------------------------------------------------------- |
| `files` | Yes      | A list of file objects to send to an existing board (see below) |

#### File object

| name   | type   | required | description |
| ------ | ------ | -------- | ----------- |
| `name` | String | Yes      | The name of the file you want to show on items list. _Must_ be less than 255 characters. |
| `size` | Number | Yes      | File size in bytes. Must be accurate. No fooling. Don't let us down! |

#### Response

##### 200 (OK)

If you add one file (or many files) that have a valid name and a size, this endpoint will return an HTTP response with a status code of `200` and a body as below.

```json
[
  {
    "id": "random-hash",
    "name": "big-bobis.jpg",
    "size": 195906,
    "multipart": {
      "id": "some random id",
      "part_numbers": 1,
      "chunk_size": 195906
    },
    "type": "file"
  }
]
```

After this successful request, this endpoint will return an JSON holding an object for each file you want to add to the board. That object is helpful in the next step when we want to request a place where we can upload our file.

The important parts in the response are the `id` of the file, the `id` of the multipart object, together with its `part_numbers`.

##### 400 (Bad Request)

If the request does not have a properly formatted file list in the body of the request, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.files\" must be an array. See https://developers.wetransfer.com/documentation"
}
```

In case you send a file with a **size of `0`** (zero), this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.files.size\" must be greater than 1. See https://developers.wetransfer.com/documentation"
}
```

In case you send a file with an **empty name**, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.files.name\" is not allowed to be empty. See https://developers.wetransfer.com/documentation"
}
```

If case you forget to send the file **name** property key and value altogether, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.files.name\" is required. See https://developers.wetransfer.com/documentation"
}
```

If case you forget to send the file **size** property key and value altogether, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.files.size\" is required. See https://developers.wetransfer.com/documentation"
}
```

If case you use a file name that is longer than 255 characters, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "\"board.files.name\" length must be less than or equal to 255 characters long. See https://developers.wetransfer.com/documentation"
}
```

<h2 id="board-request-upload-url">Request upload URL</h2>

Now that you've informed us about the file(s) you want to upload, it is time to request upload URLs. Each chunk of the file has its own upload url.

<h3 class="call"><span>GET</span> /boards/{board_id}/files/{file_id}/upload-url/{part_number}/{multipart_upload_id}</h3>

To be able to upload a file, it must be split into chunks, and uploaded to different pre-signed URLs. This endpoint can be used to get pre-signed upload URLs for each of a file's parts. These upload URLs are essentially limited access to a storage bucket hosted with Amazon. They are valid for an hour and must be re-requested if they expire.

Use the fields from the previous response; now you need the `id` of the file, the `id` of the multipart, and you must request a upload-url for all of your `part_numbers`.

```shell
curl -i -X GET "https://dev.wetransfer.com/v2/boards/{board_id}/files/{file_id}/upload-url/{part_number}/{multipart_upload_id}" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

```javascript
const file = fileItems[0];

for (
  let partNumber = 0;
  partNumber < file.multipart.part_numbers;
  partNumber++
) {
  // Get the upload url for the chunk we want to upload
  const uploadURL = await wtClient.board.getFileUploadURL(
    board.id,
    file.id,
    partNumber + 1
  );

  console.log(uploadURL.url)
}
```

```ruby
# This functionality is currently not enabled in the SDK.
```

```swift
// This step is not necessary as the request is performed by the SDK right before uploading each file
```

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |

#### Parameters

| name                  | type   | required | description                                                                                                           |
| --------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `board_id`            | String | Yes      | The public ID of the board where you added the files                                                                  |
| `file_id`             | String | Yes      | The public ID of the file to upload, returned when adding items                                                       |
| `part_number`         | Number | Yes      | Which part number of the file you want to upload. It will be limited to the maximum `multipart.part_numbers` response |
| `multipart_upload_id` | Number | Yes      | The upload ID issued by AWS S3, which is available at `multipart.id`                                                  |

#### Response

##### 200 (OK)

If you successfully request an upload-url, this endpoint will return an HTTP response with a status code of `200` and a body as below.

```json
{
  "success": true,
  "url": "https://a-very-long-pre-signed-s3-put-url"
}
```

**Important**

Files on a board _must_ have a chunk size of 6 megabytes (or more precisely 6291456 bytes), except for the very last chunk, which can be smaller. Sending too much or too little data will result in a `400 Bad Request` error when you finalize the file. As with transfers: Do not let us down.

The response body contains the pre-signed S3 upload `url`. You will use that in the next step when you upload the contents.

##### 400 (Bad request)

If a request is made for a part, but no `multipart_upload_id` is provided, this endpoint will return an HTTP response with a status code of `400`.

##### 401 (Unauthorized)

If you try to request an upload URL for a file that is not in one of your boards, this endpoint will return an HTTP response with a status code of `401`.

##### 404 (Not Found)

If you try to request an upload URL for a file, but you provide an invalid file id, this endpoint will return an HTTP response with a status code of `404`.

```json
{
  "success": false,
  "message": "File not found. See https://developers.wetransfer.com/documentation"
}
```

<h2 id="board-file-upload">File Upload</h2>

<h3 id="board-upload-part" class="call"><span>PUT</span> {signed_url}</h3>

You're communicating directly with Amazons' S3, not with our API. Please note: errors returned from S3 will be sent as XML, not JSON. If your response parser is expecting a JSON response it may throw an error here. Please see AWS' <a href="https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html" target="_blank">S3 documentation</a> for more details about specific responses.

```shell
curl -i -T "./path/to/big-bobis.jpg" "https://signed-s3-upload-url"
```

```javascript
const axios = require('axios');
const fs = require('fs');

const file = fileItems[0];
const fileContent = fs.readFileSync('/path/to/file');

for (
  let partNumber = 0;
  partNumber < file.multipart.part_numbers;
  partNumber++
) {
  const chunkStart = partNumber * file.multipart.chunk_size;
  const chunkEnd = (partNumber + 1) * file.multipart.chunk_size;

  // Get the upload url for the chunk we want to upload
  const uploadURL = await wtClient.board.getFileUploadURL(
    board.id,
    file.id,
    partNumber + 1,
    file.multipart.id
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

```swift
// To immediately create a board and upload files
let fileURLs: [URL] = [..] // URLs pointing to local files
WeTransfer.uploadBoard(named: "Little Kittens", description: nil, containing: fileURLs) { state in
    switch state {
      case .created(let board):
          // Board created, public URL available
      case .uploading(let progress)
          // Use the progress object to track the total file upload progress
      case .completed:
          // All files in board have completed uploading
      case .failed(let error):
          // Either creating the board or uploading files has failed
    }
}

// Or use an existing board with files added to it that aren't yet uploaded
WeTransfer.upload(board) { state in
    switch state {
    case .uploading(let progress):
        // Use the progress object to track the total file upload progress
    case .completed:
        // File upload is complete
    case .failed(let error):
        // Uploading files failed
    default:
        break
    }
}
```

<h2 id="board-complete-file-upload">Complete a file upload</h2>

After all of the file parts have been uploaded, the file must be marked as complete.

```shell
curl -i -X PUT "https://dev.wetransfer.com/v2/boards/{board_id}/files/{file_id}/upload-complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

```javascript
await wtClient.board.completeFileUpload(board, file);
```

```ruby
# This functionality is currently not enabled in the SDK.
```

```swift
// This step is not necessary as the request is performed by the SDK right after all chunks have been uploaded.
```

<h3 id="board-complete-upload" class="call"><span>PUT</span> /boards/{board_id}/files/{file_id}/upload-complete</h3>

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

#### Response

##### 200 (OK)

Assuming you've uploaded all chunks of the file to the signed link(s) provided by the previous request, this endpoint will return an HTTP response with a status code of `200` and a body as below.

```json
{
  "success": true,
  "message": "File is marked as complete."
}
```

##### 400 (Bad Request)

If you call this endpoint before you've uploaded all chunks of the file to the signed link(s) provided by the previous request, this endpoint will return an HTTP response with a status code of `400` and a body as below.

```json
{
  "success": false,
  "message": "expected at least 1 part. See https://developers.wetransfer.com/documentation"
}
```

##### 404 (Not Found)

If you call this endpoint but use an invalid `file_id` in the URL, this endpoint will return an HTTP response with a status code of `404` and a body as below.

```json
{
  "success": false,
  "message": "File not found. See https://developers.wetransfer.com/documentation"
}
```

<h2 id="retrieve-boards-information">Retrieve a board's information</h2>

<h3 id="get-board" class="call"><span>GET</span> /boards/{board_id}</h3>

Retrieve information about an existing board.

```shell
curl -i -X GET "https://dev.wetransfer.com/v2/boards/{board_id}" \
  -H "x-api-key: your_api_key" \
  -H "Authorization: Bearer jwt_token"
```

```Swift
// Retrieving board information is currently not supported in the SDK but will be added in the SDK version 2.1
```

#### Headers

| name            | type   | required | description                    |
| --------------- | ------ | -------- | ------------------------------ |
| `x-api-key`     | String | Yes      | Private API key                |
| `Authorization` | String | Yes      | Bearer JWT authorization token |

#### Parameters

| name       | type   | required | description                                          |
| ---------- | ------ | -------- | ---------------------------------------------------- |
| `board_id` | String | Yes      | The public ID of the board where you added the files |

#### Response

If you request a board that is yours, this endpoint will return an HTTP response with a status code of `200` and a body as below.

##### 200 (OK)

```json
{
  "id": "board-id",
  "state": "processing",
  "url": "https://we.tl/b-the-boards-url",
  "name": "Little kittens",
  "description": null,
  "items": [
    {
      "id": "random-hash",
      "name": "kittie.gif",
      "size": 195906,
      "multipart": {
        "part_numbers": 1,
        "chunk_size": 195906
      },
      "type": "file"
    },
    {
      "id": "different-random-hash",
      "url": "https://wetransfer.com",
      "meta": {
        "title": "WeTransfer"
      },
      "type": "link"
    }
  ]
}
```

##### 403 (Forbidden)

If you try to request info from a board that is not yours, this endpoint will return an HTTP response with a status code of `403` and a body as below.

```json
{
  "success": false,
  "message": "You'\''re not a member of this board (123456). See https://developers.wetransfer.com/documentation"
}
```
