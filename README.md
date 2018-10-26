# The WeTransfer Public API documentation

<p align="center">
  <!-- <img src="assets/artwork.jpg" alt="WeTransfer API Docs" width="100%" /> -->
  <br>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat" />
</p>

## Getting Started

### Prerequisites

You're going to need:

- **Linux or OS X** - Windows may work, but is unsupported.
- **Ruby** - version 2.3.1 or newer
- **Bundler**  - If Ruby is already installed, but the `bundle` command doesn't work, just run `gem install bundler` in a terminal.

## Getting Set Up

Initialize and start the docs:

```shell
bundle install
bundle exec middleman server
```

You can now see the docs at http://localhost:4567. Whoa! That was fast!

## Building static files

To create an exportable set of files, run the following command:

```shell
bundle exec middleman build --no-clean
```

This will output the static files in the `/docs` folder.
