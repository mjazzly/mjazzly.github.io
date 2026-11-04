/* mjazzly.github.io, the Frames page. Plain JavaScript, no libraries.

   Each framework's drawing is stepped through one part at a time. The words
   for every step are in the page: this shows one, lights its part in the
   drawing (the parts before it read as done), and adds Back and Next under
   it. A tap on any part goes straight to its step, and brings its words
   into view if they sit below the screen. Anything in the same
   section carrying data-on="1 3" lights while step 1 or 3 is showing (the
   four sources on FRAME-04). Nothing moves on its own. Without JavaScript
   every step shows as a list, and each part is a link to its words. */

(function () {
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

  Array.prototype.forEach.call(document.querySelectorAll("[data-stepper]"), function (box) {
    var parts = Array.prototype.slice.call(box.querySelectorAll(".part[data-step]"));
    var says = Array.prototype.slice.call(box.querySelectorAll(".say[data-step]"));
    var section = box.closest("section") || document;
    var lit = Array.prototype.slice.call(section.querySelectorAll("[data-on]"));
    var list = box.querySelector(".says");
    var n = says.length, now = 1;
    if (!n || !list) return;

    var bar = el("div", "steps");
    bar.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) bar.appendChild(el("span"));
    var marks = Array.prototype.slice.call(bar.children);
    list.parentNode.insertBefore(bar, list);

    var actions = el("div", "actions");
    var back = button("Back", "back"), next = button("Next", "next");
    var count = el("span", "count");
    count.setAttribute("aria-live", "polite");
    actions.appendChild(back); actions.appendChild(next); actions.appendChild(count);
    list.parentNode.insertBefore(actions, list.nextSibling);

    function go(k) {
      now = k;
      says.forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== k; });
      parts.forEach(function (p) {
        var s = +p.getAttribute("data-step");
        p.classList.toggle("is-now", s === k);
        p.classList.toggle("is-done", s < k);
        if (s === k) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
      });
      marks.forEach(function (m, j) { m.className = j + 1 < k ? "done" : j + 1 === k ? "now" : ""; });
      lit.forEach(function (t) {
        t.classList.toggle("is-on", t.getAttribute("data-on").split(" ").indexOf(String(k)) > -1);
      });
      count.textContent = "Step " + k + " of " + n;
      back.disabled = k === 1;
      next.querySelector(".case-toggle-label").textContent = k === n ? "From the start" : "Next";
    }

    // A tap on a part shows its words; on a phone the words can sit below the screen, so they are brought just into view
    parts.forEach(function (p) {
      p.addEventListener("click", function (e) {
        e.preventDefault();
        go(+p.getAttribute("data-step"));
        var r = actions.getBoundingClientRect();
        if (r.bottom > window.innerHeight) actions.scrollIntoView({ block: "end", behavior: "smooth" });
      });
    });
    back.addEventListener("click", function () { if (now > 1) go(now - 1); });
    next.addEventListener("click", function () { go(now === n ? 1 : now + 1); });
    box.classList.add("is-stepping");
    go(1);
  });
})();
