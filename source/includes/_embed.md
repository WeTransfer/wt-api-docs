# Embed

WeTransfer Embed allows a way to receive files in a form on your website. Embed is not an API of its own, it is an integration using the (transfer) API.

![Embed example image](images/EmbedInAForm.png)

## WeTransfer Embed enables you to receive big files

_Or: Why you need Embed_

Web forms are those things where your users fill in fields, like a form for their name and address when they buy goods.
These forms can handle files, but they aren't very good at it. There are two main problems:

1. Receiving multiple files is hard to do well.
1. Receiving large (gigantic) files can be problematic. And by large, we mean anything bigger than
  a picture from a phone camera.

Embed utilizes the power of WeTransfer to solve these problems.

In order to make use of WeTransfer Embed, there are two prerequisites

* You have a form that you want to receive files with
* An account on <a target="_top" href="https://developers.wetransfer.com">developers.wetransfer.com</a>

### Prerequisites

Create an account. From there, the creation of Embed will be straightforward.

Go to <a target="_top" href="https://developers.wetransfer.com">developers.wetransfer.com</a> and click
on <a target="_top" href="https://developers.wetransfer.com/sign-up">Sign in</a>. Create an account by
using GitHub or Google. Once completed, this should present you with a link to
the <a target="_top" href="https://developers.wetransfer.com/dashboard">dashboard</a>.

Using the dashboard you can create an Embed key, or an Apps key. To make sure
you use Embed, click on
<a target="_top" href="https://developers.wetransfer.com/dashboard/embed_keys/new">Generate new code snippet</a>,
just below the **WeTransfer Embed** heading.

Fill out the form, and press "Create".

Now you are presented your embed snippet. Note that in the example below, the embed key is invalid.
Please use this code as a reference only.

```html
<div data-widget-host="habitat" id="wt_embed">
  <script type="text/props">
    {
      "wtEmbedKey": "0a2b5190-8914-442d-a877-cbd68d571101",
      "wtEmbedOutput": ".wt_embed_output"
    }
  </script>
</div>
<script async src="https://prod-embed-cdn.wetransfer.net/v1/latest.js"></script>
<!--
  The next input element will hold the transfer link. For testing purposes, you
  could change the type attribute to "text", instead of "hidden".
-->
<input type="hidden" name="wt_embed_output" class="wt_embed_output" />
```

## Adding Embed to your form

That snippet is a piece of code you can place in your form. Open the html page that has your form in your favorite editor.

Somewhere in between your form open and close tags (`<form>` and `</form>`), paste this snippet.

With that setup, whenever a user fills out the form; a link to the uploaded material will be submitted in a field with the name `wt_embed_output`.

### In depth

Let's go over that code part by part, to see what it actually does.

```html
<div data-widget-host="habitat" id="wt_embed">
```

This line creates an element that will display the file selector.

----

```html
<script type="text/props">
  {
    "wtEmbedKey": "0a2b5190-8914-442d-a877-cbd68d571101",
    "wtEmbedOutput": ".wt_embed_output"
  }
</script>
```

This chunk of code is the configuration of WeTransfer Embed.

* The line that starts with `"wtEmbedKey"` holds the token that links the transfer to your account.
* The next line tells Embed to which form input in your page the resulting link will be put. For geeks: Under the hood, Embed uses <a target="_top" href="https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector">`document.querySelector`</a> to get the element specified here.

---


```html
</div>
```

This closes the element created on the first line. Nothing important going on otherwise.

---

```html
<script async src="https://prod-embed-cdn.wetransfer.net/v1/latest.js"></script>
```

This loads the script that has the code to make Embed do its magic.

---

```html
<!--
  The next input element will hold the transfer link. For testing purposes, you
  could change the type attribute to "text", instead of "hidden".
-->
```

This is just a bit of inline documentation, for the developers that don't care to read these docs.
Feel free to remove these lines from your code base. Or follow the advise and make the input field visible, by changing it from `"hidden"` to `"text"`.

---

```html
<input type="hidden" name="wt_embed_output" class="wt_embed_output" />
```

This is the input field for your form that holds the link to your transfer. It has a `name` attribute of `"wt_embed_output"`, meaning that it will be sent to your backend system, using that name. The `class` attribute is used (in this example) to connect embed to it.

## Examples

On <a target="_top" href="https://github.com/WeTransfer/EmbedExamples">github.com/WeTransfer/EmbedExamples</a>, we've collected some examples to help you get up to speed.

There are examples for Netlify and Ruby on Rails*. Go over there to see either the end results, or the changes that focus just on adding embed to an existing form.

_* = With more to come if you add your examples!_

## Find us

Feel free to mail your questions, remarks, feedback or praises regarding Embed on [developers@wetransfer.com](mailto:developers@wetransfer.com).
