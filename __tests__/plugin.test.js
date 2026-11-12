// Scenario tests for Chromecast Support. Runs via `npm test`.
const { runScenarios } = require("@owncast/plugin-sdk/testing");

runScenarios([
  {
    name: "unknown plugin paths return 404",
    steps: [{ http: { method: "GET", path: "/nope" }, expect: { status: 404 } }],
  },
]);
