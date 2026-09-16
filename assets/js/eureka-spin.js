/* =========================================================
   EUREKA — il giro della scarpa
   Fotogrammi calcolati fuori dal browser, a risoluzione quadrupla e poi
   rimpiccioliti: il dettaglio della pelle non sfarfalla piu'. Trascinare
   scorre le pose, quindi la scarpa si gira ancora come prima.
   Funziona senza WebGL e, per il primo fotogramma, anche senza JavaScript.
   ========================================================= */
(function () {
  "use strict";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function Spin(host) {
    var n = parseInt(host.dataset.frames, 10) || 0;
    var pattern = host.dataset.pattern;
    if (!n || !pattern) return;

    var self = this;
    this.host = host;
    this.n = n;
    this.frames = new Array(n);
    this.loaded = new Array(n);
    this.current = 0;
    this.angle = 0;
    this.dragging = false;
    this.touched = false;

    this.frames[0] = host.querySelector(".spin-frame");
    this.loaded[0] = true;

    /* Caricamento a ondate: prima una pose ogni quattro, cosi' trascinare
       funziona subito; il resto arriva dopo e il giro diventa fluido. */
    function url(i) { return pattern.replace("%", String(i).padStart(2, "0")); }
    function add(i) {
      if (self.frames[i]) return;
      var img = new Image();
      img.className = "spin-frame";
      img.decoding = "async";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.addEventListener("load", function () { self.loaded[i] = true; });
      img.src = url(i);
      self.frames[i] = img;
      host.insertBefore(img, host.firstChild);
    }
    var coarse = [], fine = [];
    for (var i = 1; i < n; i++) (i % 4 === 0 ? coarse : fine).push(i);
    coarse.forEach(add);
    var rest = function () { fine.forEach(add); };
    if ("requestIdleCallback" in window) requestIdleCallback(rest, { timeout: 2500 });
    else setTimeout(rest, 1200);

    /* mostra il fotogramma caricato piu' vicino a quello richiesto */
    this.show = function (idx) {
      idx = ((idx % n) + n) % n;
      var pick = idx;
      if (!this.loaded[pick]) {
        for (var d = 1; d < n; d++) {
          if (this.loaded[(idx + d) % n]) { pick = (idx + d) % n; break; }
          if (this.loaded[(idx - d + n) % n]) { pick = (idx - d + n) % n; break; }
        }
      }
      if (pick === this.current) return;
      var prev = this.frames[this.current];
      if (prev) prev.classList.remove("is-on");
      var next = this.frames[pick];
      if (next) next.classList.add("is-on");
      this.current = pick;
    };

    this.setAngle = function (a) {
      this.angle = a;
      this.show(Math.round(a / (Math.PI * 2) * n));
    };

    /* --- trascinamento --- */
    var last = 0;
    host.addEventListener("pointerdown", function (e) {
      self.dragging = true; self.touched = true; last = e.clientX;
      host.setPointerCapture(e.pointerId);
      host.classList.add("dragging");
    });
    host.addEventListener("pointermove", function (e) {
      if (!self.dragging) return;
      var dx = e.clientX - last;
      last = e.clientX;
      /* mezzo schermo di trascinamento = un giro intero */
      self.setAngle(self.angle + dx / (window.innerWidth * 0.5) * Math.PI * 2);
    });
    function end(e) {
      if (!self.dragging) return;
      self.dragging = false;
      host.classList.remove("dragging");
      try { host.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);

    /* --- tastiera --- */
    host.addEventListener("keydown", function (e) {
      var step = (Math.PI * 2) / n;
      if (e.key === "ArrowLeft") self.setAngle(self.angle - step);
      else if (e.key === "ArrowRight") self.setAngle(self.angle + step);
      else return;
      self.touched = true;
      e.preventDefault();
    });

    /* --- giro lento finche' nessuno tocca, per far capire che si puo' --- */
    if (!RM) {
      var t0 = performance.now(), seen = false;
      new IntersectionObserver(function (en) {
        en.forEach(function (x) { seen = x.isIntersecting; });
      }, { threshold: 0.15 }).observe(host);
      (function idle(t) {
        requestAnimationFrame(idle);
        if (self.touched || self.dragging || !seen || document.hidden) return;
        self.setAngle((t - t0) / 1000 * 0.22);
      })(t0);
    }

    host.classList.add("ready");
  }

  document.querySelectorAll(".spin").forEach(function (el) { new Spin(el); });
})();
