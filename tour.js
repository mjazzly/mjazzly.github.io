/* The walk ("Take the tour"): one card that carries a reader from page to page, one try at each stop.
   site.js loads this file only when the address carries ?tour=N, so no page is heavier for anyone else.
   The address is the whole state: ?tour=3 is the third stop that is on, Back and Next are plain links,
   and a stop can be shared. End, Finish and Escape take ?tour off the address and leave the reader where
   they are. The walk never binds the arrow keys and never takes over scrolling; it scrolls once, on arrival,
   only as far as the stop needs. Without JavaScript the start link still lands on stop 1.

   The stop list below is plain JSON between the STOPS markers, read by scripts/check.py, which fails when
   a stop's page, anchor or lit part is missing. Each stop: the page and the anchor it opens at; "lit", the
   parts to light (selectors inside the anchor, drawn as one lit area); "icon", from scripts/icons.py; "try"
   and "shows", the two lines on the card; "open", a link already on the page that the card's Open it
   button follows (for a stop that ends outside the site); "on", false keeps a stop out of the walk. */
(function () {
  var STOPS = /*STOPS*/[
    { "page": "frames.html", "anchor": "check-in", "lit": ["#check-in .desk", "#check-in .print-slot"], "icon": "ticket",
      "try": "<b>Check in at the desk.</b> Six taps at most, and a boarding pass prints.",
      "shows": "Where you stand with AI at work, and <b>your next step</b>, from a framework you can keep.", "on": true },
    { "page": "clarity.html", "anchor": "ex-04", "lit": ["#ex-04 #ex-04-panel"], "icon": "stairs",
      "try": "<b>Place two or three requests</b> in a tier, then go on when you like.",
      "shows": "Sizing a request <b>before any AI is used</b>: start at the smallest tier that passes.", "on": true },
    { "page": "aiwork.html", "anchor": "work-01", "lit": ["#work-01 figure.figure"], "icon": "list",
      "try": "<b>Point at or tap a column</b> of the drawing to light that step.",
      "shows": "Four points where it <b>must stop and ask</b>, in amber, set in code it cannot skip.", "on": true },
    { "page": "output-01.html", "anchor": "pair", "lit": ["#pair .pair"], "icon": "table",
      "try": "<b>Point at or tap a line</b> to light the row it became.",
      "shows": "<b>Every row traces to its line</b> in the transcript, from one recorded run.", "on": true },
    { "page": "aiwork.html", "anchor": "work-03", "lit": ["#work-03 .score-open"], "icon": "message", "open": "#work-03 .score-open a",
      "try": "<b>Open the live demo</b> and press one of the preset questions.",
      "shows": "<b>Running live</b>: a number with its definition, from metrics defined in code.", "on": true },
    { "page": "aiwork.html", "anchor": "work-08", "lit": ["#work-08 .score-open"], "icon": "calendar", "open": "#work-08 .score-open a",
      "try": "<b>Open the board</b> that updates itself each morning.",
      "shows": "A service that <b>runs on a schedule</b>, with nobody at the keyboard.", "on": false }
  ]/*/STOPS*/;
  var END_LINE = "<b>That is the walk.</b> The rest of the site is yours to read at your own pace.";

  var stops = STOPS.filter(function (s) { return s.on; });
  var n = parseInt(new URLSearchParams(location.search).get("tour"), 10);
  if (!(n >= 1 && n <= stops.length)) return;
  var stop = stops[n - 1];
  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reel = document.querySelector(".reel");   // Frames keeps a strip of film fixed at the top, so the card stays at the bottom there

  function href(s, k) { return s.page + "?tour=" + k + "#" + s.anchor; }
  function badge(name) { return '<span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-' + name + '"/></svg></span>'; }

  // One GoatCounter event when a walk starts and one when it finishes, nothing else
  function count(name, title) {
    function send() { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title, event: true }); }
    if (window.goatcounter && window.goatcounter.count) send(); else window.addEventListener("load", send);
  }

  // The lit area: one soft dim over the page with a clear window round the stop's parts; the page stays usable under it
  var parts = stop.lit.map(function (q) { return document.querySelector(q); }).filter(Boolean);
  var lit = document.createElement("div");
  lit.className = "tour-lit";
  lit.setAttribute("aria-hidden", "true");
  function area() {
    var box = null;
    parts.forEach(function (p) {
      var r = p.getBoundingClientRect();
      if (!r.width || !r.height) return;
      box = box ? { top: Math.min(box.top, r.top), left: Math.min(box.left, r.left), bottom: Math.max(box.bottom, r.bottom), right: Math.max(box.right, r.right) }
                : { top: r.top, left: r.left, bottom: r.bottom, right: r.right };
    });
    return box;
  }
  function place() {
    var b = area(), pad = 10;
    if (!b) { lit.hidden = true; return; }
    lit.hidden = false;
    lit.style.top = (b.top + window.pageYOffset - pad) + "px";
    lit.style.left = (b.left + window.pageXOffset - pad) + "px";
    lit.style.width = (b.right - b.left + pad * 2) + "px";
    lit.style.height = (b.bottom - b.top + pad * 2) + "px";
  }

  // The card
  var card = document.createElement("aside");
  card.className = "tour";
  card.tabIndex = -1;
  card.setAttribute("aria-label", "The tour, stop " + n + " of " + stops.length);
  var last = n === stops.length;
  var bar = '<button type="button" class="end">End</button>';
  if (n > 1) bar += '<a class="btn" href="' + href(stops[n - 2], n - 1) + '">Back</a>';
  var out = stop.open && document.querySelector(stop.open);
  if (out) bar += '<a class="btn go" target="_blank" rel="noopener" href="' + out.getAttribute("href") + '">Open it</a>';
  bar += last ? '<button type="button" class="btn finish' + (out ? "" : " go") + '">Finish</button>'
              : '<a class="btn go" href="' + href(stops[n], n + 1) + '">Next stop</a>';
  card.innerHTML = badge(stop.icon) + '<p class="tour-n">' + n + " of " + stops.length + "</p>" +
    '<p class="tour-try">' + stop["try"] + '</p><p class="tour-shows">' + stop.shows + "</p>" +
    '<div class="tour-bar">' + bar + "</div>";

  function measure() { root.style.setProperty("--tour-h", (card.offsetHeight + (window.innerWidth > 600 ? 28 : 12)) + "px"); }

  // The card docks at the bottom, and moves to the top only when that hides less of the stop
  var arriving = true;   // no docking while the arrival scroll is still moving
  function dock() {
    if (reel || arriving || card.classList.contains("is-done")) return;
    var b = area();
    if (!b) return;
    var h = card.offsetHeight + 16, vh = window.innerHeight;
    var under = Math.max(0, Math.min(b.bottom, vh) - Math.max(b.top, vh - h));
    var over = Math.max(0, Math.min(b.bottom, h) - Math.max(b.top, 0));
    var top = card.classList.contains("at-top");
    if (!top && over + 40 < under) card.classList.add("at-top");
    else if (top && under <= over) card.classList.remove("at-top");
  }

  // On arrival: bring the stop into view, only as far as it needs, clear of the card and the strip of film
  function bring() {
    var b = area();
    if (!b) return;
    var head = (reel ? reel.offsetHeight : 0) + 24, foot = window.innerHeight - card.offsetHeight - 32;
    var by = 0;
    if (b.top < head) by = b.top - head;
    else if (b.bottom > foot) by = Math.min(b.bottom - foot, b.top - head);
    // the arrival ends once the page has stopped scrolling for a moment (not every browser has scrollend)
    var idle;
    function done() { if (!arriving) return; arriving = false; window.removeEventListener("scroll", wait); place(); dock(); }
    function wait() { clearTimeout(idle); idle = setTimeout(done, 160); }
    window.addEventListener("scroll", wait, { passive: true });
    wait();
    // a short way glides; more than a screen (a page that grew after the browser found the anchor) jumps
    if (by) window.scrollBy({ top: by, behavior: calm.matches || Math.abs(by) > window.innerHeight ? "auto" : "smooth" });
  }

  function leave() {
    var q = new URLSearchParams(location.search);
    q.delete("tour");
    var s = q.toString();
    history.replaceState(history.state, "", location.pathname + (s ? "?" + s : "") + location.hash);
    if (lit.parentNode) lit.parentNode.removeChild(lit);
    root.classList.remove("touring");
  }
  function end() {
    leave();
    if (card.parentNode) card.parentNode.removeChild(card);
  }
  function finish() {
    count("tour-finish", "Tour finished");
    leave();
    card.classList.remove("at-top");
    card.classList.add("is-done");
    card.setAttribute("aria-label", "The tour, finished");
    card.innerHTML = badge("circle-check") + '<p class="tour-try">' + END_LINE + '</p><div class="tour-bar"><button type="button" class="btn go end">Close</button></div>';
    card.querySelector(".end").addEventListener("click", end);
    card.querySelector(".end").focus();
  }

  card.addEventListener("click", function (e) {
    if (e.target.closest(".finish")) finish();
    else if (e.target.closest(".end")) end();
  });
  // Tab from the card's last button goes straight to the stop, so a keyboard reaches the try without crossing the page
  card.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || e.shiftKey) return;
    var own = card.querySelectorAll("a, button");
    if (document.activeElement !== own[own.length - 1]) return;
    for (var i = 0; i < parts.length; i++) {
      var go = parts[i].matches("a[href], button, [tabindex]") ? parts[i] :
        parts[i].querySelector("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (go && go.offsetParent !== null) { e.preventDefault(); go.focus(); return; }
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || e.defaultPrevented || !card.parentNode) return;
    if (document.querySelector("nav.top .shelf.is-open")) return;   // the open shelf takes this Escape
    end();
  }, true);   // ahead of site.js, which closes the shelf on the same press

  document.body.appendChild(lit);
  document.body.appendChild(card);
  root.classList.add("touring");
  measure(); place();
  if (n === 1) {
    var seen = false;
    try { seen = sessionStorage.getItem("tour-started") === "1"; sessionStorage.setItem("tour-started", "1"); } catch (e) {}
    if (!seen) count("tour-start", "Tour started");
  }

  var ticking = false;
  function settle() { ticking = false; place(); dock(); }
  function soon() { if (!ticking) { ticking = true; requestAnimationFrame(settle); } }
  window.addEventListener("scroll", soon, { passive: true });
  window.addEventListener("resize", function () { measure(); soon(); });
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(soon);
    ro.observe(document.body);
    parts.forEach(function (p) { ro.observe(p); });
  }
  function arrive() {
    place();
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      bring();
      // to the card, unless the reader has already started somewhere
      var a = document.activeElement;
      if (!a || a === document.body || a === document.documentElement) card.focus({ preventScroll: true });
    }); });
  }
  // once the fonts are in, not on load: load also waits for the counter's script, which can be slow or blocked
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(arrive);
})();
