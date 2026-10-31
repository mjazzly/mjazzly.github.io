/* mjazzly.github.io, small site behaviours. Plain JavaScript, no libraries.

   1. A figure with a drawing gets "is-playing" the first time it scrolls
      into view, so its parts arrive in order, once.
   2. Resting the pointer on a card that holds a drawing (a model, a case,
      the tracker, the harness) marks it "is-focus" and plays the drawing
      once more; on the Models page the other cards step back while one is
      in focus. A play never restarts while it is still running.
   3. The five-depths staircase gets "is-in" when it scrolls into view.
   Without JavaScript nothing is hidden: the "js" class below is what
   switches the hidden starting states on. */

document.documentElement.classList.add("js");

// The seams beside the name: measure the name so the marine seam knows how far to travel on hover
(function () {
  var brand = document.querySelector("nav.top .brand");
  var name = brand && brand.querySelector(".brand-name");
  if (!name) return;
  function measure() { brand.style.setProperty("--w", name.offsetWidth + "px"); }
  measure(); window.addEventListener("resize", measure);

  // On the Systems page the seams open together, then part, once per visit
  var home = document.querySelector('nav.top .links a.active[href="index.html"]');
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (home && !calm) {
    brand.classList.add("no-anim", "is-joined");
  }
  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    measure();
    if (!brand.classList.contains("is-joined")) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        brand.classList.remove("no-anim");
        setTimeout(function () { brand.classList.remove("is-joined"); }, 450);  // seen together first, then they part; the map starts as the parting ends
      });
    });
  });
})();

(function () {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ROUND = 3000;  // how long one play of a drawing takes, in milliseconds

  var figures = Array.prototype.slice.call(document.querySelectorAll(".figure"));
  var stairs = document.querySelector(".stairs");
  var traits = document.querySelector(".traits");

  // Plays a drawing once; a request while it is still playing is ignored, so it never stutters or repeats
  function play(fig) {
    var now = Date.now();
    var round = +fig.getAttribute("data-round") || ROUND;
    if (fig.startedAt && now - fig.startedAt < round) return;
    fig.classList.toggle("is-replay", !!fig.startedAt);  // a second play starts at once
    fig.startedAt = now;
    fig.classList.remove("is-playing");
    void fig.offsetWidth; // lets the browser notice the switch was off
    fig.classList.add("is-playing");
  }

  if (calm.matches || !("IntersectionObserver" in window)) {
    if (stairs) stairs.classList.add("is-in");
    if (traits) traits.classList.add("is-in");
    Array.prototype.forEach.call(document.querySelectorAll(".costs"), function (t) { t.classList.add("is-in"); });
    return;
  }

  // Play the first time a drawing scrolls into view, and never again on scroll
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        play(entry.target);
        seen.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });
  figures.forEach(function (fig) { seen.observe(fig); });

  // Focus: the card under the pointer plays its drawing once
  figures.forEach(function (fig) {
    if (fig.classList.contains("shelf-fig")) return;  // the shelf and the timeline are pointed at, so they never replay under the pointer
    var card = fig.closest(".model, .case, .deep, .panel, .hero-map");
    if (!card) return;
    var grid = card.closest(".models");

    card.addEventListener("mouseenter", function () {
      card.classList.add("is-focus");
      if (grid) grid.classList.add("has-focus");
      play(fig);
    });

    card.addEventListener("mouseleave", function () {
      card.classList.remove("is-focus");
      if (grid) grid.classList.remove("has-focus");
    });
  });

  // Remember whether the last press came from a finger, so a touch screen's phantom "pointer leaves" never undoes a tap
  var lastTouch = false;
  document.addEventListener("pointerdown", function (e) { lastTouch = e.pointerType === "touch"; }, true);

  // Step by step: resting the pointer on a column lights that step
  Array.prototype.forEach.call(document.querySelectorAll(".diagram"), function (svg) {
    var parts = Array.prototype.slice.call(svg.querySelectorAll("[data-step]"));
    var fig = svg.closest(".figure");
    function light(step) {
      svg.classList.add("has-hot");
      parts.forEach(function (el) { el.classList.toggle("is-hot", el.getAttribute("data-step") === step); });
      if (fig) fig.classList.remove("is-playing");  // reading a step: the drawing sits complete
    }
    function clear() {
      svg.classList.remove("has-hot");
      parts.forEach(function (el) { el.classList.remove("is-hot"); });
    }
    Array.prototype.forEach.call(svg.querySelectorAll(".hit"), function (hit) {
      hit.addEventListener("mouseenter", function () { light(hit.getAttribute("data-step")); });
      hit.addEventListener("click", function () { light(hit.getAttribute("data-step")); });
    });
    svg.addEventListener("mouseleave", function () { if (!lastTouch) clear(); });
    // A tap or click anywhere outside the drawing returns it to normal (a touch screen has no "pointer leaves")
    document.addEventListener("pointerdown", function (e) {
      if (svg.classList.contains("has-hot") && !svg.contains(e.target)) clear();
    });
  });

  // The same for a focused card: a tap elsewhere lets it go
  document.addEventListener("pointerdown", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll(".is-focus"), function (card) {
      if (!card.contains(e.target)) {
        card.classList.remove("is-focus");
        var grid = card.closest(".models");
        if (grid) grid.classList.remove("has-focus");
      }
    });
  });

  // The fold: each case opens on its button; without JavaScript every case stays open
  Array.prototype.forEach.call(document.querySelectorAll(".case, .work"), function (card) {
    var button = card.querySelector(".case-toggle");
    var body = card.querySelector(".case-body");
    if (!button || !body) return;
    var openLabel = button.getAttribute("data-open") || "Read the case";
    function setOpen(open) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.querySelector(".case-toggle-label").textContent = open ? "Close" : openLabel;
      body.hidden = !open;
    }
    card.openFold = function () { setOpen(true); };
    button.hidden = false;
    setOpen(false);
    button.addEventListener("click", function () {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });
  });
  // A link to a folded entry (the tiles at the top, or a shared address) opens it on arrival
  function openHash() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    var card = target.classList.contains("work") || target.classList.contains("case") ? target : target.querySelector(".work, .case");
    if (card && card.openFold) card.openFold();
  }
  openHash();
  window.addEventListener("hashchange", openHash);

  // The INFJ-A bars fill once, and each percentage counts up beside its bar
  if (traits) {
    var fillIn = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      fillIn.disconnect();
      traits.classList.add("is-in");
      Array.prototype.forEach.call(traits.querySelectorAll(".pct[data-to]"), function (pct, k) {
        var to = +pct.getAttribute("data-to"), start = null, wait = 150 * k, span = 1400;
        pct.textContent = "0%";
        function step(t) {
          if (start === null) start = t + wait;
          var x = Math.min(Math.max((t - start) / span, 0), 1);
          var eased = 1 - Math.pow(1 - x, 3);
          pct.textContent = Math.round(to * eased) + "%";
          if (x < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    fillIn.observe(traits);
  }

  // The scorecard's cost bars fill once, the first time the table scrolls into view
  Array.prototype.forEach.call(document.querySelectorAll(".costs"), function (table) {
    var fillBars = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      fillBars.disconnect();
      table.classList.add("is-in");
    }, { threshold: 0.2 });
    fillBars.observe(table);
  });

  if (stairs) {
    var rise = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { stairs.classList.add("is-in"); rise.disconnect(); }
      });
    }, { threshold: 0.2 });
    rise.observe(stairs);
  }
})();

