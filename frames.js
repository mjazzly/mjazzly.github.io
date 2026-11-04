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
   parts before it read as done), and adds Back and Next under the drawing.
   A tap on a part goes straight to its step. Anything in the same section
   carrying data-on="1 3" lights while step 1 or 3 is showing (the four
   sources and their risers on FRAME-04). The departures board on FRAME-01
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
    var n = parts.length, now = first;
    if (!n) return;

    var head = map.querySelector(".head");
    var arc = map.querySelector(".arc");
    var dial = box.querySelector(".dial .fill");

    var controls = el("div", "controls");
    var back = button("Back", "back"), next = button("Next", "next");
    var count = el("span", "count");
    count.setAttribute("aria-live", "polite");
    controls.appendChild(back); controls.appendChild(next); controls.appendChild(count);
    if (list) list.parentNode.insertBefore(controls, list);
    else box.appendChild(controls);

    // the play head on FRAME-02 sits at the end of the part being played; the rhythm runs the whole length
    function placeHead() {
      if (!head) return;
      var cur = parts.filter(function (p) { return +p.getAttribute("data-step") === now; })[0];
      var m = map.getBoundingClientRect();
      var x = cur.classList.contains("rhythm") ? m.width - 16 : cur.getBoundingClientRect().right - m.left + 1.5;
      map.style.setProperty("--head", x + "px");
    }

    function go(k) {
      now = k;
      map.setAttribute("data-at", k);
      says.forEach(function (s) {
        var j = +s.getAttribute("data-step");
        if (board) {
          s.classList.toggle("is-now", j === k);
          s.classList.toggle("is-done", j < k);
          s.classList.toggle("is-later", j > k);
        } else {
          s.hidden = j !== k;
        }
      });
      parts.forEach(function (p) {
        var j = +p.getAttribute("data-step");
        p.classList.toggle("is-now", j === k);
        p.classList.toggle("is-done", j < k);
        if (j === k) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
      });
      lit.forEach(function (t) {
        t.classList.toggle("is-on", t.getAttribute("data-on").split(" ").indexOf(String(k)) > -1);
      });
      if (arc) arc.style.strokeDashoffset = 6 - (k - 1);
      if (dial) dial.style.strokeDashoffset = 4 - k;
      placeHead();
      count.textContent = k ? "Step " + k + " of " + n : "";
      back.disabled = k === first;
      next.querySelector(".case-toggle-label").textContent = k === n ? "From the start" : "Next";
    }

    // A tap on a part shows its words; on a phone the words can sit below the screen, so they are brought just into view
    parts.forEach(function (p) {
      p.addEventListener("click", function (e) {
        e.preventDefault();
        go(+p.getAttribute("data-step"));
        var say = says.filter(function (s) { return !s.hidden && +s.getAttribute("data-step") === now; })[0];
        if (say && say.getBoundingClientRect().bottom > window.innerHeight) {
          say.scrollIntoView({ block: "nearest", behavior: calm.matches ? "auto" : "smooth" });
        }
      });
    });
    back.addEventListener("click", function () { if (now > first) go(now - 1); });
    next.addEventListener("click", function () { go(now === n ? first : now + 1); });
    window.addEventListener("resize", placeHead);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeHead);

    box.stepper = {
      go: go,
      at: function () { return now; },
      first: first,
      last: n,
      controls: controls
    };
    box.classList.add("is-stepping");
    go(first);
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
  var keys = el("span", "keys", "<kbd>←</kbd><kbd>→</kbd>");
  keys.setAttribute("aria-hidden", "true");
  row.appendChild(keys);
  reel.appendChild(row);
  document.body.appendChild(reel);

  function stripH() { return reel.classList.contains("is-shown") ? reel.offsetHeight : 0; }
  // the line the reader is looking at: a little above the middle of what the strip leaves visible
  function probe() { return reel.offsetHeight + (window.innerHeight - reel.offsetHeight) * 0.38; }

  var ticking = false;
  function update() {
    ticking = false;
    var y = probe();
    var shown = sheet.getBoundingClientRect().bottom < reel.offsetHeight &&
      films[films.length - 1].getBoundingClientRect().bottom > reel.offsetHeight + 40;
    reel.classList.toggle("is-shown", shown);
    var cur = -1;
    films.forEach(function (f, i) {
      var r = f.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) cur = i;
    });
    cells.forEach(function (c, i) {
      c.classList.toggle("is-now", i === cur);
      if (i === cur) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
    });
  }
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
  function currentShot() {
    var y = probe();
    if (shots[0].getBoundingClientRect().top > y) return -1;
    for (var i = 0; i < shots.length; i++) {
      var r = shots[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return i;
    }
    return shots.length;
  }
  // a step taken with the keys while its drawing is off screen brings the screen in first
  function inView(box) {
    var m = (box.querySelector(".map") || box).getBoundingClientRect();
    var c = box.stepper.controls.getBoundingClientRect();
    return m.top >= stripH() - 4 && c.bottom <= window.innerHeight + 4;
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
        if (!inView(box)) scrollToShot(shot);
        return;
      }
    }
    var j = fwd ? i + 1 : i - 1;
    if (j >= shots.length) return;
    if (j < 0) { window.scrollTo({ top: 0, behavior: calm.matches ? "auto" : "smooth" }); return; }
    scrollToShot(shots[j]);
  });
})();
