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
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measure); }
  measure(); window.addEventListener("resize", measure);
})();

(function () {
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ROUND = 3000;  // how long one play of a drawing takes, in milliseconds

  var figures = Array.prototype.slice.call(document.querySelectorAll(".figure"));
  var stairs = document.querySelector(".stairs");

  // Plays a drawing once; a request while it is still playing is ignored, so it never stutters or repeats
  function play(fig) {
    var now = Date.now();
    if (fig.startedAt && now - fig.startedAt < ROUND) return;
    fig.startedAt = now;
    fig.classList.remove("is-playing");
    void fig.offsetWidth; // lets the browser notice the switch was off
    fig.classList.add("is-playing");
  }

  if (calm.matches || !("IntersectionObserver" in window)) {
    if (stairs) stairs.classList.add("is-in");
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
    var card = fig.closest(".model, .case, .deep, .panel");
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
    svg.addEventListener("mouseleave", clear);
  });

  // The fold: each case opens on its button; without JavaScript every case stays open
  Array.prototype.forEach.call(document.querySelectorAll(".case"), function (card) {
    var button = card.querySelector(".case-toggle");
    var body = card.querySelector(".case-body");
    if (!button || !body) return;
    function setOpen(open) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.querySelector(".case-toggle-label").textContent = open ? "Close" : "Read the case";
      body.hidden = !open;
    }
    button.hidden = false;
    setOpen(false);
    button.addEventListener("click", function () {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });
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
