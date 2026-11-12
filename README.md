# Chromecast Support

An [Owncast](https://owncast.online) plugin that adds a Cast button to the player, so viewers can send the stream to a Chromecast, Google TV or other Google Cast device. Requires Owncast 0.3.0 or later, served over HTTPS.

- Works in Chrome and Edge on desktop and Android.
- The TV plays the stream directly from your server; the player on the page pauses and shows a "Casting to" panel with a stop button.
- No settings and nothing stored on the server.

Apple TV is already covered by the AirPlay button in Owncast's own player (Safari only), so this plugin does not add one.

See [INSTRUCTIONS.md](INSTRUCTIONS.md) for what admins need to know. The slug is `chromecast-support`.

## Develop

```sh
npm install          # one-time, fetches the prebuilt test/serve host binaries
npm run build        # bundle src/plugin.js into chromecast.js
npm test             # build, then run scenarios from __tests__/
npm run serve        # build, then host the plugin on http://localhost:8080
npm run package      # build, then bundle into chromecast-support.ocpkg for distribution
```

Plugins ship as source and run on the JavaScript engine the Owncast host embeds,
so there's no wasm compile step and no toolchain to install. `npm install` only
fetches the host binaries `test`/`serve` use, and caches them after the first run.

## Ship

`npm run package` produces `chromecast-support.ocpkg`. Install it through the Owncast admin: open **Plugins**, click **Upload plugin**, and pick the file. (You can also copy it directly to the server's `data/plugins/` directory if the admin UI isn't an option.) Toggle **Enabled** to load it.

## Licence

MIT; see [LICENSE](LICENSE). The cast glyph, used for the button and the plugin icon (`icon.png`, source in `art/icon.svg`), is from [Lucide](https://lucide.dev), ISC licence, copyright Lucide Contributors and Cole Bemis.

Chromecast and Google TV are trademarks of Google LLC. This plugin is not affiliated with or endorsed by Google.