// Works with or without motion, so it sits outside the drawings' block
(function () {
  // A name over a pointed-at book or note: any link in a drawing with data-tip shows its name above it
  Array.prototype.forEach.call(document.querySelectorAll("svg.has-tips"), function (svg) {
    var ns = "http://www.w3.org/2000/svg";
    var tip = document.createElementNS(ns, "g"), box = document.createElementNS(ns, "rect"), label = document.createElementNS(ns, "text");
    tip.setAttribute("class", "tip"); box.setAttribute("rx", "6"); label.setAttribute("text-anchor", "middle");
    tip.appendChild(box); tip.appendChild(label); svg.appendChild(tip);
    var vb = svg.viewBox.baseVal;
    function show(a) {
      label.textContent = a.getAttribute("data-tip");
      var b = a.getBBox(), w = label.getComputedTextLength() + 18, h = 21;
      var x = Math.min(Math.max(b.x + b.width / 2 - w / 2, vb.x + 2), vb.x + vb.width - w - 2);
      var y = Math.max(b.y - h - 6, vb.y + 1);
      box.setAttribute("x", x); box.setAttribute("y", y); box.setAttribute("width", w); box.setAttribute("height", h);
      label.setAttribute("x", x + w / 2); label.setAttribute("y", y + 14.5);
      tip.classList.add("is-on");
    }
    function hide() { tip.classList.remove("is-on"); }
    Array.prototype.forEach.call(svg.querySelectorAll("a[data-tip]"), function (a) {
      // only a mouse or the keyboard shows the name; a finger goes straight to the card, so nothing is left lit behind
      a.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") show(a); });
      a.addEventListener("pointerleave", hide);
      a.addEventListener("focus", function () { if (a.matches(":focus-visible")) show(a); });
      a.addEventListener("blur", hide);
      a.addEventListener("click", function () { hide(); a.blur(); });
    });
  });
})();

