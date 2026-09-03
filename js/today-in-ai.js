// "Today in AI" — a live headline pulled from Hacker News, shown as a
// supplementary widget (never course content, never authoritative). See
// docs/design-spec_phase3_website-revision_v1_20260903.md Part 3.
//
// Data source: the public, keyless HN Algolia Search API. Fetched at most
// once per hour per visitor (cached in localStorage) regardless of how many
// pages they navigate. If the fetch fails, or no story matches the
// AI-relevance keyword filter, the card simply does not render — this is
// supplementary, not core, so failing invisibly is correct.

(function () {
  var CACHE_KEY = "today-in-ai-cache";
  var CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
  var KEYWORDS = [
    "ai", "llm", "gpt", "openai", "anthropic", "claude", "gemini",
    "machine learning", "neural", "agent"
  ];

  function loadCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveCache(story) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(story));
    } catch (e) {
      /* storage unavailable — just won't persist across pages */
    }
  }

  var KEYWORD_PATTERNS = KEYWORDS.map(function (kw) {
    // Word-boundary match — a plain substring check would let short
    // keywords like "ai" match inside unrelated words ("Ukrainian",
    // "maintain", "portrait"), which happened during testing.
    return new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
  });

  function isRelevant(title) {
    return KEYWORD_PATTERNS.some(function (re) { return re.test(title); });
  }

  function pickBestStory(hits) {
    var candidates = hits.filter(function (h) {
      return h.title && h.url && isRelevant(h.title);
    });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) { return (b.points || 0) - (a.points || 0); });
    var top = candidates[0];
    return { title: top.title, url: top.url, points: top.points || 0, fetchedAt: Date.now() };
  }

  function fetchTodayStory() {
    var todayStartEpoch = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    var api =
      "https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i%3E" +
      todayStartEpoch + "&hitsPerPage=50";
    return fetch(api)
      .then(function (res) {
        if (!res.ok) throw new Error("HN API error " + res.status);
        return res.json();
      })
      .then(function (data) { return pickBestStory(data.hits || []); });
  }

  function cardHTML(story) {
    return (
      '<div class="news-label">Today in AI</div>' +
      '<p class="news-headline">“' + story.title + '”</p>' +
      '<a class="news-source" href="' + story.url + '" target="_blank" rel="noopener">via Hacker News, ' +
      story.points + ' points &rarr;</a>' +
      '<p class="news-caption">The field doesn’t pause for a syllabus — here’s today’s version of it, next to where you are in the course.</p>'
    );
  }

  function render(story) {
    if (!story) return;

    var row = document.getElementById("today-in-ai-row");
    if (row) {
      var card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = cardHTML(story);
      row.appendChild(card);
    }

    var card2 = document.getElementById("today-in-ai-card");
    if (card2) {
      card2.innerHTML = cardHTML(story);
      card2.hidden = false;
    }
  }

  function init() {
    if (!document.getElementById("today-in-ai-row") && !document.getElementById("today-in-ai-card")) {
      return; // page has no widget-rail container at all
    }

    var cached = loadCache();
    if (cached) {
      render(cached);
      return;
    }

    fetchTodayStory()
      .then(function (story) {
        if (story) {
          saveCache(story);
          render(story);
        }
      })
      .catch(function () {
        /* offline, API down, etc. — no card, no error surfaced */
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
