// "You are here" indicator for the homepage's 15-week journey map.
// Scoped to index.html only — the one deliberate JS exception on an
// otherwise static HTML/CSS site (see docs/design-spec_phase2..., Part 3b).
//
// Reading the current date can't be done in CSS/HTML alone, so this file
// hardcodes each week's real first-session date (from weeks/week-NN.html)
// and the college's recess date ranges, and highlights the matching node
// on the SVG map. These tables will go stale if the schedule or the
// academic calendar changes — keep them in sync with weeks/week-NN.html
// and the official Kenyon academic calendar.

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

  function init() {
    var svg = document.getElementById("journey-map");
    var marker = document.getElementById("here-marker");
    var label = document.getElementById("here-label");
    if (!svg || !marker || !label) return;

    var todayStr = new Date().toISOString().slice(0, 10);
    var wk = currentWeekNumber(todayStr);
    if (!wk) return; // semester hasn't started yet

    var brk = activeBreak(todayStr);
    marker.style.display = "";

    if (brk) {
      var nextWk = wk + 1 <= 15 ? wk + 1 : null;
      if (nextWk) {
        var nextNode = svg.querySelector('[data-week="' + nextWk + '"]');
        var c = nodeCenter(nextNode);
        marker.innerHTML =
          '<circle class="here-ring next" cx="' + c.x + '" cy="' + c.y + '" r="13"></circle>';
      }
      label.textContent = "On break (" + brk.name + ") — next: Week " + (nextWk || "—");
    } else {
      var node = svg.querySelector('[data-week="' + wk + '"]');
      if (!node) return;
      var center = nodeCenter(node);
      marker.innerHTML =
        '<circle class="here-ring" cx="' + center.x + '" cy="' + center.y + '" r="13"></circle>';
      label.textContent = "You are here — Week " + wk;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
