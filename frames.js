/* mjazzly.github.io, the Frames page. Plain JavaScript, no libraries.

   The page is a film. Each framework is a frame, and each frame is one or
   more screens (.shot), one idea each. A thin strip of film at the top of the
   window names the four frames and marks the one being read in amber; it
   shows once the strip under the hero has scrolled away. The arrow keys move
   on: right shows the next step of the drawing on screen, and past its last
   step goes to the next screen; left goes back the same way. Scrolling works
   as on any page.

   Each drawing is stepped through one part at a time. The words for every
   step are in the page: this shows the current one, lights its part (the
   parts before it read as done), and adds Back and Next under the drawing, with no step count.
   A tap on a part goes straight to its step. Anything in the same section
   carrying data-on="1 3" lights while step 1 or 3 is showing (the four
   sources and their risers on FRAME-04). A stepper marked data-still
   (FRAME-03's roads, FRAME-04's building) never moves the page on Back,
   Next or the arrow keys: its words share one cell, so nothing below moves. On a phone FRAME-03's Back, Next and words sit in a dock at the foot
   of the screen, and each step brings its stop into the room above the dock (8 Nov 2026). The departures board on FRAME-01
   keeps every row and fills them in as the plane moves; the brief on
   FRAME-03 starts with nothing ticked. Nothing moves on its own. Without
   JavaScript every step shows as a list, and each part links to its words. */

