/* =========================================================
   EUREKA — la resa dei materiali
   Il modello non ha UV ne' texture: nessuna mappa puo' essergli
   applicata. Quel che resta si puo' fare comunque:
     1. una luce da studio al posto dell'ambiente generico
     2. la grana della pelle calcolata nel frammento a partire dalla
        posizione nel mondo (proiezione triplanare implicita, niente UV)
     3. una vernice trasparente sopra il cuoio, come una scarpa lucidata
   ========================================================= */
(function () {
  "use strict";
  if (!window.EUREKA3) return;
  var THREE = window.EUREKA3.THREE;

  /* ---------- 1. studio: pannelli luminosi invece di una stanza qualsiasi ----------
     RoomEnvironment mette scatole a caso: i riflessi risultano piatti.
     Qui i riflessi sono rettangoli allungati, come in una foto di prodotto. */
  function studio() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0E0D10);
    var geo = new THREE.PlaneGeometry(1, 1);
    var target = new THREE.Vector3(0, 0.3, 0);
    function panel(w, h, x, y, z, color, power) {
      var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide
      }));
      m.scale.set(w, h, 1);
      m.position.set(x, y, z);
      m.lookAt(target);
      scene.add(m);
    }
    panel(3.6, 2.2,  2.6, 2.5,  2.0, 0xFFF4E6, 8.0);   /* chiave, calda e ampia */
    panel(3.0, 3.0, -3.2, 1.3,  1.3, 0xE6EEFF, 2.0);   /* riempimento freddo   */
    panel(2.2, 3.6, -1.1, 1.9, -3.0, 0xFFD9A0, 5.0);   /* controluce sul bordo */
    panel(6.0, 6.0,  0.0, 4.4,  0.0, 0xFFFFFF, 1.5);   /* cielo                */
    panel(7.0, 7.0,  0.0,-2.2,  0.0, 0x6B5844, 0.7);   /* rimbalzo dal piano   */
    return scene;
  }

  var cachedEnv = null;
  function environment(renderer) {
    if (cachedEnv) return cachedEnv;
    var pmrem = new THREE.PMREMGenerator(renderer);
    cachedEnv = pmrem.fromScene(studio(), 0.02).texture;
    return cachedEnv;
  }

  /* ---------- 2. grana nel frammento, senza UV ----------
     Rumore di valore 3D campionato sulla posizione nel mondo: la normale
     viene perturbata con le differenze finite del rumore, e la ruvidezza
     varia insieme. E' quello che farebbe una normal map, ma calcolato. */
  /* Nota: la tomaia NON riceve perturbazione della normale. La grana e'
     scolpita nella geometria del modello (191k vertici di micro-rilievi):
     aggiungerne altra raddoppierebbe soltanto il rumore. Qui resta la
     variazione di ruvidezza, che non aggiunge dettaglio geometrico. */
  var GRAIN_GLSL = [
    "varying vec3 vWPosG;",
    "float hash31(vec3 p){p=fract(p*0.3183099+vec3(0.11,0.17,0.13));p*=17.0;",
    "  return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}",
    "float vnoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);",
    "  return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),",
    "                 mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),",
    "             mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),",
    "                 mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}",
    "float grain(vec3 p){return vnoise(p)*0.58+vnoise(p*2.7)*0.29+vnoise(p*6.3)*0.13;}"
  ].join("\n");

  function addGrain(mat, opts) {
    var o = opts || {};
    var scale = o.scale || 260.0;   /* quante pieghe per unita' di modello */
    var amp = o.amp != null ? o.amp : 0.55;
    var rough = o.rough != null ? o.rough : 0.20;
    /* Quanto conta la macchiettatura dipinta nei vertici. Con 191k vertici
       equivale a una mappa da ~440x440: da vicino si vede a chiazze. La
       attenuiamo verso la sua media (0.235 in lineare, misurata sul file)
       e mettiamo al suo posto la grana calcolata, molto piu' fitta. */
    var vc = o.vc != null ? o.vc : 1.0;
    var prev = mat.onBeforeCompile;
    mat.onBeforeCompile = function (sh) {
      if (prev) prev(sh);
      sh.uniforms.uGrainScale = { value: scale };
      sh.uniforms.uGrainAmp = { value: amp };
      sh.uniforms.uGrainRough = { value: rough };
      sh.uniforms.uVCContrast = { value: vc };

      sh.vertexShader = "varying vec3 vWPosG;\n" + sh.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vWPosG = (modelMatrix * vec4(transformed,1.0)).xyz;"
      );

      sh.fragmentShader = "uniform float uGrainScale;\nuniform float uGrainAmp;\nuniform float uGrainRough;\nuniform float uVCContrast;\n" +
        GRAIN_GLSL + "\n" + sh.fragmentShader
        .replace("#include <normal_fragment_begin>",
          "#include <normal_fragment_begin>\n" +
          "  {\n" +
          "    vec3 gp = vWPosG * uGrainScale;\n" +
          "    float g0 = grain(gp);\n" +
          "    float e = 0.55;\n" +
          "    vec3 bump = vec3(grain(gp+vec3(e,0.0,0.0))-g0,\n" +
          "                     grain(gp+vec3(0.0,e,0.0))-g0,\n" +
          "                     grain(gp+vec3(0.0,0.0,e))-g0);\n" +
          "    normal = normalize(normal + bump * uGrainAmp);\n" +
          "  }")
        .replace("#include <color_fragment>",
          "#if defined( USE_COLOR_ALPHA )\n" +
          "  { vec4 vc = vColor; vc.rgb = mix(vec3(0.235), vc.rgb, uVCContrast); diffuseColor *= vc; }\n" +
          "#elif defined( USE_COLOR )\n" +
          "  { vec3 vc = mix(vec3(0.235), vColor.rgb, uVCContrast); diffuseColor.rgb *= vc; }\n" +
          "#endif")
        .replace("#include <roughnessmap_fragment>",
          "#include <roughnessmap_fragment>\n" +
          "  roughnessFactor = clamp(roughnessFactor + (grain(vWPosG*uGrainScale*0.42)-0.5)*uGrainRough, 0.04, 1.0);");
      mat.userData.grainShader = sh;
    };
    mat.needsUpdate = true;
    return mat;
  }

  /* ---------- 3. vernice trasparente: il lucido di una scarpa curata ---------- */
  function toPhysical(std, extra) {
    var p = new THREE.MeshPhysicalMaterial({
      name: std.name,
      color: std.color.clone(),
      roughness: std.roughness,
      metalness: std.metalness,
      vertexColors: std.vertexColors,   /* la grana dipinta nei vertici resta */
      side: std.side,
      transparent: std.transparent,
      opacity: std.opacity
    });
    Object.assign(p, extra || {});
    return p;
  }

  /* Applica la resa giusta ai tre materiali del modello. */
  function dress(root, recipe) {
    var made = {};
    root.traverse(function (obj) {
      if (!obj.isMesh) return;
      var swap = function (m) {
        if (!m || !m.name) return m;
        if (made[m.name]) return made[m.name];
        var r = (recipe && recipe[m.name]) || {};
        var mat;
        if (m.name === "pelle") {
          mat = toPhysical(m, { clearcoat: 0.38, clearcoatRoughness: 0.34, roughness: 0.42 });
          addGrain(mat, { scale: 680, amp: 0.0, rough: 0.12, vc: 1.0 });
        } else if (m.name === "fondo") {
          mat = toPhysical(m, { clearcoat: 0.05, roughness: 0.88 });
          addGrain(mat, { scale: 260, amp: 0.30, rough: 0.14, vc: 1.0 });
        } else {
          mat = toPhysical(m, { sheen: 0.55, sheenRoughness: 0.9, roughness: 0.82 });
          addGrain(mat, { scale: 520, amp: 0.20, rough: 0.10, vc: 1.0 });
        }
        if (r.color) mat.color.set(r.color);
        if (r.multiply) mat.color.multiplyScalar(r.multiply);
        made[m.name] = mat;
        return mat;
      };
      obj.material = Array.isArray(obj.material) ? obj.material.map(swap) : swap(obj.material);
    });
    return made;
  }

  window.EurekaLook = { environment: environment, dress: dress, addGrain: addGrain };
})();
