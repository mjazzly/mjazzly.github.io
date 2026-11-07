/* Deconstruct (deconstruct.html): finished outputs taken apart a layer at a time.

   One engine, three scenes. Each piece is a drawing the output sits inside: Step back
   reveals the next layer down inside the same drawing, a choice is a part of the drawing
   the reader presses, and the output rolls to its new value with one amber flash. The
   last layer is the floor: the rows themselves, drawn and named on hover or tap, with a
   plain table of them behind a fold under the scene. Each scene plays one pass on its own
   (down to the floor and back up) the first time it is mostly on screen, then waits.

   Each piece's data is plain JSON between PIECE markers: its words, its layers, its rows.
   OUT holds each piece's one small function (rows and choices in, the output out) and
   SCENES its drawing. scripts/deconstruct.py reads the blocks and runs OUT through node
   to write the page's no-JavaScript view. DECONSTRUCT-03's rows are the record: every
   name, line and cell between the RECORD markers is written by scripts/deconstruct.py
   from the meeting tracker's run, never by hand. Rerun the script after a new counted run.

   A fourth piece costs its rows and words (a PIECE block), its OUT function and its scene.
   Reduced motion: no pass on its own, no travel, no roll, no flash; every change is shown at once. */
(function () {
  "use strict";

  var DATA = {};

  DATA["01"] = /*PIECE:01*/{
  "code": "DECONSTRUCT-01",
  "out": {"label": "Qualified this quarter"},
  "met": {"name": "The output", "what": "Qualified this quarter, as a dashboard tile shows it.", "why": "Step back to see what it rests on."},
  "layers": [
    {"key": "count", "name": "The count",
     "what": "What one unit on the tile is: a record, or a person.",
     "why": "Four people were entered twice. As records they count twice; as people, once.",
     "options": [["records", "Records"], ["people", "People"]], "pub": "records"},
    {"key": "word", "name": "The word “qualified”",
     "what": "Anyone who ever reached the stage, or only those still in it.",
     "why": "Contacts move on after qualifying. Counting only those still there drops them.",
     "options": [["any", "Any time"], ["now", "In it now"]], "pub": "any"},
    {"key": "date", "name": "The date",
     "what": "Which date puts a contact inside July to September.",
     "why": "Created in September, qualified in October: one date says this quarter, one says next.",
     "options": [["qualified", "Date qualified"], ["created", "Date created"]], "pub": "qualified"},
    {"key": "rows", "name": "The rows", "floor": true,
     "what": "The 40 contacts in the export. Point at one to read it.",
     "why": "Nothing here is a choice. Every count above is a recount of these."}
  ],
  "words": {"pub": "as published", "same": "same email", "stopped": "stopped here", "table": "The 40 contacts as a table",
            "tip": "{id} · {name}, {company} · created {created}, qualified {qualified} · now {stage}"},
  "quarter": ["Jul", "Aug", "Sep"],
  "columns": [["id", "Id"], ["name", "Name"], ["company", "Company"], ["email", "Email"], ["created", "Created"], ["qualified", "Qualified"], ["stage", "Stage now"]],
  "blank": {"qualified": "not yet"},
  "rows": [
    {"id": "C-01", "name": "Amira Hassan", "company": "Riverside Foods", "email": "amira@riverside.example", "created": "3 Jul", "qualified": "18 Jul", "stage": "Opportunity"},
    {"id": "C-02", "name": "Ben Carter", "company": "Northside Clinic", "email": "ben@northside.example", "created": "12 Apr", "qualified": "9 Jul", "stage": "Customer"},
    {"id": "C-03", "name": "Chloe Martin", "company": "Harbour Supplies", "email": "chloe@harbour.example", "created": "20 Jun", "qualified": "2 Jul", "stage": "Qualified"},
    {"id": "C-04", "name": "Daniel Wu", "company": "Hilltop Builders", "email": "daniel@hilltop.example", "created": "5 Aug", "qualified": "", "stage": "Contacted"},
    {"id": "C-05", "name": "Elena Rossi", "company": "Lakeside Hotel", "email": "elena@lakeside.example", "created": "14 May", "qualified": "28 Jun", "stage": "Opportunity"},
    {"id": "C-06", "name": "Farid Khan", "company": "Valley Farms", "email": "farid@valley.example", "created": "2 Jul", "qualified": "22 Aug", "stage": "Qualified"},
    {"id": "C-07", "name": "Grace Lee", "company": "Parkview School", "email": "grace@parkview.example", "created": "19 Jul", "qualified": "", "stage": "New"},
    {"id": "C-08", "name": "Hugo Silva", "company": "Seaside Logistics", "email": "hugo@seaside.example", "created": "8 Sep", "qualified": "3 Oct", "stage": "Qualified"},
    {"id": "C-09", "name": "Isla Brown", "company": "Old Town Bakery", "email": "isla@oldtown.example", "created": "27 Jun", "qualified": "11 Jul", "stage": "Disqualified"},
    {"id": "C-10", "name": "Jamal Reed", "company": "Eastgate Motors", "email": "jamal@eastgate.example", "created": "10 Aug", "qualified": "30 Aug", "stage": "Qualified"},
    {"id": "C-11", "name": "Kara Novak", "company": "Westbridge Dental", "email": "kara@westbridge.example", "created": "1 May", "qualified": "", "stage": "Contacted"},
    {"id": "C-12", "name": "Leo Tanaka", "company": "Central Pharmacy", "email": "leo@central.example", "created": "16 Jul", "qualified": "5 Sep", "stage": "Opportunity"},
    {"id": "C-13", "name": "Maya Patel", "company": "Greenfield Nursery", "email": "maya@greenfield.example", "created": "23 Aug", "qualified": "", "stage": "Contacted"},
    {"id": "C-14", "name": "Noah Fischer", "company": "Bayside Marina", "email": "noah@bayside.example", "created": "4 Jun", "qualified": "", "stage": "Disqualified"},
    {"id": "C-15", "name": "Olivia Grant", "company": "Summit Gym", "email": "olivia@summit.example", "created": "29 Jul", "qualified": "14 Aug", "stage": "Customer"},
    {"id": "C-16", "name": "Pablo Ruiz", "company": "Mill Lane Studio", "email": "pablo@milllane.example", "created": "11 Sep", "qualified": "", "stage": "New"},
    {"id": "C-17", "name": "Quinn Adler", "company": "Riverside Foods", "email": "quinn@riverside.example", "created": "7 Jul", "qualified": "25 Jul", "stage": "Disqualified"},
    {"id": "C-18", "name": "Rosa Mendes", "company": "Northside Clinic", "email": "rosa@northside.example", "created": "18 Apr", "qualified": "20 May", "stage": "Opportunity"},
    {"id": "C-19", "name": "Sam Okoro", "company": "Harbour Supplies", "email": "sam@harbour.example", "created": "2 Aug", "qualified": "19 Sep", "stage": "Qualified"},
    {"id": "C-20", "name": "Tara Singh", "company": "Hilltop Builders", "email": "tara@hilltop.example", "created": "25 Sep", "qualified": "", "stage": "New"},
    {"id": "C-21", "name": "Amira Hassan", "company": "Riverside Foods Ltd", "email": "amira@riverside.example", "created": "21 Aug", "qualified": "21 Aug", "stage": "Qualified"},
    {"id": "C-22", "name": "Umar Farouk", "company": "Lakeside Hotel", "email": "umar@lakeside.example", "created": "6 Jul", "qualified": "", "stage": "Contacted"},
    {"id": "C-23", "name": "Vera Kowalski", "company": "Valley Farms", "email": "vera@valley.example", "created": "13 Jun", "qualified": "8 Jul", "stage": "Customer"},
    {"id": "C-24", "name": "Will Turner", "company": "Parkview School", "email": "will@parkview.example", "created": "30 Jul", "qualified": "", "stage": "Disqualified"},
    {"id": "C-25", "name": "Ximena Lopez", "company": "Seaside Logistics", "email": "ximena@seaside.example", "created": "9 Aug", "qualified": "27 Aug", "stage": "Opportunity"},
    {"id": "C-26", "name": "Yara Nasser", "company": "Old Town Bakery", "email": "yara@oldtown.example", "created": "15 Sep", "qualified": "29 Sep", "stage": "Qualified"},
    {"id": "C-27", "name": "Zane Holt", "company": "Eastgate Motors", "email": "zane@eastgate.example", "created": "3 Jun", "qualified": "", "stage": "Contacted"},
    {"id": "C-28", "name": "Farid Khan", "company": "Valley Farms", "email": "farid@valley.example", "created": "17 Aug", "qualified": "", "stage": "New"},
    {"id": "C-29", "name": "Anna Berg", "company": "Westbridge Dental", "email": "anna@westbridge.example", "created": "22 Jul", "qualified": "12 Sep", "stage": "Disqualified"},
    {"id": "C-30", "name": "Chen Wei", "company": "Central Pharmacy", "email": "chen@central.example", "created": "26 May", "qualified": "16 Jul", "stage": "Qualified"},
    {"id": "C-31", "name": "Dina Volkova", "company": "Greenfield Nursery", "email": "dina@greenfield.example", "created": "4 Sep", "qualified": "", "stage": "Contacted"},
    {"id": "C-32", "name": "Eli Moreau", "company": "Bayside Marina", "email": "eli@bayside.example", "created": "19 Aug", "qualified": "9 Oct", "stage": "Opportunity"},
    {"id": "C-33", "name": "Jamal Reed", "company": "Eastgate Motors", "email": "jamal@eastgate.example", "created": "1 Sep", "qualified": "1 Sep", "stage": "Qualified"},
    {"id": "C-34", "name": "Fatima Zahra", "company": "Summit Gym", "email": "fatima@summit.example", "created": "8 Jul", "qualified": "", "stage": "New"},
    {"id": "C-35", "name": "Gus Larsen", "company": "Mill Lane Studio", "email": "gus@milllane.example", "created": "28 Jun", "qualified": "", "stage": "Contacted"},
    {"id": "C-36", "name": "Hana Sato", "company": "Riverside Foods", "email": "hana@riverside.example", "created": "12 Aug", "qualified": "2 Sep", "stage": "Customer"},
    {"id": "C-37", "name": "Ivan Petrov", "company": "Northside Clinic", "email": "ivan@northside.example", "created": "24 Sep", "qualified": "", "stage": "New"},
    {"id": "C-38", "name": "Chloe Martin", "company": "Harbour Supplies", "email": "chloe@harbour.example", "created": "10 Sep", "qualified": "", "stage": "Contacted"},
    {"id": "C-39", "name": "Jade Wilson", "company": "Lakeside Hotel", "email": "jade@lakeside.example", "created": "5 May", "qualified": "", "stage": "Disqualified"},
    {"id": "C-40", "name": "Kofi Mensah", "company": "Valley Farms", "email": "kofi@valley.example", "created": "20 Jun", "qualified": "22 Sep", "stage": "Qualified"}
  ]
}/*/PIECE:01*/;

  DATA["02"] = /*PIECE:02*/{
  "code": "DECONSTRUCT-02",
  "out": {"label": "On time"},
  "met": {"name": "The output", "what": "The on-time rate for June, as an arrivals board shows it.", "why": "Step back to see what it rests on."},
  "layers": [
    {"key": "rule", "name": "The rule",
     "what": "How late a flight can be and still count as on time.",
     "why": "One public reporting body says under 15 minutes. At exactly 15, it is late.",
     "options": [["0", "Not late at all"], ["15", "Under 15 minutes late"], ["30", "Under 30 minutes late"]], "pub": "15",
     "source": {"text": "Source: Bureau of Transportation Statistics, how flight delays are calculated", "href": "https://www.bts.gov/explore-topics-and-geography/topics/airline-time-performance-and-causes-flight-delays"}},
    {"key": "never", "name": "The flights that never arrived",
     "what": "Two cancelled and one diverted: counted as not on time, or left out.",
     "why": "Counted, they stay in the total. Left out, the total shrinks and the rate rises.",
     "options": [["counted", "Counted"], ["out", "Left out"]], "pub": "counted"},
    {"key": "at", "name": "Where it is measured",
     "what": "Which moment is timed: arrival at the gate, or departure from it.",
     "why": "Flights make up time in the air, so late leaving can still mean on time.",
     "options": [["arrival", "At arrival"], ["departure", "At departure"]], "pub": "arrival"},
    {"key": "rows", "name": "The rows", "floor": true,
     "what": "The 24 June flights. Point at one to read it.",
     "why": "Nothing here is a choice. Every rate above is a recount of these."}
  ],
  "words": {"pub": "as published", "board": "Arrivals, June", "arrived": "arrived on time", "flights": "{on} of {of} flights",
            "onTime": "on time", "late": "late", "early": "early", "min": "{m} min", "edge": "exactly 15: late",
            "axis": {"arrival": "minutes late at arrival", "departure": "minutes late at departure"},
            "never": ["never", "arrived"], "leftOut": "left out", "table": "The 24 flights as a table",
            "tip": "{id} · {flight}, {from} to {to}, {date} · left {dep}, arrived {arr}",
            "tipCancelled": "{id} · {flight}, {from} to {to}, {date} · cancelled",
            "tipDiverted": "{id} · {flight}, {from} to {to}, {date} · left {dep}, diverted"},
  "columns": [["id", "#"], ["flight", "Flight"], ["from", "From"], ["to", "To"], ["date", "Date"], ["sched", "Scheduled arrival"], ["actual", "Actual arrival"], ["dep", "Departure"], ["arr", "Arrival"]],
  "rows": [
    {"id": "F-01", "flight": "Flight 101", "from": "Capital", "to": "Coast Town", "date": "2 Jun", "sched": "08:40", "actual": "08:52", "dep": "14 late", "arr": "12 late"},
    {"id": "F-02", "flight": "Flight 102", "from": "Coast Town", "to": "Capital", "date": "2 Jun", "sched": "11:15", "actual": "11:09", "dep": "3 late", "arr": "6 early"},
    {"id": "F-03", "flight": "Flight 205", "from": "Capital", "to": "Lake Town", "date": "4 Jun", "sched": "09:30", "actual": "09:41", "dep": "9 late", "arr": "11 late"},
    {"id": "F-04", "flight": "Flight 206", "from": "Lake Town", "to": "Capital", "date": "4 Jun", "sched": "13:05", "actual": "13:01", "dep": "on the minute", "arr": "4 early"},
    {"id": "F-05", "flight": "Flight 310", "from": "Hill Town", "to": "Port City", "date": "6 Jun", "sched": "07:50", "actual": "08:04", "dep": "32 late", "arr": "14 late"},
    {"id": "F-06", "flight": "Flight 311", "from": "Port City", "to": "Hill Town", "date": "6 Jun", "sched": "12:20", "actual": "12:34", "dep": "22 late", "arr": "14 late"},
    {"id": "F-07", "flight": "Flight 101", "from": "Capital", "to": "Coast Town", "date": "9 Jun", "sched": "08:40", "actual": "08:40", "dep": "4 late", "arr": "on the minute"},
    {"id": "F-08", "flight": "Flight 102", "from": "Coast Town", "to": "Capital", "date": "9 Jun", "sched": "11:15", "actual": "Cancelled", "dep": "Cancelled", "arr": "Cancelled"},
    {"id": "F-09", "flight": "Flight 205", "from": "Capital", "to": "Lake Town", "date": "11 Jun", "sched": "09:30", "actual": "09:44", "dep": "30 late", "arr": "14 late"},
    {"id": "F-10", "flight": "Flight 206", "from": "Lake Town", "to": "Capital", "date": "11 Jun", "sched": "13:05", "actual": "13:14", "dep": "17 late", "arr": "9 late"},
    {"id": "F-11", "flight": "Flight 310", "from": "Hill Town", "to": "Port City", "date": "13 Jun", "sched": "07:50", "actual": "07:44", "dep": "2 early", "arr": "6 early"},
    {"id": "F-12", "flight": "Flight 311", "from": "Port City", "to": "Hill Town", "date": "13 Jun", "sched": "12:20", "actual": "Diverted", "dep": "12 late", "arr": "Diverted"},
    {"id": "F-13", "flight": "Flight 101", "from": "Capital", "to": "Coast Town", "date": "16 Jun", "sched": "08:40", "actual": "08:50", "dep": "18 late", "arr": "10 late"},
    {"id": "F-14", "flight": "Flight 102", "from": "Coast Town", "to": "Capital", "date": "16 Jun", "sched": "11:15", "actual": "11:27", "dep": "16 late", "arr": "12 late"},
    {"id": "F-15", "flight": "Flight 205", "from": "Capital", "to": "Lake Town", "date": "18 Jun", "sched": "09:30", "actual": "09:28", "dep": "on the minute", "arr": "2 early"},
    {"id": "F-16", "flight": "Flight 206", "from": "Lake Town", "to": "Capital", "date": "18 Jun", "sched": "13:05", "actual": "14:02", "dep": "55 late", "arr": "57 late"},
    {"id": "F-17", "flight": "Flight 310", "from": "Hill Town", "to": "Port City", "date": "20 Jun", "sched": "07:50", "actual": "08:05", "dep": "11 late", "arr": "15 late"},
    {"id": "F-18", "flight": "Flight 311", "from": "Port City", "to": "Hill Town", "date": "20 Jun", "sched": "12:20", "actual": "12:16", "dep": "on the minute", "arr": "4 early"},
    {"id": "F-19", "flight": "Flight 101", "from": "Capital", "to": "Coast Town", "date": "23 Jun", "sched": "08:40", "actual": "08:47", "dep": "8 late", "arr": "7 late"},
    {"id": "F-20", "flight": "Flight 102", "from": "Coast Town", "to": "Capital", "date": "23 Jun", "sched": "11:15", "actual": "11:23", "dep": "19 late", "arr": "8 late"},
    {"id": "F-21", "flight": "Flight 205", "from": "Capital", "to": "Lake Town", "date": "25 Jun", "sched": "09:30", "actual": "Cancelled", "dep": "Cancelled", "arr": "Cancelled"},
    {"id": "F-22", "flight": "Flight 206", "from": "Lake Town", "to": "Capital", "date": "25 Jun", "sched": "13:05", "actual": "13:03", "dep": "2 late", "arr": "2 early"},
    {"id": "F-23", "flight": "Flight 310", "from": "Hill Town", "to": "Port City", "date": "27 Jun", "sched": "07:50", "actual": "07:58", "dep": "6 late", "arr": "8 late"},
    {"id": "F-24", "flight": "Flight 311", "from": "Port City", "to": "Hill Town", "date": "27 Jun", "sched": "12:20", "actual": "12:32", "dep": "16 late", "arr": "12 late"}
  ]
}/*/PIECE:02*/;

  DATA["03"] = /*PIECE:03*/{
  "code": "DECONSTRUCT-03",
  "out": {"label": "The row as the tracker released it"},
  "met": {"name": "The output", "what": "One row as the meeting tracker released it.", "why": "Step back to see what it rests on."},
  "fields": [["owner", "Owner"], ["action", "Action"], ["due", "Due"], ["status", "Status"]],
  "layers": [
    {"key": "gate", "name": "The gate", "live": true,
     "what": "The checker compares each row with the answer written before the first run.",
     "why": "The rule: an owner only when the same sentence names them."},
    {"key": "line", "name": "The sentence",
     "what": "Three lines from one meeting, each naming the doer differently, or not at all.",
     "why": "A name in the same sentence makes an owner. Anything else stays “not stated”.",
     "options": [["same", "Name in the same sentence"], ["next", "Name in the next sentence"], ["none", "No name"]], "pub": "same"},
    {"key": "transcript", "name": "The transcript", "floor": true,
     "what": "The meeting as recorded, line by line. Point at a line to read it.",
     "why": "The row can only say what these lines say."}
  ],
  "words": {"pub": "as published", "rule": "an owner only when the same sentence names them", "matched": "Matched", "missed": "Missed",
            "answer": "answer written first:", "closedBy": "closed by transcript {n}, line {line}", "table": "The transcript as text",
            "tip": "line {n} · {who}: {text}"},
  "columns": [["n", "Line"], ["who", "Speaker"], ["text", "Said"]]
}/*/PIECE:03*/;

  DATA["03"].record = /*RECORD:03*/{
 "run": "E202611010805",
 "tier": "largest model",
 "matched": 5,
 "of": 5,
 "decline": true,
 "transcript": {
  "file": "02_meridian_pricing.txt",
  "meeting": "Meridian Foods, pricing review",
  "date": "2026-10-21",
  "lines": [
   {
    "n": "1",
    "who": "Tom Reyes",
    "text": "We have the three pricing scenarios ready. The question for today is which one goes to the board."
   },
   {
    "n": "2",
    "who": "Marcus Webb",
    "text": "Scenario B is the one I can defend. Let us go with that."
   },
   {
    "n": "3",
    "who": "Hannah Cole",
    "text": "The revised price list needs to go to the distributors by 28 October or we miss the November cycle."
   },
   {
    "n": "4",
    "who": "Marcus Webb",
    "text": "Agreed, that has to happen."
   },
   {
    "n": "5",
    "who": "Mei Ling Chong",
    "text": "I will update the scenario B model with the distributor volumes and send it to Hannah by 24 October."
   },
   {
    "n": "6",
    "who": "Hannah Cole",
    "text": "Thanks. Someone also needs to brief the sales team before the list goes out."
   },
   {
    "n": "7",
    "who": "Tom Reyes",
    "text": "Let us leave that with the Meridian side to decide. Anything else? No. Thanks all."
   }
  ]
 },
 "variants": {
  "same": {
   "line": "5",
   "lines": [
    "5"
   ],
   "mark": {
    "line": "5",
    "text": "I will"
   },
   "expected": {
    "owner": "Mei Ling Chong",
    "due": "2026-10-24"
   },
   "row": {
    "id": "A005",
    "action": "Update the scenario B model with the distributor volumes and send it to Hannah Cole",
    "owner": "Mei Ling Chong",
    "company": "Our firm",
    "due": "2026-10-24",
    "status": "closed",
    "closed_in": "05",
    "closed_line": "1"
   },
   "closer": {
    "file": "05_meridian_update.txt",
    "n": "1",
    "who": "Tom Reyes",
    "text": "A short one today. The scenario B model is updated and with Hannah, so that work is on track."
   },
   "fails": [],
   "matched": true,
   "notes": [
    {
     "file": "05_meridian_update.txt",
     "text": "Line 1 (\"the scenario B model is updated and with Hannah\") read as a closure of A005."
    }
   ]
  },
  "next": {
   "line": "3",
   "lines": [
    "3",
    "4"
   ],
   "mark": {
    "line": "4",
    "who": true
   },
   "expected": {
    "owner": "not stated",
    "due": "2026-10-28"
   },
   "row": {
    "id": "A004",
    "action": "The revised price list needs to go to the distributors",
    "owner": "not stated",
    "company": "",
    "due": "2026-10-28",
    "status": "open",
    "closed_in": "",
    "closed_line": ""
   },
   "closer": null,
   "fails": [],
   "matched": true,
   "notes": [
    {
     "file": "02_meridian_pricing.txt",
     "text": "Line 3 (price list to distributors by 28 October) kept as an action with owner not stated; Marcus Webb's \"agreed\" on line 4 does not make him the owner."
    }
   ]
  },
  "none": {
   "line": "6",
   "lines": [
    "6"
   ],
   "mark": {
    "line": "6",
    "text": "Someone"
   },
   "expected": {
    "owner": "not stated",
    "due": "not stated"
   },
   "row": {
    "id": "A006",
    "action": "Brief the Meridian sales team before the price list goes out",
    "owner": "not stated",
    "company": "",
    "due": "not stated",
    "status": "open",
    "closed_in": "",
    "closed_line": ""
   },
   "closer": null,
   "fails": [],
   "matched": true,
   "notes": [
    {
     "file": "02_meridian_pricing.txt",
     "text": "Line 6 (brief the sales team) kept as an unowned action; its due \"before the list goes out\" names no calendar date, so due is not stated."
    }
   ]
  }
 }
}/*/RECORD:03*/;

  // ---------- the one small function per piece: rows and choices in, the output out ----------
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function month(s) { return s ? s.split(" ")[1] : ""; }
  function minutes(s) {          // "14 late", "6 early", "on the minute"; anything else never reached a gate
    if (s === "on the minute") return 0;
    var m = /^(\d+) (late|early)$/.exec(s);
    return m ? (m[2] === "late" ? +m[1] : -m[1]) : null;
  }

  var OUT = {
    "01": {
      out: function (c, d) {
        var lit = [], seen = {};
        d.rows.forEach(function (r) {
          if (!r.qualified) return;
          if (c.word === "now" && r.stage !== "Qualified") return;
          if (d.quarter.indexOf(month(c.date === "qualified" ? r.qualified : r.created)) < 0) return;
          if (c.count === "people") { if (seen[r.email]) return; seen[r.email] = true; }
          lit.push(r.id);
        });
        var n = lit.length, unit = c.count === "people" ? (n === 1 ? "person" : "people") : (n === 1 ? "record" : "records");
        return {
          big: String(n), sub: unit + ", July to September", lit: lit,
          litText: n + " of " + d.rows.length + " records lit: the ones the tile counts" + (c.count === "people" ? ", one record for each person." : "."),
          say: "Qualified this quarter: " + n + " " + unit + "."
        };
      }
    },
    "02": {
      out: function (c, d) {
        var on = 0, of = 0, lit = [];
        d.rows.forEach(function (r) {
          if (minutes(r.arr) === null) { if (c.never === "counted") of++; return; }   // cancelled or diverted
          var m = minutes(c.at === "arrival" ? r.arr : r.dep);
          of++;
          if (c.rule === "0" ? m <= 0 : m < +c.rule) { on++; lit.push(r.id); }
        });
        var pct = Math.round(100 * on / of);
        return {
          big: pct + "%", sub: on + " of " + of + " flights, June", lit: lit,
          litText: on + " of " + d.rows.length + " flights lit: the ones counted on time.",
          say: "On time: " + pct + " percent, " + on + " of " + of + " flights."
        };
      }
    },
    "03": {
      out: function (c, d) {
        var v = d.record.variants[c.line], r = v.row;
        var cells = r ? {
          action: r.action,
          owner: r.owner + (r.company ? ", " + r.company : ""),
          due: r.due,
          status: r.status
        } : {action: "No row: the run released none for this line.", owner: "", due: "", status: ""};
        var gate = '<p><span class="dx-verdict' + (v.matched ? "" : " miss") + '">' + (v.matched ? "Matched" : "Missed") + "</span> " +
          "The answer written before the first run: owner <b>" + esc(v.expected.owner) + "</b>, due <b>" + esc(v.expected.due) + "</b>" +
          (r && r.closed_in && v.matched ? ", and the close by transcript " + esc(r.closed_in) + " checked too." : ".") + "</p>" +
          (v.fails.length ? "<p>What the checker found: " + v.fails.map(esc).join("; ") + ".</p>" : "") +
          v.notes.map(function (n) { return '<p class="dx-note">The run’s own note' + (n.file === d.record.transcript.file ? "" : ", transcript " + esc(n.file.slice(0, 2))) + ": “" + esc(n.text) + "”</p>"; }).join("");
        return {
          cells: cells,
          sub: r ? r.id + ", read from line " + v.line + " of " + d.record.transcript.file + "." +
            (r.closed_in ? " Closed by a later meeting: transcript " + r.closed_in + ", line " + r.closed_line + "." : "") : "",
          lit: v.lines.map(function (n) { return "L" + n; }).concat(v.closer ? ["C" + v.closer.n] : []),
          litText: (v.lines.length > 1 ? "Lines " + v.lines.join(" and ") : "Line " + v.lines[0]) + " lit: " + (v.lines.length > 1 ? "the line the row was read from, and the line after it." : "the line the row was read from.") +
            (v.closer ? " The line that closed it is lit below." : ""),
          live: {gate: gate},
          say: r ? "Owner: " + r.owner + ". Due: " + r.due + ". Status: " + r.status + (r.closed_in ? ", by a later meeting." : ".") : "No row for this line."
        };
      },
      floor: function (c, d) {
        var t = d.record.transcript, v = d.record.variants[c.line];
        var groups = [{label: t.file + " · " + t.meeting + " · " + t.date, rows: t.lines.map(function (l) { return {id: "L" + l.n, n: l.n, who: l.who, text: l.text}; })}];
        if (v.closer) groups.push({label: "Closed by " + v.closer.file, rows: [{id: "C" + v.closer.n, n: v.closer.n, who: v.closer.who, text: v.closer.text}]});
        return groups;
      }
    }
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[ch]; }); }
  function pubs(d) { var c = {}; d.layers.forEach(function (l) { if (l.options) c[l.key] = l.pub; }); return c; }
  function floorGroups(id, c, d) { return OUT[id].floor ? OUT[id].floor(c, d) : [{label: "", rows: d.rows}]; }

  // scripts/deconstruct.py loads this file in node to write the page's no-JavaScript view
  if (typeof module === "object" && module.exports) { module.exports = {DATA: DATA, OUT: OUT, pubs: pubs, floorGroups: floorGroups}; return; }
  if (typeof document === "undefined") return;

  // ---------- drawing helpers ----------
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PIECES = [];
  var SANS = "Manrope, system-ui, sans-serif";
  var measure = document.createElement("canvas").getContext("2d");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function tx(parent, x, y, s, cls, anchor) {
    var e = sv("text", {x: x, y: y, "class": cls || null, "text-anchor": anchor || null}, parent);
    e.textContent = s;
    return e;
  }
  function move(e, x, y) { e.style.transform = "translate(" + x + "px," + y + "px)"; }
  function show(e, on) { e.classList.toggle("is-off", !on); }
  function wide(s, size, weight) { measure.font = (weight || 400) + " " + size + "px " + SANS; return measure.measureText(s).width; }
  function fit(s, px, size, weight) {
    if (wide(s, size, weight) <= px) return s;
    while (s.length > 1 && wide(s + " …", size, weight) > px) s = s.slice(0, -1);
    return s.replace(/\s+\S*$/, "") + " …";
  }
  function wrapLines(s, px, size, weight, max) {
    var words = s.split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var next = cur ? cur + " " + w : w;
      if (cur && wide(next, size, weight) > px) { lines.push(cur); cur = w; } else cur = next;
    });
    lines.push(cur);
    if (lines.length > max) { lines = lines.slice(0, max); lines[max - 1] = fit(lines[max - 1] + " ……", px, size, weight); }
    return lines;
  }
  function fill(t, r) { return t.replace(/\{(\w+)\}/g, function (_, k) { return r[k] == null ? "" : r[k]; }); }
  function icon(name) {
    var s = sv("svg", {"class": "ic", "aria-hidden": "true"});
    sv("use", {href: "#ic-" + name}, s);
    return s;
  }
  function button(label, cls, ic) {
    var b = el("button", "case-toggle " + cls);
    b.type = "button";
    b.appendChild(el("span", "", label));
    if (ic) b.appendChild(icon(ic));
    return b;
  }
  function off(b, yes) { b.setAttribute("aria-disabled", yes ? "true" : "false"); b.classList.toggle("is-dim", !!yes); }
  function flash(node) {
    if (reduce) return;
    node.classList.remove("flash"); void node.getBoundingClientRect(); node.classList.add("flash");
  }
  // a number rolls from its old value to its new one, then flashes amber once
  function roll(p, key, from, to, paint) {
    if (p.rolls[key]) cancelAnimationFrame(p.rolls[key]);
    if (reduce || from === to || from == null) { paint(to); return; }
    var t0 = performance.now();
    (function frame(t) {
      var k = Math.min(1, (t - t0) / 420), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      paint(v);
      if (k < 1) p.rolls[key] = requestAnimationFrame(frame);
    })(t0);
  }

  // a switch drawn into the scene: one pressable segment per setting, the published one marked
  function drawSwitch(p, parent, layer, x, y) {
    var g = sv("g", {"class": "switch"}, parent), segs = [], cx = 2;
    var bg = sv("rect", {x: x, y: y, height: 30, rx: 15, "class": "switch-bg"}, g);
    layer.options.forEach(function (o) {
      var w = Math.ceil(wide(o[1], 12.5, 700)) + 26;
      var s = sv("g", {"class": "seg", role: "button", tabindex: "0", "aria-label": layer.name + ": " + o[1]}, g);
      sv("rect", {x: x + cx, y: y + 2, width: w, height: 26, rx: 13, "class": "seg-on"}, s);
      sv("rect", {x: x + cx - 2, y: y - 2, width: w + 4, height: 34, rx: 17, "class": "seg-ring"}, s);
      tx(s, x + cx + w / 2, y + 19.5, o[1], "seg-t", "middle");
      if (o[0] === layer.pub) tx(g, x + cx + w / 2, y + 46, p.d.words.pub, "pub", "middle");
      press(s, function () { choose(p, layer.key, o[0]); });
      segs.push({v: o[0], g: s});
      cx += w;
    });
    bg.setAttribute("width", cx + 2);
    p.switches.push({key: layer.key, segs: segs});
    return {g: g, w: cx + 4};
  }
  function switchWidth(layer) {
    return layer.options.reduce(function (a, o) { return a + Math.ceil(wide(o[1], 12.5, 700)) + 26; }, 6);
  }
  function press(g, fn) {
    g.addEventListener("click", function (e) { e.stopPropagation(); if (!g.closest(".dim")) fn(); });
    g.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && !g.closest(".dim")) { e.preventDefault(); fn(); }
    });
  }
  // a part of the drawing the reader has not stepped back to yet is drawn, dim; stepping back lights it in place
  function lit(e, on) { e.classList.toggle("dim", !on); }
  function tipOn(p, node, text) { node.setAttribute("data-tip", text); node.classList.add("named"); p.named.push(node); }

  // ---------- DECONSTRUCT-01: the tile on three sieves, the contacts as dots ----------
  var SCENES = {};
  SCENES["01"] = {
    build: function (p, svg, W) {
      var d = p.d, G = p.g = {}, L = d.layers;
      // the columns: twenty, two contacts deep; a person entered twice keeps both records in one column
      var seen = {}, twinOf = {}, order = [];
      d.rows.forEach(function (r, i) { if (seen[r.email] != null) twinOf[i] = seen[r.email]; else seen[r.email] = i; });
      d.rows.forEach(function (r, i) {
        if (twinOf[i] != null) return;
        order.push(i);
        Object.keys(twinOf).forEach(function (j) { if (twinOf[j] === i) order.push(+j); });
      });
      G.twinOf = twinOf;
      var cols = Math.ceil(order.length / 2), x0 = 22, sx = (W - 44) / (cols - 1);
      G.r = Math.min(6, sx * 0.3);
      G.slot = {};
      order.forEach(function (i, k) { G.slot[i] = [x0 + Math.floor(k / 2) * sx, k % 2]; });
      // the tile
      var tw = Math.min(280, W - 40), tl = (W - tw) / 2;
      G.tile = sv("g", {"class": "part"}, svg);
      sv("rect", {x: tl, y: 0, width: tw, height: 118, rx: 14, "class": "card"}, G.tile);
      tx(G.tile, tl + 22, 30, d.out.label, "t-label");
      G.big = tx(G.tile, tl + 19, 86, "", "t-big");
      G.sub = tx(G.tile, tl + 22, 106, "", "t-sub");
      // three plates, each a bar with a hole under every column, its lever at the plate's end
      var rest = 2 * G.r * 2 + 8, y = 118 + 18 + rest;
      G.plates = [];
      G.levers = [];
      for (var k = 0; k < 3; k++) {
        var lay = L[k], g = sv("g", {"class": "part plate"}, svg);
        sv("rect", {x: 6, y: y, width: W - 12, height: 18, rx: 6, "class": "plate-body"}, g);
        for (var c = 0; c < cols; c++) sv("rect", {x: x0 + c * sx - G.r - 1.5, y: y + 4, width: 2 * G.r + 3, height: 10, rx: 4, "class": "hole"}, g);
        tx(g, 10, y + 37, (k + 1) + " back", "k");
        tx(g, 58, y + 37, lay.name, "t-name");
        G.levers.push(lever(p, g, lay, W - 8, y + 18));
        G.plates.push({g: g, y: y});
        y += 18 + 44 + rest;
      }
      // the tray the 40 contacts wait in
      G.trayY = y + 2;
      G.tray = sv("g", {"class": "part"}, svg);
      sv("rect", {x: 6, y: G.trayY, width: W - 12, height: 4 * G.r + 22, rx: 10, "class": "tray"}, G.tray);
      tx(G.tray, 10, G.trayY - 8, "4 back", "k");
      p.H = G.trayY + 4 * G.r + 28;
      // a thread joins two records of one person; drawn as one, they share a ring
      G.threads = {}; G.rings = {};
      Object.keys(twinOf).forEach(function (j) {
        G.threads[j] = sv("path", {"class": "thread"}, svg);
        G.rings[j] = sv("circle", {r: G.r + 4, "class": "ring"}, svg);
      });
      G.sameLabel = tx(svg, 0, 0, d.words.same, "same", "middle");
      G.dots = d.rows.map(function (r) {
        var c = sv("circle", {r: G.r, "class": "dot"}, svg);
        tipOn(p, c, fill(d.words.tip, Object.assign({}, r, {qualified: r.qualified || d.blank.qualified})));
        return c;
      });
      G.pulse = G.levers[0].g;
    },
    update: function (p, o) {
      var d = p.d, G = p.g, c = p.c, depth = p.depth, r = G.r;
      var pass = OUT["01"].out({count: "records", word: c.word, date: c.date}, d).lit, counted = o.lit;
      var Q = d.quarter, people = c.count === "people";
      // which plate stops each contact: none (it rises to the tile), the qualified plate, or the date plate
      var level = d.rows.map(function (row) {
        if (pass.indexOf(row.id) >= 0) return 0;
        var date = c.date === "qualified" ? row.qualified : row.created;
        return !date || Q.indexOf(date.split(" ")[1]) < 0 ? 3 : 2;
      });
      G.plates.forEach(function (pl, k) { lit(pl.g, depth > k); });
      lit(G.tray, depth === 0 || depth >= 4);
      G.levers.forEach(function (lv) { lv.set(c[lv.key]); });
      var restY = function (plate, lane) { return G.plates[plate].y - r - 1 - lane * (2 * r + 3); };
      var trayY = function (lane) { return G.trayY + r + 7 + lane * (2 * r + 6); };
      var at = {};
      d.rows.forEach(function (row, i) {
        var s = G.slot[i], home = depth === 0 || depth >= 4;
        var lane = s[1];
        if (!home && people && level[i] === 0 && G.twinOf[i] != null && level[G.twinOf[i]] === 0) lane = 0;   // drawn as one with its twin
        at[i] = [s[0], home ? trayY(s[1]) : restY(level[i] === 0 ? 0 : level[i] - 1, lane)];
        var dot = G.dots[i], on = depth >= 4 ? counted.indexOf(row.id) >= 0 : depth > 0 && level[i] === 0 && !(people && lane !== s[1]);
        if (p.shown.dots && p.shown.dots[i] !== on) flash(dot);
        dot.classList.toggle("lit", on);
        move(dot, at[i][0], at[i][1]);
      });
      p.shown.dots = d.rows.map(function (row, i) { return G.dots[i].classList.contains("lit"); });
      // threads for the people entered twice, side by side on top of the first plate; a ring when they are one
      var labelled = false;
      Object.keys(G.threads).forEach(function (j) {
        var a = at[G.twinOf[j]], b = at[j], both = depth >= 1 && depth < 4 && level[j] === 0 && level[G.twinOf[j]] === 0;
        var thread = both && !people;
        if (thread) {
          G.threads[j].setAttribute("d", "M" + (a[0] + r + 1) + " " + a[1] + " Q" + (a[0] + r + 9) + " " + (a[1] + b[1]) / 2 + " " + (b[0] + r + 1) + " " + b[1]);
          if (!labelled) { G.sameLabel.setAttribute("x", a[0] + 30); G.sameLabel.setAttribute("y", b[1] - r - 6); labelled = true; }
        }
        show(G.threads[j], thread);
        move(G.rings[j], a[0], a[1]);
        show(G.rings[j], both && people);
      });
      show(G.sameLabel, labelled);
      // the tile
      var from = p.shown.big == null ? null : +p.shown.big;
      roll(p, "big", from, +o.big, function (v) { G.big.textContent = v; });
      if (p.shown.big != null && p.shown.big !== o.big) flash(G.big);
      G.sub.textContent = o.sub;
      p.shown.big = o.big;
      p.svg.setAttribute("height", p.H * p.k);
    }
  };
  // a two-position lever at a plate's end: its two settings either side of a slot, the knob on the one in force
  function lever(p, parent, layer, right, y) {
    var g = sv("g", {"class": "lever"}, parent), o = layer.options, segs = [];
    var wB = wide(o[1][1], 12, 700), wA = wide(o[0][1], 12, 700), track = 34;
    var xB = right - wB, xT = xB - 10 - track, xA = xT - 10;
    sv("rect", {x: xT + track / 2 - 1.5, y: y, width: 3, height: 9, "class": "stem"}, g);
    var t = sv("g", {"class": "seg lever-track", role: "button", tabindex: "0", "aria-label": layer.name + ": switch"}, g);
    sv("rect", {x: xT, y: y + 9, width: track, height: 14, rx: 7, "class": "slot"}, t);
    var knob = sv("circle", {cx: 0, cy: y + 16, r: 8.5, "class": "knob"}, t);
    press(t, function () { choose(p, layer.key, p.c[layer.key] === o[0][0] ? o[1][0] : o[0][0]); });
    [[o[0], xA, "end"], [o[1], xB, "start"]].forEach(function (s) {
      var sg = sv("g", {"class": "seg lever-side", role: "button", tabindex: "0", "aria-label": layer.name + ": " + s[0][1]}, g);
      var w = wide(s[0][1], 12, 700);
      sv("rect", {x: s[2] === "end" ? s[1] - w - 4 : s[1] - 4, y: y + 4, width: w + 8, height: 24, "class": "hit"}, sg);
      tx(sg, s[1], y + 20, s[0][1], "lever-t", s[2]);
      if (s[0][0] === layer.pub) tx(g, s[2] === "end" ? s[1] - w / 2 : s[1] + w / 2, y + 36, p.d.words.pub, "pub", "middle");
      press(sg, function () { choose(p, layer.key, s[0][0]); });
      segs.push({v: s[0][0], g: sg});
    });
    p.switches.push({key: layer.key, segs: segs});
    return {g: g, key: layer.key, set: function (v) { move(knob, v === o[0][0] ? xT + 8 : xT + track - 8, 0); }};
  }

  // ---------- DECONSTRUCT-02: the arrivals board on a scale of delay minutes ----------
  function minutes(s) {
    if (s === "on the minute") return 0;
    var m = /^(\d+) (late|early)$/.exec(s);
    return m ? (m[2] === "late" ? +m[1] : -m[1]) : null;
  }
  SCENES["02"] = {
    build: function (p, svg, W) {
      var d = p.d, G = p.g = {}, L = d.layers, w = d.words;
      var bw = Math.min(400, W - 16), bl = (W - bw) / 2;
      G.board = sv("g", {"class": "part"}, svg);
      sv("rect", {x: bl, y: 0, width: bw, height: 140, rx: 14, "class": "board"}, G.board);
      tx(G.board, bl + 22, 28, w.board, "b-small");
      tx(G.board, bl + 22, 50, d.out.label, "b-label");
      G.tiles = sv("g", {}, G.board); G.tilesX = bl + 22; G.flapW = bw < 400 ? 40 : 46;
      G.flights = tx(G.board, bl + Math.min(196, bw - 150), 98, "", "b-count");
      tx(G.board, bl + Math.min(196, bw - 150), 117, w.arrived, "b-small");
      // the scale
      var x0 = 20, x1 = W - 76, zx = W - 62, ax = 336;
      var X = G.X = function (m) { return x0 + (m + 10) * (x1 - x0) / 70; };
      G.ax = ax; G.zx = zx;
      G.scale = sv("g", {"class": "part"}, svg);
      G.band = sv("rect", {x: x0, y: 200, width: x1 - x0, height: ax - 200, "class": "band"}, G.scale);
      G.ruleWords = [tx(G.scale, x0 + 8, 218, w.onTime, "s-on"), tx(G.scale, x1 - 6, 218, w.late, "s-late", "end")];
      sv("line", {x1: x0, y1: ax, x2: x1, y2: ax, "class": "axis"}, G.scale);
      [0, 15, 30, 45, 60].forEach(function (m) {
        sv("line", {x1: X(m), y1: ax, x2: X(m), y2: ax + 5, "class": "axis"}, G.scale);
        tx(G.scale, X(m), ax + 19, String(m), "s-tick", "middle");
      });
      tx(G.scale, x0 + 2, ax + 19, w.early, "s-tick");
      G.caption = tx(G.scale, (x0 + x1) / 2, ax + 37, "", "s-cap", "middle");
      sv("line", {x1: zx - 8, y1: 204, x2: zx - 8, y2: ax + 6, "class": "zone"}, G.scale);
      tx(G.scale, zx + 26, ax + 19, w.never[0], "s-tick", "middle");
      tx(G.scale, zx + 26, ax + 32, w.never[1], "s-tick", "middle");
      G.leftOut = tx(G.scale, zx + 26, 194, w.leftOut, "s-tick", "middle");
      // the rule: a line the reader moves to 0, 15 or 30
      G.rule = sv("g", {"class": "rule"}, G.scale);
      sv("rect", {x: -14, y: 196, width: 28, height: 44, rx: 6, "class": "grab"}, G.rule);
      sv("line", {x1: 0, y1: 196, x2: 0, y2: ax + 4}, G.rule);
      // the line drags: it snaps to the nearest of its three places as it moves
      G.rule.addEventListener("pointerdown", function (e) {
        if (p.depth < 1) return;
        e.preventDefault(); mine(p); G.rule.setPointerCapture(e.pointerId); G.rule.classList.add("held");
        var to = function (ev) {
          var x = (ev.clientX - p.svg.getBoundingClientRect().left) / p.k, best = null;
          L[0].options.forEach(function (o) { if (best === null || Math.abs(X(+o[0]) - x) < Math.abs(X(+best) - x)) best = o[0]; });
          choose(p, "rule", best);
        };
        var up = function (ev) { to(ev); G.rule.classList.remove("held"); G.rule.removeEventListener("pointermove", to); G.rule.removeEventListener("pointerup", up); };
        G.rule.addEventListener("pointermove", to); G.rule.addEventListener("pointerup", up);
      });
      G.handles = [];
      var seg = G.handles = sv("g", {"class": "switch part"}, G.scale), segs = [];
      L[0].options.forEach(function (o) {
        var cx = X(+o[0]), hw = Math.min(60, X(15) - X(0) - 6), s = sv("g", {"class": "seg handle", role: "button", tabindex: "0", "aria-label": L[0].name + ": " + o[1]}, seg);
        sv("rect", {x: cx - hw / 2, y: 170, width: hw, height: 26, rx: 13, "class": "seg-on"}, s);
        sv("rect", {x: cx - hw / 2, y: 170, width: hw, height: 26, rx: 13, "class": "seg-off"}, s);
        sv("rect", {x: cx - hw / 2 - 2, y: 168, width: hw + 4, height: 30, rx: 15, "class": "seg-ring"}, s);
        tx(s, cx, 187, hw >= 54 ? fill(w.min, {m: o[0]}) : o[0], "seg-t", "middle");
        if (o[0] === L[0].pub) tx(seg, cx, 160, w.pub, "pub", "middle");
        press(s, function () { choose(p, "rule", o[0]); });
        segs.push({v: o[0], g: s});
      });
      p.switches.push({key: "rule", segs: segs});
      G.pulse = seg;
      tx(G.scale, W - 8, 160, "1 back · " + L[0].name, "k", "end");
      G.edge = sv("g", {"class": "edge"}, G.scale);
      sv("path", {d: "M6 -5 L20 -22", "class": "leader"}, G.edge);
      tx(G.edge, 22, -25, w.edge, "s-note");
      // the two layers under the scale: never arrived, and where it is measured
      var y = ax + 62;
      G.rows = [1, 2].map(function (k) {
        var lay = L[k], swW = switchWidth(lay);
        var stacked = wide(lay.name, 13.5, 700) + 70 + swW + 16 > W, h = stacked ? 74 : 44;
        var g = sv("g", {"class": "part"}, svg);
        sv("rect", {x: 0, y: y, width: W, height: h, rx: 10, "class": "plate-body"}, g);
        tx(g, 14, y + 27, (k + 1) + " back", "k");
        tx(g, 64, y + 27, lay.name, "t-name");
        drawSwitch(p, g, lay, stacked ? 14 : W - 6 - swW, stacked ? y + 36 : y + 7);
        var r = {g: g, y: y, h: h};
        y += h + 26;
        return r;
      });
      G.floor = sv("g", {"class": "part"}, svg);
      tx(G.floor, 14, y + 4, "4 back", "k");
      tx(G.floor, 64, y + 4, L[3].name, "t-name");
      p.H = y + 16;
      G.dots = d.rows.map(function (r) {
        var c = sv("circle", {r: 6.5, "class": "dot"}, svg);
        var tpl = minutes(r.arr) !== null ? w.tip : r.dep === "Cancelled" ? w.tipCancelled : w.tipDiverted;
        tipOn(p, c, fill(tpl, r));
        return c;
      });
      svg.appendChild(G.rule);
    },
    update: function (p, o) {
      var d = p.d, G = p.g, c = p.c, depth = p.depth, w = d.words;
      var landed = p.landed !== false;
      show(G.rule, depth >= 1); lit(G.handles, depth >= 1);
      G.ruleWords.forEach(function (t) { show(t, depth >= 1); });
      G.rows.forEach(function (r, k) { lit(r.g, depth >= k + 2); });
      lit(G.floor, depth >= 4);
      // the rule and the band of on-time minutes
      var lx = G.X(+c.rule);
      move(G.rule, lx, 0);
      G.band.style.transform = "scaleX(" + (depth >= 1 ? (lx - G.X(-10)) / (G.X(60) - G.X(-10)) : 0) + ")";
      G.caption.textContent = w.axis[c.at];
      show(G.leftOut, c.never === "out");
      // the flights, placed by their delay and stacked where they meet; those that never arrived at the far end
      var placed = [], never = 0, order = d.rows.map(function (r, i) { return i; });
      var m = d.rows.map(function (r) { var a = minutes(r.arr); return a === null ? null : minutes(c.at === "arrival" ? r.arr : r.dep); });
      order.sort(function (a, b) { return (m[a] == null ? 999 : m[a]) - (m[b] == null ? 999 : m[b]); });
      order.forEach(function (i) {
        var dot = G.dots[i], at;
        if (m[i] == null) {
          at = c.never === "out" ? [G.zx + 6 + never * 20, 212] : [G.zx + 6 + never * 20, G.ax - 9];
          never++;
          dot.classList.add("hollow"); dot.classList.toggle("gone", c.never === "out");
        } else {
          var x = G.X(m[i]), lv = 0;
          while (placed.some(function (q) { return Math.abs(q[0] - x) < 12.5 && q[1] === lv; })) lv++;
          placed.push([x, lv]);
          at = [x, G.ax - 9 - lv * 14];
          if (d.rows[i].arr === "15 late" && c.at === "arrival") { move(G.edge, at[0], at[1]); }
        }
        move(dot, at[0], landed ? at[1] : 150);
        show(dot, landed);
        var on = depth >= 1 && o.lit.indexOf(d.rows[i].id) >= 0;
        if (p.shown.dots && p.shown.dots[i] !== on) flash(dot);
        dot.classList.toggle("lit", on);
      });
      show(G.edge, depth >= 1 && c.rule === "15" && c.at === "arrival");
      p.shown.dots = G.dots.map(function (x) { return x.classList.contains("lit"); });
      // the board
      var pct = parseInt(o.big, 10), from = p.shown.pct;
      roll(p, "pct", from, pct, function (v) { paintTiles(G, String(v) + "%"); });
      var counts = /^(\d+) of (\d+)/.exec(o.sub);
      G.flights.textContent = fill(w.flights, {on: counts[1], of: counts[2]});
      if (from != null && from !== pct) { Array.prototype.forEach.call(G.tiles.querySelectorAll("text"), flash); flash(G.flights); }
      p.shown.pct = pct;
      p.svg.setAttribute("height", p.H * p.k);
    }
  };
  function paintTiles(G, s) {
    while (G.tiles.childNodes.length > s.length * 3) G.tiles.removeChild(G.tiles.lastChild);
    var fw = G.flapW;
    while (G.tiles.childNodes.length < s.length * 3) {
      var k = G.tiles.childNodes.length / 3, x = G.tilesX + k * (fw + 6);
      sv("rect", {x: x, y: 62, width: fw, height: 62, rx: 7, "class": "flap"}, G.tiles);
      sv("text", {x: x + fw / 2, y: 109, "class": fw < 46 ? "flap-t small" : "flap-t", "text-anchor": "middle"}, G.tiles);
      sv("line", {x1: x, y1: 93, x2: x + fw, y2: 93, "class": "flap-l"}, G.tiles);
    }
    for (var k = 0; k < s.length; k++) G.tiles.childNodes[k * 3 + 1].textContent = s[k];
  }

  // ---------- DECONSTRUCT-03: the row, the gate under it, the sentence under that ----------
  SCENES["03"] = {
    build: function (p, svg, W) {
      var d = p.d, G = p.g = {}, R = d.record, w = d.words, L = d.layers;
      var narrow = W < 470;
      G.narrow = narrow;
      // the row, drawn as the tracker draws it
      G.card = sv("g", {"class": "part"}, svg);
      var ch = narrow ? 172 : 124;
      G.cardBg = sv("rect", {x: 0, y: 0, width: W, height: ch, rx: 12, "class": "card"}, G.card);
      G.id = tx(G.card, 16, 22, "", "mono-s");
      var col = narrow ? {owner: [16, 44], due: [W - 150, 44], status: [W - 64, 44], action: [16, 102]}
                       : {owner: [16, 44], action: [W * 0.3, 44], due: [W * 0.7, 44], status: [W * 0.85, 44]};
      G.col = col;
      d.fields.forEach(function (f) { tx(G.card, col[f[0]][0], col[f[0]][1], f[1], "f-label"); });
      G.owner = tx(G.card, 16, col.owner[1] + 22, "", "f-owner");
      G.company = tx(G.card, 16, col.owner[1] + 40, "", "f-sub");
      G.action = [0, 1, 2].map(function (k) { return tx(G.card, col.action[0], col.action[1] + 22 + k * 17, "", "f-val"); });
      G.actionW = narrow ? W - 32 : W * 0.38;
      G.due = tx(G.card, col.due[0], col.due[1] + 22, "", "f-val f-due");
      G.chip = sv("rect", {x: col.status[0] - 2, y: col.status[1] + 8, height: 21, rx: 10.5, "class": "chip"}, G.card);
      G.status = tx(G.card, col.status[0] + 8, col.status[1] + 23, "", "chip-t");
      // threads from each cell down to the gate
      var gy = ch + 54;
      G.gate = sv("g", {"class": "part"}, svg);
      G.threads = [["owner", 40], ["action", narrow ? W * 0.45 : W * 0.3 + 40], ["due", col.due[0] + 30], ["status", col.status[0] + 20]].map(function (t) {
        G.drops = G.drops || [];
        G.drops.push(sv("line", {x1: t[1], y1: ch, x2: t[1], y2: gy + 4, "class": "thread-m drop"}, svg));
        sv("circle", {cx: t[1], cy: ch, r: 3, "class": "knot"}, G.gate);
        return t[1];
      });
      // the gate: a striped barrier with its rule, and the verdict the record carries
      var defs = sv("defs", {}, svg), pat = sv("pattern", {id: "dx-stripes", width: 14, height: 14, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)"}, defs);
      sv("rect", {width: 7, height: 14, "class": "stripe-a"}, pat); sv("rect", {x: 7, width: 7, height: 14, "class": "stripe-b"}, pat);
      sv("rect", {x: 4, y: gy - 4, width: 8, height: 48, rx: 2, "class": "post"}, G.gate);
      sv("rect", {x: W - 12, y: gy - 4, width: 8, height: 48, rx: 2, "class": "post"}, G.gate);
      sv("rect", {x: 0, y: gy + 4, width: W, height: 30, rx: 7, fill: "url(#dx-stripes)"}, G.gate);
      var rs = wide(w.rule, 11.5, 700) + 28 <= W - 32 ? 11.5 : 10.5, rw = Math.min(W - 32, wide(w.rule, rs, 700) + 24);
      sv("rect", {x: (W - rw) / 2, y: gy + 9, width: rw, height: 20, rx: 5, "class": "card"}, G.gate);
      tx(G.gate, W / 2, gy + 23, fit(w.rule, rw - 10, rs, 700), rs < 11.5 ? "g-rule small" : "g-rule", "middle");
      var vy = gy + 60;
      tx(G.gate, 16, vy, "1 back · " + L[0].name, "k");
      var vx = narrow ? 16 : W * 0.48;
      if (narrow) vy += 22;
      G.check = sv("g", {"class": "check"}, G.gate);
      sv("circle", {cx: vx + 7, cy: vy - 4, r: 7.5}, G.check);
      sv("path", {d: "M" + (vx + 3.5) + " " + (vy - 3.5) + "l2.5 2.5 4.5-5"}, G.check);
      G.verdict = tx(G.gate, vx + 21, vy, "", "g-verdict");
      tx(G.gate, vx + 104, vy - 6, w.answer, "f-sub");
      G.answer = tx(G.gate, vx + 104, vy + 8, "", "g-answer");
      // the three recorded sentences, each pressable; a thread runs from the gate to the one chosen
      var tr = {}; R.transcript.lines.forEach(function (l) { tr[l.n] = l; });
      var sy = vy + 42;
      G.sentence = sv("g", {"class": "part"}, svg);
      tx(G.sentence, 16, sy, "2 back · " + L[1].name, "k");
      sy += 12;
      var segs = [];
      G.cards = L[1].options.map(function (o) {
        var v = R.variants[o[0]], h = 26 + v.lines.length * 18;
        var g = sv("g", {"class": "seg sentence", role: "button", tabindex: "0", "aria-label": L[1].name + ": " + o[1]}, G.sentence);
        sv("rect", {x: 14, y: sy, width: W - 14, height: h, rx: 10, "class": "s-card"}, g);
        tx(g, 28, sy + 17, o[1], "s-label");
        if (o[0] === L[1].pub) tx(g, W - 12, sy + 17, w.pub, "pub", "end");
        v.lines.forEach(function (n, k) { sentence(g, tr[n], 28, sy + 35 + k * 18, W - 42, v.mark); });
        press(g, function () { choose(p, "line", o[0]); });
        segs.push({v: o[0], g: g});
        var r = {v: o[0], y: sy, h: h};
        sy += h + 8;
        return r;
      });
      p.switches.push({key: "line", segs: segs});
      G.pulse = segs;
      G.link = sv("path", {"class": "thread-m strong"}, G.sentence);
      G.linkKnot = sv("circle", {r: 3.5, "class": "knot"}, G.sentence);
      G.gateY = gy;
      // the floor: the meeting as recorded, line by line, and the line that closed the row
      var fy = sy + 24;
      G.floor = sv("g", {"class": "part"}, svg);
      tx(G.floor, 16, fy, "3 back · " + L[2].name, "k");
      tx(G.floor, 16, fy + 18, fit(R.transcript.file + " · " + R.transcript.meeting + " · " + R.transcript.date, W - 32, 11, 500), "mono-s");
      fy += 26;
      G.lines = {};
      R.transcript.lines.forEach(function (l) { G.lines["L" + l.n] = line(p, G.floor, l, fy, W); fy += 24; });
      G.closers = {};
      Object.keys(R.variants).forEach(function (k) {
        var cl = R.variants[k].closer;
        if (!cl || G.closers[cl.file + cl.n]) return;
        var g = sv("g", {}, G.floor);
        tx(g, 16, fy + 20, fill(w.closedBy, {n: cl.file.slice(0, 2), line: cl.n}), "mono-s");
        G.lines["C" + cl.n] = line(p, g, cl, fy + 28, W);
        G.closers[cl.file + cl.n] = {g: g, key: k};
      });
      p.H = fy + 60;
      G.ch = ch;
    },
    update: function (p, o) {
      var d = p.d, G = p.g, c = p.c, depth = p.depth, R = d.record, w = d.words;
      var v = R.variants[c.line], r = v.row || {}, none = r.owner === "not stated";
      lit(G.gate, depth >= 1); lit(G.sentence, depth >= 2); lit(G.floor, depth >= 3);
      G.drops.forEach(function (t) { t.classList.toggle("up", depth < 1); });
      // the cells, read from the record
      var prev = p.shown.row;
      G.cardBg.classList.toggle("unowned", none);
      G.id.textContent = r.id || "";
      G.owner.textContent = r.owner || "";
      G.owner.classList.toggle("unowned", none);
      G.company.textContent = r.company || "";
      wrapLines(r.action || "", G.actionW, 12.5, 500, 3).concat(["", ""]).slice(0, 3).forEach(function (s, k) { G.action[k].textContent = s; });
      G.due.textContent = r.due || "";
      G.status.textContent = r.status || "";
      G.chip.setAttribute("width", wide(r.status || "", 11.5, 700) + 18);
      if (prev && prev !== r.id) [G.owner, G.due, G.status].concat(G.action).forEach(flash);
      p.shown.row = r.id;
      // the gate's verdict, as recorded for this line
      G.verdict.textContent = v.matched ? w.matched : w.missed;
      G.check.classList.toggle("miss", !v.matched);
      G.answer.textContent = v.expected.owner + ", " + v.expected.due;
      // the chosen sentence lit, the thread re-drawn to it
      var chosen = G.cards.filter(function (k) { return k.v === c.line; })[0];
      G.cards.forEach(function (k, i) { p.switches[0].segs[i].g.classList.toggle("on", k.v === c.line); });
      var mid = chosen.y + chosen.h / 2;
      var path = "M8 " + (G.gateY + 38) + " L8 " + (mid - 8) + " Q8 " + mid + " 14 " + mid;
      if (G.link.getAttribute("d") !== path) { G.link.setAttribute("d", path); flash(G.link); }
      G.linkKnot.setAttribute("cx", 14); G.linkKnot.setAttribute("cy", mid);
      show(G.link, depth >= 2); show(G.linkKnot, depth >= 2);
      // the floor: the lines the row was read from lit, and the closing line when there is one
      Object.keys(G.lines).forEach(function (k) { G.lines[k].classList.toggle("lit", depth >= 3 && o.lit.indexOf(k) >= 0); });
      Object.keys(G.closers).forEach(function (k) { show(G.closers[k].g, G.closers[k].key === c.line); });
      p.svg.setAttribute("height", p.H * p.k);
    }
  };
  // a transcript line inside a sentence card, its deciding words lit
  function sentence(g, l, x, y, px, mark) {
    var t = sv("text", {x: x, y: y, "class": "s-line"}, g);
    var n = sv("tspan", {"class": "s-n"}, t); n.textContent = l.n;
    var whoLit = mark && mark.line === l.n && mark.who;
    var who = sv("tspan", {dx: 8, "class": whoLit ? "s-who mark" : "s-who"}, t); who.textContent = l.who + ":";
    var room = px - wide(l.n + "  " + l.who + ": ", 12, 700) - 8;
    var said = fit(l.text, room, 12, 500), cut = mark && mark.line === l.n && mark.text && said.indexOf(mark.text) >= 0;
    var a = sv("tspan", {dx: 5}, t);
    if (cut) {
      var parts = said.split(mark.text);
      a.textContent = parts[0];
      var m = sv("tspan", {"class": "mark", dx: parts[0] ? null : 5}, t); m.textContent = mark.text;
      var b = sv("tspan", {}, t); b.textContent = parts.slice(1).join(mark.text);
    } else a.textContent = said;
  }
  // a line of the transcript on the floor, named in full on hover or tap
  function line(p, parent, l, y, W) {
    var g = sv("g", {"class": "t-line"}, parent);
    sv("rect", {x: 8, y: y + 4, width: W - 16, height: 22, rx: 6, "class": "t-hi"}, g);
    tx(g, 18, y + 19, l.n, "s-n");
    tx(g, 40, y + 19, l.who, "s-who");
    tx(g, 40 + Math.min(118, wide(l.who, 12, 700) + 12), y + 19, fit(l.text, W - 72 - Math.min(118, wide(l.who, 12, 700) + 12), 12, 500), "t-said");
    tipOn(p, g, fill(p.d.words.tip, l));
    return g;
  }

  // ---------- the engine ----------
  function build(stage) {
    var id = stage.getAttribute("data-piece"), d = DATA[id];
    if (!d || !OUT[id] || !SCENES[id]) return;
    var n = d.layers.length;
    var p = {id: id, d: d, stage: stage, depth: 0, c: pubs(d), shown: {}, rolls: {}, switches: [], named: []};
    if (id === "02" && !reduce && "IntersectionObserver" in window) p.landed = false;
    stage.textContent = "";
    if (d.record && d.record.run) {
      var run = el("p", "dx-run");
      run.appendChild(icon("circle-check"));
      var rs = el("span");
      rs.innerHTML = "From run <b>" + esc(d.record.run) + "</b>, the " + esc(d.record.tier) + ", read blind: the checker matched <b>" +
        esc(d.record.matched) + " of " + esc(d.record.of) + "</b> cases" + (d.record.decline ? " and the decline held." : ".");
      run.appendChild(rs);
      stage.appendChild(run);
    }
    var scene = el("div", "dx-scene");
    p.draw = el("div", "dx-draw");
    p.tip = el("div", "dx-tip"); p.tip.hidden = true; p.tip.setAttribute("aria-hidden", "true");
    p.draw.appendChild(p.tip);
    var ctl = el("div", "dx-controls");
    p.back = button("Step back", "dx-step back", "chevron");
    p.fwd = button("Step forward", "dx-step fwd", "chevron");
    p.reset = button("Reset", "dx-reset", "repeat");
    p.count = el("span", "dx-count");
    [p.back, p.fwd, p.reset, p.count].forEach(function (x) { ctl.appendChild(x); });
    // the words cell: one entry per step, all in one cell, so nothing below moves
    p.words = el("div", "dx-words");
    p.says = [d.met].concat(d.layers).map(function (l, k) {
      var s = el("div", "dx-say");
      s.appendChild(el("span", "dx-back", k ? k + " back" + (l.floor ? " · the floor" : "") : " "));
      s.appendChild(el("h3", "", l.name));
      s.appendChild(el("p", "dx-what", l.what));
      s.appendChild(el("p", "dx-why", l.why));
      p.words.appendChild(s);
      return s;
    });
    var left = el("div", "dx-left");
    left.appendChild(p.draw); left.appendChild(ctl);
    scene.appendChild(left); scene.appendChild(p.words);
    stage.appendChild(scene);
    d.layers.forEach(function (l) {
      if (!l.source) return;
      var sp = el("p", "dx-source"), a = el("a", "", l.source.text);
      a.href = l.source.href; a.target = "_blank"; a.rel = "noopener";
      sp.appendChild(a); stage.appendChild(sp);
    });
    // the floor as a plain table, behind a fold under the scene
    var det = el("details", "dx-table");
    var sum = el("summary", "case-toggle");
    sum.appendChild(el("span", "", d.words.table)); sum.appendChild(icon("chevron"));
    det.appendChild(sum);
    p.rowsBox = det.appendChild(el("div", "dx-rows"));
    stage.appendChild(det);
    p.say = stage.appendChild(el("p", "visually-hidden"));
    p.say.setAttribute("aria-live", "polite");

    p.back.addEventListener("click", function () { mine(p); step(p, 1); });
    p.fwd.addEventListener("click", function () { mine(p); step(p, -1); });
    p.reset.addEventListener("click", function () { mine(p); reset(p); });
    stage.addEventListener("pointerdown", function () { mine(p); });
    // a named dot or line shows its name on hover, or on a tap
    p.draw.addEventListener("pointerover", function (e) { var t = e.target.closest && e.target.closest(".named"); if (t && e.pointerType === "mouse") tip(p, t); });
    p.draw.addEventListener("pointerout", function (e) { if (e.pointerType === "mouse" && e.target.closest && e.target.closest(".named")) tip(p, null); });
    p.draw.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest(".named"); tip(p, t && p.tipFor !== t ? t : null); });

    draw(p);
    PIECES.push(p);
    play(p);
  }

  // the drawing is laid out at its own width, so its words stay readable on a phone
  function draw(p) {
    var full = Math.max(300, Math.round(p.draw.clientWidth));
    p.W = Math.min(full, 640); p.k = full / p.W; p.full = full;
    if (p.svg) p.draw.removeChild(p.svg);
    p.switches = []; p.named = []; p.shown = {};
    p.svg = sv("svg", {"class": "dx-svg is-still", width: full, role: "group", "aria-label": p.d.code});
    p.draw.insertBefore(p.svg, p.tip);
    SCENES[p.id].build(p, p.svg, p.W);
    p.svg.setAttribute("viewBox", "0 0 " + p.W + " " + p.H);
    render(p);
    requestAnimationFrame(function () { requestAnimationFrame(function () { p.svg.classList.remove("is-still"); }); });
  }

  function render(p) {
    var o = OUT[p.id].out(p.c, p.d), n = p.d.layers.length;
    SCENES[p.id].update(p, o);
    p.switches.forEach(function (s) {
      s.segs.forEach(function (sg) {
        var on = sg.v === p.c[s.key], asleep = !!sg.g.closest(".dim, .is-off");
        sg.g.setAttribute("tabindex", asleep ? "-1" : "0");
        sg.g.setAttribute("aria-disabled", asleep ? "true" : "false");
        sg.g.classList.toggle("on", on);
        sg.g.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
    Array.prototype.forEach.call(p.svg.querySelectorAll(".lever-track"), function (t) {
      var asleep = !!t.closest(".dim");
      t.setAttribute("tabindex", asleep ? "-1" : "0"); t.setAttribute("aria-disabled", asleep ? "true" : "false");
    });
    var floor = p.depth >= n;
    p.named.forEach(function (x) { x.classList.toggle("can-name", floor); });
    if (!floor) tip(p, null);
    p.says.forEach(function (s, k) { s.classList.toggle("is-on", k === p.depth); s.setAttribute("aria-hidden", k === p.depth ? "false" : "true"); });
    p.count.textContent = p.depth + " of " + n + " back";
    off(p.back, p.depth >= n);
    off(p.fwd, p.depth <= 0);
    var base = pubs(p.d);
    off(p.reset, Object.keys(p.c).every(function (k) { return p.c[k] === base[k]; }));
    p.rowsBox.textContent = "";
    p.rowsBox.appendChild(table(p, floorGroups(p.id, p.c, p.d), o.lit));
    return o;
  }

  function tip(p, node) {
    p.tipFor = node;
    if (!node || !node.classList.contains("can-name")) { p.tip.hidden = true; p.tipFor = null; return; }
    p.tip.textContent = node.getAttribute("data-tip");
    p.tip.hidden = false;
    var b = node.getBoundingClientRect(), box = p.draw.getBoundingClientRect();
    var x = b.left + b.width / 2 - box.left, tw = p.tip.offsetWidth;
    p.tip.style.left = Math.max(0, Math.min(box.width - tw, x - tw / 2)) + "px";
    p.tip.style.top = (b.top - box.top - p.tip.offsetHeight - 8) + "px";
  }

  function table(p, groups, lit) {
    var cols = p.d.columns, blank = p.d.blank || {};
    var t = el("table");
    var thead = el("thead"), hr = el("tr");
    cols.forEach(function (c) { hr.appendChild(el("th", "", c[1])); });
    thead.appendChild(hr); t.appendChild(thead);
    groups.forEach(function (g) {
      var tb = el("tbody");
      if (g.label) {
        var gr = el("tr", "dx-group"), th = el("th", "", g.label);
        th.colSpan = cols.length; th.scope = "colgroup"; gr.appendChild(th); tb.appendChild(gr);
      }
      g.rows.forEach(function (r) {
        var tr = el("tr", lit.indexOf(r.id) >= 0 ? "lit" : "");
        cols.forEach(function (c, k) {
          var v = r[c[0]];
          tr.appendChild(el(k === 0 ? "th" : "td", k === 0 ? "key" : "", v === "" && blank[c[0]] ? blank[c[0]] : v));
        });
        tb.appendChild(tr);
      });
      t.appendChild(tb);
    });
    return t;
  }

  function announce(p, text) { p.say.textContent = ""; setTimeout(function () { p.say.textContent = text; }, 30); }

  function step(p, by, quiet) {
    var n = p.d.layers.length, to = Math.max(0, Math.min(n, p.depth + by));
    if (to === p.depth) return;
    p.depth = to;
    var o = render(p), l = to ? p.d.layers[to - 1] : p.d.met;
    if (!quiet) announce(p, to ? to + " back: " + l.name + "." + (l.floor ? " " + o.litText : "") : "The output, as it stands. " + o.say);
  }
  function choose(p, key, v) {
    mine(p);
    if (p.c[key] === v) return;
    p.c[key] = v;
    announce(p, render(p).say);
  }
  function reset(p) {
    if (p.reset.getAttribute("aria-disabled") === "true") return;
    p.c = pubs(p.d);
    announce(p, "Back to as published. " + render(p).say);
  }

  // one pass on its own, the first time the scene is mostly on screen: down to the floor and back up, then it waits
  function mine(p) {
    p.taken = true;
    if (p.timer) { clearTimeout(p.timer); p.timer = null; }
    if (p.landed === false) { p.landed = true; render(p); }
  }
  // the reader lands on a choice: its switch swells once and settles
  function pulse(p) {
    var t = p.g.pulse;
    if (!t || reduce) return;
    (t.length ? t.map(function (s) { return s.g; }) : [t]).forEach(function (n, k) {
      setTimeout(function () { n.classList.remove("pulse"); void n.getBoundingClientRect(); n.classList.add("pulse"); }, k * 90);
    });
  }
  function play(p) {
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var h = e.boundingClientRect.height, seen = e.intersectionRect.height;
        if (p.played || p.taken || seen < 0.6 * Math.min(h, window.innerHeight)) return;
        p.played = true; io.disconnect();
        var n = p.d.layers.length, down = 0, first = p.landed === false ? 650 : 0;
        var stop = 1 + p.d.layers.map(function (l) { return !!l.options; }).indexOf(true);
        if (first) { p.landed = true; render(p); }
        p.timer = setTimeout(function tick() {
          if (p.taken) return;
          if (down < n) { down++; step(p, 1, true); p.timer = setTimeout(tick, down === n ? 1800 : 1100); }
          else if (p.depth > stop) { step(p, -1, true); p.timer = setTimeout(tick, 420); }
          else { p.timer = null; pulse(p); }
        }, first);
      });
    }, {threshold: [0, .2, .4, .5, .6, .7, .8, .9, 1]});
    io.observe(p.draw);
  }

  // the left and right arrows step the piece the reader is in: the one holding focus,
  // or else the one most in view. They never scroll the page and never take over a field.
  function current() {
    var a = document.activeElement, best = null, most = 0, vh = window.innerHeight;
    for (var i = 0; i < PIECES.length; i++) if (a && PIECES[i].stage.contains(a)) return PIECES[i];
    PIECES.forEach(function (p) {
      var r = p.stage.getBoundingClientRect(), seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (seen > most) { most = seen; best = p; }
    });
    return most > Math.min(200, vh / 3) ? best : null;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (t && t.closest && t.closest("nav, .dx-rows")) return;
    var p = current();
    if (!p) return;
    e.preventDefault();
    mine(p);
    step(p, e.key === "ArrowRight" ? 1 : -1);
  });
  document.addEventListener("click", function (e) {
    PIECES.forEach(function (p) { if (p.tipFor && !p.draw.contains(e.target)) tip(p, null); });
  });
  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(window.dxResize);
    window.dxResize = setTimeout(function () { PIECES.forEach(function (p) { if (Math.round(p.draw.clientWidth) !== p.full) draw(p); }); }, 150);
  });

  function start() { Array.prototype.forEach.call(document.querySelectorAll(".dx-stage[data-piece]"), build); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();