(function () {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  function icon(name) {
    return '<svg class="ic" aria-hidden="true"><use href="#ic-' + name + '"/></svg>';
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function button(label, cls) {
    var b = el("button", "case-toggle " + cls);
    b.type = "button";
    b.innerHTML = '<span class="case-toggle-label">' + label + "</span>" + icon("chevron");
    return b;
  }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------- the steppers ----------
  all("[data-stepper]").forEach(function (box) {
    var parts = all(".part[data-step]", box);
    var says = all(".say[data-step]", box);
    var section = box.closest("section") || document;
    var lit = all("[data-on]", section);
    var list = box.querySelector(".says");
    var map = box.querySelector(".map") || box;
    var board = list && list.classList.contains("board");
    var first = box.hasAttribute("data-start") ? +box.getAttribute("data-start") : 1;
    var still = box.hasAttribute("data-still");
    // a part or a say may cover several steps (a stage on FRAME-01 holds three posts): data-step is its first, data-last its last
    function from(e) { return +e.getAttribute("data-step"); }
    function to(e) { return +(e.getAttribute("data-last") || e.getAttribute("data-step")); }
    var n = parts.reduce(function (m, p) { return Math.max(m, to(p)); }, 0), now = first;
    if (!n) return;

    var head = map.querySelector(".head");
    var arc = map.querySelector(".arc");
    var dial = box.querySelector(".dial .fill");

    var controls = el("div", "controls");
    var back = button("Back", "back"), next = button("Next", "next");
    controls.appendChild(back); controls.appendChild(next);
    // right under the drawing, so the words they change sit just below them
    var mapEl = box.querySelector(".map");
    if (mapEl) mapEl.parentNode.insertBefore(controls, mapEl.nextSibling);
    else if (list) list.parentNode.insertBefore(controls, list);
    else box.appendChild(controls);
    // on the departures board the flight and its buttons stay pinned under the strip of film while the board passes beneath,
    // so the plane and the checkpoint it has reached are always seen together
    var pin = null;
    if (board && mapEl) {
      pin = el("div", "pin");
      mapEl.parentNode.insertBefore(pin, mapEl);
      pin.appendChild(mapEl); pin.appendChild(controls);
    }
    // on FRAME-03's roads the buttons and the words for the step share a dock under the roads; on a phone, where the roads run
    // down the screen taller than the window, the dock stays at the foot of the screen and each step brings its stop into the room above it
    var dock = null, narrow = window.matchMedia("(max-width:600px)");
    if (map.classList.contains("roads") && list) {
      dock = el("div", "dock");
      controls.parentNode.insertBefore(dock, controls);
      dock.appendChild(controls); dock.appendChild(list);
      // while the dock sits at the foot of the screen the site's back-to-top button steps aside (frames.css hides it on a phone)
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
        document.documentElement.classList.toggle("f-docked", es[0].isIntersecting);
      }, { rootMargin: "-92% 0px 0px 0px" }).observe(dock);
    }

    // on the roads each stop gets a road that fills with a sliding layer and a dot that grows in, so a step animates rather than redraws
    if (map.classList.contains("roads")) parts.forEach(function (p) {
      var road = el("i", "road"), dot = el("i", "dot");
      road.setAttribute("aria-hidden", "true"); dot.setAttribute("aria-hidden", "true");
      road.appendChild(el("i", "fill"));
      p.insertBefore(road, p.firstChild); p.appendChild(dot);
    });

    // the play head on FRAME-02 sits at the end of the part being played; the rhythm runs the whole length
    function placeHead() {
      if (!head) return;
      var cur = parts.filter(function (p) { return from(p) === now; })[0];
      var m = map.getBoundingClientRect();
      var x = cur.classList.contains("rhythm") ? m.width - 16 : cur.getBoundingClientRect().right - m.left + 1.5;
      map.style.setProperty("--head", x + "px");
    }

    function go(k) {
      now = k;
      map.setAttribute("data-at", k);
      says.forEach(function (s) {
        var on = from(s) <= k && k <= to(s);
        if (board) {
          s.classList.toggle("is-now", on);
          s.classList.toggle("is-done", to(s) < k);
          s.classList.toggle("is-later", from(s) > k);
        } else {
          s.hidden = !on;
        }
      });
      parts.forEach(function (p) {
        var on = from(p) <= k && k <= to(p);
        p.classList.toggle("is-now", on);
        p.classList.toggle("is-done", to(p) < k);
        p.classList.toggle("is-later", from(p) > k);
        if (on) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
      });
      lit.forEach(function (t) {
        t.classList.toggle("is-on", t.getAttribute("data-on").split(" ").indexOf(String(k)) > -1);
      });
      if (arc && !wrapping) arc.style.strokeDashoffset = 6 - (k - 1);
      if (dial) dial.style.strokeDashoffset = 4 - k;
      placeHead();
      back.disabled = k === first;
      next.querySelector(".case-toggle-label").textContent = k === n ? (arc ? "Next version" : "From the start") : "Next";
    }

    // After a step the reader takes, the window moves only as far as it must to show the drawing and the words for the step together:
    // on FRAME-01 the plane and the checkpoint it has reached on the board. Where both cannot fit, the moving part and its words come first,
    // and where even that cannot fit, the words.
    var plane = map.querySelector(".plane");
    function keep() {
      var words = board ? box.querySelector('.post[data-step="' + now + '"]') || list.querySelector(".say.is-now")
        : says.filter(function (s) { return !s.hidden; })[0];
      if (!words) return;
      var reel = document.querySelector(".reel"), top = (reel ? reel.offsetHeight : 0) + 10;
      if (pin) top += pin.offsetHeight;
      var room = window.innerHeight - top - 14, b = words.getBoundingClientRect().bottom;
      if (pin) {
        // the plane is pinned, so only the checkpoint has to come into the room under it
        var w = words.getBoundingClientRect(), d = w.top < top ? w.top - top : w.bottom > top + room ? w.bottom - top - room : 0;
        if (Math.abs(d) > 2) window.scrollBy({ top: d, behavior: calm.matches ? "auto" : "smooth" });
        return;
      }
      var mover = plane || parts.filter(function (p) { return p.classList.contains("is-now"); })[0] || map;
      var t = [map.getBoundingClientRect().top, mover.getBoundingClientRect().top, words.getBoundingClientRect().top]
        .filter(function (y) { return b - y <= room; })[0];
      var dy = 0;
      if (t === undefined) dy = b - (top + room);
      else if (t < top) dy = t - top;
      else if (b > top + room) dy = b - (top + room);
      if (Math.abs(dy) > 2) window.scrollBy({ top: dy, behavior: calm.matches ? "auto" : "smooth" });
    }

    // with the dock at the foot of a phone screen, the lit stop is brought to the middle of the room above it; a stop already in that room stays put
    function keepStop() {
      var cur = parts.filter(function (p) { return p.classList.contains("is-now"); })[0];
      if (!cur) return;
      var reel = document.querySelector(".reel"), top = (reel && reel.classList.contains("is-shown") ? reel.offsetHeight : 0) + 12;
      var bottom = dock.getBoundingClientRect().top - 12, r = cur.getBoundingClientRect();
      if (r.top >= top && r.bottom <= bottom) return;
      var dy = r.top + r.height / 2 - (top + bottom) / 2;
      window.scrollBy({ top: dy, behavior: calm.matches ? "auto" : "smooth" });
    }
    function docked() { return dock && narrow.matches; }

    // A tap on a part shows its words, brought into view with the drawing
    parts.forEach(function (p) {
      p.addEventListener("click", function (e) {
        e.preventDefault();
        go(from(p));
        if (docked()) keepStop(); else keep();
      });
    });
    // on the departures board a folded stage opens with one tap, at its first post
    if (board) says.forEach(function (s) {
      s.querySelector(".say-k").addEventListener("click", function () {
        if (!s.classList.contains("is-now")) { go(from(s)); keep(); }
      });
    });
    back.addEventListener("click", function () { if (now > first) { go(now - 1); if (!still) keep(); else if (docked()) keepStop(); } });
    next.addEventListener("click", function () {
      if (now === n && arc) roundAgain(); else go(now === n ? first : now + 1);
      if (!still) keep(); else if (docked()) keepStop();
    });
    // the loop goes round, never back: past Reuse the arc closes the circle, then the next version starts at Write
    var wrapping = false;
    function roundAgain() {
      wrapping = true;
      go(first);
      arc.style.strokeDashoffset = 0;
      // the closed ring fades, and the new round begins from empty
      var T = calm.matches ? 0 : 650;
      setTimeout(function () { arc.style.opacity = 0; }, T);
      setTimeout(function () {
        arc.style.transition = "none";
        arc.style.strokeDashoffset = 6;
        arc.getBoundingClientRect();
        arc.style.transition = "";
        arc.style.opacity = "";
        wrapping = false;
        arc.style.strokeDashoffset = 6 - (now - 1);
      }, T * 1.5);
    }
    window.addEventListener("resize", placeHead);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeHead);

    box.stepper = {
      go: go,
      at: function () { return now; },
      first: first,
      last: n,
      controls: controls,
      still: still,
      keep: function () { if (docked()) keepStop(); else keep(); },
      dock: dock
    };
    box.classList.add("is-stepping");
    go(first);
  });

  // ---------- the check-in desk on FRAME-01 ----------
  // Five stage questions, one at a time; each answer counts toward a stage,
  // the most common wins and a tie goes to the earlier stage. Then one
  // checkpoint question, showing only the options for that stage. "No, or not
  // yet" to the first question is No ticket, so the pass prints at once. The
  // pass carries the checkpoint, its "How you tell" line, its lever and the
  // next checkpoint from the departures board, word for word. Answers live in
  // this script only: nothing is sent or stored.
  all("[data-checkin]").forEach(function (desk) {
    var qs = all(".desk-q", desk);
    var stageQs = qs.filter(function (q) { return !q.classList.contains("final"); });
    var final = desk.querySelector(".desk-q.final");
    var tpl = desk.querySelector("template[data-pass]");
    var flight = document.querySelector("#frame-01 [data-stepper]");
    var ORDER = ["ground", "gate", "air"];
    var ROW = { ground: "f1-1", gate: "f1-2", air: "f1-3" };
    var answers = [], cp = 0, at = 0;

    // progress: a dotted route on the sign, the plane one dot further on for each answer
    var STOPS = stageQs.length + 1;
    var route = el("span", "route");
    route.setAttribute("aria-hidden", "true");
    for (var d = 0; d <= STOPS; d++) route.appendChild(el("i"));
    var rplane = el("span", "rplane", icon("plane"));
    route.appendChild(rplane);
    desk.querySelector(".desk-sign").appendChild(route);
    function fly(n) {
      rplane.style.left = (n / STOPS * 100) + "%";
      all("i", route).forEach(function (dot, j) { dot.classList.toggle("is-passed", j <= n); });
    }

    // the result: a small flight beside the pass, the plane parked at the reader's checkpoint, the next one glowing amber
    var PTS = [[12, 92], [30, 92], [48, 92], [74, 92], [92, 92], [110, 92], [140, 62], [166, 32], [190, 28]];
    function miniFlight(n) {
      var svgNS = "http://www.w3.org/2000/svg";
      var box = el("div", "mini");
      box.setAttribute("aria-hidden", "true");
      var dots = PTS.map(function (p, j) {
        var c = j + 1, cls = c < n ? "passed" : c === n ? "here" : c === n + 1 ? "next" : "";
        return (c === n + 1 ? '<circle class="glow" cx="' + p[0] + '" cy="' + p[1] + '" r="12"/>' : "") +
          '<circle class="cp ' + cls + '" cx="' + p[0] + '" cy="' + p[1] + '" r="5.5"/>';
      }).join("");
      var at = PTS[n - 1], tilt = n === 7 ? 62 : 90;
      box.innerHTML = '<svg viewBox="0 0 200 120" xmlns="' + svgNS + '">' +
        '<path class="ground" d="M0 108H200"/>' +
        '<path class="path" d="M12 92H118C134 92 138 36 166 32C178 30 188 28 200 28"/>' + dots +
        '<g class="mplane" style="transform:translate(' + PTS[0][0] + 'px,' + (PTS[0][1] - 15) + 'px)">' +
        '<use href="#ic-plane" x="-13" y="-13" width="26" height="26" transform="rotate(' + tilt + ')"/></g></svg>';
      var g = box.querySelector(".mplane");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { g.style.transform = "translate(" + at[0] + "px," + (at[1] - 15) + "px)"; });
      });
      return box;
    }

    var back = button("Back", "back");
    var again = button("Check in again", "again");
    var foot = el("div", "controls");
    foot.appendChild(back); foot.appendChild(again);
    var slot = el("div", "print-slot");
    desk.appendChild(foot);
    desk.parentNode.insertBefore(slot, desk.nextSibling);

    function asButton(li, onPick) {
      var b = el("button", "opt", li.innerHTML);
      b.type = "button";
      li.innerHTML = "";
      li.appendChild(b);
      b.addEventListener("click", onPick);
    }
    stageQs.forEach(function (q, i) {
      all(".opts li", q).forEach(function (li) {
        asButton(li, function () {
          answers[i] = li.getAttribute("data-to");
          if (answers[i] === "none") { cp = 1; show(-1); }
          else if (i === stageQs.length - 1) show(stageQs.length);
          else show(i + 1);
        });
      });
    });
    all(".opts li", final).forEach(function (li) {
      asButton(li, function () { cp = +li.getAttribute("data-cp"); show(-1); });
    });

    function stage() {
      if (answers[0] === "none") return "ground";
      var tally = { ground: 0, gate: 0, air: 0 };
      answers.forEach(function (a) { if (tally[a] !== undefined) tally[a]++; });
      return ORDER.reduce(function (best, s) { return tally[s] > tally[best] ? s : best; }, "ground");
    }
    function point(n) { return flight && flight.querySelector('.post[data-step="' + n + '"]'); }
    function plain(e) {
      var c = e.cloneNode(true);
      all(".k", c).forEach(function (k) { k.remove(); });
      return c.textContent.trim();
    }

    function print() {
      var row = document.getElementById(ROW[stage()]), here = point(cp), next = point(cp + 1);
      var pass = tpl.content.firstElementChild.cloneNode(true);
      pass.querySelector(".r-stage").textContent = row.querySelector(".say-k").textContent;
      pass.querySelector(".r-cp").textContent = here.querySelector(".pn").textContent;
      pass.querySelector(".r-tell").textContent = plain(here.querySelector(".tell"));
      pass.querySelector(".r-lever").textContent = plain(here.querySelector(".plever"));
      var r = pass.querySelector(".r-next");
      if (next) r.innerHTML = "<b>" + next.querySelector(".pn").textContent + "</b>: " + plain(next.querySelector(".tell"));
      else r.textContent = r.getAttribute("data-last");
      pass.querySelector(".to-flight").addEventListener("click", function () {
        if (flight && flight.stepper) flight.stepper.go(cp);
      });
      slot.innerHTML = "";
      slot.appendChild(pass);
      slot.appendChild(miniFlight(cp));
    }

    // k is the question on show (the last is the checkpoint question); -1 is the printed pass
    function show(k) {
      if (k >= 0 && k < stageQs.length) answers.length = k;
      at = k;
      qs.forEach(function (q, i) { q.hidden = i !== k; });
      if (k === stageQs.length) {
        var s = stage();
        all(".opts", final).forEach(function (o) { o.hidden = o.getAttribute("data-stage") !== s; });
      }
      desk.classList.toggle("is-done", k < 0);
      if (k < 0) print(); else slot.innerHTML = "";
      fly(k < 0 ? STOPS : k);
      back.disabled = k === 0;
      again.hidden = k >= 0;
    }
    back.addEventListener("click", function () {
      if (at < 0) show(answers[0] === "none" ? 0 : stageQs.length);
      else if (at > 0) show(at - 1);
    });
    again.addEventListener("click", function () { show(0); });

    desk.classList.add("is-asking");
    show(0);
  });

  // ---------- counting who is where: the scene on FRAME-01 ----------
  // Nine checkpoint gates, named from the departures board, with passenger
  // dots standing at them: an illustration, never a count. The four sources
  // light the gates they reveal (pointed at, or tapped to hold). Each shape in
  // the list below is a picker: a tap moves the dots into that shape and
  // shows its finding under the gates. The dots keep their order, so a shape
  // that moves people up the flight reads as people moving up. Without
  // JavaScript the scene is not drawn and the list reads as it is.
  all(".shape-shot").forEach(function (shot) {
    var tpl = shot.querySelector("template[data-scene]");
    var list = shot.querySelector(".shape");
    var names = all("#frame-01 .post .pn").map(function (e) { return e.textContent; });
    if (!tpl || !list || names.length !== 9) return;
    var scene = tpl.content.firstElementChild.cloneNode(true);
    tpl.parentNode.insertBefore(scene, tpl);
    var row = scene.querySelector(".cpgs"), layer = scene.querySelector(".pax-layer");
    var caption = scene.querySelector(".finding-now");
    var gates = names.map(function (name, i) {
      var g = el("div", "cpg" + (i && i % 3 === 0 ? " stage-start" : ""),
        '<span class="crowd"></span><span class="arch" aria-hidden="true"></span><span class="gn">' + name + "</span>");
      row.appendChild(g);
      return g;
    });

    var N = 24, W = [0, 1, 2, 3.5, 5.5], pax = [], at = [];
    for (var d = 0; d < N; d++) { var dot = el("i", "pax"); layer.appendChild(dot); pax.push(dot); }
    function heights(box) { return all("i", box).map(function (i) { return +i.className.replace(/\D/g, ""); }); }
    // share the same crowd out across the gates in proportion to the shape
    function share(hs) {
      var w = hs.map(function (h) { return W[h]; }), sum = w.reduce(function (a, b) { return a + b; }, 0);
      var raw = w.map(function (x) { return x / sum * N; }), out = raw.map(Math.floor);
      var left = N - out.reduce(function (a, b) { return a + b; }, 0);
      raw.map(function (x, i) { return [x - Math.floor(x), i]; }).sort(function (a, b) { return b[0] - a[0]; })
        .slice(0, left).forEach(function (r) { out[r[1]]++; });
      return out;
    }
    function place(counts) {
      at = counts;
      var base = layer.getBoundingClientRect(), k = 0;
      gates.forEach(function (g, gi) {
        var c = g.querySelector(".crowd").getBoundingClientRect();
        var wide = c.width > c.height * 1.6, per = wide ? 99 : Math.max(1, Math.min(4, Math.floor(c.width / 12)));
        for (var j = 0; j < counts[gi]; j++, k++) {
          var x, y;
          if (wide) { x = c.left - base.left + j * 12; y = c.top - base.top + (c.height - 9) / 2; }
          else {
            x = c.left - base.left + (c.width - Math.min(per, counts[gi]) * 12) / 2 + (j % per) * 12;
            y = c.bottom - base.top - 10 - Math.floor(j / per) * 12;
          }
          pax[k].style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
          pax[k].setAttribute("data-gate", gi + 1);
        }
      });
      light();
    }

    // the sources: pointing previews, a tap holds
    var srcs = all(".scene-src", scene), held = null, hover = null;
    function light() {
      var s = hover || held, show = s ? s.getAttribute("data-show").split(" ") : null;
      scene.classList.toggle("has-lit", !!show);
      gates.forEach(function (g, i) { g.classList.toggle("is-lit", !!show && show.indexOf(String(i + 1)) > -1); });
      pax.forEach(function (p) { p.classList.toggle("dim", !!show && show.indexOf(p.getAttribute("data-gate")) < 0); });
      srcs.forEach(function (b) { b.classList.toggle("is-on", b === s); b.setAttribute("aria-pressed", b === held ? "true" : "false"); });
    }
    srcs.forEach(function (b) {
      b.addEventListener("mouseenter", function () { hover = b; light(); });
      b.addEventListener("mouseleave", function () { hover = null; light(); });
      b.addEventListener("click", function () { held = held === b ? null : b; hover = null; light(); });
    });

    // the shapes: each item in the list moves the crowd and shows its finding
    var items = all("li", list);
    list.classList.add("is-picker");
    function pick(li) {
      items.forEach(function (x) { x.classList.toggle("is-on", x === li); x.setAttribute("aria-pressed", x === li ? "true" : "false"); });
      caption.innerHTML = li.querySelector("p").innerHTML;
      var was = li.querySelector(".spark .was"), now = li.querySelector(".spark .now");
      if (was && now) {
        // a month later: the crowd stands as it was, then moves up
        place(share(heights(was)));
        setTimeout(function () { place(share(heights(now))); }, calm.matches ? 0 : 750);
      } else {
        place(share(heights(li.querySelector(".spark"))));
      }
    }
    items.forEach(function (li) {
      li.setAttribute("role", "button");
      li.tabIndex = 0;
      li.addEventListener("click", function () {
        pick(li);
        var r = scene.getBoundingClientRect();
        if (r.top < 0) scene.scrollIntoView({ block: "start", behavior: calm.matches ? "auto" : "smooth" });
      });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); }
      });
    });
    window.addEventListener("resize", function () { if (at.length) place(at); });
    layer.classList.add("still");
    pick(items[0]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { layer.classList.remove("still"); }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(at); });
  });

  // ---------- FRAME-02: the two roads into one song, and the rehearsal ----------
  // Pointing at a road (or a tap) lights it toward the finished song. On the
  // top road the composer leads and the performer follows; on the bottom road
  // the performer leads. Both play once when the drawing first comes into view.
  all(".roads-art").forEach(function (svg) {
    var lit = {}, trav = {}, raf = 0, on = null, began = 0;
    all(".lit", svg).forEach(function (p) { lit[p.getAttribute("data-road")] = p; });
    all(".trav", svg).forEach(function (g) { trav[g.getAttribute("data-who")] = g; });
    function at(path, t) { var q = path.getPointAtLength(Math.max(0, Math.min(1, t)) * path.getTotalLength()); return "translate(" + q.x + " " + q.y + ")"; }
    function run(road) {
      cancelAnimationFrame(raf);
      on = road; began = Date.now();
      var path = lit[road], order = road === "top" ? ["pen", "mic"] : ["mic", "pen"];
      Object.keys(lit).forEach(function (k) { lit[k].classList.toggle("is-on", k === road); });
      svg.classList.add("is-going"); svg.classList.remove("is-arrived");
      var t0 = performance.now(), T = calm.matches ? 0 : 1600;
      (function frame(now) {
        var t = T ? Math.min(1, (now - t0) / T) : 1, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        path.style.strokeDashoffset = 1 - e;
        trav[order[0]].setAttribute("transform", at(path, e));
        trav[order[1]].setAttribute("transform", at(path, e - 0.16));
        if (t < 1) raf = requestAnimationFrame(frame); else svg.classList.add("is-arrived");
      })(t0);
    }
    function stop() {
      cancelAnimationFrame(raf); on = null;
      svg.classList.remove("is-going", "is-arrived");
      Object.keys(lit).forEach(function (k) { lit[k].classList.remove("is-on"); lit[k].style.strokeDashoffset = 1; });
    }
    // the first time the drawing is mostly on screen, both roads play once, top then bottom, so the reader sees there is something to point at
    var demo = [];
    function quiet() { demo.forEach(clearTimeout); demo = []; }
    if (!calm.matches && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es.some(function (e) { return e.intersectionRatio >= 0.8; })) return;
        io.disconnect();
        demo = [
          setTimeout(function () { run("top"); }, 300),
          setTimeout(function () { run("bottom"); }, 2500),
          setTimeout(function () { stop(); demo = []; }, 4900)
        ];
      }, { threshold: [0.8] });
      io.observe(svg);
    }
    all(".hit", svg).forEach(function (h) {
      var road = h.getAttribute("data-road");
      h.addEventListener("mouseenter", function () { quiet(); if (on !== road) run(road); });
      h.addEventListener("mouseleave", function () { if (!demo.length) stop(); });
      // a tap on a touch screen also reports the pointer arriving, so the tap that started a road does not stop it
      h.addEventListener("click", function () {
        quiet();
        if (on !== road) run(road);
        else if (Date.now() - began > 500) stop();
      });
    });
  });

  // the rehearsal plays its pass marks once, when its screen is mostly in view
  all(".tiles.pair .cases").forEach(function (cases) {
    var tiles = cases.closest(".tiles");
    if (calm.matches || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.intersectionRatio >= 0.85) { cases.classList.add("is-playing"); io.disconnect(); }
      });
    }, { threshold: [0.85] });
    io.observe(tiles);
  });

  // Then both cards can be tried. A tap on a case makes it miss (the decline case then answers instead of declining),
  // and the verdict under the cases follows the rule: four of five match and the decline holds. A tap on a part of the
  // writing grade leaves it out of the sheet; the parts left in close up to the left, so the grade reads against the 60 line.
  function tryOut(tpl) {
    var t = tpl.content.firstElementChild.cloneNode(true);
    tpl.parentNode.insertBefore(t, tpl);
    var stamp = t.querySelector(".stamp");
    return {
      n: t.querySelector(".tn"),
      say: function (e, ok) {
        e.textContent = e.getAttribute(ok ? "data-yes" : "data-no");
        e.classList.toggle("is-no", !ok);
      },
      stamp: function (ok) {
        this.say(stamp, ok);
        stamp.classList.remove("is-new"); stamp.getBoundingClientRect(); stamp.classList.add("is-new");
      }
    };
  }
  function toggler(e, label, onFlip) {
    e.setAttribute("role", "button");
    e.tabIndex = 0;
    e.setAttribute("aria-pressed", "false");
    if (label) e.setAttribute("aria-label", label);
    e.addEventListener("click", function () {
      e.setAttribute("aria-pressed", e.getAttribute("aria-pressed") === "true" ? "false" : "true");
      onFlip();
    });
    e.addEventListener("keydown", function (k) {
      if (k.key === "Enter" || k.key === " ") { k.preventDefault(); e.click(); }
    });
  }
  all('template[data-try="cases"]').forEach(function (tpl) {
    var ui = tryOut(tpl), cases = all(".cases li", tpl.parentNode), held = tpl.parentNode.querySelector(".verdict .held");
    function judge() {
      var miss = cases.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; });
      var holds = miss.every(function (c) { return !c.classList.contains("decline"); });
      ui.n.textContent = cases.length - miss.length;
      ui.say(held, holds);
      ui.stamp(cases.length - miss.length >= 4 && holds);
    }
    cases.forEach(function (c) { toggler(c, null, judge); });
    tpl.parentNode.classList.add("is-trying");
  });
  all('template[data-try="grade"]').forEach(function (tpl) {
    var ui = tryOut(tpl), meter = tpl.parentNode.querySelector(".meter");
    var names = all("#frame-02 .song-bar .pn, #frame-02 .rhythm .pn").map(function (e) { return e.textContent.split(",")[0]; });
    var segs = all("i", meter);
    if (names.length !== segs.length) return;
    meter.removeAttribute("aria-hidden");
    segs.forEach(function (g, i) {
      var pts = +g.className.replace(/\D/g, "");
      g.setAttribute("data-pts", pts);
      g.textContent = names[i];
      toggler(g, names[i] + ", " + pts, function () {
        var sum = 0;
        segs.forEach(function (x) { if (x.getAttribute("aria-pressed") !== "true") sum += +x.getAttribute("data-pts"); });
        ui.n.textContent = sum;
        meter.classList.toggle("is-under", sum < 60);
        ui.stamp(sum >= 60);
      });
    });
    meter.classList.add("is-trying");
  });

  // ---------- the strip of film at the top of the window ----------
  var sheet = document.querySelector(".tiles.entries.frames");
  var films = all("section.film");
  var shots = all(".shot");
  if (!sheet || !films.length) return;

  var reel = el("nav", "reel");
  reel.setAttribute("aria-label", "The four frames");
  var row = el("div", "wrap");
  var cells = all(".tile.entry", sheet).map(function (t) {
    var id = t.querySelector(".sys-id").textContent;
    var a = el("a", "cell");
    a.href = t.getAttribute("href");
    a.innerHTML = t.querySelector(".badge").innerHTML +
      '<span class="id"><span class="pre">' + id.replace(/\d+$/, "") + "</span>" + id.match(/\d+$/)[0] + "</span>";
    a.setAttribute("aria-label", id + ", " + t.querySelector(".what").textContent);
    a.title = t.querySelector(".what").textContent;
    row.appendChild(a);
    return a;
  });
  // the two arrows beside the cells move to the previous and the next frame
  var keys = el("span", "keys");
  var prevF = el("button", "key", "\u2190"), nextF = el("button", "key", "\u2192");
  prevF.type = nextF.type = "button";
  prevF.setAttribute("aria-label", "Previous frame");
  nextF.setAttribute("aria-label", "Next frame");
  keys.appendChild(prevF); keys.appendChild(nextF);
  row.appendChild(keys);
  reel.appendChild(row);
  document.body.appendChild(reel);

  // the line the reader is looking at: a little above the middle of what the strip leaves visible
  function probe() { return reel.offsetHeight + (window.innerHeight - reel.offsetHeight) * 0.38; }

  var ticking = false, curFrame = -1;
  function update() {
    ticking = false;
    var y = probe();
    var shown = sheet.getBoundingClientRect().bottom < reel.offsetHeight &&
      films[films.length - 1].getBoundingClientRect().bottom > reel.offsetHeight + 40;
    reel.classList.toggle("is-shown", shown);
    document.documentElement.style.setProperty("--reel", (shown ? reel.offsetHeight : 0) + "px");
    var cur = -1;
    films.forEach(function (f, i) {
      var r = f.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) cur = i;
    });
    curFrame = cur;
    prevF.disabled = cur <= 0;
    nextF.disabled = cur >= films.length - 1;
    cells.forEach(function (c, i) {
      c.classList.toggle("is-now", i === cur);
      if (i === cur) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
    });
  }
  prevF.addEventListener("click", function () { if (curFrame > 0) scrollToShot(films[curFrame - 1]); });
  nextF.addEventListener("click", function () { if (curFrame < films.length - 1) scrollToShot(films[curFrame + 1]); });
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();

  // ---------- the arrow keys: next step, then next screen ----------
  function scrollToShot(s) {
    var top = s.getBoundingClientRect().top + window.pageYOffset - reel.offsetHeight;
    window.scrollTo({ top: Math.max(0, top), behavior: calm.matches ? "auto" : "smooth" });
  }
  // at the foot of each screen, a cue naming the next one; a tap glides there
  function cue(after, next) {
    var a = el("a", "cue", icon("chevron") + "<span>Next: " + next.getAttribute("data-name") + "</span>");
    a.href = next.id ? "#" + next.id : "#" + (next.closest("section") || next).id;
    a.addEventListener("click", function (e) { e.preventDefault(); scrollToShot(next); });
    after.appendChild(a);
  }
  var heroCue = el("div", "cue-row");
  sheet.parentNode.insertBefore(heroCue, sheet.nextSibling);
  cue(heroCue, shots[0]);
  shots.forEach(function (s, i) { if (shots[i + 1]) cue(s, shots[i + 1]); });

  function currentShot() {
    var y = probe();
    if (shots[0].getBoundingClientRect().top > y) return -1;
    for (var i = 0; i < shots.length; i++) {
      var r = shots[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return i;
    }
    return shots.length;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector("nav.top .shelf.is-open")) return;
    var fwd = e.key === "ArrowRight";
    var i = currentShot();
    var shot = shots[i];
    var box = shot && shot.querySelector("[data-stepper].is-stepping");
    e.preventDefault();
    if (box) {
      var st = box.stepper, k = st.at();
      if (fwd ? k < st.last : k > st.first) {
        st.go(fwd ? k + 1 : k - 1);
        if (!st.still) st.keep();
        return;
      }
    }
    var j = fwd ? i + 1 : i - 1;
    if (j >= shots.length) return;
    if (j < 0) { window.scrollTo({ top: 0, behavior: calm.matches ? "auto" : "smooth" }); return; }
    scrollToShot(shots[j]);
  });
})();
