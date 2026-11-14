/* ============================================================
   Burnout Unpacked — shared runtime
   · language switching (?lang= deep-link, remembered locally)
   · shared header / footer / decorative layers / SVG motifs
   · scroll reveal, gentle floating orbs, reduced-motion aware
   · all page interactivity, no external dependencies
   ============================================================ */
(function () {
  "use strict";

  var I18N = window.BURNOUT_I18N || {};
  var LANGS = ["en", "zh-HK", "zh-CN"];
  var PAGE = (document.body && document.body.dataset.page) || "home";
  var html = document.documentElement;

  /* ---------- small helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function make(tag, cls, htmlStr) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (htmlStr != null) n.innerHTML = htmlStr;
    return n;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function reduce() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- language ---------- */
  var lang = (function () {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS.indexOf(q) !== -1) return q;
    try { var s = localStorage.getItem("burnout-lang"); if (s && LANGS.indexOf(s) !== -1) return s; } catch (e) {}
    var n = (navigator.language || "en").toLowerCase();
    if (n.indexOf("zh") === 0) return (n.indexOf("cn") !== -1 || n.indexOf("hans") !== -1 || n.indexOf("sg") !== -1) ? "zh-CN" : "zh-HK";
    return "en";
  })();

  /* resolve a dotted key from the active (or a fallback) language */
  function raw(path, l) {
    var dict = I18N[l || lang];
    if (!dict) return undefined;
    return path.split(".").reduce(function (o, k) { return (o == null ? undefined : o[k]); }, dict);
  }
  function t(path, vars) {
    var v = raw(path);
    if (v === undefined) v = raw(path, "en");
    if (v === undefined) return "";
    if (typeof v === "string" && vars) {
      Object.keys(vars).forEach(function (k) { v = v.split("{" + k + "}").join(vars[k]); });
    }
    return v;
  }

  /* ============================================================
     SVG motif sprite — loose, soft line art (injected once)
     ============================================================ */
  var SPRITE = '' +
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false" id="motif-sprite">' +
    '<defs>' +
    '<g id="m-moon" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M31 7a17 17 0 1 0 10 30A14 14 0 0 1 31 7Z"/></g>' +
    '<g id="m-window" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="7" width="30" height="34" rx="8"/><path d="M24 9v30M11 24h26"/><path d="M16 15h4M28 15h4"/></g>' +
    '<g id="m-desk" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 31h38M10 31v9M38 31v9M14 31V20h15"/><path d="M29 20h5a3 3 0 0 1 0 6h-5"/></g>' +
    '<g id="m-mug" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 20h18v12a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6Z"/><path d="M31 23h4a4 4 0 0 1 0 8h-4"/><path d="M18 14c0-3 3-3 3-7M26 14c0-3 3-3 3-7"/></g>' +
    '<g id="m-cloud" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 34h19a7 7 0 0 0 1-14 10 10 0 0 0-19 3 6.5 6.5 0 0 0-1 11Z"/></g>' +
    '<g id="m-orb" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="12"/><circle cx="20" cy="20" r="3"/></g>' +
    '<g id="m-star" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6c1 9 3 11 12 12-9 1-11 3-12 12-1-9-3-11-12-12 9-1 11-3 12-12Z"/></g>' +
    '<g id="m-plant" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 30h18l-2 10H17Z"/><path d="M24 30V14"/><path d="M24 21c-6 0-8-4-8-9 5 0 8 3 8 9Z"/><path d="M24 25c6 0 9-4 9-10-6 0-9 3-9 10Z"/></g>' +
    '<g id="m-book" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 14c-4-3-9-3-14-2v22c5-1 10-1 14 2 4-3 9-3 14-2V12c-5-1-10-1-14 2Z"/><path d="M24 14v24"/></g>' +
    '<g id="m-cushion" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="12" width="30" height="24" rx="12"/><path d="M15 18c4 3 14 3 18 0"/></g>' +
    '<g id="m-chat" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 13h26a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H22l-8 7v-7h-3a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4Z"/><path d="M24 27c-4-3-6-5-6-8a3 3 0 0 1 6-2 3 3 0 0 1 6 2c0 3-2 5-6 8Z"/></g>' +
    '<g id="m-breath" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="6"/><path d="M24 5v5M24 38v5M5 24h5M38 24h5M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/></g>' +
    '<g id="m-feather" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 37c11 0 20-9 22-21-12 2-20 10-22 21Z"/><path d="M12 37l11-11"/></g>' +
    '<g id="m-hourglass" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 8h18M15 40h18"/><path d="M17 8c0 8 7 10 7 16s-7 8-7 16M31 8c0 8-7 10-7 16s7 8 7 16"/></g>' +
    '<g id="m-leaf" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 35c0-13 8-21 23-23-2 15-10 23-23 23Z"/><path d="M12 35c6-6 12-10 18-12"/></g>' +
    '<g id="m-heart" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 40S9 30 9 20a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 10-15 20-15 20Z"/></g>' +
    '<g id="m-house" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 23 24 10l15 13v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z"/><path d="M20 40V29h8v11"/></g>' +
    '<g id="m-clock" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="15"/><path d="M24 15v9l6 4"/></g>' +
    '<g id="m-lamp" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 7l11 17H13Z"/><path d="M24 24v13M18 40h12"/></g>' +
    '<g id="m-grip" fill="currentColor" stroke="none"><circle cx="20" cy="16" r="2.4"/><circle cx="28" cy="16" r="2.4"/><circle cx="20" cy="24" r="2.4"/><circle cx="28" cy="24" r="2.4"/><circle cx="20" cy="32" r="2.4"/><circle cx="28" cy="32" r="2.4"/></g>' +
    '</defs></svg>';

  function icon(id, cls) {
    return '<svg class="' + (cls || "illu") + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#' + esc(id) + '"></use><use xlink:href="#' + esc(id) + '"></use></svg>';
  }

  /* ============================================================
     Decorative background: drifting orbs, clouds, stars
     ============================================================ */
  var ORBS = [
    { x: 8, y: 14, s: 150, c: "lav", dur: 34, dx: 30, dy: -40 },
    { x: 84, y: 20, s: 110, c: "peach", dur: 42, dx: -34, dy: 30 },
    { x: 70, y: 72, s: 190, c: "peri", dur: 50, dx: 40, dy: -30 },
    { x: 16, y: 78, s: 120, c: "peach", dur: 38, dx: -26, dy: -34 },
    { x: 46, y: 44, s: 90, c: "lav", dur: 46, dx: 24, dy: 28 },
    { x: 92, y: 58, s: 70, c: "peri", dur: 30, dx: -18, dy: -24 }
  ];
  var STARS = [
    { x: 22, y: 10, s: 12, d: 0 }, { x: 62, y: 8, s: 8, d: 1.2 }, { x: 38, y: 26, s: 10, d: 2.1 },
    { x: 88, y: 34, s: 9, d: .6 }, { x: 8, y: 48, s: 11, d: 1.8 }, { x: 74, y: 88, s: 8, d: 2.6 },
    { x: 30, y: 66, s: 9, d: 3.2 }, { x: 54, y: 82, s: 11, d: 1.4 }
  ];

  function injectDecor() {
    if ($(".orbs")) return;
    var wrap = make("div", "orbs");
    wrap.setAttribute("aria-hidden", "true");
    if (!reduce()) {
      STARS.forEach(function (st) {
        var n = make("span", "orb lav");
        n.style.left = st.x + "%"; n.style.top = st.y + "%";
        n.style.width = n.style.height = st.s + "px";
        n.style.opacity = ".45";
        n.style.setProperty("--dur", (24 + st.d * 4) + "s");
        n.style.setProperty("--dx", (12 + st.d * 3) + "px");
        n.style.setProperty("--dy", (-10 - st.d * 2) + "px");
        wrap.appendChild(n);
      });
      ORBS.forEach(function (o, i) {
        var n = make("span", "orb " + (i % 3 === 0 ? "blob " : "") + o.c);
        n.style.left = o.x + "%"; n.style.top = o.y + "%";
        n.style.width = n.style.height = o.s + "px";
        n.style.setProperty("--dur", o.dur + "s");
        n.style.setProperty("--dx", o.dx + "px");
        n.style.setProperty("--dy", o.dy + "px");
        wrap.appendChild(n);
      });
      [["6%", 30, 620], ["72%", 62, 520]].forEach(function (c) {
        var n = make("span", "cloud");
        n.style.left = c[0]; n.style.top = c[1] + "%";
        n.style.width = c[2] + "px"; n.style.height = (c[2] * 0.16) + "px";
        n.style.setProperty("--dur", "58s");
        wrap.appendChild(n);
      });
    }
    document.body.insertBefore(wrap, document.body.firstChild);
    // gentle parallax on scroll
    if (!reduce()) {
      var tiles = $$(".orb, .cloud", wrap);
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY || 0;
          tiles.forEach(function (n, i) {
            var k = (i % 3 + 1) * 0.035;
            n.style.marginTop = (-y * k) + "px";
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ============================================================
     Shared header + footer
     ============================================================ */
  var PAGES = [
    { id: "home", file: "index.html", key: "nav.home" },
    { id: "what", file: "what-is-burnout.html", key: "nav.what" },
    { id: "compare", file: "compare.html", key: "nav.compare" },
    { id: "story", file: "story-map.html", key: "nav.story" },
    { id: "toolkit", file: "toolkit.html", key: "nav.toolkit" },
    { id: "resources", file: "resources.html", key: "nav.resources" }
  ];

  function langBar() {
    return LANGS.map(function (l) {
      var label = l === "en" ? "EN" : (l === "zh-HK" ? "繁" : "简");
      var full = l === "en" ? "English" : (l === "zh-HK" ? "繁體中文" : "简体中文");
      return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === lang) + '" aria-label="' + esc(full) + '" lang="' + l + '">' + label + "</button>";
    }).join("");
  }

  function injectHeader() {
    var root = $("[data-nav]");
    if (!root) return;
    var links = PAGES.map(function (p) {
      var cur = p.id === PAGE ? ' aria-current="page"' : "";
      return '<a href="' + p.file + '" data-i18n="' + p.key + '"' + cur + ">" + esc(t(p.key)) + "</a>";
    }).join("");
    root.innerHTML =
      '<div class="wrap nav">' +
      '<a class="brand" href="index.html">' +
      '<span class="mark">' + icon("m-moon", "") + "</span>" +
      '<span class="txt"><b data-i18n="meta.brandTitle">Burnout Unpacked</b>' +
      '<span data-i18n="nav.brandSub">Rest Is Not Laziness</span></span></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links">' +
      '<span data-i18n="nav.menu">Menu</span>' + icon("m-grip", "menu-ic") + "</button>" +
      '<nav id="nav-links" class="nav-links" aria-label="Primary">' + links + "</nav>" +
      '<div class="lang" role="group" aria-label="' + esc(t("meta.langLabel")) + '">' + langBar() + "</div>" +
      "</div>";
  }

  function injectFooter() {
    var root = $("[data-footer]");
    if (!root) return;
    var links = PAGES.map(function (p) {
      return '<li><a href="' + p.file + '" data-i18n="' + p.key + '">' + esc(t(p.key)) + "</a></li>";
    }).join("");
    root.innerHTML =
      '<div class="wrap">' +
      '<div class="foot-grid">' +
      "<div>" +
      '<div class="brand" style="margin-bottom:14px"><span class="mark">' + icon("m-moon", "") + "</span>" +
      '<span class="txt"><b data-i18n="meta.brandTitle">Burnout Unpacked</b><span data-i18n="nav.brandSub">Rest Is Not Laziness</span></span></div>' +
      '<p class="tiny" data-i18n="footer.copy"></p>' +
      '<p class="tiny" data-i18n="footer.builtNote"></p>' +
      "</div>" +
      "<div><h4 data-i18n=\"footer.navTitle\">Explore</h4><ul class=\"foot-links\">" + links + "</ul></div>" +
      "<div><h4 data-i18n=\"footer.ethicsTitle\">Ethics &amp; Disclaimer</h4>" +
      '<p class="tiny" data-i18n="footer.ethics"></p>' +
      '<p class="tiny"><strong data-i18n="footer.crisisNote"></strong></p>' +
      '<p class="tiny"><a href="resources.html" data-i18n="footer.moreLink"></a></p></div>' +
      "</div>" +
      '<div class="foot-tagline">' +
      '<span class="tl" data-i18n="meta.tagline"></span>' +
      '<span class="foot-copy">© <span class="year"></span> Burnout Unpacked</span>' +
      "</div></div>";
  }

  /* ============================================================
     i18n application to static markup
     ============================================================ */
  function applyI18n() {
    document.title = t("meta.title") + " ｜ " + t("meta.tagline");
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t("footer.ethics"));
    html.setAttribute("lang", lang);

    $$("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    $$("[data-i18n-html]").forEach(function (n) { n.innerHTML = t(n.getAttribute("data-i18n-html")); });
    $$("[data-i18n-ph]").forEach(function (n) { n.setAttribute("placeholder", t(n.getAttribute("data-i18n-ph"))); });
    $$("[data-i18n-attrs]").forEach(function (n) {
      n.getAttribute("data-i18n-attrs").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (p.length === 2) n.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    $$("[data-i18n-aria]").forEach(function (n) { n.setAttribute("aria-label", t(n.getAttribute("data-i18n-aria"))); });
    $$("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    var y = $(".year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ============================================================
     Scroll reveal
     ============================================================ */
  var io = null;
  function buildReveal() {
    var nodes = $$("[data-reveal]:not(.in)");
    if (reduce() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    }
    nodes.forEach(function (n, i) {
      if (!n.style.getPropertyValue("--rd")) n.style.setProperty("--rd", (Math.min(i, 5) * 70) + "ms");
      io.observe(n);
    });
  }

  /* ============================================================
     HOME
     ============================================================ */
  function buildHome() {
    var stats = $("#stats");
    if (stats) {
      var data = t("home.stats") || [];
      stats.innerHTML = data.map(function (s) {
        return '<div class="stat" data-reveal><b>' + esc(s.value) + "</b><span>" + esc(s.text) + "</span></div>";
      }).join("");
    }
    var cards = $("#nav-cards");
    if (cards) {
      var cd = t("home.cards") || [];
      cards.innerHTML = cd.map(function (c, i) {
        return '<article class="card glowable" data-reveal style="--rd:' + (i * 60) + 'ms">' +
          icon(c.icon, "illu " + (c.tone || "")) +
          "<h3>" + esc(c.title) + "</h3><p class=\"muted\">" + esc(c.desc) + "</p>" +
          '<a class="btn btn-ghost btn-sm" href="' + PAGES[i + 1].file + '">' + esc(t("common.learnMore")) + "</a>" +
          "</article>";
      }).join("");
    }
  }

  var reflectTimer = null, reflectIdx = -1;
  function initReflect() {
    var pop = $("#reflect-pop");
    if (!pop) return;
    var qs = t("home.reflect.questions") || [];
    if (!qs.length) return;
    var body = $(".q", pop);
    function show() {
      if (pop.classList.contains("show")) return;
      reflectIdx = (reflectIdx + 1) % qs.length;
      body.textContent = qs[reflectIdx];
      pop.classList.add("show");
      clearTimeout(reflectTimer);
      reflectTimer = setTimeout(hide, 14000);
    }
    function hide() { pop.classList.remove("show"); }
    $("#reflect-q").addEventListener("click", show);
    $(".cls", pop).addEventListener("click", function () { hide(); clearTimeout(reflectTimer); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
    // a slow, gentle first appearance
    setTimeout(show, 6500);
    setInterval(show, 34000);
  }

  /* ============================================================
     WHAT IS BURNOUT
     ============================================================ */
  function buildWhat() {
    var dims = $("#dims");
    if (dims) {
      var d = t("what.dimsData") || [];
      dims.innerHTML = d.map(function (x, i) {
        var ex = (x.examples || []).map(function (e) { return '<div class="example">' + esc(e) + "</div>"; }).join("");
        return '<article class="card reveal-card" data-reveal style="--rd:' + (i * 80) + 'ms" tabindex="0" role="button" aria-expanded="false">' +
          icon(x.icon, "illu " + (x.tone || "")) +
          "<h3>" + esc(x.title) + "</h3><p class=\"muted\">" + esc(x.body) + "</p>" +
          '<span class="toggle-hint">' + esc(t("common.revealHint")) +
          '<span class="plus" aria-hidden="true">＋</span></span>' +
          '<div class="more">' + ex + "</div></article>";
      }).join("");
    }
    var myths = $("#myths");
    if (myths) {
      var m = t("what.mythsData") || [];
      myths.innerHTML = m.map(function (x, i) {
        return '<article class="card" data-reveal style="--rd:' + (i * 70) + 'ms">' +
          '<p class="chip rose" style="margin-bottom:12px">' + esc(x.myth) + "</p>" +
          "<p style=\"margin:0\">" + esc(x.truth) + "</p></article>";
      }).join("");
    }
    var quiz = $("#quiz");
    if (quiz) {
      var q = t("what.quiz.data") || [];
      var answered = {};
      quiz.innerHTML = q.map(function (x, i) {
        return '<div class="quiz-item" data-q="' + i + '">' +
          '<p class="quiz-q">' + esc(x.q) + "</p>" +
          '<div class="quiz-btns">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-ans="true">' + esc(t("common.trueLabel")) + "</button>" +
          '<button class="btn btn-ghost btn-sm" type="button" data-ans="false">' + esc(t("common.falseLabel")) + "</button>" +
          "</div>" +
          '<div class="quiz-feedback" role="status" aria-live="polite"></div></div>';
      }).join("");
      var scoreEl = $("#quiz-score");
      quiz.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-ans]");
        if (!btn) return;
        var item = btn.closest(".quiz-item");
        var idx = +item.getAttribute("data-q");
        var pick = btn.getAttribute("data-ans") === "true";
        var item_data = q[idx];
        var fb = $(".quiz-feedback", item);
        if (answered[idx]) return;
        answered[idx] = (pick === item_data.a);
        fb.className = "quiz-feedback show " + (pick === item_data.a ? "ok" : "no");
        fb.innerHTML = "<b>" + esc(pick === item_data.a ? t("common.trueLabel") + " ✓" : t("common.falseLabel") + " ✕") +
          "</b>" + esc(item_data.explain);
        $$("[data-ans]", item).forEach(function (b) {
          b.disabled = true; b.setAttribute("aria-disabled", "true");
          if ((b.getAttribute("data-ans") === "true") === item_data.a) b.classList.add("btn-lav");
        });
        var keys = Object.keys(answered);
        if (scoreEl) {
          if (keys.length === q.length) {
            var n = keys.filter(function (k) { return answered[k]; }).length;
            scoreEl.textContent = t("what.quiz.scoreLabel", { n: n, total: q.length });
          } else {
            scoreEl.textContent = "";
          }
        }
      });
    }
  }

  /* ============================================================
     COMPARE
     ============================================================ */
  function buildCompare() {
    var ticks = $("#slider-ticks");
    var readout = $("#compare-readout");
    var slider = $("#compare-slider");
    var panel = $("#compare-panel");
    var states = t("compare.states") || [];
    if (!states.length || !panel) return;

    function renderState(i) {
      states.forEach(function (s, k) {
        s.__i = k;
      });
      var s = states[i];
      if (readout) {
        readout.innerHTML = states.map(function (x, k) {
          return '<button class="state-pill' + (k === i ? " active" : "") + '" type="button" data-state="' + k +
            '" aria-pressed="' + (k === i) + '"><b>' + esc(x.name) + "</b><span>" + esc(x.summary) + "</span></button>";
        }).join("");
      }
      panel.innerHTML =
        '<div class="row" style="align-items:center;gap:16px;margin-bottom:6px">' +
        icon(s.icon, "illu " + (s.tone || "")) + "<h3 style=\"margin:0\">" + esc(s.name) + "</h3></div>" +
        '<p class="muted">' + esc(s.onset) + "</p>" +
        '<ul class="trait-list">' + (s.traits || []).map(function (tr) { return "<li>" + esc(tr) + "</li>"; }).join("") + "</ul>";
      if (slider) { slider.value = String(i); slider.setAttribute("aria-valuetext", s.name); }
      if (ticks) {
        ticks.innerHTML = (t("compare.slider.ticks") || []).map(function (lb, k) {
          return '<button type="button" data-state="' + k + '"' + (k === i ? ' style="color:var(--accent)"' : "") + ">" + esc(lb) + "</button>";
        }).join("");
      }
    }
    window.__compareRender = renderState;
    renderState(0);

    if (slider) {
      slider.min = 0; slider.max = String(states.length - 1); slider.step = "1";
      slider.addEventListener("input", function () { renderState(+slider.value); });
    }
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-state]");
      if (b && (b.closest("#slider-ticks") || b.closest("#compare-readout"))) renderState(+b.getAttribute("data-state"));
    });

    /* self-reflection checklist */
    var list = $("#check-list");
    var note = $("#check-note");
    var result = $("#check-result");
    if (note) note.textContent = t("compare.check.notDiagnosis");
    if (list) {
      var items = t("compare.check.items") || [];
      list.innerHTML = items.map(function (it, i) {
        return '<label class="check"><input type="checkbox" data-check="' + i + '">' +
          '<span class="box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 10 18 20 6"/></svg></span>' +
          "<span>" + esc(it) + "</span></label>";
      }).join("");
      list.addEventListener("change", function () {
        var n = $$("[data-check]", list).filter(function (c) { return c.checked; }).length;
        if (!result) return;
        var bands = t("compare.check.bands") || [];
        var band = bands.find(function (b) { return n <= b.max; }) || bands[bands.length - 1];
        if (n === 0) { result.textContent = ""; return; }
        result.innerHTML = '<div class="check-note" style="border-style:solid;background:rgba(184,168,217,.12)"><strong>' +
          n + " / " + items.length + "</strong> — " + esc(band ? band.text : "") + "</div>";
      });
    }

    /* comparison cases */
    var cases = $("#cases");
    if (cases) {
      var cd = t("compare.cases.data") || [];
      cases.innerHTML = cd.map(function (c, i) {
        return '<button class="card glowable reveal-card" type="button" data-reveal style="--rd:' + (i * 80) + 'ms" aria-expanded="false">' +
          '<div class="row" style="justify-content:space-between"><strong>' + esc(c.name) + "</strong>" +
          '<span class="chip ' + (c.tone || "") + '">' + esc(c.tag) + "</span></div>" +
          '<p class="muted" style="margin:.6em 0 0">' + esc(c.short) + "</p>" +
          '<span class="toggle-hint">' + esc(t("common.revealHint")) + '<span class="plus" aria-hidden="true">＋</span></span>' +
          '<div class="more"><p style="margin:0">' + esc(c.full) + "</p></div></button>";
      }).join("");
    }
  }

  /* ============================================================
     STORY MAP
     ============================================================ */
  function buildStory() {
    var tl = $("#timeline");
    var panel = $("#story-panel");
    var fill = $("#story-reflect");
    var stages = t("story.stages") || [];
    if (!stages.length) return;

    if (tl) {
      tl.innerHTML = stages.map(function (s, i) {
        return '<div class="stage" data-reveal style="--rd:' + (i * 90) + 'ms">' +
          '<button class="marker" type="button" data-stage="' + i + '" aria-expanded="false" aria-controls="story-panel" aria-label="' + esc(s.name + " — " + s.place) + '">' +
          icon(s.icon, "") + "</button>" +
          "<div class=\"stage-label\">" + esc(s.name) + "</div>" +
          '<div class="stage-sub">' + esc(s.place) + "</div>" +
          '<div class="knot" aria-hidden="true"></div></div>';
      }).join("");
    }
    function open(i, scrollTo) {
      var s = stages[i];
      if (panel) {
        panel.innerHTML =
          '<div class="who"><span class="avatar">' + icon(s.icon, "") + "</span>" +
          "<div><strong>" + esc(s.name) + "</strong><div class=\"small\">" + esc(s.who) + " · " + esc(s.place) + "</div></div></div>" +
          "<blockquote>“" + esc(s.quote) + "”</blockquote>" +
          '<p class="muted" style="margin-top:1em">' + esc(s.note) + "</p>" +
          '<div class="note"><strong>' + esc(t("story.reflect.title")) + "</strong><br>" + esc(s.prompt) + "</div>";
        panel.classList.add("show");
      }
      $$(".marker", tl).forEach(function (m, k) { m.setAttribute("aria-expanded", String(k === i)); });
      if (scrollTo && panel && panel.scrollIntoView) panel.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "nearest" });
    }
    window.__storyOpen = open;
    if (tl) {
      tl.addEventListener("click", function (e) {
        var b = e.target.closest("[data-stage]");
        if (b) open(+b.getAttribute("data-stage"), true);
      });
    }
    if (panel) open(0, false);

    if (fill) {
      var items = t("story.reflect.items") || [];
      fill.innerHTML = items.map(function (q, i) {
        return '<label class="field-label" for="sf' + i + '">' + esc(q) + "</label>" +
          '<textarea id="sf' + i + '" rows="2" class="reflect-input"></textarea>';
      }).join("");
    }
  }

  /* ============================================================
     TOOLKIT
     ============================================================ */
  function segButtons(kind, arr, onPick) {
    var active = arr.length ? arr[0].k : null;
    function html() {
      return arr.map(function (o) {
        return '<button type="button" data-kind="' + kind + '" data-k="' + esc(o.k) + '" aria-pressed="' + (o.k === active) + '">' + esc(o.v) + "</button>";
      }).join("");
    }
    return {
      html: html,
      get: function () { return active; },
      set: function (k) { active = k; },
      has: function (k) { return arr.some(function (o) { return o.k === k; }); }
    };
  }

  function buildToolkit() {
    /* --- boundary sentence builder --- */
    var out = $("#builder-out");
    if (out) {
      var B = t("toolkit.builder") || {};
      var who = segButtons("who", t("toolkit.builder.who") || []);
      var need = segButtons("need", t("toolkit.builder.need") || []);
      var tone = segButtons("tone", t("toolkit.builder.tone") || []);
      $("#who-seg").innerHTML = who.html();
      $("#need-seg").innerHTML = need.html();
      $("#tone-seg").innerHTML = tone.html();

      function compose() {
        var tk = tone.get();
        var whoV = (t("toolkit.builder.who") || []).find(function (o) { return o.k === who.get(); });
        var needV = (t("toolkit.builder.need") || []).find(function (o) { return o.k === need.get(); });
        var opener = (B.openers || {})[tk] || "";
        var conn = (B.connectors || {})[tk] || "";
        var closer = (B.closers || {})[tk] || "";
        var lines = [
          opener + " " + whoV.v + ".",
          conn + " " + needV.v + ". " + (needV.extra || ""),
          closer
        ];
        out.innerHTML = lines.map(function (ln) { return '<div class="script-line">' + esc(ln.trim()) + "</div>"; }).join("");
        out.dataset.text = lines.join("\n");
      }
      compose();
      document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-kind]");
        if (!b) return;
        var kind = b.getAttribute("data-kind");
        var sel = kind === "who" ? who : kind === "need" ? need : tone;
        sel.set(sel.get() === b.getAttribute("data-k") ? sel.get() : b.getAttribute("data-k"));
        $$('[data-kind="' + kind + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-k") === sel.get())); });
        compose();
      });
      var cp = $("#builder-copy");
      if (cp) cp.addEventListener("click", function () { copyText(out.dataset.text || "", cp); });
    }

    /* --- priority sorting (drag + tap) --- */
    var zonesWrap = $("#zones");
    if (zonesWrap) {
      var zones = t("toolkit.priority.zones") || [];
      var pitems = t("toolkit.priority.items") || [];
      zonesWrap.innerHTML =
        '<div class="dropzone" data-zone="pool" role="list" aria-label="' + esc(t("toolkit.priority.title")) + '">' +
        pitems.map(function (it, i) {
          return '<div class="drag-item" data-item="' + i + '" draggable="true" tabindex="0" role="button" aria-pressed="false">' +
            '<span class="grip" aria-hidden="true">' + icon("m-grip", "grip-ic") + "</span><span>" + esc(it) + "</span></div>";
        }).join("") + "</div>" +
        '<div class="grid three gap-sm mt-2">' + zones.map(function (z) {
          return '<div class="dropzone zone-' + esc(z.tone) + '" data-zone="' + esc(z.k) + '" role="list" aria-label="' + esc(z.t) + '"><h4>' + esc(z.t) + "</h4></div>";
        }).join("") + "</div>";
      var selected = null;
      function moveTo(item, zone) {
        if (!item || !zone) return;
        zone.appendChild(item);
        item.classList.remove("selected");
        item.setAttribute("aria-pressed", "false");
        if (selected === item) selected = null;
      }
      zonesWrap.addEventListener("click", function (e) {
        var item = e.target.closest(".drag-item");
        var z = e.target.closest(".dropzone");
        if (item && !z) {
          var wasSel = item.classList.contains("selected");
          $$(".drag-item.selected", zonesWrap).forEach(function (n) { n.classList.remove("selected"); n.setAttribute("aria-pressed", "false"); });
          if (!wasSel) { item.classList.add("selected"); item.setAttribute("aria-pressed", "true"); selected = item; }
          else selected = null;
          return;
        }
        if (z && !item) { moveTo(selected, z); }
      });
      zonesWrap.addEventListener("keydown", function (e) {
        var item = e.target.closest(".drag-item");
        if (item && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); item.click(); }
        var z = e.target.closest(".dropzone");
        if (z && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); moveTo(selected, z); }
      });
      zonesWrap.addEventListener("dragstart", function (e) {
        var item = e.target.closest(".drag-item");
        if (!item) return;
        item.classList.add("dragging");
        try { e.dataTransfer.setData("text/plain", item.getAttribute("data-item")); e.dataTransfer.effectAllowed = "move"; } catch (err) {}
      });
      zonesWrap.addEventListener("dragend", function (e) {
        var item = e.target.closest(".drag-item");
        if (item) item.classList.remove("dragging");
        $$(".drop-target", zonesWrap).forEach(function (n) { n.classList.remove("drop-target"); });
      });
      zonesWrap.addEventListener("dragover", function (e) {
        var z = e.target.closest(".dropzone");
        if (!z) return;
        e.preventDefault();
        $$(".drop-target", zonesWrap).forEach(function (n) { n.classList.remove("drop-target"); });
        z.classList.add("drop-target");
      });
      zonesWrap.addEventListener("drop", function (e) {
        var z = e.target.closest(".dropzone");
        if (!z) return;
        e.preventDefault();
        var id = "";
        try { id = e.dataTransfer.getData("text/plain"); } catch (err) {}
        moveTo($('.drag-item[data-item="' + id + '"]', zonesWrap) || $(".dragging", zonesWrap), z);
        z.classList.remove("drop-target");
      });
    }

    /* --- 5-4-3-2-1 grounding --- */
    var stage = $("#ground-stage");
    if (stage) {
      var steps = t("toolkit.grounding.steps") || [];
      var big = make("div", "ground-step");
      var dots = make("div", "ground-dots");
      var ctrls = make("div", "btn-row mt-2");
      ctrls.style.justifyContent = "center";
      var orb = make("div", "breath-orb");
      stage.innerHTML = "";
      stage.appendChild(orb); stage.appendChild(big); stage.appendChild(dots); stage.appendChild(ctrls);
      var gi = -1, doneNote = null;
      function draw() {
        big.textContent = gi < 0 ? t("toolkit.grounding.lead") : steps[gi].text;
        dots.innerHTML = steps.map(function (s, k) { return "<i class=\"" + (k <= gi ? "on" : "") + "\"></i>"; }).join("");
        ctrls.innerHTML = gi < 0
          ? '<button class="btn btn-primary" type="button" data-g="start">' + esc(t("toolkit.grounding.startBtn")) + "</button>"
          : (gi < steps.length - 1
            ? '<button class="btn btn-primary" type="button" data-g="next">' + esc(t("toolkit.grounding.nextBtn")) + "</button>"
            : '<button class="btn btn-ghost" type="button" data-g="reset">' + esc(t("common.again")) + "</button>");
        if (step_hint) step_hint.textContent = (gi >= 0 && steps[gi] && steps[gi].hint) ? steps[gi].hint : "";
        if (doneNote) { doneNote.remove(); doneNote = null; }
        if (gi === steps.length - 1) { doneNote = make("p", "small center mt-1"); doneNote.textContent = t("toolkit.grounding.done"); ctrls.parentNode.insertBefore(doneNote, ctrls.nextSibling); }
      }
      var step_hint = make("p", "small center");
      stage.insertBefore(step_hint, dots);
      stage.addEventListener("click", function (e) {
        var b = e.target.closest("[data-g]");
        if (!b) return;
        var a = b.getAttribute("data-g");
        if (a === "start") { gi = 0; }
        else if (a === "next") { gi = Math.min(gi + 1, steps.length - 1); }
        else { gi = -1; }
        draw();
      });
      window.__groundDraw = draw;
      draw();
    }

    /* --- journal template download --- */
    var dl = $("#journal-dl");
    if (dl) {
      dl.addEventListener("click", function () {
        var L = {
          "en": { head: "Reflective Journal — Burnout Unpacked", date: "Date:", f: ["Energy today (1–10):", "One thing that went well:", "One thing I can set down:", "Tomorrow's smallest step:", "A kind line to myself:"] },
          "zh-HK": { head: "反思日誌 — 休息不是偷懶", date: "日期：", f: ["今天的精力（1–10）：", "一件順利的事：", "一件我可以放下的事：", "明天最小的一步：", "對自己的一句溫柔話語："] },
          "zh-CN": { head: "反思日志 — 休息不是偷懒", date: "日期：", f: ["今天的精力（1–10）：", "一件顺利的事：", "一件我可以放下的事：", "明天最小的一步：", "对自己的一句温柔话语："] }
        }[lang];
        var lines = ["== " + L.head + " ==", L.date + " ____________________", ""];
        L.f.forEach(function (q) { lines.push(q); lines.push("____________________________________________"); lines.push(""); });
        lines.push("— " + t("meta.tagline"));
        var blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "burnout-journal-" + lang + ".txt";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      });
    }

    /* --- recovery practices --- */
    var practices = $("#practices");
    if (practices) {
      practices.innerHTML = (t("toolkit.practices.data") || []).map(function (p, i) {
        return '<article class="card glowable" data-reveal style="--rd:' + (i * 70) + 'ms">' +
          icon(p.icon, "illu " + (p.tone || "")) +
          "<h3>" + esc(p.title) + "</h3><p class=\"muted\" style=\"margin:0\">" + esc(p.body) + "</p></article>";
      }).join("");
    }
  }

  /* ============================================================
     RESOURCES
     ============================================================ */
  function buildResources() {
    var grid = $("#res-grid");
    if (!grid) return;
    var items = t("resources.items") || [];
    var filters = t("resources.filters") || [];
    var bar = $("#filters");
    var cur = "all";
    function cardHTML(r) {
      var tel = r.phone
        ? '<a class="tel" href="tel:' + esc(String(r.phone).replace(/[^\d+]/g, "")) + '" aria-label="' + esc(t("common.copy") + " " + r.name + " " + r.phone) + '">' + esc(r.phone) + "</a>"
        : "";
      var copy = r.phone ? '<button class="copy-btn" type="button" data-copy="' + esc(r.phone) + '"><span>' + esc(t("common.copy")) + "</span></button>" : "";
      var link = r.url
        ? '<a class="btn btn-ghost btn-sm" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(t("common.learnMore")) + "</a>"
        : "";
      return '<article class="card glowable res-card" data-cats="' + esc((r.cats || []).join(" ")) + '" data-reveal>' +
        '<div class="res-top"><h3>' + esc(r.name) + '</h3><span class="chip ' + esc(r.tone || "") + '">' + esc(r.tag) + "</span></div>" +
        '<p class="muted" style="margin:0">' + esc(r.desc) + "</p>" +
        '<div class="contact">' + tel + copy + link + "</div></article>";
    }
    function draw() {
      var list = items.filter(function (r) { return cur === "all" || (r.cats || []).indexOf(cur) !== -1; });
      grid.innerHTML = list.length ? list.map(cardHTML).join("") :
        '<p class="muted">' + esc(t("common.emptyFilter")) + "</p>";
      buildReveal();
    }
    if (bar) {
      bar.innerHTML = filters.map(function (f) {
        return '<button type="button" data-filter="' + esc(f.k) + '" aria-pressed="' + (f.k === "all") + '">' + esc(f.t) + "</button>";
      }).join("");
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-filter]");
        if (!b) return;
        cur = b.getAttribute("data-filter");
        $$("[data-filter]", bar).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw();
      });
    }
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-copy]");
      if (b) copyText(b.getAttribute("data-copy"), b);
    });
    draw();

    var reading = $("#reading-list");
    if (reading) {
      reading.innerHTML = (t("resources.reading.data") || []).map(function (r) {
        return '<a class="card glowable" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer" data-reveal>' +
          "<h3 style=\"margin-bottom:.35em\">" + esc(r.name) + "</h3>" +
          '<p class="muted" style="margin:0">' + esc(r.desc) + "</p></a>";
      }).join("");
    }
  }

  /* ---------- copy helper ---------- */
  function copyText(text, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.innerHTML;
      btn.classList.add("done");
      btn.innerHTML = "<span>" + esc(t("common.copied")) + " ✓</span>";
      setTimeout(function () { btn.classList.remove("done"); btn.innerHTML = old; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      ta.remove();
    }
  }

  /* ============================================================
     Global interactions (delegated, bound once)
     ============================================================ */
  function initGlobalUI() {
    /* mobile menu */
    document.addEventListener("click", function (e) {
      var m = e.target.closest(".menu-btn");
      if (m) {
        var nav = $("#nav-links");
        var open = nav.classList.toggle("open");
        m.setAttribute("aria-expanded", String(open));
      }
      var lb = e.target.closest("[data-lang]");
      if (lb) {
        lang = lb.getAttribute("data-lang");
        try { localStorage.setItem("burnout-lang", lang); } catch (er) {}
        var url = new URL(location.href); url.searchParams.set("lang", lang);
        history.replaceState(null, "", url);
        render();
      }
      /* reveal cards (info / cases) */
      var rc = e.target.closest(".reveal-card");
      if (rc && !e.target.closest("a")) {
        var open2 = rc.classList.toggle("open");
        rc.setAttribute("aria-expanded", String(open2));
        var hint = rc.querySelector(".toggle-hint");
        if (hint) hint.firstChild.textContent = open2 ? t("common.hideHint") : t("common.revealHint");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var rc = e.target.closest(".reveal-card");
      if (rc && e.target === rc) { e.preventDefault(); rc.click(); }
    });
  }

  /* ============================================================
     Render pipeline
     ============================================================ */
  var BUILDERS = [buildHome, buildWhat, buildCompare, buildStory, buildToolkit, buildResources];

  function render() {
    injectDecor();
    if (!$("#motif-sprite")) {
      var holder = make("div"); holder.innerHTML = SPRITE;
      document.body.insertBefore(holder.firstChild, document.body.firstChild);
    }
    injectHeader();
    injectFooter();
    applyI18n();
    BUILDERS.forEach(function (f) { try { f(); } catch (e) { if (window.console) console.warn(e); } });
    buildReveal();
    if (window.__compareRender) window.__compareRender(0);
  }

  function boot() {
    var skip = $(".skip-link");
    if (!skip) {
      var s = make("a", "skip-link"); s.href = "#main"; s.setAttribute("data-i18n", "nav.skip");
      document.body.insertBefore(s, document.body.firstChild);
    }
    initGlobalUI();
    render();
    initReflect();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
