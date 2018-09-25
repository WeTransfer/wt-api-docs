---
title: WeTransfer API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - shell
  - ruby
  - javascript
  - php

search: false

includes:
 - sdks
 - authorization
 - transfer-api
 - board-api
 - errors
 - changelog
---

<div class="v1-notice">
  <div class="v1-notice__content">
    <p>👋 Big news: on 2018-09-25 we released V2 of our API - introducing the Transfer & Board APIs. <br/> For the latest and greatest documentation please visit <a href="/v2/index.html">API V2</a>. 👈</p>
  </div>
</div>

# Introduction

Welcome to WeTransfer's public API! You can use our API to create transfers and boards to share files, links and love all over the world.

## Our APIs

Depending on how you want to use the API we have two different ways of using WeTransfer's systems: transfers and boards.

<div class="two-col">
  <div class="col">
    <span class="two-col__title">Transfer API</span>
    <p>Built to get files from one place to the other, this is the classic WeTransfer experience. Send it up to 2GB of files per transfer and this thing will handle it with ease, with a built-in 7 day expiry.</p>
  </div>
  <div class="col">
    <span class="two-col__title">Board API</span>
    <p>Our new <em>Board API</em> is in line with our new mobile app. It can store traditional files as well as links, and is flexible in how it displays it all.</p>
  </div>
</div>
