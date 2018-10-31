# File names

Both the [transfer endpoints](#transfer-api) and the [board endpoints](#board-api) have the ability to work with files. Whether you are using the API to create a board or a transfer, there are constraints that apply to file names.

## Removal of characters

Some characters in file names don't go well on our systems, others characters don't go well on the systems of the receiver. That means we will remove them from the file name.

### Emojis

Emojis will be removed from a file name. That means that a file with the name `the-weather-is-☀️.jpg` will be converted into `the-weather-is-.jpg`.

### Special file system characters

We remove characters that have a special meaning to file systems. Think of the `/`, `\` (forward and backward slash), and the `:` (colon) character, to name a few. A file that has these characters in its name could potentially break a file system. That means that a file with the name `the-weather-is-:\.jpg` will be converted into `the-weather-is-.jpg`.

You can use your preferred file names, but the API strips the kind of characters listed above. That means that the upload of the file will go fine, but it will end up inside the transfer or board with a different name than you might expect.

## File names should have characters

A file with an empty name is not valid. Since the API removes problematic characters, you might hit this issue for files that have a name that consists solely of emojis and special characters. No judgement on your file naming scheme, but after we strip all those characters, we expect there to be something left. If the resulting file name is empty, the API will return an error.

## Unique names

Your file names should be unique within your board or transfer. If you want to store two files with the same name, we will return an error. In the API we consider file names to be case sensitive. That means that the files `polish.txt` and `Polish.txt` are treated as two different files.
