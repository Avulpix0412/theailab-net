// "You are here" indicator + "This Week" rail card for the homepage.
// Scoped to index.html only (the map only exists there) — see
// docs/design-spec_phase2_website-revision_v1_20260903.md (Part 3b) and
// docs/design-spec_phase3_website-revision_v1_20260903.md (Part 2.3-2.5).
//
// Reading the current date can't be done in CSS/HTML alone, so this file
// hardcodes each week's real first-session date (from weeks/week-NN.html)
// and the college's recess date ranges, highlights the matching node on the
// SVG map, and mirrors the same state into the "This Week" rail card. These
// tables will go stale if the schedule or the academic calendar changes —
// keep them in sync with weeks/week-NN.html and the official Kenyon
// academic calendar.

(function () {
  var WEEK_START_DATES = [
    "2026-08-27", // Week 1
    "2026-09-01", // Week 2
    "2026-09-08", // Week 3
    "2026-09-15", // Week 4
    "2026-09-22", // Week 5
    "2026-09-29", // Week 6
    "2026-10-06", // Week 7 (single session, October Break)
    "2026-10-13", // Week 8
    "2026-10-20", // Week 9
    "2026-10-27", // Week 10
    "2026-11-03", // Week 11
    "2026-11-10", // Week 12
    "2026-11-17", // Week 13
    "2026-12-01", // Week 14 (after Thanksgiving Recess)
    "2026-12-08"  // Week 15
  ];

  var BREAKS = [
    { start: "2026-10-08", end: "2026-10-09", name: "October Break" },
    { start: "2026-11-21", end: "2026-11-29", name: "Thanksgiving Recess" }
  ];

  var ETHICS_WEEKS = [3, 8, 12];

  function currentWeekNumber(dateStr) {
    if (dateStr < WEEK_START_DATES[0]) return null;
    var week = null;
    for (var i = 0; i < WEEK_START_DATES.length; i++) {
      if (dateStr >= WEEK_START_DATES[i]) week = i + 1;
    }
    return week;
  }

  function activeBreak(dateStr) {
    for (var i = 0; i < BREAKS.length; i++) {
      if (dateStr >= BREAKS[i].start && dateStr <= BREAKS[i].end) return BREAKS[i];
    }
    return null;
  }

  function nodeCenter(node) {
    return node.tagName === "rect"
      ? {
          x: parseFloat(node.getAttribute("x")) + parseFloat(node.getAttribute("width")) / 2,
          y: parseFloat(node.getAttribute("y")) + parseFloat(node.getAttribute("height")) / 2
        }
      : { x: parseFloat(node.getAttribute("cx")), y: parseFloat(node.getAttribute("cy")) };
  }

  function weekTitle(svg, wk) {
    var node = svg.querySelector('[data-week="' + wk + '"]');
    var title = node && node.querySelector("title");
    if (!title) return "";
    // Titles are authored as "Week N: Actual Title" — strip the "Week N: " prefix.
    return title.textContent.replace(/^Week \d+:\s*/, "");
  }

  function renderHereCard(card, opts) {
    if (!card) return;
    if (!opts) {
      card.hidden = true;
      card.innerHTML = "";
      return;
    }
    card.hidden = false;
    if (opts.onBreak) {
      card.innerHTML =
        '<div class="here-week">On break</div>' +
        '<div class="here-title">' + opts.breakName + "</div>" +
        (opts.nextWeek
          ? '<a class="here-link" href="weeks/week-' + String(opts.nextWeek).padStart(2, "0") + '.html">Go to Week ' + opts.nextWeek + " &rarr;</a>"
          : "");
    } else {
      var pct = Math.round((opts.week / 15) * 100);
      card.innerHTML =
        '<div class="here-week">Week ' + opts.week + " of 15</div>" +
        '<div class="here-title">' + opts.title + "</div>" +
        '<div class="here-bar"><div class="here-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<a class="here-link" href="weeks/week-' + String(opts.week).padStart(2, "0") + '.html">Go to this week &rarr;</a>';
    }
  }

  function init() {
    var svg = document.getElementById("journey-map");
    var marker = document.getElementById("here-marker");
    var hereCard = document.getElementById("here-card");
    if (!svg || !marker) return;

    var todayStr = new Date().toISOString().slice(0, 10);
    var wk = currentWeekNumber(todayStr);
    if (!wk) {
      renderHereCard(hereCard, null); // semester hasn't started yet
      return;
    }

    var brk = activeBreak(todayStr);
    marker.style.display = "";

    if (brk) {
      var nextWk = wk + 1 <= 15 ? wk + 1 : null;
      if (nextWk) {
        var nextNode = svg.querySelector('[data-week="' + nextWk + '"]');
        var c = nodeCenter(nextNode);
        marker.innerHTML =
          '<circle class="here-ring next" cx="' + c.x + '" cy="' + c.y + '" r="13"></circle>';
      } else {
        marker.innerHTML = "";
      }
      renderHereCard(hereCard, { onBreak: true, breakName: brk.name, nextWeek: nextWk });
    } else {
      var node = svg.querySelector('[data-week="' + wk + '"]');
      if (!node) return;
      var center = nodeCenter(node);
      var isEthicsWeek = ETHICS_WEEKS.indexOf(wk) !== -1;
      var labelY = isEthicsWeek ? center.y + 34 : center.y - 24;
      marker.innerHTML =
        '<circle class="here-ring" cx="' + center.x + '" cy="' + center.y + '" r="13"></circle>' +
        '<text fill="var(--accent)" font-family="Quicksand" font-size="11" font-weight="700" ' +
        'x="' + center.x + '" y="' + labelY + '" text-anchor="middle">You are here</text>';
      renderHereCard(hereCard, { week: wk, title: weekTitle(svg, wk) });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
