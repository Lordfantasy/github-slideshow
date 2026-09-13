/* =========================================================
   EUREKA — the original · comportamenti
   Tutto vanilla, zero dipendenze. Rispetta prefers-reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 0. preloader: il laccio si allaccia ---------- */
  (function loader() {
    var el = $("#loader");
    if (!el) return;
    var lace = $("#loaderLace");
    if (lace) {
      var len = lace.getTotalLength();
      lace.style.setProperty("--len", len);
    }
    var hide = function () {
      el.classList.add("done");
      setTimeout(function () { el.remove(); }, 800);
    };
    if (RM) { hide(); return; }
    window.addEventListener("load", function () { setTimeout(hide, 1750); });
    setTimeout(hide, 3600); // rete lenta: non bloccare mai il sito
  })();

  /* ---------- 1. barra di scorrimento ---------- */
  var progress = $("#progress");

  /* ---------- 2. navigazione ---------- */
  var nav = $("#nav"), burger = $("#burger"), drawer = $("#drawer");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      nav.classList.toggle("open", open);
      document.body.classList.toggle("is-locked", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("#drawer a").forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("open");
        nav.classList.remove("open");
        document.body.classList.remove("is-locked");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  var navLinks = $$(".nav-links a");
  var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);

  /* ---------- 3. reveal allo scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, .node").forEach(function (el) { io.observe(el); });

  /* ---------- 4. gli occhi seguono il cursore + battono le palpebre ---------- */
  (function eyes() {
    var pupils = $$("#pupils .pupil");
    if (!pupils.length) return;
    var svg = $("#heroSandal");
    var target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };

    if (!RM) {
      window.addEventListener("pointermove", function (e) {
        var r = svg.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height * 0.24;
        target.x = clamp((e.clientX - cx) / (r.width * 0.9), -1, 1) * 9;
        target.y = clamp((e.clientY - cy) / (r.height * 0.7), -1, 1) * 7;
      }, { passive: true });

      (function tick() {
        cur.x += (target.x - cur.x) * 0.09;
        cur.y += (target.y - cur.y) * 0.09;
        pupils.forEach(function (p) {
          p.setAttribute("cx", (+p.dataset.cx + cur.x).toFixed(2));
          p.setAttribute("cy", (+p.dataset.cy + cur.y).toFixed(2));
        });
        requestAnimationFrame(tick);
      })();

      // battito di ciglia: irregolare, come uno sguardo vero
      var lids = $$("#lids .lid");
      var blink = function () {
        lids.forEach(function (l) {
          l.style.transition = "transform .1s ease-in";
          l.style.transform = "scale(1,1)";
          setTimeout(function () {
            l.style.transition = "transform .16s ease-out";
            l.style.transform = "scale(1,0.001)";
          }, 130);
        });
        setTimeout(blink, 2600 + Math.random() * 4200);
      };
      setTimeout(blink, 2200);
    }
  })();

  /* ---------- 5. lacci vivi: onde sinusoidali animate ---------- */
  function wavyLace(el, opts) {
    if (!el || RM) return;
    var o = opts || {};
    var x0 = o.x0, x1 = o.x1, y = o.y, amp = o.amp || 22, k = o.k || 2.2, sp = o.speed || 0.0016;
    var n = 28;
    function frame(t) {
      var d = "", i, px, py;
      for (i = 0; i <= n; i++) {
        var u = i / n;
        px = x0 + (x1 - x0) * u;
        // l'onda si spegne agli estremi: il laccio è fissato ai due capi
        py = y + Math.sin(u * Math.PI * k + t * sp) * amp * Math.sin(u * Math.PI);
        d += (i ? " L" : "M") + px.toFixed(1) + " " + py.toFixed(1);
      }
      el.setAttribute("d", d);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  $$("[data-lace]").forEach(function (el) {
    var d = el.dataset;
    wavyLace(el, { x0: +d.x0, x1: +d.x1, y: +d.y, amp: +d.amp, k: +d.k, speed: +d.speed });
  });

  /* ---------- 6. le cuciture si cuciono mentre scorri (ago compreso) ---------- */
  var seams = $$("[data-seam]").map(function (seam) {
    var thread = $("[data-thread]", seam);
    var stitch = $("[data-stitch]", seam);
    var needle = $("[data-needle]", seam);
    var len = thread.getTotalLength();
    thread.style.strokeDasharray = len;
    thread.style.strokeDashoffset = len;
    stitch.style.strokeDasharray = "14 12";
    stitch.style.strokeDashoffset = len;
    return { el: seam, thread: thread, stitch: stitch, needle: needle, len: len, path: thread };
  });

  function paintSeams() {
    var vh = window.innerHeight;
    seams.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      // 0 quando il divisore entra dal basso, 1 quando è uscito in alto
      var p = clamp((vh - r.top) / (vh * 0.85 + r.height), 0, 1);
      s.thread.style.strokeDashoffset = s.len * (1 - p);
      s.stitch.style.strokeDashoffset = s.len * (1 - p);
      if (s.needle) {
        var pt = s.path.getPointAtLength(s.len * p);
        var pt2 = s.path.getPointAtLength(clamp(s.len * p + 2, 0, s.len));
        var ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
        s.needle.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ") rotate(" + ang + ")");
        s.needle.style.opacity = p > 0.01 && p < 0.99 ? 1 : 0;
      }
    });
  }

  /* ---------- 7. il filo della timeline si tende con lo scroll ---------- */
  var tl = $("#timeline"), tlThread = $("#tlThread"), tlLen = 0;
  if (tlThread) {
    tlLen = tlThread.getTotalLength();
    tlThread.style.setProperty("--len", tlLen);
    tlThread.style.strokeDasharray = tlLen;
    tlThread.style.strokeDashoffset = tlLen;
  }
  function paintTimeline() {
    if (!tl || !tlThread) return;
    var r = tl.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh * 0.78 - r.top) / (r.height * 0.82), 0, 1);
    tlThread.style.strokeDashoffset = tlLen * (1 - p);
  }

  /* ---------- 8. la fibbia si apre quando arrivi ---------- */
  (function buckle() {
    var b = $("#buckle");
    if (!b) return;
    var obs = new IntersectionObserver(function (en) {
      en.forEach(function (e) { b.classList.toggle("open", e.isIntersecting && e.intersectionRatio > 0.45); });
    }, { threshold: [0, 0.45, 0.8] });
    obs.observe(b);
  })();

  /* ---------- 9. contatori ---------- */
  (function counters() {
    var els = $$("[data-count]");
    var obs = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        var end = +e.target.dataset.count;
        if (RM || e.target.dataset.plain) { e.target.textContent = end; return; }
        var t0 = performance.now(), dur = 1500;
        (function step(t) {
          var u = clamp((t - t0) / dur, 0, 1);
          var ease = 1 - Math.pow(1 - u, 3);
          e.target.textContent = Math.round(end * ease);
          if (u < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { obs.observe(el); });
  })();

  /* ---------- 10. inclinazione delle card ---------- */
  if (!RM && window.matchMedia("(hover:hover)").matches) {
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- 11. configuratore ---------- */
  (function configurator() {
    var stage = $("#cfgSandal");
    if (!stage) return;
    var state = { pelle: "Vitello", colore: "Cuoio", occhi: "Aperti", fondo: "Cuoio naturale", hex: "#A8622F" };
    var upper = $("#cfgUpper"), strap = $("#cfgStrap"), sole = $("#cfgSole"),
        eyeG = $("#cfgEyeGroup"), recap = $("#recap"), stitch = $("#cfgStitch"),
        eyeDetail = $("#eyeDetailSvg");

    function shade(hex, amt) {
      var n = parseInt(hex.slice(1), 16);
      var r = clamp(((n >> 16) & 255) + amt, 0, 255),
          g = clamp(((n >> 8) & 255) + amt, 0, 255),
          b = clamp((n & 255) + amt, 0, 255);
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    var SHAPES = {
      Aperti: function (cx, cy) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="27" fill="#241C15"/>' +
               '<circle cx="' + cx + '" cy="' + cy + '" r="27" fill="none" stroke="rgba(247,242,233,.35)" stroke-width="2"/>';
      },
      Cuori: function (cx, cy) {
        return '<path transform="translate(' + (cx - 28) + ',' + (cy - 26) + ') scale(1.12)" d="M25 46S2 31 2 16A11 11 0 0 1 25 9 11 11 0 0 1 48 16c0 15-23 30-23 30Z" fill="#241C15"/>';
      },
      Stelle: function (cx, cy) {
        return '<path transform="translate(' + (cx - 28) + ',' + (cy - 27) + ') scale(1.1)" d="M25 0l7 17 18 2-13 12 4 19-16-10-16 10 4-19L0 19l18-2Z" fill="#241C15"/>';
      },
      Chiusi: function (cx, cy, hex) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="27" fill="' + shade(hex, 34) + '"/>' +
               '<circle cx="' + cx + '" cy="' + cy + '" r="27" fill="none" stroke="' + shade(hex, -50) + '" stroke-width="2.5" stroke-dasharray="7 6"/>';
      }
    };

    function render() {
      var hex = state.hex;
      upper.setAttribute("fill", hex);
      strap.setAttribute("fill", shade(hex, -28));
      sole.setAttribute("fill", state.fondo === "Cuoio naturale" ? "#C9A57C" : "#2B2621");
      stitch.setAttribute("stroke", state.fondo === "Cuoio naturale" ? "#8B5A2B" : "#D9A441");
      eyeG.innerHTML = SHAPES[state.occhi](162, 140, hex) + SHAPES[state.occhi](238, 140, hex);
      recap.innerHTML = "Due Occhi in <b>" + state.pelle.toLowerCase() + "</b> colore <b>" +
        state.colore.toLowerCase() + "</b>, occhi <b>" + state.occhi.toLowerCase() + "</b>, fondo <b>" +
        state.fondo.toLowerCase() + "</b>. Tagliato dopo l'ordine · pronto in <b>15 giorni</b>.";

      /* la forma degli occhi non e' nella geometria del modello: la mostriamo a parte */
      if (eyeDetail) {
        eyeDetail.innerHTML = '<rect width="210" height="96" rx="4" fill="' + hex + '"/>' +
          SHAPES[state.occhi](74, 48, hex) + SHAPES[state.occhi](136, 48, hex);
      }

      /* i tre materiali del modello 3D seguono la configurazione */
      var colors = {
        pelle: hex,
        fondo: state.fondo === "Cuoio naturale" ? "#C9A57C" : "#2B2621",
        filo: "#EFE0C8",
        lucida: state.pelle === "Vernice" || state.pelle === "Laminato"
      };
      if (window.EurekaModel) window.EurekaModel.setColors(colors);
      else window.EurekaPendingColors = colors;
    }

    $$("[data-group]").forEach(function (group) {
      var key = group.dataset.group;
      group.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        $$("button", group).forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        if (key === "colore") { state.colore = btn.dataset.val; state.hex = btn.dataset.color; }
        else { state[key] = btn.dataset.val; }
        render();
      });
    });
    render();
  })();

  /* ---------- 12. un solo loop di scroll ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      if (nav) nav.classList.toggle("solid", y > 60);

      // voce di menu attiva
      var active = null;
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.42) active = s.id;
      });
      navLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + active);
      });

      paintSeams();
      paintTimeline();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
