# Chromecast Support

Adds a Cast button to the player so viewers can send the stream to a Chromecast, Google TV or other Google Cast device.

## Setup

None. Enable the plugin; there are no settings.

Your site must be served over HTTPS, because browsers only allow casting from secure pages. On a plain `http://` address the button does not appear.

## Usage

While the stream is live, a Cast button appears in the player's control bar, next to the fullscreen button, for viewers using Chrome or Edge (desktop or Android). Clicking it opens the browser's device picker.

- While casting, the player on the page is paused and shows "Casting to" with the device name and a **Stop casting** button. Picture and sound are on the TV.
- The TV plays the stream directly from this server at automatic quality. Chat stays in the browser.
- The cast can be stopped from the page, from the TV remote or from the Google Home app.

Browsers without Google Cast support (Firefox, Safari) never see the button. Safari users can use the AirPlay button that Owncast's player already provides for Apple TV.

## Permissions

- **http.serve**: serve the small page that holds the Cast button. It has to come from the plugin, because Owncast's own page only allows scripts from this site and Google's Cast library is loaded from Google.
- **ui.modify**: place the button and the "casting" panel on the viewer page.

## Privacy

For viewers whose browser supports casting, the button loads Google's Cast library from `gstatic.com`, so Google sees that request. Nothing else is sent anywhere, and nothing is stored on the server.