// The output pages: items that share a data-src light together when the pointer rests on one, a finger taps one, or the keyboard reaches one; a press anywhere else clears them
(function () {
  Array.prototype.forEach.call(document.querySelectorAll(".linked"), function (box) {
    var items = Array.prototype.slice.call(box.querySelectorAll("[data-src]"));
    // an item may carry more than one id (an answer names its question and its metric); it lights whatever shares any of them
    function ids(el) { return (el.getAttribute("data-src") || "").split(/\s+/).filter(Boolean); }
    function light(id) {
      var want = id.split(/\s+/);
      box.classList.add("has-lit");
      items.forEach(function (el) {
        el.classList.toggle("is-lit", ids(el).some(function (x) { return want.indexOf(x) > -1; }));
      });
    }
    function clear() {
      box.classList.remove("has-lit");
      items.forEach(function (el) { el.classList.remove("is-lit"); });
    }
    // The peek: whatever lit up outside the screen is copied into a tray at the edge of the screen,
    // labelled with where it sits, so the match can be read without scrolling or zooming
    var tray = document.createElement("div");
    tray.className = "peek";
    tray.hidden = true;
    document.body.appendChild(tray);
    var current = null;
    function bare(n) {
      n.classList.remove("lit", "is-lit");
      [n].concat(Array.prototype.slice.call(n.querySelectorAll("*"))).forEach(function (c) {
        c.removeAttribute("data-src"); c.removeAttribute("tabindex"); c.removeAttribute("id");
      });
      return n;
    }
    function copyOf(el) {
      if (el.tagName === "TR") {
        var table = el.closest("table"), head = table.querySelector("thead tr, tr.head");
        var t = document.createElement("table");
        t.className = table.className;
        if (head && head !== el) t.appendChild(bare(head.cloneNode(true)));
        t.appendChild(bare(el.cloneNode(true)));
        var wrap = document.createElement("div");
        wrap.className = "peek-scroll";
        wrap.appendChild(t);
        return wrap;
      }
      if (el.tagName === "TH") {
        var chip = document.createElement("span");
        chip.className = "peek-chip";
        chip.textContent = el.textContent;
        return chip;
      }
      if (el.tagName === "LI") {   // a list item keeps its list around it, so it keeps its look
        var list = el.parentNode.cloneNode(false);
        list.removeAttribute("data-peek");
        list.appendChild(bare(el.cloneNode(true)));
        return list;
      }
      return bare(el.cloneNode(true));
    }
    function peek(from) {
      var away = items.filter(function (el) {
        if (el === from || !el.classList.contains("is-lit")) return false;
        var r = el.getBoundingClientRect();
        return r.top < 0 || r.bottom > window.innerHeight;
      });
      tray.innerHTML = "";
      if (!away.length) { tray.hidden = true; return; }
      var head = document.createElement("p");
      head.className = "peek-head";
      head.textContent = "Lit elsewhere on the page";
      tray.appendChild(head);
      away.slice(0, 6).forEach(function (el) {
        var item = document.createElement("div"), where = el.closest("[data-peek]"), k = document.createElement("p");
        item.className = "peek-item";
        k.className = "peek-k";
        k.textContent = where ? where.getAttribute("data-peek") : "";
        item.appendChild(k);
        item.appendChild(copyOf(el));
        tray.appendChild(item);
      });
      var r = from.getBoundingClientRect();
      tray.classList.toggle("at-top", r.top + r.height / 2 > window.innerHeight * 0.55);
      tray.hidden = false;
    }
    function point(el) { current = el; light(el.getAttribute("data-src")); peek(el); }
    function letGo() { current = null; clear(); tray.hidden = true; }
    window.addEventListener("scroll", function () { if (current) peek(current); }, { passive: true });

    items.forEach(function (el) {
      el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") point(el); });
      el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") letGo(); });
      el.addEventListener("click", function () { point(el); });
      el.addEventListener("focus", function () { point(el); });
      el.addEventListener("blur", letGo);
    });
    document.addEventListener("pointerdown", function (e) {
      if (box.classList.contains("has-lit") && !(e.target.closest && e.target.closest(".linked [data-src]"))) letGo();
    });
  });
})();

// The released board at full size: scaled to the width it is given, so it fills the page on any screen
(function () {
  Array.prototype.forEach.call(document.querySelectorAll(".board-stage"), function (stage) {
    var frame = stage.querySelector("iframe");
    var w = +stage.getAttribute("data-w"), h = +stage.getAttribute("data-h");
    if (!frame || !w || !h) return;
    function fit() {
      var k = stage.clientWidth / w;
      frame.style.transform = "scale(" + k + ")";
      stage.style.height = Math.ceil(h * k) + "px";
    }
    stage.classList.add("is-fit");
    fit();
    window.addEventListener("resize", fit);
  });
})();
