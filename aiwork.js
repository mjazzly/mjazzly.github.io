/* AI Work's own script, loaded after site.js on aiwork.html only.
   WORK-10, "What the drafter was shown": one route at a time, chosen from the four buttons or
   stepped with Next and Back. Every count in it is written into the page by scripts/work10.py;
   this file holds no words a reader sees beyond the button labels already in the page.
   Without it every route shows, one under the other, each under its own name. */
(function () {
  document.querySelectorAll("[data-dv]").forEach(function (fig) {
    var steps = fig.querySelectorAll(".dv-step"), picks = fig.querySelectorAll(".dv-pick"),
        next = fig.querySelector(".dv-next"), back = fig.querySelector(".dv-back"), i = 0;
    if (!steps.length || !next || !back) return;
    fig.querySelectorAll(".dv-picks, .dv-ctl, .dv-js").forEach(function (el) { el.hidden = false; });
    fig.classList.add("is-stepped");
    function go(n, focus) {
      i = (n + steps.length) % steps.length;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      picks.forEach(function (p, k) { p.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      back.hidden = i === 0;
      next.textContent = i === steps.length - 1 ? "Start again" : "Next";
      if (focus) focus.focus();
    }
    picks.forEach(function (p, k) { p.addEventListener("click", function () { go(k); }); });
    next.addEventListener("click", function () { go(i + 1); });
    back.addEventListener("click", function () { go(i - 1, i - 1 === 0 ? next : null); });
    go(0);
  });
})();
