/* mjazzly.github.io, the Clarity page. Plain JavaScript, no libraries.

   Two exercises. Each shows a request, asks the reader to decide, and then
   shows the reasoning. Nothing is scored against the reader; the count at
   the end says how many were placed on the first try, so the tells can be
   seen. Every word of the exercises lives in this file.

   CLARITY-01  From a request to a workflow: five decisions, one request at
               a time, the chosen structure drawn at the end.
   CLARITY-02  Which container the work belongs in: a request, seven
               containers, a reveal, a count at the end. */

(function () {
  "use strict";

  /* ---------- CLARITY-01: from a request to a workflow ---------- */

  var STEPS = [
    { key: "ask",    name: "The ask",    icon: "message",      q: "what is actually being asked?" },
    { key: "source", name: "The source", icon: "database",     q: "where does the answer come from?" },
    { key: "output", name: "The output", icon: "file",         q: "what should come back?" },
    { key: "stop",   name: "The stop",   icon: "stop",         q: "where do you stop and ask a person?" },
    { key: "check",  name: "The check",  icon: "circle-check", q: "how do you know it is right before it goes out?" }
  ];

  var REQUESTS = [
    {
      from: "From the head of sales, Monday morning",
      text: "Can you look at the pipeline numbers before Thursday?",
      steps: [
        { opts: [
            { t: "Produce a full pipeline report with every metric in it.",
              why: "Too wide. <b>Look at</b> did not ask for a report. A report nobody asked for costs a day and answers a question nobody put." },
            { t: "Find what changed in the pipeline since the last review, and say whether anything needs a decision before Thursday.", sound: true,
              why: "<b>Thursday is the tell</b>: there is a meeting. The reader wants to walk in knowing what moved and whether it matters." },
            { t: "Ask what they mean before doing anything.",
              why: "A fair instinct at the wrong moment. One reading fits the facts (a date, a person who owns the pipeline). <b>State the reading, start, and confirm it at handover.</b> Save the question for a request where two readings fit equally." }
          ], flow: "What changed since the last review, and what Thursday needs" },
        { opts: [
            { t: "The CRM export for this quarter and the one from the last review, each named by file and date.", sound: true,
              why: "<b>Two dated snapshots</b> are the smallest source that can show a change. Name them so the reader can open the same files." },
            { t: "What the assistant already knows about sales pipelines.",
              why: "Nothing it knows is <b>this</b> pipeline. An answer from general knowledge reads well and is wrong." },
            { t: "A screenshot of the pipeline dashboard.",
              why: "A picture of a number is a number nobody can recount. <b>Use the table behind the picture.</b>" }
          ], flow: "Two dated CRM exports, named by file" },
        { opts: [
            { t: "A new dashboard.",
              why: "Nobody asked for one, and a dashboard built before Thursday is a build with no time to test it." },
            { t: "A long written analysis of the pipeline.",
              why: "A reader with a meeting on Thursday will not read it. <b>Length is not the same as care.</b>" },
            { t: "Five lines: what moved, by how much, from which file, and the one decision Thursday needs, if any.", sound: true,
              why: "A reader with a meeting wants <b>a page they can read in a minute and defend if asked</b>. Every number carries its source so it can be checked." }
          ], flow: "Five lines, each number with its file" },
        { opts: [
            { t: "Nowhere. Deliver the result and let them react.",
              why: "The reader's own definitions are not yours to guess. A number can be right and still be <b>the wrong number</b>." },
            { t: "When two stages in the CRM could both be called the pipeline, stop and ask which one the reader counts.", sound: true,
              why: "<b>A definition is the reader's to give.</b> One short question now saves a correction in the meeting." },
            { t: "At every step, to be safe.",
              why: "Five questions for a five-line answer and the reader does the work twice. <b>Stop where a guess would change the number</b>, and nowhere else." }
          ], flow: "Which stages count as pipeline", stop: true },
        { opts: [
            { t: "Ask the assistant whether it is sure.",
              why: "An assistant asked whether it is sure says yes. <b>The check has to come from outside the answer.</b>" },
            { t: "Read it once. If it looks right, it is right.",
              why: "The errors that reach a meeting are the ones that looked right. A wrong filter produces a tidy number." },
            { t: "Recount one number by hand from the export, and match the totals to the dashboard the reader already trusts.", sound: true,
              why: "<b>One recount catches a wrong join; one reconciliation catches a wrong filter.</b> Both take minutes." }
          ], flow: "One recount by hand, totals matched to the dashboard" }
      ]
    },
    {
      from: "From a programme lead, after a week of calls",
      text: "Pull together what was agreed in last week's calls.",
      steps: [
        { opts: [
            { t: "Write minutes for each call.",
              why: "Minutes record everything that was said. <b>Agreed is the tell</b>: the reader wants the commitments, and only those." },
            { t: "Summarise every call in a paragraph.",
              why: "A summary is read once and forgotten. The reader will have to go back and find who owes what." },
            { t: "A list of what was agreed: who does what, by when, from which call.", sound: true,
              why: "<b>Who, what, by when, from where.</b> That is what the reader will chase next week, so that is the shape of the ask." }
          ], flow: "Who does what, by when, from which call" },
        { opts: [
            { t: "The transcripts or recordings of last week's calls, each with its date.", sound: true,
              why: "The words that were actually said, with the date, so <b>by Friday</b> can be turned into a real date." },
            { t: "Memory of who was on each call.",
              why: "Memory keeps the mood of a call and drops the dates. <b>A commitment without its words is a guess.</b>" },
            { t: "The calendar invites for the week.",
              why: "An invite says who was asked to come. It never says what was agreed." }
          ], flow: "Last week's transcripts, each with its date" },
        { opts: [
            { t: "A table: action, owner, due date, the call it came from. A cell left blank where the call named nothing.", sound: true,
              why: "A table can be sorted by owner and by date. <b>A blank cell is honest</b>; a filled one the call never supported is not." },
            { t: "One paragraph per call.",
              why: "The reader has to read all of it to find one action. <b>The shape should match the chase</b>, and the chase is by person and by date." },
            { t: "An email to every owner.",
              why: "Sending comes after the list is right. An email built on a wrong owner is a correction sent to the whole team." }
          ], flow: "A table: action, owner, due date, source call" },
        { opts: [
            { t: "Before every row is added.",
              why: "Fifty rows, fifty questions, and the reader stops answering. <b>Stop where a guess would land on the wrong person.</b>" },
            { t: "When a call names a person in one sentence and the action in another, stop rather than pairing them.", sound: true,
              why: "<b>Pairing a name with an action the call never gave them</b> puts a task on the wrong desk. Leave the owner blank or ask." },
            { t: "Nowhere. A table with every cell filled looks finished.",
              why: "It looks finished and sends two people chasing work that was never theirs." }
          ], flow: "Owner named in a different sentence from the action", stop: true },
        { opts: [
            { t: "Count the rows. Fifty actions from eight calls sounds about right.",
              why: "A plausible count proves nothing. <b>The check is against the source</b>, never against a feeling." },
            { t: "Open one call and find each of its actions in the table, then find each of its rows back in the call.", sound: true,
              why: "<b>Both directions.</b> Call to table catches what was missed; table to call catches what was invented." },
            { t: "Ask the owners whether the list is right.",
              why: "That is the reader's job after handover, with a list already checked. Sending an unchecked list asks them to do your check." }
          ], flow: "One call checked both ways against the table" }
      ]
    },
    {
      from: "From a director, in the corridor",
      text: "Someone senior asked what our customer churn was last quarter. Can you get me a number?",
      steps: [
        { opts: [
            { t: "Explain how churn is calculated and why it varies.",
              why: "A lesson is not a number. <b>The reader has to answer a question from above</b>, and the question was a number." },
            { t: "One number for last quarter, with the definition it was counted by, that the reader can quote.", sound: true,
              why: "<b>A number that can be quoted</b> carries its definition with it, so the next question (counted how?) is already answered." },
            { t: "Pull every retention metric for the year.",
              why: "Every metric is a page of choices handed back to the reader. They asked for one." }
          ], flow: "One quotable number with its definition" },
        { opts: [
            { t: "The last deck that mentioned churn.",
              why: "A number copied from a deck inherits every mistake that deck made, and <b>nobody can say how it was counted</b>." },
            { t: "An industry benchmark.",
              why: "A benchmark is someone else's customers. <b>The question was about ours.</b>" },
            { t: "The customer table with start and end dates, and the written definition of churn, if the business has one.", sound: true,
              why: "<b>The table is the only source that can be recounted.</b> The written definition, if it exists, decides who counts as gone." }
          ], flow: "The customer table and the written definition" },
        { opts: [
            { t: "The number, the definition in one sentence (who counts as a customer, what counts as leaving, which quarter), and the counts it was made from.", sound: true,
              why: "<b>Number, definition, counts.</b> Three lines the reader can repeat in a meeting and defend if challenged." },
            { t: "A chart of churn by month for the last two years.",
              why: "A chart is an invitation to more questions. The reader needs to close one." },
            { t: "A note on the method, with the number at the end.",
              why: "The number goes first. <b>A reader who has to hunt for it will quote the wrong line.</b>" }
          ], flow: "Number, one-sentence definition, the counts behind it" },
        { opts: [
            { t: "Nowhere. Pick the most common definition and go.",
              why: "A number quoted to someone senior with the wrong definition is <b>remembered longer than its correction</b>." },
            { t: "At every step, since this is going to someone senior.",
              why: "Seniority changes the cost of a wrong number. It does not change where the guess is. <b>There is one guess here</b>, and it is the definition." },
            { t: "If no written definition exists, stop and have the reader choose one before any number goes out.", sound: true,
              why: "<b>The definition is the reader's call</b>, because they will be the one asked how it was counted." }
          ], flow: "Which definition of churn, if none is written", stop: true },
        { opts: [
            { t: "Count the customers at the start of the quarter and the leavers by hand from the table, and make sure the two produce the number.", sound: true,
              why: "<b>Two counts from the table reproduce the number</b> or they do not. Either way you know before the reader does." },
            { t: "Compare it with last quarter. If it is close, it is right.",
              why: "Close to last quarter proves only that the same mistake was made twice." },
            { t: "It matches what you expected.",
              why: "Expectation is the weakest check there is. <b>The number has to be rebuilt from the source</b>, by hand, once." }
          ], flow: "Starting customers and leavers counted by hand" }
      ]
    }
  ];

  /* ---------- CLARITY-02: which container ---------- */

  var BUCKETS = [
    { key: "prompt",  name: "One-off prompt", icon: "message",
      needs: "a request that is asked once and read once" },
    { key: "saved",   name: "Saved prompt",   icon: "bookmark",
      needs: "the same request coming back, with you there to read each answer" },
    { key: "project", name: "Project",        icon: "folder",
      needs: "one body of material that stays, with the questions changing" },
    { key: "skill",   name: "Skill",          icon: "puzzle",
      needs: "a method with steps and rules, applied the same way every time, by anyone" },
    { key: "script",  name: "Script",         icon: "code",
      needs: "a fixed rule that has to run without anyone reading each result" },
    { key: "app",     name: "App",            icon: "users",
      needs: "other people using it on their own, with their own inputs" },
    { key: "harness", name: "Test harness",   icon: "flask",
      needs: "a build or a prompt that has to be shown to still work after a change" }
  ];

  var CASES = [
    { text: "Rewrite this paragraph so it reads better.",
      sound: "prompt",
      tell: "<b>Once, read once.</b> There is no next week and no second paragraph. The shortest container fits.",
      close: "saved", closeWhy: "A saved prompt earns its keep when the request comes back. Nothing here says it will." },
    { text: "Every Monday I turn the week's support tickets into a short summary for my lead.",
      sound: "saved",
      tell: "<b>Every Monday</b>, with a new week of tickets each time, and you read the summary before it goes. The ask repeats; the material changes; a person is still in the loop.",
      close: "script", closeWhy: "A script runs without you, and this summary goes to your lead with your name on it. You read it first, so you are still in the loop." },
    { text: "I have a sixty-page contract and I will have questions about it all month.",
      sound: "project",
      tell: "<b>The material stays and the questions change.</b> Load the contract once and ask against it all month.",
      close: "prompt", closeWhy: "A one-off prompt means pasting sixty pages every time you have a question. The contract is the constant; put it where it stays." },
    { text: "Our team writes status updates six different ways. I want one method everyone follows.",
      sound: "skill",
      tell: "<b>One method, the same way every time, by anyone on the team.</b> A skill holds the steps and the rules, and whoever runs it gets the same shape.",
      close: "saved", closeWhy: "A saved prompt is one person's shortcut. The request is for a method the whole team follows, with rules written down, which is a skill." },
    { text: "Rename four hundred files from the export to match our naming pattern.",
      sound: "script",
      tell: "<b>A fixed rule, four hundred times, with nobody reading each result.</b> Code does this exactly; an assistant does it well three hundred and ninety times.",
      close: "prompt", closeWhy: "A prompt can describe the rule, but four hundred renames need to be exact and unread. That is a script's job." },
    { text: "Branch managers should be able to check their own numbers without asking me.",
      sound: "app",
      tell: "<b>Other people, on their own, with their own inputs.</b> Nobody is pasting a prompt for them; they open it and use it.",
      close: "project", closeWhy: "A project is yours to ask questions in. Managers who did not build it need a front door of their own, which is an app." },
    { text: "I changed the instructions for the summariser. Did it get worse?",
      sound: "harness",
      tell: "<b>Still works, after a change.</b> The same test cases run before and after, and the result is a count, so the answer is known rather than felt.",
      close: "prompt", closeWhy: "Asking the assistant whether it got worse gets an opinion. A harness runs the cases and gives a count." },
    { text: "Help me think through whether to take this role.",
      sound: "prompt",
      tell: "<b>A conversation, once.</b> The value is in the back and forth, and nothing from it needs to run again.",
      close: "project", closeWhy: "A project holds material you will keep asking against. One decision, thought through once, does not need a home." },
    { text: "Each new client's onboarding checklist has to be built from their contract the same way, with the same checks, whoever on the team does it.",
      sound: "skill",
      tell: "<b>The same way, the same checks, whoever does it.</b> The steps are the point, and they travel with the skill to the next person.",
      close: "saved", closeWhy: "A saved prompt lives with one person. The request says whoever on the team does it, so the method has to be packaged to travel." },
    { text: "Pull yesterday's orders every morning at six and put the totals into the shared sheet.",
      sound: "script",
      tell: "<b>Every morning at six, without anyone awake to read it.</b> A fixed pull, a fixed sum, a fixed destination: a script on a schedule.",
      close: "saved", closeWhy: "A saved prompt still needs someone to run it at six. The request wants it done with nobody there." }
  ];

  /* ---------- shared bits ---------- */

  function icon(name, cls) {
    return '<svg class="' + (cls || "ic") + '" aria-hidden="true"><use href="#ic-' + name + '"/></svg>';
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function button(label, cls) {
    var b = el("button", cls || "case-toggle");
    b.type = "button";
    b.innerHTML = '<span class="case-toggle-label">' + label + "</span>" + icon("chevron");
    return b;
  }
  function progress(n, done, now) {
    var p = el("div", "steps");
    p.setAttribute("aria-hidden", "true");
    for (var i = 0; i < n; i++) {
      var s = el("span");
      if (i < done) s.className = "done";
      else if (i === now) s.className = "now";
      p.appendChild(s);
    }
    return p;
  }
  function scrollTo(node) {
    var r = node.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) node.scrollIntoView({ block: "nearest" });
  }

  /* ---------- CLARITY-01 ---------- */

  var ex1 = document.getElementById("ex-01-stage");
  if (ex1) (function () {
    var r = 0, s = 0, picks = [];
    var stage = ex1;

    function renderStep() {
      var req = REQUESTS[r], step = STEPS[s], data = req.steps[s];
      stage.innerHTML = "";
      stage.appendChild(el("div", "count", "Request " + (r + 1) + " of " + REQUESTS.length + " · Decision " + (s + 1) + " of " + STEPS.length));
      stage.appendChild(el("div", "request", icon("message", "ic req-ic") + '<div><span class="from">' + req.from + "</span>" + req.text + "</div>"));
      stage.appendChild(progress(STEPS.length, s, s));
      stage.appendChild(el("h3", "q", '<span class="badge badge-s">' + icon(step.icon) + "</span>" + step.name + ": " + step.q));
      var list = el("ul", "options");
      data.opts.forEach(function (o, i) {
        var li = el("li");
        var b = el("button", "opt", o.t); b.type = "button";
        b.addEventListener("click", function () { choose(i); });
        li.appendChild(b); list.appendChild(li);
      });
      stage.appendChild(list);
      var reveal = el("div", "reveal"); reveal.hidden = true; reveal.setAttribute("aria-live", "polite");
      stage.appendChild(reveal);
      var actions = el("div", "actions"); actions.hidden = true;
      stage.appendChild(actions);
    }

    function choose(i) {
      var data = REQUESTS[r].steps[s], picked = data.opts[i], soundIdx = -1;
      data.opts.forEach(function (o, k) { if (o.sound) soundIdx = k; });
      var buttons = stage.querySelectorAll(".opt");
      Array.prototype.forEach.call(buttons, function (b, k) {
        b.disabled = true;
        if (k === i) b.classList.add("picked");
        if (k === soundIdx) b.classList.add("sound");
      });
      var reveal = stage.querySelector(".reveal");
      if (picked.sound) {
        reveal.innerHTML = '<span class="lab">Sound choice</span><p>' + picked.why + "</p>";
      } else {
        reveal.innerHTML = '<span class="lab">A closer look</span><p>' + picked.why + '</p><p class="then"><b>The sound choice:</b> ' + data.opts[soundIdx].t + " " + data.opts[soundIdx].why + "</p>";
      }
      reveal.hidden = false;
      picks.push({ step: STEPS[s], flow: data.flow, stop: !!data.stop, sound: picked.sound });
      var actions = stage.querySelector(".actions");
      var next = button(s + 1 < STEPS.length ? "Next decision" : "See the workflow");
      next.addEventListener("click", function () {
        if (s + 1 < STEPS.length) { s += 1; renderStep(); scrollTo(stage); }
        else renderFlow();
      });
      actions.appendChild(next);
      actions.hidden = false;
      scrollTo(reveal);
    }

    function renderFlow() {
      var req = REQUESTS[r];
      stage.innerHTML = "";
      stage.appendChild(el("div", "count", "Request " + (r + 1) + " of " + REQUESTS.length + " · The workflow"));
      stage.appendChild(el("div", "request", icon("message", "ic req-ic") + '<div><span class="from">' + req.from + "</span>" + req.text + "</div>"));
      stage.appendChild(progress(STEPS.length, STEPS.length, -1));
      stage.appendChild(el("p", "flow-lead", "<b>Five decisions, one structure</b>, drawn from the sound choices. The amber box is the stop point, the one place a person is asked before the work goes on. The rest runs without a question."));
      var flow = el("ol", "flow");
      picks.forEach(function (p) {
        var li = el("li", "fstep" + (p.stop ? " stop" : ""));
        li.innerHTML = '<span class="fl">' + icon(p.stop ? "stop" : p.step.icon) + p.step.name + "</span>" + p.flow;
        flow.appendChild(li);
      });
      stage.appendChild(flow);
      var hit = picks.filter(function (p) { return p.sound; }).length;
      stage.appendChild(el("p", "tally-line", "<b>" + hit + " of " + STEPS.length + "</b> landed on the first try." + (hit === STEPS.length ? "" : " The decisions that did not are the ones worth a second read.")));
      var actions = el("div", "actions");
      var again = button(r + 1 < REQUESTS.length ? "Try the next request" : "Start again from the first request");
      again.addEventListener("click", function () {
        r = (r + 1) % REQUESTS.length; s = 0; picks = [];
        renderStep(); scrollTo(stage);
      });
      actions.appendChild(again);
      stage.appendChild(actions);
      scrollTo(stage);
    }

    renderStep();
  })();

  /* ---------- CLARITY-02 ---------- */

  var ex2 = document.getElementById("ex-02-stage");
  if (ex2) (function () {
    var stage = ex2, order = [], n = 0, results = [];

    function byKey(key) { for (var i = 0; i < BUCKETS.length; i++) if (BUCKETS[i].key === key) return BUCKETS[i]; return null; }
    function shuffle() {
      order = CASES.map(function (_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
    }

    function renderCase() {
      var c = CASES[order[n]];
      stage.innerHTML = "";
      stage.appendChild(el("div", "count", "Request " + (n + 1) + " of " + CASES.length));
      stage.appendChild(el("div", "request", icon("message", "ic req-ic") + "<div>" + c.text + "</div>"));
      stage.appendChild(progress(CASES.length, n, n));
      stage.appendChild(el("h3", "q", '<span class="badge badge-s">' + icon("box") + "</span>Which container does this belong in?"));
      var list = el("ul", "buckets");
      BUCKETS.forEach(function (b) {
        var li = el("li");
        var btn = el("button", "bucket"); btn.type = "button"; btn.setAttribute("data-key", b.key);
        btn.innerHTML = '<span class="badge badge-s">' + icon(b.icon) + '</span><span class="name">' + b.name + "</span>";
        btn.addEventListener("click", function () { choose(b.key); });
        li.appendChild(btn); list.appendChild(li);
      });
      stage.appendChild(list);
      var reveal = el("div", "reveal"); reveal.hidden = true; reveal.setAttribute("aria-live", "polite");
      stage.appendChild(reveal);
      var actions = el("div", "actions"); actions.hidden = true;
      stage.appendChild(actions);
    }

    function choose(key) {
      var c = CASES[order[n]], sound = byKey(c.sound), picked = byKey(key);
      Array.prototype.forEach.call(stage.querySelectorAll(".bucket"), function (b) {
        b.disabled = true;
        if (b.getAttribute("data-key") === key) b.classList.add("picked");
        if (b.getAttribute("data-key") === c.sound) b.classList.add("sound");
      });
      var reveal = stage.querySelector(".reveal");
      var hit = key === c.sound;
      if (hit) {
        reveal.innerHTML = '<span class="lab">Sound: ' + sound.name + "</span><p>" + c.tell + "</p>";
      } else if (key === c.close) {
        reveal.innerHTML = '<span class="lab">Close. The sound one is ' + sound.name + "</span><p>" + c.closeWhy + "</p><p class=\"then\">" + c.tell + "</p>";
      } else {
        reveal.innerHTML = '<span class="lab">The sound one is ' + sound.name + "</span><p>A " + picked.name.toLowerCase() + " needs <b>" + picked.needs + "</b>, and this request does not say it.</p><p class=\"then\">" + c.tell + "</p>";
      }
      reveal.hidden = false;
      results.push({ text: c.text, bucket: sound.name, hit: hit });
      var actions = stage.querySelector(".actions");
      var next = button(n + 1 < CASES.length ? "Next request" : "See the count");
      next.addEventListener("click", function () {
        if (n + 1 < CASES.length) { n += 1; renderCase(); scrollTo(stage); }
        else renderTally();
      });
      actions.appendChild(next);
      actions.hidden = false;
      scrollTo(reveal);
    }

    function renderTally() {
      var hits = results.filter(function (x) { return x.hit; }).length;
      stage.innerHTML = "";
      stage.appendChild(el("div", "count", "All " + CASES.length + " placed"));
      stage.appendChild(progress(CASES.length, CASES.length, -1));
      var tally = el("div", "tally");
      tally.innerHTML = '<div class="n">' + hits + ' <small>of ' + CASES.length + "</small></div><div class=\"what\">placed on the first try</div><div class=\"basis\">" +
        (hits === CASES.length ? "<b>Every tell was read.</b> The next step is noticing them in requests that arrive without a label." :
         hits >= 7 ? "<b>Most tells were read.</b> The ones below marked amber are the containers that get confused most often, and the reason is in each line." :
         "<b>The tells take a few rounds to see.</b> Go again with the reasons below in mind; the order changes each time.") + "</div>";
      stage.appendChild(tally);
      var recap = el("ul", "recap");
      results.forEach(function (x) {
        var li = el("li", x.hit ? "hit" : "miss");
        li.innerHTML = '<span class="mark">' + icon(x.hit ? "check" : "repeat") + "</span><span class=\"txt\">" + x.text + "</span><span class=\"b\">" + x.bucket + "</span>";
        recap.appendChild(li);
      });
      stage.appendChild(recap);
      var actions = el("div", "actions");
      var again = button("Go again, in a new order");
      again.addEventListener("click", function () { shuffle(); n = 0; results = []; renderCase(); scrollTo(stage); });
      actions.appendChild(again);
      stage.appendChild(actions);
      scrollTo(stage);
    }

    shuffle();
    renderCase();
  })();
})();
