/* mjazzly.github.io, the Clarity page. Plain JavaScript, no libraries.

   Four exercises. Each shows a request, asks the reader to decide, and then
   shows the reasoning. Nothing is scored against the reader; the count at
   the end says how many were placed on the first try, so the clues can be
   seen. Every word of the exercises lives in this file.

   CLARITY-01  From a request to a workflow: five decisions, one request at
               a time, the chosen structure drawn at the end.
   CLARITY-02  Which container the work belongs in: a request, seven
               containers, a reveal, a count at the end.
   CLARITY-03  Same conversation or a new one: the same sorter, three
               choices.
   CLARITY-04  Which model tier: the same sorter, three tiers. */

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
              why: "<b>Thursday is the clue</b>: there is a meeting. The reader wants to walk in knowing what moved and whether it matters." },
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
              why: "Minutes record everything that was said. <b>Agreed is the clue</b>: the reader wants the commitments, and only those." },
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

  /* ---------- CLARITY-03: same conversation or a new one ---------- */

  var BUCKETS_03 = [
    { key: "stay",  name: "Stay in this conversation",       icon: "message",
      needs: "the same task, with everything said so far still right and still useful" },
    { key: "fresh", name: "New conversation, fresh",           icon: "plus",
      needs: "a different task, or an answer that should not lean on anything said before" },
    { key: "carry", name: "New conversation, carry a summary", icon: "clipboard",
      needs: "the same task, in a conversation that has grown long or taken a wrong turn" }
  ];

  var CASES_03 = [
    { text: "I asked for a draft email to a supplier. Now I want it shorter and a little warmer.",
      sound: "stay",
      tell: "<b>The next step of the same piece.</b> The draft, the supplier and the tone are already in the conversation; a new one means explaining all three again.",
      close: "fresh", closeWhy: "A new conversation needs the draft, the supplier and the tone explained again, and nothing in this one has gone wrong.",
      other: "There is nothing to carry over yet: the conversation is short, and nothing in it has gone wrong." },
    { text: "We have spent two hours on this script, and the assistant has started putting back a bug we fixed an hour ago.",
      sound: "carry",
      tell: "<b>Returning to what was fixed</b> is the sign of a long conversation: the early, broken version is still in it, competing with the current one. Start over with the current script and one line on what was fixed and why.",
      close: "stay", closeWhy: "Staying keeps the broken version in view, and it will keep pulling the answers back to it.",
      other: "Starting fresh throws away the hour that worked. Carry the current script and the fix, and leave the broken versions behind." },
    { text: "The budget analysis is done. Next I want help planning a team offsite.",
      sound: "fresh",
      tell: "<b>A new subject.</b> Nothing from the budget helps the offsite, and an hour of numbers is noise for a plan about people and places.",
      close: "carry", closeWhy: "A summary carries what matters to the same task. The offsite is a different task, so there is nothing to carry.",
      other: "Staying keeps an hour of budget figures in view for a plan that needs none of them." },
    { text: "Early on I said the dates were in US format. They are not, and every answer since has been built on that.",
      sound: "carry",
      tell: "<b>An early wrong turn.</b> Start over with the right format stated first, plus the conclusions that still hold.",
      close: "stay", closeWhy: "A correction added at the end sits beside the original mistake, and both stay in view. A clean start with the right fact stated first removes the competition.",
      other: "Starting fresh loses the conclusions that still hold. Carry those over, with the right date format stated first." },
    { text: "We reviewed three sections of a report against a checklist. Now I want the fourth reviewed the same way.",
      sound: "stay",
      tell: "<b>The standard lives in the conversation.</b> Three sections in, the checklist and how strictly it applies are already agreed.",
      close: "carry", closeWhy: "Carrying a summary is the fix for a conversation that has gone wrong. This one is working, and the three reviews are the best record of the standard.",
      other: "A fresh conversation would review the fourth section without the checklist, and without the strictness the first three were held to." },
    { text: "The assistant helped me write this plan. Now I want someone to find the holes in it.",
      sound: "fresh",
      tell: "<b>An outside view.</b> The conversation that helped write the plan holds every reason behind it and reads the plan the way it was meant. A fresh one reads it the way a stranger would.",
      close: "stay", closeWhy: "The conversation that wrote the plan holds its reasoning, so it reads the plan as intended, which is the view you are trying to get past.",
      other: "A summary of the plan carries its reasoning into the new conversation, and the review then inherits the reasoning it was meant to test." },
    { text: "A long research session is finished. The next step is writing the final report from it.",
      sound: "carry",
      tell: "<b>Carry the findings, leave the dead ends.</b> The session holds every source tried and dropped. A summary of what held up, with its sources, is the cleaner start for the writing.",
      close: "stay", closeWhy: "The session holds the dead ends as well as the findings, and a report written there can pick up a source that was already dropped.",
      other: "Starting fresh leaves the findings behind along with the dead ends. The summary keeps what held up, with its sources." },
    { text: "I am comparing two vendor proposals, and a third has just arrived.",
      sound: "stay",
      tell: "<b>The same comparison, one more input.</b> The criteria and the first two scores are in the conversation, so the third is read on the same scale.",
      close: "fresh", closeWhy: "A fresh conversation would score the third proposal without the criteria the first two were held to.",
      other: "Nothing here has gone wrong, so there is no reason to summarise and start over. The third proposal joins the comparison where it stands." }
  ];

  /* ---------- CLARITY-04: which model tier ---------- */

  var BUCKETS_04 = [
    { key: "small",    name: "Small and fast",  icon: "zap",
      needs: "a narrow task with a fixed answer shape, often run many times" },
    { key: "standard", name: "Standard",        icon: "cpu",
      needs: "everyday reading and writing, where judgement matters and the reasoning is short" },
    { key: "deep",     name: "Deep reasoning",  icon: "search",
      needs: "many steps that depend on each other, where one wrong early step spoils the rest" }
  ];

  var CASES_04 = [
    { text: "Sort 2,000 support tickets into five fixed categories.",
      sound: "small",
      tell: "<b>A fixed answer shape, many times over.</b> Five labels, two thousand times: the small tier does it well, and every extra cost per ticket is multiplied by two thousand.",
      close: "standard", closeWhy: "The standard tier sorts five fixed labels no better, and costs more per ticket, two thousand times over.",
      other: "The deep tier is the slowest and costliest per request, and five fixed labels give it nothing to reason through." },
    { text: "Draft a reply to a customer who is upset about a late delivery.",
      sound: "standard",
      tell: "<b>Tone and judgement, in one pass.</b> The reply has to acknowledge, explain and offer something. That is everyday writing, and the middle tier is built for it.",
      close: "small", closeWhy: "The small tier writes a correct reply that can read flat or slightly off, and in this reply the tone is the point.",
      other: "The deep tier writes the same reply, slower and at more cost. The reply needs judgement on tone, which the middle tier already has." },
    { text: "Two reports disagree on last quarter's revenue. Find out why, across three tables with different definitions.",
      sound: "deep",
      tell: "<b>Work out why, across steps that depend on each other.</b> Each table's definition changes what the next comparison means, so a wrong early step spoils every step after it.",
      close: "standard", closeWhy: "The standard tier compares two numbers well. Tracing a difference through three definitions takes a chain of dependent steps, and that is where the deeper tier earns its cost.",
      other: "The small tier is built for answers with a fixed shape. Finding why two numbers differ has no fixed shape." },
    { text: "Pull the invoice number, date and total out of 500 invoices.",
      sound: "small",
      tell: "<b>Extraction with a fixed shape.</b> Run it on the small tier, check a sample by hand, and move up only if the sample shows a miss.",
      close: "standard", closeWhy: "Three fixed fields do not need the middle tier, and the difference in cost is multiplied by five hundred.",
      other: "Reading three fields off an invoice gives the deep tier nothing to reason through, and its extra cost is multiplied by five hundred." },
    { text: "Fix the spelling and grammar in this paragraph.",
      sound: "small",
      tell: "<b>A narrow edit on a short text.</b> A larger model makes the same corrections, only slower and at more cost.",
      close: "standard", closeWhy: "The standard tier makes the same corrections. It becomes the right tier if the paragraph needs rewriting, which is a different request.",
      other: "The deep tier spends its extra time on reasoning, and a spelling fix needs none." },
    { text: "Summarise a ten-page meeting transcript into the decisions made and who owns each one.",
      sound: "standard",
      tell: "<b>Reading and judgement, short reasoning.</b> Telling a decision from a discussion takes judgement. It does not take a long chain of steps.",
      close: "small", closeWhy: "The small tier summarises, but it is more likely to list what was discussed as if it were decided, and the owners are the part that matters.",
      other: "The deep tier does it too, slower and at more cost. Telling a decision from a discussion takes judgement, which the middle tier has." },
    { text: "Plan a system migration with fourteen dependencies and two fixed deadlines.",
      sound: "deep",
      tell: "<b>Many constraints that move together.</b> Shifting one step shifts others, so the plan has to be reasoned through as a whole.",
      close: "standard", closeWhy: "The standard tier writes a plan that reads well. With fourteen dependencies, a plan that reads well is exactly where the conflicts hide.",
      other: "The small tier is built for narrow tasks with a fixed shape. A plan with fourteen dependencies has neither." },
    { text: "Write this week's status update from five bullet points that are already agreed.",
      sound: "standard",
      tell: "<b>Everyday writing from settled material.</b> The thinking is done and the five bullets are the content.",
      close: "deep", closeWhy: "The deep tier is built for problems whose steps depend on each other. Five settled bullets are not one, so it takes longer and costs more for the same update.",
      other: "The small tier can join five bullets into sentences, but a status update is read for its tone too, and the middle tier writes it better." }
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

  /* ---------- CLARITY-02 to 04: place each request, then the count ---------- */

  function sorter(cfg) {
    var stage = document.getElementById(cfg.stage);
    if (!stage) return;
    var buckets = cfg.buckets, cases = cfg.cases, order = [], n = 0, results = [];

    function byKey(key) { for (var i = 0; i < buckets.length; i++) if (buckets[i].key === key) return buckets[i]; return null; }
    function shuffle() {
      order = cases.map(function (_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
    }

    function renderCase() {
      var c = cases[order[n]];
      stage.innerHTML = "";
      stage.appendChild(el("div", "count", "Request " + (n + 1) + " of " + cases.length));
      stage.appendChild(el("div", "request", icon("message", "ic req-ic") + "<div>" + c.text + "</div>"));
      stage.appendChild(progress(cases.length, n, n));
      stage.appendChild(el("h3", "q", '<span class="badge badge-s">' + icon(cfg.qIcon) + "</span>" + cfg.q));
      var list = el("ul", "buckets" + (buckets.length === 3 ? " three" : ""));
      buckets.forEach(function (b) {
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
      var c = cases[order[n]], sound = byKey(c.sound), picked = byKey(key);
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
        reveal.innerHTML = '<span class="lab">Close. The sound one is ' + sound.name + "</span><p>" + c.closeWhy + '</p><p class="then">' + c.tell + "</p>";
      } else if (c.other) {
        reveal.innerHTML = '<span class="lab">The sound one is ' + sound.name + "</span><p>" + c.other + '</p><p class="then">' + c.tell + "</p>";
      } else {
        reveal.innerHTML = '<span class="lab">The sound one is ' + sound.name + "</span><p><b>" + picked.name + "</b> fits " + picked.needs + ". This request does not say that.</p><p class=\"then\">" + c.tell + "</p>";
      }
      reveal.hidden = false;
      results.push({ text: c.text, bucket: sound.name, hit: hit });
      var actions = stage.querySelector(".actions");
      var next = button(n + 1 < cases.length ? "Next request" : "See the count");
      next.addEventListener("click", function () {
        if (n + 1 < cases.length) { n += 1; renderCase(); scrollTo(stage); }
        else renderTally();
      });
      actions.appendChild(next);
      actions.hidden = false;
      scrollTo(reveal);
    }

    function renderTally() {
      var hits = results.filter(function (x) { return x.hit; }).length;
      stage.innerHTML = "";
      stage.appendChild(el("div", "count", "All " + cases.length + " placed"));
      stage.appendChild(progress(cases.length, cases.length, -1));
      var tally = el("div", "tally");
      tally.innerHTML = '<div class="n">' + hits + ' <small>of ' + cases.length + "</small></div><div class=\"what\">placed on the first try</div><div class=\"basis\">" +
        (hits === cases.length ? "<b>You read every clue.</b> The next step is spotting them in requests that arrive without a label." :
         hits >= Math.ceil(cases.length * 0.7) ? "<b>You read most of the clues.</b> The requests marked amber below are the ones worth a second look." :
         "<b>The clues take a few rounds to spot.</b> Go again with the answers below in mind; the order changes each time.") + "</div>";
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
  }

  sorter({ stage: "ex-02-stage", buckets: BUCKETS, cases: CASES, q: "Which container does this belong in?", qIcon: "box" });
  sorter({ stage: "ex-03-stage", buckets: BUCKETS_03, cases: CASES_03, q: "Stay, start fresh, or carry a summary over?", qIcon: "repeat" });
  sorter({ stage: "ex-04-stage", buckets: BUCKETS_04, cases: CASES_04, q: "Which tier is the right size for this?", qIcon: "stairs" });
})();
