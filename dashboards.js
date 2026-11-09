/* Dashboards (dashboards.html): a dashboard read one part at a time, then live on request.

   The guided read follows Deconstruct's pattern. It opens with the dashboard's question, one line and
   one button (Show me). Each step lights one part of the report's picture in place (the rest steps
   back) and shows the question that part answers, the decision it feeds and one line read from the
   numbers; then Next, with a small Back link. After the last part: the amber mark in plain words,
   and Start again. There is no step counter and no arrow-key binding.

   Every word and number comes from the page: scripts/dashboards.py writes the steps as a plain list
   (ol.db-steps, each li carrying the part's position on the report page in data-box, read from the
   report's own files). This script only turns that list into the stepper. On a phone each step shows
   its part cut from the picture at full width, and the question card sits at the foot of the screen.

   The live report loads only when the reader asks (Load it live on this page, wide screens only):
   until then the page makes no request to Power BI.
   Reduced motion: nothing glides or swells; every change is shown at once. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function guided(stage) {
    var ol = stage.querySelector(".db-steps"), pic = stage.querySelector(".db-pic"), rule = stage.querySelector(".db-rule");
    if (!ol || !pic) return;
    var W = +stage.getAttribute("data-w"), H = +stage.getAttribute("data-h"), d = ol.dataset;
    var steps = Array.prototype.map.call(ol.children, function (li) {
      var feeds = li.querySelector(".db-feeds").cloneNode(true), b = feeds.querySelector("b");
      if (b) b.remove();
      return { box: li.getAttribute("data-box").split(" ").map(Number), part: li.querySelector(".db-part").textContent,
               q: li.querySelector("h3").textContent, feeds: feeds.textContent.trim(), say: li.querySelector(".db-say").textContent };
    });
    var n = steps.length, q = 0, taken = false;

    // the scene: the picture with its lens on the left, the words cell on the right (under it on a phone)
    var scene = el("div", "db-scene"), draw = scene.appendChild(el("div", "db-draw"));
    stage.insertBefore(scene, pic);
    draw.appendChild(pic);
    pic.style.setProperty("--W", W); pic.style.setProperty("--H", H);
    var lens = pic.appendChild(el("span", "db-lens"));
    lens.setAttribute("aria-hidden", "true");
    // on a phone the lit part is cut from the picture at a readable size, scrolling sideways when wider than the screen
    var cut = pic.appendChild(el("div", "db-cut")), cutImg = cut.appendChild(pic.querySelector("img").cloneNode());
    cut.setAttribute("aria-hidden", "true"); cutImg.alt = "";
    var phone = window.matchMedia("(max-width: 860px)");
    function sizeCut(st) {
      if (!st) return;
      var b = st.box, s = Math.max(draw.clientWidth / b[2], 0.6);
      cut.style.width = Math.round(b[2] * s) + "px"; cut.style.height = Math.round(b[3] * s) + "px";
      cutImg.style.width = Math.round(W * s) + "px";
      cutImg.style.left = -Math.round(b[0] * s) + "px"; cutImg.style.top = -Math.round(b[1] * s) + "px";
    }
    // Each Next, Back and Start again keeps the lit part in view (the whole picture when nothing is lit),
    // scrolling only as far as it must: a small gap under the top of the window, and on a phone the room
    // above the question card at the foot of the screen. A part taller than the room shows its top.
    // A part already in view never moves the page. Reduced motion jumps instead of gliding.
    var GAP = 16;
    function keep(st) {
      var top, bottom;
      if (phone.matches) {
        var r = (st ? cut : pic).getBoundingClientRect(); top = r.top; bottom = r.bottom;
      } else {
        var p = pic.getBoundingClientRect(), b = st ? st.box : [0, 0, W, H];
        top = p.top + b[1] / H * p.height; bottom = top + b[3] / H * p.height;
      }
      var room = window.innerHeight - (phone.matches ? g.offsetHeight : 0) - GAP, by = 0;
      if (top >= GAP && bottom <= room) return;
      if (bottom - top > room - GAP || top < GAP) by = top - GAP;
      else by = bottom - room;
      window.scrollBy({ top: by, behavior: reduce ? "auto" : "smooth" });
    }
    var g = scene.appendChild(el("div", "db-guide"));
    var tag = g.appendChild(el("p", "db-tag")), hq = g.appendChild(el("h3", "db-q")), line = g.appendChild(el("p", "db-line"));
    var ans = g.appendChild(el("p", "db-answer")), act = g.appendChild(el("div", "db-act"));
    var go = act.appendChild(el("button", "db-go")), back = act.appendChild(el("button", "db-backlink", d.back));
    go.type = back.type = "button";
    var say = g.appendChild(el("p", "visually-hidden")); say.setAttribute("aria-live", "polite");
    ol.hidden = true; if (rule) rule.hidden = true;
    stage.classList.add("is-guided");

    function render() {
      var st = q >= 1 && q <= n ? steps[q - 1] : null;
      if (st) {
        ["bx", "by", "bw", "bh"].forEach(function (k, i) { pic.style.setProperty("--" + k, st.box[i]); });
        tag.textContent = st.part; hq.textContent = st.q;
        line.textContent = ""; line.appendChild(el("b", null, "It feeds: ")); line.appendChild(document.createTextNode(st.feeds));
        ans.textContent = st.say; go.textContent = d.next;
      } else if (q === 0) {
        tag.textContent = ""; hq.textContent = d.q; line.textContent = d.line; ans.textContent = ""; go.textContent = d.go;
      } else {
        tag.textContent = ""; hq.textContent = d.freeQ; line.textContent = d.freeLine; ans.textContent = ""; go.textContent = d.again;
      }
      sizeCut(st);
      pic.classList.toggle("is-lit", !!st);
      pic.scrollLeft = 0;
      tag.hidden = !st; back.hidden = q === 0 || q > n;
      say.textContent = "";
      setTimeout(function () { say.textContent = [tag.textContent, hq.textContent, line.textContent, ans.textContent].join(" ").trim(); }, 30);
    }
    function lit() { return q >= 1 && q <= n ? steps[q - 1] : null; }
    go.addEventListener("click", function () { taken = true; q = q > n ? 0 : q + 1; render(); go.focus({ preventScroll: true }); keep(lit()); });
    back.addEventListener("click", function () { taken = true; q = Math.max(0, q - 1); render(); (q === 0 ? go : back).focus({ preventScroll: true }); keep(lit()); });
    window.addEventListener("resize", function () { sizeCut(q >= 1 && q <= n ? steps[q - 1] : null); });
    render();

    // Show me swells once, the first time the picture is mostly on screen
    if (!reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (taken || e.intersectionRect.height < 0.6 * Math.min(e.boundingClientRect.height, window.innerHeight)) return;
          io.disconnect(); go.classList.add("pulse");
        });
      }, { threshold: [0, .2, .4, .6, .8, 1] });
      io.observe(draw);
    }
    // while the card sits at the foot of a phone screen, the back-to-top button steps aside
    if ("IntersectionObserver" in window) {
      var foot = new IntersectionObserver(function (es) {
        es.forEach(function (e) { document.documentElement.classList.toggle("db-asking", e.isIntersecting); });
      }, { rootMargin: "-92% 0px 0px 0px" });
      foot.observe(g);
    }
  }

  // the live report, only when the reader asks for it
  function live(box) {
    var btn = box.querySelector(".db-load"), frame = box.querySelector(".db-frame"), link = box.querySelector("a[href^='https://app.powerbi.com/']");
    if (!btn || !frame || !link) return;
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = link.href; f.title = "Branch review, the live report"; f.setAttribute("allowfullscreen", "");
      frame.appendChild(f); frame.hidden = false; btn.hidden = true;
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll(".db-stage"), guided);
  Array.prototype.forEach.call(document.querySelectorAll(".db-live"), live);
})();
