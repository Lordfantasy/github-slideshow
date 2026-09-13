/* =========================================================
   EUREKA — il modello 3D del sandalo due occhi
   Il .glb espone tre materiali: "pelle", "fondo", "fodera_e_filo".
   Il configuratore li ricolora dal vivo.
   Se WebGL manca o il modello non si carica, restano i disegni SVG.
   ========================================================= */
(function () {
  "use strict";
  if (!window.EUREKA3) return;

  var THREE = window.EUREKA3.THREE;
  var GLTFLoader = window.EUREKA3.GLTFLoader;
  var RoomEnvironment = window.EUREKA3.RoomEnvironment;
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* WebGL disponibile? */
  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }
  if (!hasWebGL()) return;

  var MODEL_URL = "assets/models/eureka-due-occhi.glb";

  /* ---------------------------------------------------------
     Una scena per contenitore. Rende solo quando è visibile.
     --------------------------------------------------------- */
  function Stage(host, opts) {
    this.host = host;
    this.opts = opts || {};
    this.visible = false;
    this.needsRender = true;

    var w = host.clientWidth || 400, h = host.clientHeight || 400;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.opts.exposure || 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, w / h, 0.05, 50);

    /* luce d'ambiente procedurale: niente file HDR da scaricare */
    var pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = this.opts.envIntensity || 0.85;

    var key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.2, 3.4, 2.0);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 4;
    key.shadow.bias = -0.0012;
    var s = key.shadow.camera;
    s.left = -1.2; s.right = 1.2; s.top = 1.2; s.bottom = -1.2; s.near = 0.1; s.far = 9;
    this.scene.add(key);

    var rim = new THREE.DirectionalLight(0xffe6c0, 0.75);
    rim.position.set(-2.4, 1.4, -2.0);
    this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xfff6e8, 0x4a3524, 0.45));

    /* piano che riceve solo l'ombra */
    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.ShadowMaterial({ opacity: this.opts.shadowOpacity != null ? this.opts.shadowOpacity : 0.26 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.receiveShadow = true;
    this.scene.add(shadow);
    this.shadowPlane = shadow;

    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    /* stato dell'interazione */
    this.rotY = this.opts.startY || 0;
    this.targetY = this.rotY;
    this.rotX = 0;
    this.targetX = 0;
    this.spin = RM ? 0 : (this.opts.spin || 0);
    this.dragging = false;
    this.lastPointer = null;
    this.velocity = 0;
    this.t0 = performance.now();

    this._bindPointer();
    this._observe();
    window.addEventListener("resize", this.resize.bind(this));
  }

  Stage.prototype.setModel = function (root, box) {
    /* centra il modello e lo appoggia a terra */
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -box.min.y, -center.z);

    var holder = new THREE.Group();
    holder.add(root);
    this.pivot.add(holder);
    this.holder = holder;
    this.modelSize = size;

    root.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });

    /* inquadratura calcolata sul volume reale, non a occhio */
    var radius = size.length() / 2;
    var dist = radius / Math.sin((this.camera.fov * Math.PI / 180) / 2);
    dist *= this.opts.zoom || 1.25;
    var el = this.opts.elevation != null ? this.opts.elevation : 0.42;
    this.camera.position.set(0, dist * el, dist);
    this.lookAt = new THREE.Vector3(0, size.y * 0.52, 0);
    this.camera.lookAt(this.lookAt);
    this.shadowPlane.position.y = 0.001;
    this.needsRender = true;
    this.resize();
  };

  Stage.prototype._bindPointer = function () {
    var self = this, el = this.host;

    el.addEventListener("pointerdown", function (e) {
      self.dragging = true;
      self.lastPointer = e.clientX;
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (!self.dragging) return;
      var dx = e.clientX - self.lastPointer;
      self.lastPointer = e.clientX;
      self.targetY += dx * 0.008;
      self.velocity = dx * 0.008;
      self.needsRender = true;
    });
    var end = function (e) {
      if (!self.dragging) return;
      self.dragging = false;
      el.classList.remove("dragging");
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    /* si gira anche da tastiera: trascinare non e' l'unico modo */
    el.addEventListener("keydown", function (e) {
      var step = 0.28;
      if (e.key === "ArrowLeft") self.targetY -= step;
      else if (e.key === "ArrowRight") self.targetY += step;
      else return;
      e.preventDefault();
      self.velocity = 0;
      self.needsRender = true;
    });

    /* fuori dal trascinamento il sandalo segue chi guarda, come facevano gli occhi */
    if (!RM && this.opts.followPointer) {
      window.addEventListener("pointermove", function (e) {
        if (self.dragging) return;
        var r = el.getBoundingClientRect();
        if (!r.width) return;
        var nx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        var ny = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        self.pointerY = nx * (self.opts.followAmount || 0.45);
        self.pointerX = Math.max(-0.22, Math.min(0.22, ny * 0.3));
        self.needsRender = true;
      }, { passive: true });
    }
  };

  Stage.prototype._observe = function () {
    var self = this;
    new IntersectionObserver(function (en) {
      en.forEach(function (e) { self.visible = e.isIntersecting; self.needsRender = true; });
    }, { threshold: 0.02 }).observe(this.host);
  };

  Stage.prototype.resize = function () {
    var w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.needsRender = true;
  };

  Stage.prototype.tick = function (now) {
    if (!this.visible || document.hidden) return;
    if (RM) {
      if (!this.needsRender) return;
      this.pivot.rotation.y = this.targetY;   /* le frecce funzionano anche senza animazioni */
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
      return;
    }

    if (!this.dragging) {
      this.targetY += this.spin;
      if (Math.abs(this.velocity) > 0.0001) { this.targetY += this.velocity; this.velocity *= 0.93; }
    }
    var wantY = this.targetY + (this.pointerY || 0);
    var wantX = (this.pointerX || 0);
    this.rotY += (wantY - this.rotY) * 0.08;
    this.rotX += (wantX - this.rotX) * 0.08;
    this.pivot.rotation.y = this.rotY;
    this.pivot.rotation.x = this.rotX;

    if (this.holder && this.opts.float) {
      var t = (now - this.t0) / 1000;
      this.holder.position.y = Math.sin(t * 0.9) * 0.022 + 0.022;
      this.shadowPlane.material.opacity = 0.26 - Math.sin(t * 0.9) * 0.05;
    }
    this.renderer.render(this.scene, this.camera);
  };

  /* ---------------------------------------------------------
     Caricamento: una volta sola, poi si clona per ogni scena.
     --------------------------------------------------------- */
  var stages = [];
  function loop(now) { for (var i = 0; i < stages.length; i++) stages[i].tick(now); requestAnimationFrame(loop); }

  function findMaterials(root) {
    var map = {};
    root.traverse(function (o) {
      if (!o.isMesh) return;
      var mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(function (m) { if (m && m.name) map[m.name] = m; });
    });
    return map;
  }

  function build(gltf) {
    var src = gltf.scene;
    var box = new THREE.Box3().setFromObject(src);

    /* --- HERO --- */
    var heroHost = document.getElementById("hero3d");
    if (heroHost) {
      var heroStage = new Stage(heroHost, {
        spin: 0, float: true, followPointer: true, followAmount: 0.42,
        zoom: 0.72, startY: 3.66, elevation: 0.34
      });
      var heroModel = src.clone(true);
      /* tinta piena, senza compensazione: sulla grana dipinta da' il cuoio scuro della casa */
      paint(findMaterials(heroModel), { pelle: "#A8622F", fondo: "#C9A57C", filo: "#EFE0C8" }, 1);
      heroStage.setModel(heroModel, box.clone());
      stages.push(heroStage);
      heroHost.classList.add("ready");
      document.querySelector(".hero-stage").classList.add("has3d");
    }

    /* --- CONFIGURATORE --- */
    var cfgHost = document.getElementById("cfg3d");
    if (cfgHost) {
      var cfgStage = new Stage(cfgHost, {
        spin: 0.0018, float: false, followPointer: false, zoom: 0.62, startY: 3.49,
        elevation: 0.34, shadowOpacity: 0.4, envIntensity: 0.75, exposure: 1.15
      });
      var cfgModel = src.clone(true);
      /* materiali indipendenti: il configuratore non deve tingere anche l'hero */
      var seen = {};
      cfgModel.traverse(function (o) {
        if (!o.isMesh) return;
        if (Array.isArray(o.material)) o.material = o.material.map(cloneMat);
        else o.material = cloneMat(o.material);
        function cloneMat(m) {
          if (!m) return m;
          if (!seen[m.name]) { seen[m.name] = m.clone(); seen[m.name].name = m.name; }
          return seen[m.name];
        }
      });
      cfgStage.setModel(cfgModel, box.clone());
      stages.push(cfgStage);
      cfgHost.classList.add("ready");
      document.querySelector(".config-stage").classList.add("has3d");

      var cfgMats = findMaterials(cfgModel);
      window.EurekaModel = {
        setColors: function (c) { paint(cfgMats, c); cfgStage.needsRender = true; }
      };
      if (window.EurekaPendingColors) window.EurekaModel.setColors(window.EurekaPendingColors);
    }

    window.Eureka3D = { stages: stages };  /* utile per verifiche e regolazioni */
    requestAnimationFrame(loop);
  }

  /* I COLOR_0 del modello portano la grana della pelle: hanno luminanza media 0.235,
     quindi il colore del materiale ci si moltiplica sopra e scurirebbe di oltre quattro volte.
     Lo compensiamo, lasciando pero' un residuo di quel bruno: e' cosi' che si comporta
     una pelle tinta davvero. */
  var GRANA = 2.4;

  function paint(mats, c, k) {
    if (k == null) k = GRANA;
    if (mats.pelle) {
      mats.pelle.color.set(c.pelle).multiplyScalar(k);
      mats.pelle.roughness = c.lucida ? 0.14 : 0.34;
      mats.pelle.needsUpdate = true;
    }
    if (mats.fondo) {
      mats.fondo.color.set(c.fondo).multiplyScalar(k);
      mats.fondo.roughness = 0.85;
      mats.fondo.needsUpdate = true;
    }
    if (mats.fodera_e_filo) {
      mats.fodera_e_filo.color.set(c.filo).multiplyScalar(k * 0.92);
      mats.fodera_e_filo.roughness = 0.75;
      mats.fodera_e_filo.needsUpdate = true;
    }
  }

  function fail(msg) {
    document.querySelectorAll(".stage3d").forEach(function (h) { h.classList.add("failed"); });
    if (window.console && console.warn) console.warn("[eureka] modello 3D non caricato:", msg);
  }

  var loader = new GLTFLoader();
  function onProgress(e) {
    if (!e.lengthComputable) return;
    var pct = Math.round(e.loaded / e.total * 100);
    document.querySelectorAll(".loading3d b").forEach(function (b) { b.textContent = pct + "%"; });
  }

  if (window.EUREKA_MODEL_DATA) {
    /* versione in file unico: il modello viaggia dentro la pagina */
    try {
      var bin = atob(window.EUREKA_MODEL_DATA), len = bin.length, buf = new Uint8Array(len);
      for (var i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
      loader.parse(buf.buffer, "", build, function (e) { fail(e); });
    } catch (e) { fail(e); }
  } else {
    loader.load(MODEL_URL, build, onProgress, function (e) { fail(e && e.message ? e.message : e); });
  }
})();
