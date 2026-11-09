/* The walks (the AI tour and the data tour): one card that carries a reader from page to page, one try at each stop.
   site.js loads this file only when the address carries ?tour=N or ?tour=data-N, so no page is heavier for anyone else.
   The address is the whole state: ?tour=3 is the third stop of the AI tour that is on (every address from before
   the data tour still works), ?tour=data-3 the third of the data tour; Back and Next are plain links,
   and a stop can be shared. End, Finish and Escape take ?tour off the address and leave the reader where
   they are. The walk never binds the arrow keys and never takes over scrolling; it scrolls once, on arrival,
   only as far as the stop needs. Without JavaScript the start link still lands on stop 1.

   Each stop list below is plain JSON between its markers (STOPS for the AI tour, STOPS:data for the data tour),
   read by scripts/check.py and scripts/shot.py; check.py fails when
   a stop's page, anchor or lit part is missing. Each stop: the page and the anchor it opens at; "lit", the
   parts to light (selectors inside the anchor, drawn as one lit area); "icon", from scripts/icons.py; "try"
   and "shows", the two lines on the card; "open", a link already on the page that the card's Open it
   button follows (for a stop that ends outside the site); "foot", true for a stop whose page keeps its own
   question card at the foot of a narrow screen, so the tour card sits at the top there; "folded", true for a stop
   whose try is opening a fold that its address would otherwise open on arrival (site.js), so the card closes it; "on", false keeps a stop
   out of the walk. The finish card offers the other tour. */
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
      "shows": "A service that <b>runs on a schedule</b>, with nobody at the keyboard.", "on": true }
  ]/*/STOPS*/;
  var DATA = /*STOPS:data*/[
    { "page": "dashboards.html", "anchor": "read", "lit": ["#read .db-stage"], "icon": "chart", "foot": true,
      "try": "<b>Press Show me</b>, then Next through two or three parts of the page.",
      "shows": "A dashboard read <b>in the order the decision is made</b>: which branches need attention next month.", "on": true },
    { "page": "dashboards.html", "anchor": "record", "lit": ["#record .db-run", "#record .case-foot"], "icon": "shield", "folded": true,
      "try": "<b>Press Read the record</b> to see what was compared and what was left out.",
      "shows": "Each number on the dashboard <b>checked against answers written first</b>, and every question it cannot answer named and left out of the count.", "on": true },
    { "page": "deconstruct.html", "anchor": "deconstruct-01", "lit": ["#deconstruct-01 .dx-stage"], "icon": "unstack", "foot": true,
      "try": "<b>Press Show me</b> and change one choice under the tile.",
      "shows": "One export <b>counted eight ways</b>, each right by its own setting: ask how a number was made.", "on": true },
    { "page": "aiwork.html", "anchor": "work-03", "lit": ["#work-03 figure.figure"], "icon": "database",
      "try": "<b>Point at or tap the first column</b>, Rows checked, then any other.",
      "shows": "Before any question, messy rows become <b>tested tables</b>, and a failed test keeps the live demo on its last passing version.", "on": true },
    { "page": "aiwork.html", "anchor": "work-03", "lit": ["#work-03 .score-open"], "icon": "message", "open": "#work-03 .score-open a",
      "try": "<b>Open the live demo</b> and ask your own question about the orders, or press a preset one.",
      "shows": "<b>Running live</b>, on the table the dashboard reads: a number with its definition and filters.", "on": true }
  ]/*/STOPS:data*/;
  var END_LINE = "<b>That is the walk.</b> The rest of the site is yours to read at your own pace.";

  // Two tours share this card. ?tour=N is the AI tour (every address from before the data tour still works),
  // ?tour=data-N the data tour. Each counts its own start and finish, and its finish card offers the other.
  var TOURS = {
    ai: { list: STOPS, pre: "", name: "AI tour", say: "AI tour", start: ["tour-start", "Tour started"], finish: ["tour-finish", "Tour finished"], seen: "tour-started", other: "data" },
    data: { list: DATA, pre: "data-", name: "Data tour", say: "data tour", start: ["data-tour-start", "Data tour started"], finish: ["data-tour-finish", "Data tour finished"], seen: "data-tour-started", other: "ai" }
  };
  var m = /^(data-)?(\d+)$/.exec(new URLSearchParams(location.search).get("tour") || "");
  if (!m) return;
  var T = TOURS[m[1] ? "data" : "ai"], O = TOURS[T.other];
  var stops = T.list.filter(function (s) { return s.on; });
  var n = parseInt(m[2], 10);
  if (!(n >= 1 && n <= stops.length)) return;
  var stop = stops[n - 1];
  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reel = document.querySelector(".reel");   // Frames keeps a strip of film fixed at the top, so the card stays at the bottom there
  // a stop whose page keeps its own question card at the foot of the screen (Dashboards, Deconstruct, up to 860px wide)
  // puts the tour card at the top on those widths, and tells the page how much room it takes there (--tour-top)
  var footed = stop.foot ? window.matchMedia("(max-width: 860px)") : null;

  function href(s, k, t) { t = t || T; return s.page + "?tour=" + t.pre + k + "#" + s.anchor; }
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
  card.setAttribute("aria-label", "The " + T.say + ", stop " + n + " of " + stops.length);
  var last = n === stops.length;
  var bar = '<button type="button" class="end">End</button>';
  if (n > 1) bar += '<a class="btn" href="' + href(stops[n - 2], n - 1) + '">Back</a>';
  var out = stop.open && document.querySelector(stop.open);
  if (out) bar += '<a class="btn go" target="_blank" rel="noopener" href="' + out.getAttribute("href") + '">Open it</a>';
  bar += last ? '<button type="button" class="btn finish' + (out ? "" : " go") + '">Finish</button>'
              : '<a class="btn go" href="' + href(stops[n], n + 1) + '">Next stop</a>';
  card.innerHTML = badge(stop.icon) + '<p class="tour-n">' + T.name + " · " + n + " of " + stops.length + "</p>" +
    '<p class="tour-try">' + stop["try"] + '</p><p class="tour-shows">' + stop.shows + "</p>" +
    '<div class="tour-bar">' + bar + "</div>";

  function measure() {
    root.style.setProperty("--tour-h", (card.offsetHeight + (window.innerWidth > 600 ? 28 : 12)) + "px");
    root.style.setProperty("--tour-top", (card.classList.contains("at-top") ? card.offsetHeight + (window.innerWidth > 600 ? 16 : 0) : 0) + "px");
  }

  // The card docks at the bottom, and moves to the top only when that hides less of the stop
  var arriving = true;   // no docking while the arrival scroll is still moving
  function footTop() {
    if (!footed) return false;
    var was = card.classList.contains("at-top");
    if (was !== footed.matches) { card.classList.toggle("at-top", footed.matches); measure(); }
    return footed.matches;
  }
  function dock() {
    if (footTop()) return;
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
    var top = card.classList.contains("at-top");
    var head = (reel ? reel.offsetHeight : 0) + (top ? card.offsetHeight + 16 : 0) + 24, foot = window.innerHeight - (top ? 0 : card.offsetHeight) - 32;
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
    count(T.finish[0], T.finish[1]);
    leave();
    card.classList.remove("at-top");
    card.classList.add("is-done");
    card.setAttribute("aria-label", "The " + T.say + ", finished");
    // the finish card offers the other tour, from its first stop
    var next = O.list.filter(function (s) { return s.on; })[0];
    card.innerHTML = badge("circle-check") + '<p class="tour-try">' + END_LINE + '</p><div class="tour-bar">' +
      (next ? '<button type="button" class="end">Close</button><a class="btn go" href="' + href(next, 1, O) + '">Take the ' + O.say + "</a>"
            : '<button type="button" class="btn go end">Close</button>') + "</div>";
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

  if (stop.folded) {
    var shut = document.querySelector("#" + stop.anchor + " .case-toggle[aria-expanded='true']");
    if (shut) shut.click();
  }
  document.body.appendChild(lit);
  document.body.appendChild(card);
  root.classList.add("touring");
  footTop(); measure(); place();
  if (n === 1) {
    var seen = false;
    try { seen = sessionStorage.getItem(T.seen) === "1"; sessionStorage.setItem(T.seen, "1"); } catch (e) {}
    if (!seen) count(T.start[0], T.start[1]);
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
