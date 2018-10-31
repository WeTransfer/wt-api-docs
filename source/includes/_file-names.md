# File names

Both the [transfer API](#transfer-api) and the [board API](#board-api) have the ability to work with files. No matter which API you're using, there are constraints that apply to file names.

## Removal of characters

Some characters in file names don't interact well with our systems or in some cases with the systems of the receiver. Therefore we will remove them from the file name. This does not alter the _content_ of the file, only the _name_ of the file.

### Emojis

Emojis will be removed from a file name. That means that a file with the name `the-weather-is-☀️.jpg` will be converted into `the-weather-is-.jpg`.

### Special file system characters

We remove characters that have a special meaning to file systems. Think of the `/`, `\` (forward and backward slash), and the `:` (colon) character, to name a few. A file that has these characters in its name could potentially break a file system. That means that a file with the name `the-weather-is-:\.jpg` will be converted into `the-weather-is-.jpg`.

You can use your preferred file names, but the API strips the kind of characters listed above. That means that the upload of an affected file will succeed, but it will end up with a different name than you might expect when it reaches its destination.

## File names should have characters

A file with an empty name is not valid. Since the API removes problematic characters, you might hit this issue for files that have a name that consists solely of emojis and special characters. No judgement on your file naming scheme, but after we strip all those characters, we expect there to be something left. If the resulting file name is empty, the API will return an error. See below for an example

If you create a transfer for a file with an empty name, the API responds with an HTTP status code `400 Bad Request`, and this body:

```json
{
  "success": false,
  "message": "\"transfer.files.name\" is not allowed to be empty"
}
```

If you create a board for a file with an empty name, the API responds with an HTTP status code `400 Bad Request`, and this body:

```json
{
  "success": false,
  "message": "\"board.files.name\" is not allowed to be empty"
}
```

## Unique names

Your file names should be unique within your board or transfer. If you want to store two files with the same name, we will return an error. In the API we consider file names to be case sensitive. That means that the files `polish.txt` and `Polish.txt` are treated as two different files.

If you create a transfer with duplicate file names, the API will return an HTTP status code `400 Bad Request`, and this body:

```json
{
  "success": false,
  "message": "\"transfer.files\" position 1 contains a duplicate value"
}
```

If you create a board with duplicate file names, the API will return an HTTP status code `400 Bad Request`, and this body:

```json
{
  "success": false,
  "message": "\"board.files\" position 1 contains a duplicate value"
}
```
