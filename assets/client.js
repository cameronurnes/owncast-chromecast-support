(function () {
  "use strict";
  if (window.__chromecastLoaded) return;
  window.__chromecastLoaded = true;

  var BASE = "/plugins/chromecast-support";
  // Part of the button page's address. Owncast serves plugin files as cacheable
  // for a month, so without this an update would not reach viewers.
  var VERSION = "0.4.0";
  // Casting only works from a secure (HTTPS) page.
  if (!window.isSecureContext) return;

  var holder = null; // sits in the player's control bar and contains the button frame
  var frame = null;
  var overlay = null;
  var unsupported = false;
  var casting = false;
  var device = "";

  function vjs() { var p = document.getElementById("player"); return p ? p.querySelector(".video-js") : null; }
  function video() { var v = vjs(); return v ? v.querySelector("video") : null; }

  function keepPaused() { var v = video(); if (casting && v && !v.paused) v.pause(); }

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.id = "chromecast-overlay";
    overlay.setAttribute("role", "status");
    var text = document.createElement("div");
    text.className = "ctt-text";
    var stop = document.createElement("button");
    stop.type = "button";
    stop.className = "ctt-stop";
    stop.textContent = "Stop casting";
    stop.addEventListener("click", function () {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ target: "chromecast", cmd: "stop" }, location.origin);
      }
    });
    overlay.appendChild(text);
    overlay.appendChild(stop);
  }

  function setCasting(on, name) {
    var was = casting;
    casting = on;
    device = name || "";
    var v = video();
    if (on) {
      if (v) { v.pause(); v.addEventListener("play", keepPaused); }
    } else if (v) {
      v.removeEventListener("play", keepPaused);
      if (was) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }
    sync();
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data || e.data.source !== "chromecast") return;
    var s = e.data.state;
    if (s === "available") { if (holder) holder.classList.add("ctt-ready"); lastLook = ""; matchLook(); }
    else if (s === "unavailable") { unsupported = true; if (holder) holder.remove(); holder = frame = null; }
    else if (s === "casting") setCasting(true, e.data.device);
    else if (s === "idle" || s === "error") setCasting(false);
    else if (s === "activity") {
      // The pointer is over the button frame, which the player cannot see, so
      // tell it the viewer is still active or it would fade its controls out.
      var el = vjs();
      if (el) el.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
    }
  });

  // The button is drawn inside a frame, which cannot inherit the page's
  // styles, so copy the colour and size of the player's own icons into it.
  var lastLook = "";

  function rgb(text) {
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/.exec(text || "");
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  }

  function lum(c) { return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255; }

  function matchLook() {
    var el = vjs();
    if (!el || !frame || !frame.contentWindow) return;
    var ref = el.querySelector(".vjs-fullscreen-control") || el.querySelector(".vjs-control-bar");
    if (!ref) return;
    var glyph = ref.querySelector(".vjs-icon-placeholder");
    var bar = el.querySelector(".vjs-control-bar");
    // The bar's colour may be set on the bar or on something behind it.
    var bg = null;
    for (var node = bar; node && node !== document.documentElement; node = node.parentElement) {
      var c = rgb(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0.5) { bg = c; break; }
    }
    // Themes colour the icons in different places (the button, the glyph, an
    // inline drawing), so look at every control in the bar and take the colour
    // that stands out most against it. That is the one the icons are using.
    var color = "";
    var best = -1;
    var lb = bg ? lum(bg) : 0;
    var nodes = bar ? bar.querySelectorAll("button, .vjs-icon-placeholder, button svg, button span") : [];
    for (var n = 0; n < nodes.length; n++) {
      if (holder && holder.contains(nodes[n])) continue;
      var styles = [getComputedStyle(nodes[n]), getComputedStyle(nodes[n], "::before")];
      for (var k = 0; k < styles.length; k++) {
        var found = [styles[k].color, styles[k].fill];
        for (var f = 0; f < found.length; f++) {
          var fg = rgb(found[f]);
          if (!fg || fg.a < 0.5) continue;
          var contrast = Math.abs(lum(fg) - lb);
          if (contrast > best) { best = contrast; color = "rgb(" + fg.r + ", " + fg.g + ", " + fg.b + ")"; }
        }
      }
    }
    // Still not readable against the bar: use plain black or plain white.
    if (bg && best < 0.35) color = lb > 0.5 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
    if (!color) color = "rgb(255, 255, 255)";
    var size = glyph ? parseFloat(getComputedStyle(glyph, "::before").fontSize) : 0;
    if (!size || size < 12 || size > 48) size = 22;
    // While casting the icon takes the site's accent colour.
    var active = getComputedStyle(document.documentElement).getPropertyValue("--theme-color-action").trim();
    var look = color + "|" + size + "|" + active;
    if (look === lastLook) return;
    lastLook = look;
    frame.contentWindow.postMessage({ target: "chromecast", cmd: "look", color: color, size: size, active: active }, location.origin);
  }

  // Both pieces live inside the video player itself: the button in its control
  // bar beside fullscreen, the "casting" panel over the picture. That way they
  // fade, resize, scroll and go fullscreen with the player. Owncast rebuilds
  // the player when a stream starts, so this runs on a timer and puts them back.
  function sync() {
    var el = vjs();
    var bar = el ? el.querySelector(".vjs-control-bar") : null;
    if (!el || !bar) return;

    if (!unsupported && (!holder || holder.parentNode !== bar)) {
      holder = document.createElement("div");
      holder.className = "vjs-control ctt-control";
      frame = document.createElement("iframe");
      frame.title = "Cast to a TV";
      frame.setAttribute("allow", "presentation");
      frame.src = BASE + "/button.html?v=" + VERSION + "&title=" + encodeURIComponent((document.title || "").trim().slice(0, 80));
      holder.appendChild(frame);
      bar.insertBefore(holder, bar.querySelector(".vjs-fullscreen-control"));
      lastLook = "";
    }
    matchLook();

    el.classList.toggle("ctt-casting", casting);
    if (casting) {
      if (!overlay) buildOverlay();
      overlay.querySelector(".ctt-text").textContent = device ? "Casting to " + device : "Casting to your TV";
      if (overlay.parentNode !== el) el.appendChild(overlay);
      // Cover the picture but stop above the control bar, so the player's
      // own controls stay usable.
      overlay.style.bottom = (el.contains(bar) ? bar.offsetHeight : 0) + "px";
      var v = video();
      if (v && !v.paused) { v.pause(); v.addEventListener("play", keepPaused); }
    } else if (overlay && overlay.parentNode) {
      overlay.remove();
    }
  }

  function safeSync() {
    try { sync(); } catch (err) { if (window.console) console.warn("chromecast plugin:", err); }
  }

  function mount() {
    if (!document.body) return setTimeout(mount, 200);
    safeSync();
    setInterval(safeSync, 500);
  }
  mount();
})();
