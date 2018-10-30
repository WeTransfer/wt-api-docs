---
title: WeTransfer API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - javascript
  - ruby

search: false

includes:
 - sdks
 - authorization
 - transfer-api
 - board-api
 - errors
 - changelog
---

# Welcome to WeTransfer's public API!

You can use our API to share files, links and love all over the world.

## Our APIs

Depending on what you want to make we have two main flavors: **transfers** and **boards**.

<div class="two-col">
  <div class="col">
    <span class="two-col__title">Transfer API</span>
    <p>Built to get files from one place to the other, this is the classic WeTransfer experience. Send up to 2GB of files per transfer and we will handle it with ease, with a built-in 7 day expiry. Once a transfer has been finalized, that's it - it can't be changed.</p>
  </div>
  <div class="col">
    <span class="two-col__title">Board API</span>
    <p>Our Board API is similar to what you'll experience in our mobile app. It can store traditional files as well as links, and is flexible in how it displays your items. Additionally - boards do not have an expiry time as long as they receive activity, so you can add items as you see fit. If untouched, they expire after 3 months.</p>
  </div>
</div>
