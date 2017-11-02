---
layout: post
title: "How to Write a Fun Chrome Extension"
author: "0x00019913"
mathjax: true
excerpt: "Implementation details of a basic Chrome extension for your browsing pleasure!"
date: 2017-11-02 12:09:00
hidden: 0
---

<div style="position: fixed; width: 200px; height: 200px; background-image: url('/assets/img/hair6.png'); pointer-events: none;"></div>

* TOC
{:toc}

## What and why?

You know how some folks on FB and Youtube have those white profile pics with a curved black line that makes you think you've got a hair on the screen? It occurred to me that a Chrome extension that actually puts a hair on your screen would be optimally ~~annoying~~ fun, so here's how it's done.

This was a fun afternoon project, so it's intentionally minimalistic.

<a href="https://github.com/0x00019913/HairOnScreen">And here's the code</a>.

## Design

I wanted the following behaviors:

1. When a page loads, a hair appears somewhere on the screen. We'll do this by injecting a `div` into the `body` via a content script.
2. The hair position will not change after reloading; it will also persist across tabs and windows, so a different tab will have the same `div` and the same `top` and `left` offset.
3. We should be able to change the number of `div`s and randomize them.

## Manifest (manifest.json)

Any Chrome extension should have a manifest:

{% highlight json linenos %}
{
  "manifest_version": 2,

  "name": "Hair on Screen",
  "description": "Displays a helpful hair on the screen",
  "version": "0.0.0.1",
  "author": "0x00019913"
}
{% endhighlight %}

We'll add more lines to this later.

## Injecting the HTML

We will make a JS file that will inject the `div` into the `body`, which we want to run when every page loads. We'll do this with a content script.

### Content Script (content_script.js)

This is the basic HTML injection pattern we'll have in the content script:

{% highlight javascript linenos %}
var w = 200;
var h = 200;
var imageObject = {
  leftOffset: Math.round(Math.random() * (window.screen.width - w)),
  topOffset: Math.round(Math.random() * (window.screen.height - h)),
  // pick an image from the set of hair images we've prepared
  url: randomImage()
};

// make the div
var image = document.createElement("div");
image.className = "screenHairImage";

// set size and offsets
image.style.width = w + "px";
image.style.height = h + "px";
image.style.left = imageObject.leftOffset + "px";
image.style.top = imageObject.topOffset + "px";

// set background
var absoluteUrl = chrome.runtime.getURL(imageObject.url);
image.style.backgroundImage = "url('" + absoluteUrl + "')";

// append to body
document.body.appendChild(image);
{% endhighlight %}

The only interesting bit here is the `chrome.runtime.getURL()` call - it turns a basic relative URL of the image (e.g., `assets/h.png`) into an absolute URL the extension can insert into the page.

### CSS for the Content Script (content_script_style.css)

We need to put some CSS on our `div` to make it show up properly.

{% highlight css linenos %}
.screenHairImage {
  position: fixed;
  z-index: 100000;
  pointer-events: none;

  -webkit-animation: fadein 2s;
  animation: fadein 2s;
}

@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
{% endhighlight %}

So we set the position to `fixed` so that it won't move as the user scrolls, plus set a really high `z-index` to make it show up on top of everything else. `pointer-events: none` lets us click through the `div`, making it non-interactable via mouse. The `@keyframes` bit makes the hair inconspicuously fade into the page instead of popping into existence suddenly.

### Updating the Manifest (manifest.json)

{% highlight json linenos %}
"content_scripts": [
  {
    "matches": ["http://*/*", "https://*/*"],
    "css": ["content_script_style.css"],
    "js": ["content_script.js"]
  },

"web_accessible_resources": ["assets/*"]
{% endhighlight %}

Firstly, we need to register the content script and its associated CSS file in the manifest. The `"matches"` field makes the script run on pages whose URLs match the given pattern - see <a href="https://developer.chrome.com/extensions/match_patterns">Matching Patterns</a> for details.

Secondly, since we're keeping our images in the `assets` folder, we make everything in that folder accessible for inclusion in the HTML we inject.

## Persistence Across Tabs and Windows (content_script.js)

The key APIs to use here are these:

{% highlight javascript linenos %}
// get values from the global store
chrome.storage.sync.get(/* string or array of strings */, function(items) {
  // callback on retrieving data
});

// set a value in the global store
chrome.storage.sync.set( { key: val })
{% endhighlight %}

We're using the global store here because we want to distribute our data to every browser to make the hair maximally persistent.

Note that the `chrome.storage.sync` API calls are actually asynchronous - so, if you want to retrieve some data, you have to do your work in the callback.

All we need to do here is encapsulate the above injection code in a call to `chrome.storage.sync.get` that retrieves the existing image offsets and URL from memory, e.g.,

{% highlight javascript linenos %}
// get values from the global store
chrome.storage.sync.get("hairImage", function(items) {
  var hairImage;
  if (items.hasOwnProperty("hairImage")) hairImage = items.hairImage;
  else hairImage = generateHairImage();

  // and then inject as above
});
{% endhighlight %}

### Updating the Manifest (manifest.json)

Lastly, to use the API, we need to permit the extension to access `storage`.

{% highlight json linenos %}
"permissions": [
  "storage"
]
{% endhighlight %}

### More Hair! (content_script.js)

Here, it would also be logical to put all of that code in the callback to a `.get` call that retrieves a `numHairImages` variable and injects that number of hair images, so that we may have more than one. Then we'd need to modify the above code to retrieve an array of generated image data objects (call it `"hairImages"`), iterate through it, and generate new copies of any images that are missing in the array.

The completed code is in <a href="https://github.com/0x00019913/HairOnScreen">the repo</a>.

## Adding Controls

We'd like to allow the user to access a few options by right-clicking the browser action (the icon in the top right of the browser). We do it by adding a background page that puts some options there via the `contextMenus` API.

### Updating the Manifest (manifest.json)

{% highlight json linenos %}
"browser_action": {
  "default_icon": "assets/icons/icon128.png"
},

"permissions": [
  "contextMenus",
  "storage"
],

"background": {
  "scripts": ["background.js"],
  "persistent": false
}
{% endhighlight %}

Declaring the `browser_action` in the manifest seems to be required to make the options show up. You also need `contextMenus` permissions and the entry declaring the background script.

### Background Script (background.js)

The basic pattern is like this:

{% highlight javascript linenos %}
// add the context menu options
chrome.contextMenus.create({
  title: "More hair!",
  id: "more_hair",
  contexts: ["browser_action"]
});
chrome.contextMenus.create({
  title: "Less hair!",
  id: "less_hair",
  contexts: ["browser_action"]
});

// handle context menu clicks
chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId == "more_hair") incrementNumImages();
  else if (info.menuItemId == "less_hair") decrementNumImages();
});
{% endhighlight %}

You just set the title for the option, give it a unique ID, and specify that it's used in the browser action. Then, in the listener, match the ID of the clicked command to the intended function call.

The `increment-` and `decrement-` function calls just change the count in the global store; then, when the page is reloaded, the content script injects the correct number of `div`s. For randomization, we can have different approaches - mine was to just clear the array of stored image objects, letting the content script generate random ones at the next page load. Dynamically adding and removing `div`s when the user clicks the context menus seemed like overkill.
