const { definePlugin } = require("@owncast/plugin-sdk");

// Everything this plugin does happens in the viewer's browser. The server
// side only has to exist so Owncast serves the files in public/.
module.exports = definePlugin({
  onHttpRequest() {
    return { status: 404, body: "not found" };
  },
});
