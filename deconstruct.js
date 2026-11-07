/* Deconstruct (deconstruct.html): finished outputs taken apart a layer at a time.

   One renderer, one data block per piece. Each block is plain JSON between
   PIECE markers: its words, its layers and its rows. OUT holds each piece's one
   small function, which turns the rows and the reader's choices into the output.
   scripts/deconstruct.py reads the blocks (and runs OUT through node) to write
   the page's no-JavaScript view between the DECON markers in deconstruct.html.

   DECONSTRUCT-03's rows are the record: every name, line and cell between the
   RECORD markers is written by scripts/deconstruct.py from the meeting tracker's
   run, never by hand. Rerun the script after a new counted run.

   A fourth piece costs one PIECE block, one OUT entry and one section in the page.
   Nothing moves on its own: a layer slides in when the reader steps back, and the
   parts of the output that changed flash once when the reader changes a choice. */
(function () {
  "use strict";

  var DATA = {};

  DATA["01"] = /*PIECE:01*/{
  "code": "DECONSTRUCT-01",
  "out": {"label": "Qualified this quarter"},
  "layers": [
    {"key": "count", "name": "The count",
     "what": "What one unit on the tile is: a record in the export, or a person.",
     "why": "The same person entered twice is two records. Four people in these rows appear twice, each pair sharing one email.",
     "options": [["records", "Records"], ["people", "People"]], "pub": "records"},
    {"key": "word", "name": "The word “qualified”",
     "what": "Which contacts the word covers: anyone who ever reached the stage, or only those still in it.",
     "why": "Contacts move on after they qualify, to an opportunity, to a customer, or out. Counting only the ones still in the stage drops them.",
     "options": [["any", "Reached it at any time"], ["now", "In the stage now"]], "pub": "any"},
    {"key": "date", "name": "The date",
     "what": "Which date puts a contact inside July to September.",
     "why": "A contact created in September and qualified in October falls in one quarter by one date and in the next by the other.",
     "options": [["qualified", "Date qualified"], ["created", "Date created"]], "pub": "qualified"},
    {"key": "rows", "name": "The rows", "floor": true,
     "what": "The 40 records in the export, as it came out. The ones the tile counts are lit.",
     "why": "Nothing here is a choice: every number above is a recount of these rows."}
  ],
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
  "layers": [
    {"key": "rule", "name": "The rule",
     "what": "How late a flight can be and still count as on time.",
     "why": "One public reporting body counts a flight as on time when it arrives less than 15 minutes after schedule, so at 15 minutes it is late. A stricter or looser line moves flights across it.",
     "options": [["15", "Under 15 minutes late"], ["0", "Not late at all"], ["30", "Under 30 minutes late"]], "pub": "15",
     "source": {"text": "Source: Bureau of Transportation Statistics, how flight delays are calculated", "href": "https://www.bts.gov/explore-topics-and-geography/topics/airline-time-performance-and-causes-flight-delays"}},
    {"key": "never", "name": "The flights that never arrived",
     "what": "What happens to the two cancelled flights and the one diverted flight.",
     "why": "Counted, they stay in the total as not on time. Left out, the total shrinks and the rate rises.",
     "options": [["counted", "Counted as not on time"], ["out", "Left out"]], "pub": "counted"},
    {"key": "at", "name": "Where it is measured",
     "what": "Which moment is timed: arrival at the gate, or departure from it.",
     "why": "Flights make up time in the air and lose it on the ground, so a late departure can still arrive on time, and the reverse.",
     "options": [["arrival", "At arrival"], ["departure", "At departure"]], "pub": "arrival"},
    {"key": "rows", "name": "The rows", "floor": true,
     "what": "The 24 flights in June, as scheduled and as flown. The ones counted on time are lit.",
     "why": "Nothing here is a choice: every rate above is a recount of these rows."}
  ],
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
  "fields": [["action", "Action"], ["owner", "Owner"], ["due", "Due"], ["status", "Status"]],
  "layers": [
    {"key": "gate", "name": "The gate", "live": true,
     "what": "The checker that compares every row with the answer written before the first run, and the rule the row was made under: an owner only when the transcript names the person in the same sentence, and “not stated” for every blank.",
     "why": "The rule decides what goes in the owner cell; the checker shows whether the row kept to it."},
    {"key": "line", "name": "The sentence",
     "what": "How the line in the transcript names, or does not name, who will do the work. Three lines from the same meeting, each phrased one way.",
     "why": "A name in the same sentence makes an owner. A name one line later, or no name at all, leaves the owner “not stated”, and the row is still kept, because an unowned action is the one most worth chasing.",
     "options": [["same", "Name in the same sentence"], ["next", "Name in the next sentence"], ["none", "No name"]], "pub": "same"},
    {"key": "transcript", "name": "The transcript", "floor": true,
     "what": "The meeting as it was recorded, line by line. The line the row was read from is lit.",
     "why": "The row can only say what these lines say."}
  ],
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

  // ---------- the renderer ----------
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PIECES = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function icon(name) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "ic"); s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#ic-" + name); s.appendChild(u);
    return s;
  }
  function button(label, cls, ic) {
    var b = el("button", "case-toggle " + cls);
    b.type = "button";
    b.appendChild(el("span", "", label));
    if (ic) b.appendChild(icon(ic));
    return b;
  }
  function off(b, yes) { b.setAttribute("aria-disabled", yes ? "true" : "false"); b.classList.toggle("is-off", !!yes); }
  function flash(node) {
    if (reduce) return;
    node.classList.remove("flash"); void node.offsetWidth; node.classList.add("flash");
  }

  function build(stage) {
    var id = stage.getAttribute("data-piece"), d = DATA[id];
    if (!d || !OUT[id]) return;
    var p = {id: id, d: d, stage: stage, depth: 0, c: pubs(d), parts: {}};
    var layers = d.layers;
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

    // the output and the buttons, pinned while the layers are read
    var pin = el("div", "dx-pin");
    var card = el("div", "dx-out");
    card.appendChild(el("div", "dx-label", d.out.label));
    if (d.fields) {
      var dl = el("dl", "dx-cells");
      d.fields.forEach(function (f) {
        var w = el("div", "dx-cell " + f[0]);
        w.appendChild(el("dt", "", f[1]));
        p.parts[f[0]] = w.appendChild(el("dd"));
        dl.appendChild(w);
      });
      card.appendChild(dl);
    } else {
      p.parts.big = card.appendChild(el("div", "dx-big"));
    }
    p.parts.sub = card.appendChild(el("div", "dx-sub"));
    pin.appendChild(card);

    var ctl = el("div", "dx-controls");
    p.back = button("Step back", "dx-step back", "chevron");
    p.fwd = button("Step forward", "dx-step fwd", "chevron");
    p.reset = button("Reset", "dx-reset", "repeat");
    p.count = el("span", "dx-count");
    [p.back, p.fwd, p.reset, p.count].forEach(function (x) { ctl.appendChild(x); });
    pin.appendChild(ctl);
    stage.appendChild(pin);

    p.hint = stage.appendChild(el("p", "dx-hint", "Step back to see what this result rests on."));

    // the layers, numbered from the output
    var ol = el("ol", "dx-layers");
    p.items = layers.map(function (l, k) {
      var li = el("li", "dx-layer" + (l.floor ? " floor" : ""));
      li.hidden = true;
      var head = el("div", "dx-lh");
      head.appendChild(el("span", "dx-back", (k + 1) + " back" + (l.floor ? " · the floor" : "")));
      head.appendChild(el("h3", "", l.name));
      li.appendChild(head);
      li.appendChild(el("p", "dx-what", l.what));
      li.appendChild(el("p", "dx-why", l.why));
      if (l.options) {
        var g = el("div", "dx-opts");
        g.setAttribute("role", "group"); g.setAttribute("aria-label", l.name);
        l.options.forEach(function (o) {
          var b = el("button", "dx-opt");
          b.type = "button"; b.setAttribute("data-v", o[0]);
          b.appendChild(el("span", "", o[1]));
          if (o[0] === l.pub) b.appendChild(el("span", "dx-pub", "as published"));
          b.addEventListener("click", function () { choose(p, l.key, o[0]); });
          g.appendChild(b);
        });
        li.appendChild(g);
      }
      if (l.source) {
        var sp = el("p", "dx-src"), a = el("a", "", l.source.text);
        a.href = l.source.href; a.target = "_blank"; a.rel = "noopener";
        sp.appendChild(a); li.appendChild(sp);
      }
      if (l.live) p.parts["live-" + l.key] = li.appendChild(el("div", "dx-live"));
      if (l.floor) {
        p.parts.litText = li.appendChild(el("p", "dx-lit"));
        p.parts.rows = li.appendChild(el("div", "dx-rows"));
      }
      ol.appendChild(li);
      return li;
    });
    stage.appendChild(ol);

    p.say = stage.appendChild(el("p", "visually-hidden"));
    p.say.setAttribute("aria-live", "polite");

    p.back.addEventListener("click", function () { step(p, 1); });
    p.fwd.addEventListener("click", function () { step(p, -1); });
    p.reset.addEventListener("click", function () { reset(p); });

    render(p, false);
    PIECES.push(p);
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

  function render(p, changed) {
    var o = OUT[p.id].out(p.c, p.d), parts = p.parts;
    function put(node, text) {
      if (node.textContent === text) return;
      node.textContent = text;
      if (changed) flash(node);
    }
    if (o.cells) Object.keys(o.cells).forEach(function (k) { put(parts[k], o.cells[k]); });
    else put(parts.big, o.big);
    put(parts.sub, o.sub || "");
    if (o.live) Object.keys(o.live).forEach(function (k) { if (parts["live-" + k]) parts["live-" + k].innerHTML = o.live[k]; });
    if (parts.rows) {
      parts.litText.textContent = o.litText;
      parts.rows.textContent = "";
      parts.rows.appendChild(table(p, floorGroups(p.id, p.c, p.d), o.lit));
    }
    // the choices, the as-published mark and the buttons
    p.items.forEach(function (li, k) {
      var l = p.d.layers[k];
      if (!l.options) return;
      Array.prototype.forEach.call(li.querySelectorAll(".dx-opt"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-v") === p.c[l.key] ? "true" : "false");
      });
    });
    var n = p.d.layers.length;
    p.count.textContent = p.depth + " of " + n + " back";
    off(p.back, p.depth >= n);
    off(p.fwd, p.depth <= 0);
    var same = Object.keys(p.c).every(function (k) { return p.c[k] === pubs(p.d)[k]; });
    off(p.reset, same);
    p.hint.hidden = p.depth > 0;
    return o;
  }

  function announce(p, text) { p.say.textContent = ""; setTimeout(function () { p.say.textContent = text; }, 30); }

  function step(p, by) {
    var n = p.d.layers.length, to = Math.max(0, Math.min(n, p.depth + by));
    if (to === p.depth) return;
    if (by > 0) {
      var li = p.items[to - 1];
      li.hidden = false;
      if (!reduce) { li.classList.remove("in"); void li.offsetWidth; li.classList.add("in"); }
    } else {
      p.items[p.depth - 1].hidden = true;
    }
    p.depth = to;
    var o = render(p, false), l = p.d.layers[to - 1];
    announce(p, to ? to + " back: " + l.name + "." + (l.floor ? " " + o.litText : "") : "The output, as it stands. " + o.say);
  }

  function choose(p, key, v) {
    if (p.c[key] === v) return;
    p.c[key] = v;
    announce(p, render(p, true).say);
  }

  function reset(p) {
    if (p.reset.getAttribute("aria-disabled") === "true") return;
    p.c = pubs(p.d);
    announce(p, "Back to as published. " + render(p, true).say);
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
    step(p, e.key === "ArrowRight" ? 1 : -1);
  });

  Array.prototype.forEach.call(document.querySelectorAll(".dx-stage[data-piece]"), build);
})();
