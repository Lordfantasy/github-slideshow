/* =========================================================
   EUREKA — L'apertura
   Una sequenza legata allo scorrimento: la scatola si apre, la velina
   si scosta, la scarpa sale e i fili le girano attorno.
   La scatola e i fili sono costruiti qui; la scarpa e' il modello .glb
   gia' caricato da eureka-3d.js (non si scarica due volte).
   ========================================================= */
(function () {
  "use strict";
  if (!window.EUREKA3) return;

  var THREE = window.EUREKA3.THREE;
  var RoomEnvironment = window.EUREKA3.RoomEnvironment;
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var host = document.getElementById("unbox3d");
  var section = document.getElementById("apertura");
  if (!host || !section) return;

  /* ---------- utilita' di scena ---------- */
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  /* avanzamento normalizzato su un intervallo, con partenza e arrivo morbidi */
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- misure della scatola, ricavate dalla scarpa ---------- */
  var BW = 0.66, BH = 0.54, BD = 1.30, T = 0.022;   /* larghezza, altezza, profondita', spessore */

  var renderer, scene, camera, boxGroup, lid, shoe, laces = [], tissueL, tissueR, shadowPlane;
  var visible = false, ready = false;

  /* ---------- il marchio impresso sul coperchio ---------- */
  function lidTexture() {
    /* La tela segue le proporzioni del coperchio (0.71 x 1.35): con un
       rapporto diverso il marchio si stira e si sparpaglia. */
    var W = 512, H = 972;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d");
    g.fillStyle = "#C09C71"; g.fillRect(0, 0, W, H);
    for (var i = 0; i < 12000; i++) {
      g.fillStyle = "rgba(90,62,35," + (Math.random() * 0.09) + ")";
      g.fillRect(Math.random() * W, Math.random() * H, 2, 1);
    }
    g.save();
    g.translate(W / 2, H / 2);
    g.rotate(-Math.PI / 2);          /* il marchio corre nel senso lungo della scatola */
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#4A2A11";
    g.font = "700 122px Georgia, serif";
    var word = "EUREKA", sp = 104, x = -(word.length - 1) * sp / 2;
    for (var k = 0; k < word.length; k++) g.fillText(word[k], x + k * sp, -26);
    g.font = "34px monospace";
    g.fillStyle = "rgba(74,42,17,.72)";
    var sub = "THE ORIGINAL", sp2 = 40, x2 = -(sub.length - 1) * sp2 / 2;
    for (var j = 0; j < sub.length; j++) g.fillText(sub[j], x2 + j * sp2, 78);
    /* filetto impresso attorno al marchio */
    g.strokeStyle = "rgba(74,42,17,.45)"; g.lineWidth = 3;
    g.strokeRect(-H * 0.34, -W * 0.30, H * 0.68, W * 0.60);
    g.restore();
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  function panel(w, h, d, mat, x, y, z) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  function buildBox() {
    var out = new THREE.MeshStandardMaterial({ color: 0xC09C71, roughness: 0.94, metalness: 0 });
    var inn = new THREE.MeshStandardMaterial({ color: 0x4A3526, roughness: 0.96, metalness: 0 });

    var base = new THREE.Group();
    base.add(panel(BW, T, BD, inn, 0, T / 2, 0));                       /* fondo */
    base.add(panel(T, BH, BD, out, -BW / 2, BH / 2, 0));                /* fianchi */
    base.add(panel(T, BH, BD, out, BW / 2, BH / 2, 0));
    base.add(panel(BW, BH, T, out, 0, BH / 2, -BD / 2));                /* testate */
    base.add(panel(BW, BH, T, out, 0, BH / 2, BD / 2));

    lid = new THREE.Group();
    var top = panel(BW + 0.05, T, BD + 0.05, new THREE.MeshStandardMaterial({
      map: lidTexture(), roughness: 0.9, metalness: 0
    }), 0, 0, 0);
    lid.add(top);
    var skirt = 0.13;
    lid.add(panel(T, skirt, BD + 0.05, out, -(BW + 0.05) / 2, -skirt / 2, 0));
    lid.add(panel(T, skirt, BD + 0.05, out, (BW + 0.05) / 2, -skirt / 2, 0));
    lid.add(panel(BW + 0.05, skirt, T, out, 0, -skirt / 2, -(BD + 0.05) / 2));
    lid.add(panel(BW + 0.05, skirt, T, out, 0, -skirt / 2, (BD + 0.05) / 2));
    lid.position.y = BH;

    /* velina: due falde che si scostano ruotando sui bordi lunghi */
    var paper = new THREE.MeshStandardMaterial({
      color: 0xEFE6D6, roughness: 0.95, metalness: 0,
      side: THREE.DoubleSide, transparent: true, opacity: 0.97
    });
    function flap(sign) {
      /* cerniera sul bordo lungo della scatola, foglio steso verso il centro */
      var g = new THREE.Group();
      var p = new THREE.Mesh(new THREE.PlaneGeometry(BW * 0.54, BD * 0.92, 8, 14), paper);
      p.rotation.x = -Math.PI / 2;
      p.position.x = -sign * BW * 0.27;
      p.castShadow = true;
      g.add(p);
      g.position.set(sign * (BW / 2 - T), BH - 0.05, 0);
      return g;
    }
    tissueL = flap(-1); tissueR = flap(1);

    boxGroup = new THREE.Group();
    boxGroup.add(base, lid, tissueL, tissueR);
    scene.add(boxGroup);
  }

  /* ---------- i fili: tubi deformati nel vertex shader ---------- */
  function buildLaces() {
    [
      { r: 0.34, h: 1.25, turns: 2.1, color: 0xC2402A, phase: 0.0,  rad: 0.011 },
      { r: 0.46, h: 1.45, turns: 1.6, color: 0xD9A441, phase: 2.1,  rad: 0.009 },
      { r: 0.27, h: 1.05, turns: 2.8, color: 0x7A431E, phase: 4.2,  rad: 0.008 }
    ].forEach(function (o) {
      var pts = [];
      for (var i = 0; i <= 70; i++) {
        var t = i / 70, a = t * Math.PI * 2 * o.turns + o.phase;
        /* il raggio si apre e si richiude: il filo avvolge invece di salire dritto */
        var rr = o.r * (0.55 + 0.45 * Math.sin(t * Math.PI));
        pts.push(new THREE.Vector3(Math.cos(a) * rr, t * o.h, Math.sin(a) * rr));
      }
      var curve = new THREE.CatmullRomCurve3(pts);
      var mat = new THREE.MeshStandardMaterial({
        color: o.color, roughness: 0.72, metalness: 0, transparent: true, opacity: 0
      });
      /* l'ondeggiamento avviene sulla GPU: nessuna geometria ricostruita ogni fotogramma */
      mat.onBeforeCompile = function (sh) {
        sh.uniforms.uTime = { value: 0 };
        sh.uniforms.uAmp = { value: 0 };
        sh.vertexShader = "uniform float uTime;\nuniform float uAmp;\n" + sh.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\n" +
          "  transformed.x += sin(transformed.y * 7.0 + uTime * 1.7) * uAmp;\n" +
          "  transformed.z += cos(transformed.y * 5.5 + uTime * 1.3) * uAmp;"
        );
        mat.userData.sh = sh;
      };
      var mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 170, o.rad, 7, false), mat);
      mesh.visible = false;
      scene.add(mesh);
      laces.push(mesh);
    });
  }

  /* ---------- scena ---------- */
  function init(source) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60);

    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.62;

    var key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(2.0, 3.6, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 4; key.shadow.bias = -0.0013;
    var s = key.shadow.camera;
    s.left = -2; s.right = 2; s.top = 2; s.bottom = -2; s.near = 0.1; s.far = 12;
    scene.add(key);
    scene.add(new THREE.DirectionalLight(0xffe6c0, 0.7).translateX(-2.4).translateY(1.4).translateZ(-2));
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0x4a3524, 0.5));

    shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.ShadowMaterial({ opacity: 0.3 }));
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    buildBox();
    buildLaces();

    /* la scarpa: clone del modello gia' in memoria, con materiali propri */
    shoe = source.clone(true);
    var seen = {};
    shoe.traverse(function (o) {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      var c = function (m) {
        if (!m) return m;
        if (!seen[m.name]) {
          seen[m.name] = m.clone();
          seen[m.name].name = m.name;
          if (m.name === "pelle") seen[m.name].color.set("#A8622F");
          if (m.name === "fondo") seen[m.name].color.set("#C9A57C");
          if (m.name === "fodera_e_filo") seen[m.name].color.set("#EFE0C8");
        }
        return seen[m.name];
      };
      o.material = Array.isArray(o.material) ? o.material.map(c) : c(o.material);
    });
    var bb = new THREE.Box3().setFromObject(shoe);
    var ctr = bb.getCenter(new THREE.Vector3());
    shoe.position.set(-ctr.x, -bb.min.y, -ctr.z);
    var holder = new THREE.Group();
    holder.add(shoe);
    scene.add(holder);
    shoe = holder;

    resize();
    window.addEventListener("resize", resize);
    new IntersectionObserver(function (en) {
      en.forEach(function (e) { visible = e.isIntersecting; });
    }, { threshold: 0 }).observe(section);

    ready = true;
    host.classList.add("ready");
    section.classList.add("has3d");
    requestAnimationFrame(loop);
  }

  function resize() {
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || !renderer) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---------- la coreografia ---------- */
  var caps = [];
  function applyTimeline(p, time) {
    /* 1. coperchio: si stacca, sale e si allontana ruotando */
    var lp = ease(seg(p, 0.12, 0.44));
    lid.position.y = BH + lp * 1.5;
    lid.position.x = lp * 0.55;
    lid.position.z = lp * 0.30;
    lid.rotation.z = -lp * 0.55;
    lid.rotation.x = lp * 0.30;
    lid.visible = lp < 0.995;

    /* 2. velina: due falde che si aprono verso l'esterno */
    var tp = ease(seg(p, 0.30, 0.56));
    tissueL.rotation.z = tp * 2.35;
    tissueR.rotation.z = -tp * 2.35;

    /* 3. la scarpa sale e si gira verso la posa che mostra gli occhietti */
    var sp = easeOut(seg(p, 0.40, 0.82));
    shoe.position.y = lerp(0.03, 0.66, sp);
    shoe.rotation.y = lerp(0.25, 3.66, sp);
    shoe.rotation.z = Math.sin(sp * Math.PI) * 0.12;      /* appena inclinata mentre esce */
    shoe.position.x = Math.sin(sp * Math.PI) * 0.04;

    /* 4. i fili salgono con lei e ondeggiano */
    var fp = seg(p, 0.52, 0.95);
    laces.forEach(function (m, i) {
      var o = clamp(fp * 1.4 - i * 0.18, 0, 1);
      m.visible = o > 0.01;
      m.material.opacity = o * 0.95;
      m.position.y = lerp(-0.2, 0.05, easeOut(fp));
      m.rotation.y = time * (0.18 + i * 0.05) + i;
      var sh = m.material.userData.sh;
      if (sh) {
        sh.uniforms.uTime.value = time;
        sh.uniforms.uAmp.value = 0.035 * o;
      }
    });

    /* 5. la scatola si abbassa e sfuma quando ha finito il suo compito */
    var bp = ease(seg(p, 0.74, 1.0));
    boxGroup.position.y = -bp * 0.55;
    boxGroup.traverse(function (o) {
      if (!o.isMesh) return;
      o.material.transparent = true;
      o.material.opacity = 1 - bp * 0.92;
    });
    shadowPlane.material.opacity = 0.3 - bp * 0.12;

    /* 6. macchina da presa: gira attorno e si alza */
    var cp = ease(p);
    var ang = lerp(0.95, 0.02, cp);
    var dist = lerp(2.25, 2.05, cp);
    camera.position.set(Math.sin(ang) * dist, lerp(0.85, 1.05, cp), Math.cos(ang) * dist);
    camera.lookAt(0, lerp(0.22, 0.62, cp), 0);

    /* 7. didascalie */
    caps.forEach(function (el, i) {
      var a = +el.dataset.from, b = +el.dataset.to;
      var o = p < a || p > b ? 0 : Math.min((p - a) / 0.06, (b - p) / 0.06, 1);
      el.style.opacity = clamp(o, 0, 1);
      el.style.transform = "translateY(" + (1 - clamp(o, 0, 1)) * 14 + "px)";
    });
  }

  function progress() {
    var r = section.getBoundingClientRect();
    var travel = r.height - window.innerHeight;
    if (travel <= 0) return 0;
    return clamp(-r.top / travel, 0, 1);
  }

  function loop(now) {
    requestAnimationFrame(loop);
    if (!ready || !visible || document.hidden) return;
    applyTimeline(RM ? 1 : progress(), now / 1000);
    renderer.render(scene, camera);
  }

  /* ---------- avvio: attende il modello caricato da eureka-3d.js ---------- */
  caps = Array.prototype.slice.call(document.querySelectorAll(".unbox-cap"));
  function start(src) { if (!ready && src) init(src); }
  if (window.Eureka3D && window.Eureka3D.source) start(window.Eureka3D.source);
  else document.addEventListener("eureka:model", function (e) { start(e.detail.source); });
})();
