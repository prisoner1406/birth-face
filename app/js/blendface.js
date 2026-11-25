// The blended faces: the angel portraits (the user's own art), blended in the proportions of a chart, like
// Galton's composite portraits, and set in a halo of the elements' colours.
//
// Shape and texture are blended separately, as in composite-face research (build/make-blend-faces.py):
// every face is stored warped onto the mean shape of all the angel faces, with its own displacement from that mean
// on a coarse grid. The textures are blended in the mean shape, where every face's eyes, brows, nose, lips, jaw
// and neck sit on the same pixels, so nothing doubles. The displacements are blended with the same weights, and
// the result is warped to that blended shape: the blend has its angels' averaged shape, drawn with clean lines.
const BlendFace = (() => {
  const ANGEL = { Fire: "michael", Air: "raphael", Water: "gabriel", Earth: "uriel" };
  const COL = { shem: [214, 180, 90], mansion: [196, 204, 222], lilly: [200, 170, 120], Fire: [217, 84, 28], Air: [212, 166, 58], Water: [63, 123, 224], Earth: [93, 138, 58],
    malchidiel: [200, 40, 30], asmodel: [90, 130, 70], ambriel: [230, 210, 120], muriel: [190, 210, 220], verchiel: [230, 140, 40], hamaliel: [200, 170, 90],
    zuriel: [220, 150, 160], barbiel: [140, 20, 30], adnachiel: [110, 60, 150], hanael: [80, 90, 80], cambiel: [40, 90, 200], barchiel: [90, 170, 150],
    michael: [232, 177, 48], gabriel: [150, 170, 210], raphael: [212, 166, 58], anael: [214, 120, 150], khamael: [192, 57, 43], sachiel: [120, 80, 170], cassiel: [60, 60, 110] };
  // Portraits that hold the other sex's face in this sex's place (no portrait of this sex was drawn yet): they lend
  // their shape to a blend of this sex, but not their lines and features.
  // (Lilly's Mercury in Leo to Pisces were drawn only as men, his Venus in Aries, Gemini, Leo and Libra and Moon in
  // Capricorn, Aquarius and Pisces only as women.)
  // (Every archangel and zodiac angel has both since the 2026-11-24 set.)
  const BORROWED = { f: [65, 66, 67, 68, 69, 70, 71, 72].map((n) => "lilly" + n), m: [49, 51, 53, 55, 82, 83, 84].map((n) => "lilly" + n) };
  const FEAT_ONLY = (n) => /^(lilly|mansion)\d\d$/.test(n); // faces that lend only their features
  // Eye colour, chosen by the person (the portraits and the chart never set colouring): the irises of the finished
  // face are found around the two eye points and given this colour, keeping each pixel's own light and shade.
  const EYE_COLORS = { "dark-brown": [62, 40, 28], brown: [104, 66, 38], hazel: [122, 98, 52], amber: [168, 118, 44], green: [74, 118, 70],
    grey: [118, 128, 134], blue: [66, 106, 158], "light-blue": [118, 160, 204] };
  // Hair colour, chosen by the person too: a wash laid over the engraved hair, its ink strands kept (the darkest
  // strokes take the colour's shadow, the light between them its highlight).
  const HAIR_COLORS = { black: [34, 28, 26], "dark-brown": [70, 46, 30], brown: [108, 72, 44], "light-brown": [150, 110, 70],
    auburn: [140, 62, 34], red: [178, 86, 42], "dark-blonde": [176, 140, 86], blonde: [214, 182, 116], platinum: [232, 222, 194],
    grey: [150, 148, 146], white: [228, 226, 222] };
  // hairAt(x, y): how much the point of the finished face lies in the hair (outside the face, not the neck).
  function hairMaskOf(o, W, H, hairAt) {
    const N = W * H, Y1 = new Float32Array(N), Y2 = new Float32Array(N);
    for (let p = 0, t = 0; p < N; p++, t += 4) { const v = o[t + 3] ? 0.299 * o[t] + 0.587 * o[t + 1] + 0.114 * o[t + 2] : 0; Y1[p] = v; Y2[p] = v * v; }
    const blur = (a, sg) => { const rad = Math.ceil(sg * 3), ker = []; let ks = 0; for (let k = -rad; k <= rad; k++) { const v = Math.exp(-0.5 * (k / sg) ** 2); ker.push(v); ks += v; }
      const t1 = new Float32Array(N), t2 = new Float32Array(N);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * a[y * W + Math.min(W - 1, Math.max(0, x + k))]; t1[y * W + x] = v / ks; }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * t1[Math.min(H - 1, Math.max(0, y + k)) * W + x]; t2[y * W + x] = v / ks; }
      return t2; };
    // hair is where fine strands lie close together (strong local contrast, light hair too); the smooth skin of the
    // ears and the plain background are not
    const m1 = blur(Y1, 1.5), m2 = blur(Y2, 1.5), sd = new Float32Array(N);
    for (let p = 0; p < N; p++) sd[p] = Math.sqrt(Math.max(0, m2[p] - m1[p] * m1[p]));
    const tex = blur(sd, 3.5), m = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = y * W + x; if (!o[p * 4 + 3]) continue; m[p] = hairAt(x, y) * Math.min(1, Math.max(0, (tex[p] - 6) / 8)); }
    return blur(m, 2.5);
  }
  function tintHair(o, W, H, mb, rgb) {
    // The highlight between strands is only as light as the colour allows: black hair shines dark grey, not pale;
    // blonde and white hair keep their light. The strands themselves take the colour's deep shadow.
    const N = W * H, Yh = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255, lift = 0.08 + 0.32 * Yh;
    const sh = rgb.map((c) => c * 0.28), hi = rgb.map((c) => c + (255 - c) * lift);
    // the mask reaches out to the hair's very edge (the strands' own light rim and the glow drawn around them), so no
    // pale outline is left between the coloured hair and the background
    const edge = gblur(Float32Array.from(mb, (v) => Math.min(1, v * 3)), W, H, 3 * W / 450);
    for (let p = 0, t = 0; p < N; p++, t += 4) {
      const k = 0.97 * Math.min(1, Math.max(mb[p] * 1.8, edge[p] * 1.6)); if (k < 0.01 || !o[t + 3]) continue;
      const Y = 0.299 * o[t] + 0.587 * o[t + 1] + 0.114 * o[t + 2], s = Math.min(1, Math.max(0, (Y - 35) / 200)) ** 1.15;
      for (let c = 0; c < 3; c++) o[t + c] += k * (sh[c] + s * (hi[c] - sh[c]) - o[t + c]);
    }
  }
  // Skin tone, chosen by the person: the engraving's cream skin is brought to the tone by scaling each colour channel,
  // so the ink lines, hatching and shading stay exactly as drawn (dark ink stays dark).
  const SKIN_TONES = { fair: [240, 214, 192], light: [230, 196, 164], "light-olive": [214, 182, 140], medium: [198, 156, 116],
    olive: [182, 148, 100], tan: [172, 124, 84], brown: [140, 96, 64], "dark-brown": [106, 72, 50], deep: [80, 54, 40] };
  const CREAM = [246, 234, 204]; // the engraving's own skin
  const gblur = (a, W, H, sg) => { const N = W * H, rad = Math.ceil(sg * 3), ker = []; let ks = 0; for (let k = -rad; k <= rad; k++) { const v = Math.exp(-0.5 * (k / sg) ** 2); ker.push(v); ks += v; }
    const t1 = new Float32Array(N), t2 = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * a[y * W + Math.min(W - 1, Math.max(0, x + k))]; t1[y * W + x] = v / ks; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * t1[Math.min(H - 1, Math.max(0, y + k)) * W + x]; t2[y * W + x] = v / ks; }
    return t2; };
  // coreAt(x, y): the face itself (tinted wherever it is not hair); edgeAt(x, y): the ears, the whole neck and the
  // forehead up to the hairline, tinted where the drawing is as bright as skin (hair, even light hair, is darker once
  // its strands are blurred together). The mask is softened, so the tone never stops at a hard line.
  // earAt(x, y): the ears and the neck, whose ink lines and hatching make them darker, so they pass a gentler test.
  function tintSkin(o, W, H, coreAt, edgeAt, earAt, hair, rgb, eyes) {
    const N = W * H, r = rgb.map((c, i) => c / CREAM[i]), Y = new Float32Array(N), K = new Float32Array(N);
    for (let p = 0, t = 0; p < N; p++, t += 4) Y[p] = o[t + 3] ? 0.299 * o[t] + 0.587 * o[t + 1] + 0.114 * o[t + 2] : 0;
    const Yb = gblur(Y, W, H, 5 * W / 450), Ys = gblur(Y, W, H, 3 * W / 450);
    for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
      if (!o[p * 4 + 3]) continue;
      const bright = Math.min(1, Math.max(0, (Yb[p] - 178) / 36)), soft = Math.min(1, Math.max(0, (Ys[p] - 115) / 40));
      const notHair = 1 - Math.min(1, hair ? hair[p] * 1.25 : 0);
      K[p] = Math.max(coreAt(x, y) * notHair, edgeAt(x, y) * bright * notHair, earAt(x, y) * soft);
    }
    const Ks = gblur(K, W, H, 2.5 * W / 450);
    // The drawing is mapped onto the tone by its light and shade, not simply darkened: the bare skin takes the tone
    // (a little lighter where the light falls on darker skin), the ink lines its deep shadow, and the hatching between
    // them is spread so it still reads. Without this the drawing sinks into darker tones: hatching, creases and the
    // lines of the lids, nose and lips all but vanish. The darker the tone, the more the hatching is spread.
    const Yt = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2], dark = Math.min(1, Math.max(0, 1 - Yt / 225));
    // (the lit skin is the tone made brighter in its own hue, never paler toward white, which would turn it ashen)
    const lightC = rgb.map((c) => Math.min(255, c * (1.04 + 0.4 * dark))), shadC = rgb.map((c) => c * 0.14), gam = 1 + 0.75 * dark;
    const Yc = 0.299 * CREAM[0] + 0.587 * CREAM[1] + 0.114 * CREAM[2];
    // the whites of the eyes are not skin: they stay light at every tone
    const ex = 24 * W / 450, ey = 9 * W / 450;
    for (let y = 0, p = 0, t = 0; y < H; y++) for (let x = 0; x < W; x++, p++, t += 4) {
      let k = Math.min(1, Ks[p]); if (k < 0.01 || !o[t + 3]) continue;
      if (eyes) for (const [cx, cy] of eyes) {
        const q = ((x - cx) / ex) ** 2 + ((y - cy) / ey) ** 2; if (q > 2.5) continue;
        k *= 1 - 0.9 * Math.exp(-q * q) * Math.min(1, Math.max(0, (Y[p] - 165) / 35));
      }
      const s = Math.min(1.06, Math.max(0, (Y[p] - 28) / (Yc - 28))), f = Math.pow(s, gam);
      for (let c = 0; c < 3; c++) o[t + c] += k * (Math.min(255, shadC[c] + f * (lightC[c] - shadC[c])) - o[t + c]);
    }
  }
  const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  // Each iris is found as the dark disc with light (the white of the eye) on both sides of it, searched around the
  // eye point for its centre and size; only that disc is coloured, and within it only the iris itself (not the
  // pupil, the ink of the lids and lashes, or the lid's skin where it covers the top of the iris).
  function tintEyes(o, W, H, centres, rgb) {
    const Yc = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    const L = (x, y) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return 255; const i = (y * W + x) * 4; return 0.299 * o[i] + 0.587 * o[i + 1] + 0.114 * o[i + 2]; };
    const sc = W / 450;
    for (const [cx0, cy0] of centres) {
      let best = null;
      for (let r = Math.round(8 * sc); r <= Math.round(14 * sc); r++) {
        // Sample points of the disc and of the two side arcs (the whites of the eye, left and right of the iris).
        const disc = [], side = [], pupil = [];
        for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) if (dx * dx + dy * dy <= 0.8 * r * r) disc.push([dx, dy]);
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= 0.12 * r * r) pupil.push([dx, dy]);
        for (let a = -0.5; a <= 0.5; a += 0.1) for (const sgn of [-1, 1]) for (const f of [1.35, 1.6]) side.push([sgn * f * r * Math.cos(a), f * r * Math.sin(a)]);
        for (let dy = -6 * sc; dy <= 6 * sc; dy++) for (let dx = -8 * sc; dx <= 8 * sc; dx++) {
          const cx = cx0 + dx, cy = cy0 + dy;
          let si = 0; for (const [u, v] of disc) si += L(cx + u, cy + v); si /= disc.length;
          let ss = 0; for (const [u, v] of side) ss += L(cx + u, cy + v); ss /= side.length;
          let sp = 0; for (const [u, v] of pupil) sp += L(cx + u, cy + v); sp /= pupil.length;
          // light on both sides, a dark disc, darkest at its centre (the pupil), near where the eye should be
          const score = ss - 0.5 * si - 0.5 * sp - 1.0 * Math.hypot(dx, dy) / sc;
          if (!best || score > best.score) best = { score, cx, cy, r, white: ss, iris: si };
        }
      }
      if (!best || best.score < 12) continue; // no clear iris: leave the eye as drawn
      const { cx, cy, r, white } = best;
      for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4; if (!o[i + 3]) continue;
        const edge = Math.min(1, Math.max(0, (r + 0.5 - Math.hypot(x - cx, y - cy)) / 1.5));
        if (!edge) continue;
        const Y = 0.299 * o[i] + 0.587 * o[i + 1] + 0.114 * o[i + 2];
        // the iris's own tones: darker than the white of the eye and the lid's skin, lighter than the pupil and ink
        // (engraved irises are drawn light, only a little darker than the white, so the whole pale disc counts)
        const tone = Math.min(1, Math.max(0, (white - 6 - Y) / 14)) * Math.min(1, Math.max(0, (Y - 28) / 30));
        const m = 0.75 * edge * tone; if (m < 0.01) continue;
        for (let c = 0; c < 3; c++) o[i + c] += m * (Math.min(255, rgb[c] * Y / Yc) - o[i + c]);
      }
    }
  }
  const isShem = (n) => /^(shem|mansion|lilly)\d\d$/.test(n); // the Shem and mansion angels load one file each
  // A weight's key is an element (Fireâ€¦), an archangel (michaelâ€¦) or a Shem angel (shem01â€¦).
  const layerOf = (k) => ANGEL[k] || k;
  const grid = () => (typeof BLEND_GRID !== "undefined" ? BLEND_GRID : { step: 10, gx: 46, gy: 61 });

  // The face data loads only when a face is first drawn, so the app itself opens quickly: the archangels in one
  // file (js/blendfaces-data.js), the 72 Shem angels and 28 mansion angels one file each (js/shem/NN.js,
  // js/mansion/NN.js). Each carries the app's version, so an update is never served from an old copy.
  const VER = ((document.currentScript && document.currentScript.src.match(/\?v=(\w+)/)) || [])[1] || "";
  const scripts = {};
  const loadScript = (path) => (scripts[path] ||= new Promise((ok, fail) => {
    const s = document.createElement("script"); s.src = path + (VER ? `?v=${VER}` : "");
    s.onload = ok; s.onerror = () => { delete scripts[path]; fail(new Error("could not load " + path)); }; document.head.appendChild(s);
  }));
  const archData = () => (typeof BLEND_FACES !== "undefined" ? Promise.resolve() : loadScript("js/blendfaces-data.js"));
  function shemScript(name) {
    if (!isShem(name)) return archData();
    if (window.SHEM_FACES && window.SHEM_FACES[name]) return Promise.resolve();
    return loadScript(`js/${name.slice(0, -2)}/${name.slice(-2)}.js`);
  }
  // A displacement grid: int16 little-endian in 1/16 px, x then y for each point.
  function decodeFlow(b64) {
    if (!b64) return null;
    const bin = atob(b64), n = bin.length >> 1, out = new Float32Array(n);
    for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v & 0x8000) v -= 0x10000; out[i] = v / 16; }
    return out;
  }
  // Faces are decoded only when a chart needs them, then kept: { data: ImageData, flow: Float32Array | null,
  // mf: Float32Array | null } (mf: where the angel's feminine outline and hair sit against its masculine ones).
  const cache = {};
  function layer(key) {
    if (cache[key]) return cache[key];
    const [sex, name] = key.split(":");
    return (cache[key] = shemScript(name).then(() => new Promise((ok, fail) => {
      let src, flow, borrowed = false;
      let mf;
      if (isShem(name)) { const set = (window.SHEM_FACES || {})[name] || {}; const s = set[sex] ? sex : set.m ? "m" : "f"; borrowed = s !== sex || (BORROWED[sex] || []).includes(name); src = set[s]; flow = set[s + "flow"]; mf = set.mf; }
      else { const s = (BLEND_FACES[sex] || {})[name] ? sex : "m"; borrowed = s !== sex || (BORROWED[sex] || []).includes(name); src = BLEND_FACES[s][name]; flow = typeof BLEND_FLOW !== "undefined" ? (BLEND_FLOW[s] || {})[name] : null; mf = typeof BLEND_MF !== "undefined" ? BLEND_MF[name] : null; }
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
        const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0);
        ok({ data: x.getImageData(0, 0, c.width, c.height), flow: decodeFlow(flow), mf: decodeFlow(mf), borrowed });
      };
      im.onerror = fail; im.src = src;
    })));
  }
  // Soft masks for each part of the face, in the mean-shape frame (eyes at y 270, x 193 and 347; mouth at 270, 428,
  // in a 540 Ã— 720 frame scaled to the layers). Each pixel's share of a part is its mask over the sum of all masks.
  let masks = null;
  function regionMasks(W, H) {
    if (masks && masks.W === W) return masks;
    const sx = W / 540, sy = H / 720, N = W * H;
    const g = (cx, cy, rx, ry, p = 1) => { const a = new Float32Array(N); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const q = ((x / sx - cx) / rx) ** 2 + ((y / sy - cy) / ry) ** 2; a[y * W + x] = Math.exp(-0.5 * q ** p); } return a; };
    const add = (a, b) => { for (let i = 0; i < N; i++) a[i] = Math.max(a[i], b[i]); return a; };
    const R = {
      hair: new Float32Array(N).fill(0.06),
      face: g(270, 350, 118, 172, 3),
      brows: g(270, 205, 150, 42),
      eyes: add(g(193, 272, 62, 30), g(347, 272, 62, 30)),
      nose: g(270, 352, 36, 52),
      mouth: g(270, 430, 64, 30)
    };
    for (const k of ["brows", "eyes", "nose", "mouth"]) for (let i = 0; i < N; i++) R[k][i] *= 3;
    const keys = Object.keys(R), tot = new Float32Array(N);
    for (const k of keys) for (let i = 0; i < N; i++) tot[i] += R[k][i];
    for (const k of keys) for (let i = 0; i < N; i++) R[k][i] /= tot[i];
    // The whole face, from the hairline to the upper neck and out to the ears, is where the faces blend (every face
    // sits on the same mean shape, so forehead, temples, cheeks, jaw line and ears line up); only the hair around
    // it comes from the hair's leading angel, since hairstyles cannot be averaged. (BlendFace.INNER sets the area.)
    const inner = new Float32Array(N);
    const I = BlendFace.INNER;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const q = ((x / sx - I.cx) / I.rx) ** 2 + ((y / sy - I.cy) / I.ry) ** 2; inner[y * W + x] = Math.exp(-0.5 * q * q * I.k); }
    // The features that matter most (brows, eyes, nose, mouth): where Lilly's and the lunar faces may show. Their
    // hairlines, ears and jaw edges differ too much to blend, so outside the features they give way to the others.
    const feat = new Float32Array(N), fg = [g(270, 210, 165, 50), g(193, 272, 80, 44), g(347, 272, 80, 44), g(270, 350, 52, 70), g(270, 432, 90, 44)];
    for (let i = 0; i < N; i++) { let m = 0; for (const a of fg) m = Math.max(m, a[i]); feat[i] = Math.min(1, m * 1.25); }
    return (masks = { W, R, keys, inner, feat });
  }
  const norm = (o) => { const t = Object.values(o).reduce((a, b) => a + b, 0) || 1; return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v / t])); };

  // weights: { key: share } for the whole face, or { regions: { hair, face, brows, eyes, nose, mouth: { key: share } }, lead? }
  // to give each part of the face its own mix; lead (optional) is the angel the hair and outline come from. sex: "m" or "f" picks that set of faces; anything else blends the
  // masculine and feminine faces half and half (hair and outline then come from the masculine, so they don't double);
  // weights.sexMix sets the shares from the chart instead.
  // Finished faces are kept for the session: opening a tab or the page again shows them at once.
  const done = new Map();
  async function render(canvas, weights, sex) {
    const key = JSON.stringify([weights, sex, BlendFace.CARICATURE, BlendFace.INNER, BlendFace.DETAIL, BlendFace.HAIR]);
    const hit = done.get(key);
    if (hit) { canvas.width = hit.width; canvas.height = hit.height; canvas.getContext("2d").drawImage(hit, 0, 0); return canvas; }
    await draw(canvas, weights, sex);
    const copy = document.createElement("canvas"); copy.width = canvas.width; copy.height = canvas.height; copy.getContext("2d").drawImage(canvas, 0, 0);
    done.set(key, copy);
    if (done.size > 24) done.delete(done.keys().next().value);
    return canvas;
  }
  async function draw(canvas, weights, sex) {
    // weights.sexMix { m, f, outline } (Faces.sexMix): the share of the masculine and feminine faces from the chart.
    const mix = weights.sexMix;
    const sets = mix ? [["m", mix.m], ["f", mix.f]].filter(([, v]) => v > 0.001) : sex === "m" || sex === "f" ? [[sex, 1]] : [["m", 0.5], ["f", 0.5]];
    const outlineSex = mix ? (sets.some(([x]) => x === mix.outline) ? mix.outline : sets[0][0]) : sets.length > 1 ? "m" : sets[0][0];
    const META = ["sexMix", "lead", "neutral", "hairColor", "eyeColor", "hairTint", "skinTone"], flat = Object.fromEntries(Object.entries(weights).filter(([k]) => !META.includes(k)));
    // A face blended from both sexes' portraits without parts (one angel on its own, or a simple mix): its hair and
    // outline come from one portrait of the outline's sex like every other face, or the two sexes' hair overlaps
    // (long hair showing faintly past short). Its features blend the two sexes as before.
    if (!weights.regions && sets.length > 1 && Object.keys(flat).length) weights = { ...weights, regions: Object.fromEntries(["hair", "face", "brows", "eyes", "nose", "mouth"].map((r) => [r, flat])), solo: true };
    const parts = weights.regions || (Object.keys(flat).length ? { all: flat } : {});
    // weights.neutral { regions }: the same face for an average chart; the chart's face is drawn as its difference
    // from that average, strengthened (Perrett's caricaturing of composite faces), so averaging cannot flatten it.
    const nParts = weights.neutral && weights.neutral.regions ? weights.neutral.regions : null;
    const wanted = [...new Set(Object.values(parts).concat(nParts ? Object.values(nParts) : []).flatMap((o) => Object.keys(o)).concat(weights.lead ? [weights.lead] : []).concat(weights.hairColor ? [weights.hairColor] : []))];
    const L = {};
    await Promise.all(wanted.flatMap((k) => sets.map(([sx]) => layer(sx + ":" + layerOf(k)).then((d) => (L[sx + ":" + layerOf(k)] = d)))));
    const first = Object.values(L)[0].data, W = first.width, H = first.height, N = W * H;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const regions = weights.regions ? Object.fromEntries(Object.entries(weights.regions).map(([k, v]) => [k, norm(v)])) : null;
    // The hair and outline come from one angel, the leader of the hair: blended hairstyles leave ghostly outlines.
    let lead = null;
    // weights.lead names it when the chart gives it (the angel of the rising degree); otherwise the strongest in the hair.
    if (regions && regions.hair) {
      const rank = Object.entries(regions.hair).sort((a, b) => b[1] - a[1]).map(([k]) => k);
      lead = weights.lead && L[sets[0][0] + ":" + layerOf(weights.lead)] ? weights.lead : rank.find((k) => !(BORROWED[outlineSex] || []).includes(layerOf(k))) || rank[0];
      regions.hairOverall = regions.hair; regions.hair = { [lead]: 1 };
    }
    const overall = norm(regions ? regions.hairOverall || regions.hair : parts.all);
    const nRegions = nParts && regions ? Object.fromEntries(Object.entries(nParts).map(([k, v]) => [k, norm(v)])) : null;
    if (nRegions) nRegions.hair = { [lead]: 1 };
    const col = [0, 1, 2].map((i) => Object.entries(overall).reduce((a, [e, v]) => a + (COL[e] || (/^mansion/.test(e) ? COL.mansion : /^lilly/.test(e) ? COL.lilly : isShem(e) ? COL.shem : COL.michael))[i] * v, 0));
    // Halo: warm gold at the centre into the blend's own colour.
    const g = ctx.createRadialGradient(W / 2, H * 0.41, 0, W / 2, H * 0.41, W * 0.8);
    g.addColorStop(0, "rgb(255,240,196)"); g.addColorStop(0.45, "rgb(246,214,140)");
    g.addColorStop(1, `rgb(${col.map((v) => Math.round(v * 0.8)).join(",")})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(176,130,40,.85)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(W / 2, H * 0.41, W * 0.47, 0, Math.PI * 2); ctx.stroke();

    // Each layer: its share of each part of the face (hair, face, brows, eyes, nose, mouth), whether it gives the
    // hair and outline, its set's share and its displacement grid. Weights are worked out pixel by pixel as they
    // are needed, so even a blend of every angel (well over a hundred layers) stays light.
    const keys = [...new Set(Object.entries(regions || { all: overall }).filter(([r]) => r !== "hairOverall").flatMap(([, o]) => Object.keys(o)).concat(nRegions ? Object.values(nRegions).flatMap((o) => Object.keys(o)) : []))];
    const M = regionMasks(W, H), mixed = sets.length > 1, RK = M.keys, NR = RK.length, MR = RK.map((r) => M.R[r]), inn = M.inner;
    const layers = [];
    for (const k of keys) {
      const v = new Float32Array(NR);
      RK.forEach((r, n) => (v[n] = regions ? ((regions[r] || overall)[k] || 0) : overall[k] || 0));
      const vn = nRegions ? new Float32Array(NR) : null;
      if (vn) RK.forEach((r, n) => (vn[n] = (nRegions[r] || {})[k] || 0));
      for (const [sx, f] of sets) {
        const ly = L[sx + ":" + layerOf(k)], isLead = !!lead && layerOf(k) === layerOf(lead);
        // Only the inner face blends; the rest is the hair leader's, in the outline's set (the person's own sex).
        const outer = lead ? (isLead ? (sx === outlineSex ? 1 / f : 0) : 0) : 0;
        layers.push({ d: ly.data.data, v, vn, outer, f, flow: ly.flow, isLead, sx, featOnly: !!lead && !weights.solo && FEAT_ONLY(layerOf(k)), lilly: /^lilly\d\d$/.test(layerOf(k)), borrowed: !!ly.borrowed && !isLead, hairShare: regions && regions.hairOverall ? regions.hairOverall[k] || 0 : 0 });
      }
    }
    // The hair in both genders: when the features blend the masculine and feminine faces, the hair leader's hair
    // morphs between its masculine and feminine hair too, at half the features' share of the other sex (at most a
    // quarter of the way, so hair lengths that have no counterpart never show through).
    const { step, gx, gy } = grid();
    const gridAt = (G, x, y) => {
      const fx = x / step, fy = y / step, i0 = Math.min(gx - 2, Math.max(0, Math.floor(fx))), j0 = Math.min(gy - 2, Math.max(0, Math.floor(fy)));
      const ax = fx - i0, ay = fy - j0, a = (j0 * gx + i0) * 2, b = a + 2, c = a + gx * 2, d = c + 2;
      return [G[a] * (1 - ax) * (1 - ay) + G[b] * ax * (1 - ay) + G[c] * (1 - ax) * ay + G[d] * ax * ay,
        G[a + 1] * (1 - ax) * (1 - ay) + G[b + 1] * ax * (1 - ay) + G[c + 1] * (1 - ax) * ay + G[d + 1] * ax * ay];
    };
    const lm = lead && L["m:" + layerOf(lead)], lf = lead && L["f:" + layerOf(lead)];
    const otherShare = sets.filter(([x]) => x !== outlineSex).reduce((a, [, v]) => a + v, 0);
    const hairB = outlineSex === "m" ? otherShare / 2 : 1 - otherShare / 2; // 0 = masculine hair, 1 = feminine
    if (lm && lf && lm.mf && lm.mf.length === gx * gy * 2 && otherShare > 0.001) {
      const md = lm.data.data, fd = lf.data.data, D = lm.mf, hm = new Uint8ClampedArray(N * 4), b = hairB;
      const bil = (d, px, py, t) => {
        px = Math.min(W - 1.001, Math.max(0, px)); py = Math.min(H - 1.001, Math.max(0, py));
        const x0 = px | 0, y0 = py | 0, ax = px - x0, ay = py - y0, a = (y0 * W + x0) * 4, bb = a + 4, c = a + W * 4, e = c + 4;
        return d[a + t] * (1 - ax) * (1 - ay) + d[bb + t] * ax * (1 - ay) + d[c + t] * (1 - ax) * ay + d[e + t] * ax * ay;
      };
      // Where the two disagree (hair in one, background or a different strand in the other), the person's own hair
      // wins outright, so the other's never shows through; they blend only where both agree, and only where both
      // have hair: past the end of the person's own hair (longer hair in the other sex's portrait), nothing of the
      // other's shows, not even single fine strands over the background.
      // Hair maps: how dark each portrait is around each point (strands are dark lines on light parchment and skin).
      const hairMap = (d) => {
        const R = 4, S = new Float64Array((W + 1) * (H + 1)), out2 = new Float32Array(N); // summed-area table of brightness
        for (let y = 0; y < H; y++) { let row = 0; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; row += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; S[(y + 1) * (W + 1) + x + 1] = S[y * (W + 1) + x + 1] + row; } }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const x0 = Math.max(0, x - R), x1 = Math.min(W, x + R + 1), y0 = Math.max(0, y - R), y1 = Math.min(H, y + R + 1);
          const mean = (S[y1 * (W + 1) + x1] - S[y0 * (W + 1) + x1] - S[y1 * (W + 1) + x0] + S[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
          out2[y * W + x] = Math.min(1, Math.max(0, (210 - mean) / 45));
        }
        return out2;
      };
      const hmM = hairMap(md), hmF = hairMap(fd);
      const bil1 = (a, px, py) => {
        px = Math.min(W - 1.001, Math.max(0, px)); py = Math.min(H - 1.001, Math.max(0, py));
        const x0 = px | 0, y0 = py | 0, ax = px - x0, ay = py - y0, q = y0 * W + x0;
        return a[q] * (1 - ax) * (1 - ay) + a[q + 1] * ax * (1 - ay) + a[q + W] * (1 - ax) * ay + a[q + W + 1] * ax * ay;
      };
      const ownM = outlineSex === "m", mm = [0, 0, 0, 0], ff = [0, 0, 0, 0];
      for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i += 4) {
        const [dx, dy] = gridAt(D, x, y);
        for (let t = 0; t < 4; t++) { mm[t] = bil(md, x - b * dx, y - b * dy, t); ff[t] = bil(fd, x + (1 - b) * dx, y + (1 - b) * dy, t); }
        const diff = Math.abs(mm[0] - ff[0]) + Math.abs(mm[1] - ff[1]) + Math.abs(mm[2] - ff[2]);
        const both = Math.min(bil1(hmM, x - b * dx, y - b * dy), bil1(hmF, x + (1 - b) * dx, y + (1 - b) * dy));
        const agree = (1 - Math.min(1, Math.max(0, (diff - 30) / 60))) * both;
        const bf = ownM ? b * agree : 1 - (1 - b) * agree; // the feminine side's share at this pixel
        for (let t = 0; t < 4; t++) hm[i + t] = (1 - bf) * mm[t] + bf * ff[t];
      }
      const own = layers.find((l) => l.isLead && l.sx === outlineSex);
      for (const l of layers) if (l.isLead) { l.outer = 0; l.isLead = false; }
      layers.push({ d: hm, v: new Float32Array(NR), vn: nRegions ? new Float32Array(NR) : null, outer: 1, f: 1, flow: own.flow, isLead: true, sx: outlineSex });
    }
    // The weights of every layer at a pixel, for your chart (w) and for the average chart (wn), worked out together:
    // each layer's share of the six parts of the face is a row of V (VN), and the six part masks at the pixel are
    // read once into m. Flat typed arrays keep this inner loop, the costliest in the app, fast.
    // Keeping the hair colour: when the hair comes from another portrait, its hair can take the colour of the
    // chart's own hair (weights.hairColor names that portrait). Each colour channel of the chosen hair is matched
    // to the chart's hair in average and spread, measured over the hair around the face; the face itself is untouched.
    if (lead && weights.hairColor && layerOf(weights.hairColor) !== layerOf(lead)) {
      const sx0 = outlineSex, src = L[sx0 + ":" + layerOf(weights.hairColor)] || L["m:" + layerOf(weights.hairColor)];
      const inn0 = M.inner, yMax = Math.round(H * 0.62);
      const stats = (d) => {
        const sum = [0, 0, 0], sq = [0, 0, 0]; let n = 0;
        for (let y = 0; y < yMax; y++) for (let x = 0; x < W; x++) { const p = y * W + x, i = p * 4; if (d[i + 3] < 200 || inn0[p] > 0.3) continue; n++; for (let c = 0; c < 3; c++) { sum[c] += d[i + c]; sq[c] += d[i + c] * d[i + c]; } }
        return sum.map((v, c) => { const mu = v / (n || 1); return [mu, Math.sqrt(Math.max(1, sq[c] / (n || 1) - mu * mu))]; });
      };
      if (src) {
        const to = stats(src.data.data);
        const recolor = (d) => {
          const from = stats(d), out = new Uint8ClampedArray(d);
          for (let y = 0; y < H; y++) {
            const fy = Math.min(1, Math.max(0, (H * 0.88 - y) / (H * 0.1))); if (!fy) continue; // down to the ends of long hair
            for (let x = 0; x < W; x++) {
              const p = y * W + x, i = p * 4, t = (1 - inn0[p]) * fy; if (t < 0.01) continue;
              for (let c = 0; c < 3; c++) { const v = (d[i + c] - from[c][0]) / from[c][1] * to[c][1] + to[c][0]; out[i + c] = d[i + c] + t * (v - d[i + c]); }
            }
          }
          return out;
        };
        for (const l of layers) if (l.isLead || l.outer) l.d = recolor(l.d);
      }
    }
    const NL = layers.length, NEU = !!nRegions;
    const V = new Float32Array(NL * NR), VN = new Float32Array(NL * NR), OUT = new Float32Array(NL), FF = new Float32Array(NL), DD = layers.map((l) => l.d);
    // FO: lends only its features; LI: one of Lilly's faces (whose descriptions are chiefly of the face's shape, so
    // it shapes the whole face, not only the features); TB: the drawing's share of a portrait standing in for the
    // other sex (no portrait of this sex exists), which lends its shape but not its lines and features.
    const FO = new Uint8Array(NL), FM = M.feat, LI = new Uint8Array(NL), TB = new Float32Array(NL);
    layers.forEach((ly, l) => { for (let n = 0; n < NR; n++) { V[l * NR + n] = ly.v[n]; if (NEU) VN[l * NR + n] = ly.vn[n]; } OUT[l] = ly.outer; FF[l] = ly.f; FO[l] = ly.featOnly ? 1 : 0; LI[l] = ly.lilly ? 1 : 0; TB[l] = ly.borrowed ? 0.02 : 1; });
    // Lilly's faces in a blend give the face's shape only (DETAIL.lillyTex of their drawing): they were drawn as
    // particular people, many old, worn or ill, whose skin, shadows and wrinkles must not age the face they shape.
    const LT = new Float32Array(NL).fill(1); if (!weights.solo && keys.length > 1) layers.forEach((l, k) => { if (l.lilly) LT[k] = BlendFace.DETAIL.lillyTex ?? 1; });
    const m = new Float32Array(NR), w = new Float32Array(NL), wn = new Float32Array(NL);
    // The face is drawn from the chart's own mix everywhere, the hair part and the area around the face included
    // (each portrait by its share of the chart's hair, as the shape is). The portrait that lends the hair shows only
    // where it has hair (step 1b), so choosing another hair changes the hair and nothing else.
    const CH = !!lead && !weights.solo, HIx = RK.indexOf("hair"), HSx = layers.map((l) => l.hairShare || 0);
    const fill = (p, tex = true) => {
      for (let n = 0; n < NR; n++) m[n] = MR[n][p];
      const ip = lead ? inn[p] : 1, op = 1 - ip;
      for (let l = 0, b = 0; l < NL; l++, b += NR) {
        let s = 0, sn = 0;
        if (CH) for (let n = 0; n < NR; n++) { const h = n === HIx; s += (h ? HSx[l] : V[b + n]) * m[n]; if (NEU) sn += (h ? HSx[l] : VN[b + n]) * m[n]; }
        else for (let n = 0; n < NR; n++) { s += V[b + n] * m[n]; if (NEU) sn += VN[b + n] * m[n]; }
        const fm = FO[l] && (tex || !LI[l]) ? FM[p] : 1, tb = tex ? TB[l] * LT[l] : 1, ou = CH ? HSx[l] : OUT[l];
        w[l] = (s * ip * fm + ou * op) * FF[l] * tb;
        if (NEU) wn[l] = (sn * ip * fm + ou * op) * FF[l] * tb;
      }
    };
    // The outline's opacity: the hair leader's own cut-out.
    const leadAlpha = lead ? layers.filter((l) => l.isLead && l.sx === outlineSex).map((l) => l.d) : null;
    // 1. Texture: blend the faces in the mean shape, weighting colour by each face's cut-out (both charts at once).
    // The fine lines (the ink strokes of lids, lashes, lips, nostrils) are taken apart from the tones: averaging
    // many drawings' strokes, each a pixel or two from the others, leaves faint doubled lines (ghosting). So the
    // strokes come from the faces that lead at each point, by their weights raised to a high power (DETAIL.p),
    // while the tones, the shading and the shape still come from every face in its share.
    const C = new Float32Array(N * 4), Cn = NEU ? new Float32Array(N * 4) : null, Dt = new Float32Array(N * 3);
    // The fine lines also come mostly from the person's own sex (DETAIL.sexP): a man's stubble or a woman's lashes
    // belong to the drawing of one sex, not to the features the two sexes share.
    const DP = BlendFace.DETAIL.p, DPO = BlendFace.DETAIL.pOut || DP, SP = BlendFace.DETAIL.sexP || 0, FFmax = Math.max(...layers.map((l) => l.f || 0), 1e-6);
    const FRAME = new Float32Array(NL); { // the frame face: the largest share of the chart's hair mix, in the person's own set
      let best = -1, bi = -1; layers.forEach((l, k) => { const v = CH ? (l.hairShare || 0) * (l.f || 0) * TB[k] : (l.isLead ? 1 : 0); if (v > best) { best = v; bi = k; } });
      if (bi >= 0 && best > 0) FRAME[bi] = 1; else FRAME.fill(-1); }
    // Lilly's faces describe the body and the shape of the face, but they were drawn as particular people, many of
    // them old, with wrinkles, creases and stubble: in a blend they give their shape and tone, while the fine lines
    // come mostly from the angels (DETAIL.lilly), so no face takes an old man's wrinkles from one Lilly portrait.
    const LQ = new Float32Array(NL).fill(1); if (!weights.solo && keys.length > 1) layers.forEach((l, k) => { if (l.lilly) LQ[k] = BlendFace.DETAIL.lilly ?? 1; });
    const FQ = new Float32Array(NL); layers.forEach((l, k) => (FQ[k] = ((l.f || 0) / FFmax) ** SP));
    const ROWS = W * 40; // every 40 rows the page gets a moment to respond, so drawing never freezes it
    for (let p = 0, i = 0; p < N; p++, i += 4) {
      if (p && p % ROWS === 0) await new Promise((r) => setTimeout(r, 0));
      fill(p);
      let A = 0, R = 0, G = 0, B = 0, An = 0, Rn = 0, Gn = 0, Bn = 0, wmax = 0, Ao = 0;
      for (let l = 0; l < NL; l++) if (w[l] > wmax && DD[l][i + 3]) wmax = w[l];
      // The lines outside the features (cheeks, jaw, chin, forehead) all come from one face for the whole picture:
      // the face that leads the head's outline (the chart's hair mix), so the jaw line inside and the outline around
      // it are the same face's and never lie side by side; inside the features, the leading faces at each point.
      const fp = FRAME[0] < 0 ? 1 : FM[p]; // no frame face (a single portrait, or no hair leader): lines as before
      let Ad = 0, Rd = 0, Gd = 0, Bd = 0;
      // Outside the features (cheeks, jaw, chin, forehead) the lines come from the leading face alone (DETAIL.pOut):
      // the jaw and cheek contours of different faces lie a few pixels apart and would draw a second, faint jaw.
      const DPx = DP + (DPO - DP) * (1 - FM[p]);
      for (let l = 0; l < NL; l++) {
        const d = DD[l], al = d[i + 3];
        if (!al) continue;
        const r = d[i], g2 = d[i + 1], b2 = d[i + 2], ww = w[l];
        if (ww > 1e-6) {
          const a = ww * al; R += a * r; G += a * g2; B += a * b2; A += a; Ao += a / (TB[l] * LT[l]); // Ao: opacity, by the full shares
          const q = fp * (ww / wmax) + (1 - fp) * FRAME[l]; if (q > 0.05) { const ad = q ** DPx * FQ[l] * LQ[l] * al; Rd += ad * r; Gd += ad * g2; Bd += ad * b2; Ad += ad; }
        }
        if (NEU) { const wv = wn[l]; if (wv > 1e-6) { const a = wv * al; Rn += a * r; Gn += a * g2; Bn += a * b2; An += a; } }
      }
      let alpha = 0;
      if (leadAlpha) { for (const d of leadAlpha) alpha += d[i + 3]; alpha /= leadAlpha.length; } else alpha = Math.min(255, Ao);
      if (A > 0) { C[i] = R / A; C[i + 1] = G / A; C[i + 2] = B / A; C[i + 3] = alpha; }
      if (Ad > 0) { const t = p * 3; Dt[t] = Rd / Ad; Dt[t + 1] = Gd / Ad; Dt[t + 2] = Bd / Ad; }
      if (NEU && An > 0) { Cn[i] = Rn / An; Cn[i + 1] = Gn / An; Cn[i + 2] = Bn / An; }
    }
    if (BlendFace.DEBUG) { BlendFace.DEBUG.W = W; BlendFace.DEBUG.H = H; BlendFace.DEBUG.average = C.slice(); BlendFace.DEBUG.lines = (() => { const a = new Float32Array(N * 4); for (let p = 0; p < N; p++) { a[p * 4] = Dt[p * 3]; a[p * 4 + 1] = Dt[p * 3 + 1]; a[p * 4 + 2] = Dt[p * 3 + 2]; a[p * 4 + 3] = C[p * 4 + 3]; } return a; })(); if (Cn) BlendFace.DEBUG.neutral = Cn.slice(); } // the stages, for explaining the method (only when BlendFace.DEBUG is set)
    // 2. Shape: the displacement fields blended on the coarse grid (both charts at once). The outline of the head
    // takes its shape from the chart's own hair mix, not from the portrait that lends the hair, so choosing another
    // hair changes only the hair: it is drawn on the chart's head.
    const HI = RK.indexOf("hair"), HS = layers.map((l) => l.hairShare || 0);
    const fillShape = (p) => {
      if (!lead) return fill(p, false);
      for (let n = 0; n < NR; n++) m[n] = MR[n][p];
      const ip = inn[p], op = 1 - ip;
      for (let l = 0, b = 0; l < NL; l++, b += NR) {
        let s = 0, sn = 0;
        for (let n = 0; n < NR; n++) { const vh = n === HI ? HS[l] : V[b + n], vhn = n === HI ? HS[l] : VN[b + n]; s += vh * m[n]; if (NEU) sn += vhn * m[n]; }
        const fm = FO[l] && !LI[l] ? FM[p] : 1; // Lilly's faces shape the whole face, outline and jaw included
        w[l] = (s * ip * fm + HS[l] * op) * FF[l];
        if (NEU) wn[l] = (sn * ip * fm + HS[l] * op) * FF[l];
      }
    };
    const F = new Float32Array(gx * gy * 2), Fn = new Float32Array(gx * gy * 2);
    if (layers.every((l) => l.flow && l.flow.length === gx * gy * 2)) {
      const FL = layers.map((l) => l.flow);
      for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
        const p = Math.min(j * step, H - 1) * W + Math.min(i * step, W - 1), q = (j * gx + i) * 2;
        fillShape(p);
        let s = 0, dx = 0, dy = 0, sn = 0, dxn = 0, dyn = 0;
        for (let l = 0; l < NL; l++) {
          const fl = FL[l];
          if (w[l]) { s += w[l]; dx += w[l] * fl[q]; dy += w[l] * fl[q + 1]; }
          if (NEU && wn[l]) { sn += wn[l]; dxn += wn[l] * fl[q]; dyn += wn[l] * fl[q + 1]; }
        }
        if (s > 0) { F[q] = dx / s; F[q + 1] = dy / s; }
        if (sn > 0) { Fn[q] = dxn / sn; Fn[q + 1] = dyn / sn; }
      }
    }
    if (NEU) {
      // The chart's face = the average chart's face + its difference from it, strengthened (x KT in the drawing,
      // x KS in the shape). Outside the blended area both are the hair leader's, so nothing there changes.
      // The drawing's difference is strengthened only in its broad shading (below), never in fine tones: strengthening
      // the small tone differences around lips and lids doubles their edges into soft ghost shadows.
      const { KS } = BlendFace.CARICATURE;
      for (let q = 0; q < F.length; q++) F[q] = Fn[q] + KS * (F[q] - Fn[q]);
    }
    // The tones of the whole blend (smoothed) plus the strokes of the leading faces (their detail above their own
    // smoothed tones): one clean set of lines, no doubles. Smoothing is weighted by the cut-out, so edges stay clean.
    {
      // Smooths 3 channels (read by get) weighted by the cut-out, with a Gaussian of the given width.
      const smooth = (get, sg = BlendFace.DETAIL.sigma) => {
        const rad = Math.ceil(sg * 3), ker = new Float32Array(2 * rad + 1);
        for (let k = -rad; k <= rad; k++) ker[k + rad] = Math.exp(-0.5 * (k / sg) ** 2);
        const tmp = new Float32Array(N * 4), out2 = new Float32Array(N * 4);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
          for (let k = -rad; k <= rad; k++) { const xx = Math.min(W - 1, Math.max(0, x + k)), p = y * W + xx, kk = ker[k + rad], a = C[p * 4 + 3] * kk; if (!a) continue; const v = get(p); s0 += a * v[0]; s1 += a * v[1]; s2 += a * v[2]; s3 += a; }
          const o2 = (y * W + x) * 4; tmp[o2] = s0; tmp[o2 + 1] = s1; tmp[o2 + 2] = s2; tmp[o2 + 3] = s3;
        }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
          for (let k = -rad; k <= rad; k++) { const yy = Math.min(H - 1, Math.max(0, y + k)), o2 = (yy * W + x) * 4, kk = ker[k + rad]; s0 += kk * tmp[o2]; s1 += kk * tmp[o2 + 1]; s2 += kk * tmp[o2 + 2]; s3 += kk * tmp[o2 + 3]; }
          const o2 = (y * W + x) * 4, a = s3 || 1; out2[o2] = s0 / a; out2[o2 + 1] = s1 / a; out2[o2 + 2] = s2 / a;
        }
        return out2;
      };
      const v3 = [0, 0, 0];
      const lowC = smooth((p) => { v3[0] = C[p * 4]; v3[1] = C[p * 4 + 1]; v3[2] = C[p * 4 + 2]; return v3; });
      await new Promise((r) => setTimeout(r, 0));
      const lowD = smooth((p) => { v3[0] = Dt[p * 3]; v3[1] = Dt[p * 3 + 1]; v3[2] = Dt[p * 3 + 2]; return v3; });
      // The chart's difference from the average chart, strengthened (x KT) in its broad shading only.
      const KT = NEU ? BlendFace.CARICATURE.KT : 1;
      const LIGHT = weights.solo || keys.length <= 1 ? 1 : BlendFace.DETAIL.light ?? 1; // one angel on its own keeps all its shading
      const broad = NEU && KT !== 1 ? smooth((p) => { const i = p * 4; v3[0] = C[i] - Cn[i]; v3[1] = C[i + 1] - Cn[i + 1]; v3[2] = C[i + 2] - Cn[i + 2]; return v3; }, BlendFace.CARICATURE.SIGMA) : null;
      for (let p = 0; p < N; p++) {
        const i = p * 4; if (!C[i + 3]) continue;
        // the leading faces give their ink lines (what is darker than their own surroundings); their painted highlights
        // count for little (DETAIL.light), so a portrait's lip or cheek highlight never shows as a pale patch
        for (let c = 0; c < 3; c++) { const dd = Dt[p * 3 + c] - lowD[i + c]; C[i + c] = Math.min(255, Math.max(0, lowC[i + c] + (dd < 0 ? dd : LIGHT * dd) + (broad ? (KT - 1) * broad[i + c] : 0))); }
      }
    }
    if (BlendFace.DEBUG) BlendFace.DEBUG.detailed = C.slice();
    // 1b. The seams. Three things meet on a blended face, and each meeting is made seamless:
    //  - the edge of the face (temples, cheek outlines, jaw, neck) is the frame face's own drawing (one face, one
    //    contour), carried in the blend's broad tone, since the faint tone of many faces' contours would show as soft
    //    second outlines;
    //  - the hair is the chosen portrait's, wherever its picture clearly differs from the face drawn beneath; on the
    //    forehead its skin carries the blend's broad tone, so no lighter patch or second hairline shows;
    //  - around the head, its background gives way to the app's own halo (after the warp, below).
    // Broad tone: a Gaussian of sigma sg on RGB, worked on a quarter-size copy (fast at any width).
    const broadTone = (src, sg) => {
      const f = 4, w4 = Math.ceil(W / f), h4 = Math.ceil(H / f), sm = new Float32Array(w4 * h4 * 3), cnt = new Float32Array(w4 * h4);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const q = ((y / f) | 0) * w4 + ((x / f) | 0), i = (y * W + x) * 4; sm[q * 3] += src[i]; sm[q * 3 + 1] += src[i + 1]; sm[q * 3 + 2] += src[i + 2]; cnt[q]++; }
      for (let q = 0; q < w4 * h4; q++) for (let c = 0; c < 3; c++) sm[q * 3 + c] /= cnt[q] || 1;
      const s4 = sg / f, rad = Math.ceil(s4 * 3), ker = []; let ks = 0;
      for (let k = -rad; k <= rad; k++) { const v = Math.exp(-0.5 * (k / s4) ** 2); ker.push(v); ks += v; }
      const tmp = new Float32Array(sm.length), b = new Float32Array(sm.length);
      for (let y = 0; y < h4; y++) for (let x = 0; x < w4; x++) for (let c = 0; c < 3; c++) { let a = 0; for (let k = -rad; k <= rad; k++) a += ker[k + rad] * sm[(y * w4 + Math.min(w4 - 1, Math.max(0, x + k))) * 3 + c]; tmp[(y * w4 + x) * 3 + c] = a / ks; }
      for (let y = 0; y < h4; y++) for (let x = 0; x < w4; x++) for (let c = 0; c < 3; c++) { let a = 0; for (let k = -rad; k <= rad; k++) a += ker[k + rad] * tmp[(Math.min(h4 - 1, Math.max(0, y + k)) * w4 + x) * 3 + c]; b[(y * w4 + x) * 3 + c] = a / ks; }
      return (x, y, c) => {
        const fx = Math.min(w4 - 1.001, Math.max(0, (x + 0.5) / f - 0.5)), fy = Math.min(h4 - 1.001, Math.max(0, (y + 0.5) / f - 0.5)), x0 = fx | 0, y0 = fy | 0, ax = fx - x0, ay = fy - y0, q = (y0 * w4 + x0) * 3 + c;
        return b[q] * (1 - ax) * (1 - ay) + b[q + 3] * ax * (1 - ay) + b[q + w4 * 3] * (1 - ax) * ay + b[q + w4 * 3 + 3] * ax * ay;
      };
    };
    const fi = FRAME.indexOf(1);
    const SM = BlendFace.SEAMS || {};
    if (CH && fi >= 0 && SM.edge !== false) {
      const Fr = DD[fi], tC = broadTone(C, 22), tF = broadTone(Fr, 22);
      for (let p = 0, i = 0; p < N; p++, i += 4) {
        if (!C[i + 3]) continue;
        const y = (p / W) | 0, x = p - y * W;
        const edge = Math.min(1, Math.max(0, (0.92 - inn[p]) / 0.4)) * (1 - FM[p]);
        if (edge > 0.005) for (let c = 0; c < 3; c++) C[i + c] += edge * (Math.min(255, Math.max(0, Fr[i + c] + tC(x, y, c) - tF(x, y, c))) - C[i + c]);
      }
    }
    let bgTone = null;
    if (CH && leadAlpha && leadAlpha.length) {
      const Ld = leadAlpha[0], Dd = new Float32Array(N);
      for (let p = 0, i = 0; p < N; p++, i += 4) if (C[i + 3]) Dd[p] = Math.abs(Ld[i] - C[i]) + Math.abs(Ld[i + 1] - C[i + 1]) + Math.abs(Ld[i + 2] - C[i + 2]);
      const sg = BlendFace.HAIR.sigma, rad = Math.ceil(sg * 3), ker = new Float32Array(2 * rad + 1); let ks = 0;
      for (let k = -rad; k <= rad; k++) ks += (ker[k + rad] = Math.exp(-0.5 * (k / sg) ** 2));
      for (let k = 0; k < ker.length; k++) ker[k] /= ks;
      const T = new Float32Array(N), Ds = new Float32Array(N);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let a = 0; for (let k = -rad; k <= rad; k++) a += ker[k + rad] * Dd[y * W + Math.min(W - 1, Math.max(0, x + k))]; T[y * W + x] = a; }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let a = 0; for (let k = -rad; k <= rad; k++) a += ker[k + rad] * T[Math.min(H - 1, Math.max(0, y + k)) * W + x]; Ds[y * W + x] = a; }
      const { lo, hi } = BlendFace.HAIR;
      // the forehead's skin tone: the portrait's skin is brought to the blend's by one even shift, measured where both
      // are skin (the middle of the forehead, just above the brows), so no lighter or darker patch shows
      const K = [0, 0, 0]; let kn = 0;
      for (let y = Math.round(H * 0.27); y < Math.round(H * 0.31); y++) for (let x = Math.round(W * 0.4); x < Math.round(W * 0.6); x++) {
        const p = y * W + x, i = p * 4; if (FM[p] > 0.5 || Ds[p] > lo) continue; kn++; for (let c = 0; c < 3; c++) K[c] += C[i + c] - Ld[i + c]; }
      for (let c = 0; c < 3; c++) K[c] = kn ? K[c] / kn : 0;
      for (let p = 0, i = 0; p < N; p++, i += 4) {
        if (!C[i + 3]) continue;
        const y = (p / W) | 0, x = p - y * W, below = Math.min(1, Math.max(0, (y / H - 0.40) / 0.06));
        const neck = Math.min(1, Math.max(0, (y / H - 0.62) / 0.05)) * Math.min(1, Math.max(0, (0.21 - Math.abs(x / W - 0.5)) / 0.04));
        const hair = Math.min(1, Math.max(0, (Ds[p] - lo) / (hi - lo))) * (1 - FM[p]) * (1 - below * Math.min(1, inn[p] / 0.25)) * (1 - neck);
        // the forehead above the brows and the area around the head: the chosen portrait's drawing (its hairline,
        // its hair ends); on the forehead its skin in the blend's broad tone where it is not hair
        const top = SM.top === false ? 0 : Math.min(1, Math.max(0, (0.31 - y / H) / 0.07)) * (1 - FM[p]);
        const around = Math.min(1, Math.max(0, (0.15 - inn[p]) / 0.1)) * (1 - neck); // only far from the face: nearer, the frame face's own edge stays
        const zone = Math.max(top, around), h = Math.max(zone, hair);
        if (h <= 0) continue;
        for (let c = 0; c < 3; c++) {
          const skin = Math.min(255, Math.max(0, Ld[i + c] + top * K[c]));
          C[i + c] += h * (skin - C[i + c]);
        }
      }
      // the chosen portrait's own background colour: the brightest part of what lies well around the head
      const px = [];
      for (let p = 0; p < N; p += 3) if (inn[p] < 0.08 && Ld[p * 4 + 3] > 200) px.push(p * 4);
      if (px.length > 200) {
        const lum = (i) => 0.299 * Ld[i] + 0.587 * Ld[i + 1] + 0.114 * Ld[i + 2];
        px.sort((a, b) => lum(b) - lum(a));
        const top40 = px.slice(0, Math.max(50, (px.length * 0.4) | 0)); bgTone = [0, 0, 0];
        for (const i of top40) for (let c = 0; c < 3; c++) bgTone[c] += Ld[i + c] / top40.length;
      }
    }
    if (BlendFace.DEBUG) { BlendFace.DEBUG.seamed = C.slice(); BlendFace.DEBUG.F = F.slice(); BlendFace.DEBUG.Fn = Fn.slice(); BlendFace.DEBUG.grid = { step, gx, gy }; }
    const flowAt = (x, y) => {
      const fx = x / step, fy = y / step, i0 = Math.min(gx - 2, Math.max(0, Math.floor(fx))), j0 = Math.min(gy - 2, Math.max(0, Math.floor(fy)));
      const ax = fx - i0, ay = fy - j0, a = (j0 * gx + i0) * 2, b = a + 2, c = a + gx * 2, d = c + 2;
      return [F[a] * (1 - ax) * (1 - ay) + F[b] * ax * (1 - ay) + F[c] * (1 - ax) * ay + F[d] * ax * ay,
        F[a + 1] * (1 - ax) * (1 - ay) + F[b + 1] * ax * (1 - ay) + F[c + 1] * (1 - ax) * ay + F[d + 1] * ax * ay];
    };
    // 3. Warp the blended texture to the blended shape: each output point y shows the mean-shape point x with
    //    x + F(x) = y (found by a few fixed-point steps), read with bilinear interpolation.
    const out = ctx.createImageData(W, H), o = out.data;
    for (let y = 0; y < H; y++) {
      const fade = Math.min(1, Math.max(0, (0.93 - y / H) / 0.15)); // the robe fades into the halo
      if (!fade) continue;
      for (let x = 0; x < W; x++) {
        let [dx, dy] = flowAt(x, y), px = x - dx, py = y - dy;
        for (let it = 0; it < 3; it++) { [dx, dy] = flowAt(px, py); px = x - dx; py = y - dy; }
        // A point drawn from beyond the picture's edge (a tall head whose hair the shape pushes past the top) has no
        // drawing: it fades out over a few pixels instead of repeating the edge row into streaks.
        const out0 = Math.max(0, -py, -px, px - (W - 1.001), py - (H - 1.001)), edgeFade = Math.max(0, 1 - out0 / 8);
        px = Math.min(W - 1.001, Math.max(0, px)); py = Math.min(H - 1.001, Math.max(0, py));
        const x0 = px | 0, y0 = py | 0, ax = px - x0, ay = py - y0, a = (y0 * W + x0) * 4, b = a + 4, c = a + W * 4, d = c + 4, t = (y * W + x) * 4;
        for (let ch = 0; ch < 4; ch++) o[t + ch] = C[a + ch] * (1 - ax) * (1 - ay) + C[b + ch] * ax * (1 - ay) + C[c + ch] * (1 - ax) * ay + C[d + ch] * ax * ay;
        o[t + 3] *= fade * edgeFade;
      }
    }
    // The head's parts in the finished face, for the chart's faces and the colour choices: the hair (fine strands
    // close together, outside the face itself and the neck) and the forehead between the hair and the face (in each
    // column across the face, everything from the top of the hair down), which must never be taken for background.
    const tone = weights.skinTone && SKIN_TONES[weights.skinTone], hc = weights.hairTint && HAIR_COLORS[weights.hairTint];
    const clip = CH && BlendFace.SILHOUETTE !== false; // a chart's face: only the head itself is kept
    const inMean = (x, y) => { const [fx, fy] = flowAt(x, y); return [(x - fx) * 540 / W, (y - fy) * 720 / H]; };
    const neckAt = (x, y, lo, w) => Math.min(1, Math.max(0, (y / H - lo) / 0.05)) * Math.min(1, Math.max(0, (w - Math.abs(x / W - 0.5)) / 0.04));
    // the ears, beside the face at the height between the brows and the jaw (in the mean frame)
    const earAt = (x, y) => { const [qx, qy] = inMean(x, y), side = Math.abs(qx - 270);
      return Math.min(1, Math.max(0, (side - 135) / 15)) * Math.min(1, Math.max(0, (215 - side) / 15)) * Math.min(1, Math.max(0, (qy - 250) / 20)) * Math.min(1, Math.max(0, (420 - qy) / 20)); };
    let hair = null, fore = null;
    if (tone || hc || clip) {
      hair = hairMaskOf(o, W, H, (x, y) => {
        const [qx, qy] = inMean(x, y), face = Math.exp(-0.5 * (((qx - 270) / 130) ** 2 + ((qy - 345) / 186) ** 2) ** 3);
        return Math.min(1, Math.max(0, (0.4 - face) / 0.3)) * (1 - neckAt(x, y, 0.6, 0.27));
      });
      fore = new Float32Array(N);
      const yEnd = Math.round(H * 0.5), yTop = Math.round(H * 0.45);
      for (let x = 0; x < W; x++) {
        const [qx] = inMean(x, Math.round(H * 0.3)), across = Math.min(1, Math.max(0, (150 - Math.abs(qx - 270)) / 25));
        if (across <= 0) continue;
        let y0 = -1; for (let y = 0; y < yTop; y++) if (hair[y * W + x] > 0.25) { y0 = y; break; }
        if (y0 < 0) continue;
        for (let y = y0; y < yEnd; y++) fore[y * W + x] = across;
      }
    }
    // Around the head, the chosen portrait's own parchment and halo give way to the app's halo beneath: what is close
    // to its background colour, or a thin line (its halo ring) within such background, is made see-through, so only
    // one halo and one background show. The face, neck and robe are untouched.
    if (bgTone && SM.bg !== false) {
      // Hair is full of ink strokes; parchment and the halo ring are not. So a pixel is background only if it is close
      // to the parchment's colour or to the halo's gold AND few strokes lie around it (stroke density over ~6 px).
      const ink = new Float32Array(N);
      for (let p = 0, t = 0; p < N; p++, t += 4) ink[p] = o[t + 3] && 0.299 * o[t] + 0.587 * o[t + 1] + 0.114 * o[t + 2] < 125 ? 1 : 0;
      const blur = (a, sg) => { const rad = Math.ceil(sg * 3), ker = []; let ks = 0; for (let k = -rad; k <= rad; k++) { const v = Math.exp(-0.5 * (k / sg) ** 2); ker.push(v); ks += v; }
        const t1 = new Float32Array(N), t2 = new Float32Array(N);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * a[y * W + Math.min(W - 1, Math.max(0, x + k))]; t1[y * W + x] = v / ks; }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * t1[Math.min(H - 1, Math.max(0, y + k)) * W + x]; t2[y * W + x] = v / ks; }
        return t2; };
      const dens = blur(ink, 6), gold = [203, 153, 62], bg = new Float32Array(N);
      for (let p = 0, t = 0; p < N; p++, t += 4) {
        if (!o[t + 3]) continue;
        const dB = Math.abs(o[t] - bgTone[0]) + Math.abs(o[t + 1] - bgTone[1]) + Math.abs(o[t + 2] - bgTone[2]);
        const dG = Math.abs(o[t] - gold[0]) + Math.abs(o[t + 1] - gold[1]) + Math.abs(o[t + 2] - gold[2]);
        const like = Math.max(Math.min(1, Math.max(0, (70 - dB) / 35)), Math.min(1, Math.max(0, (90 - dG) / 40)));
        const hairy = Math.min(1, Math.max(0, (dens[p] - 0.05) / 0.08));
        // the halo ring's own saturated gold is never hair, even beside hair (hair colours are far less saturated)
        const ringGold = o[t] - o[t + 2] > 115 && o[t] > 150 && o[t + 1] > 105 && o[t + 1] < 185 ? 1 : 0;
        bg[p] = Math.max(like * (1 - hairy), ringGold * (inn[p] < 0.3 ? 1 : 0));
      }
      const cl = blur(bg, 1.2);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = y * W + x, t = p * 4; if (!o[t + 3]) continue;
        const [fx, fy] = flowAt(x, y), q = Math.min(H - 1, Math.max(0, Math.round(y - fy))) * W + Math.min(W - 1, Math.max(0, Math.round(x - fx)));
        const face = Math.min(1, Math.max(0, (inn[q] - 0.25) / 0.2)), neck = Math.min(1, Math.max(0, (y / H - 0.6) / 0.05)) * Math.min(1, Math.max(0, (0.2 - Math.abs(x / W - 0.5)) / 0.04));
        const keep = Math.max(face, neck, fore ? fore[p] : 0); // the robe is not parchment-coloured, so it stays by itself
        o[t + 3] *= 1 - cl[p] * (1 - keep);
      }
    }
    if (tone || hc || clip) {
      // the skin: the face with its ears, the forehead up to the hair, and the neck; never the hair
      if (tone) tintSkin(o, W, H, (x, y) => {
        const [qx, qy] = inMean(x, y), face = Math.exp(-0.5 * (((qx - 270) / 172) ** 2 + ((qy - 340) / 245) ** 2) ** 3);
        return Math.min(1, face * 1.3);
      }, (x, y) => {
        const [qx, qy] = inMean(x, y), wide = Math.exp(-0.5 * (((qx - 270) / 205) ** 2 + ((qy - 340) / 260) ** 2) ** 3);
        return Math.max(Math.min(1, wide * 1.3), fore[y * W + x]);
      }, (x, y) => Math.max(earAt(x, y), neckAt(x, y, 0.5, 0.34)), hair, tone,
        [[160, 229], [281, 228]].map(([x, y]) => { const [dx, dy] = flowAt(x, y); return [x * W / 450 + dx, y * H / 600 + dy]; }));
      if (hc) tintHair(o, W, H, hair, hc);
      // The head alone: its face and ears, its forehead, its neck and its hair. Whatever else the portraits carry
      // around the head (their own halo rings, panels, glows) is made see-through, so only the one halo shows.
      if (clip) {
        const inkE = new Float32Array(N);
        for (let p = 0, t = 0; p < N; p++, t += 4) inkE[p] = o[t + 3] && 0.299 * o[t] + 0.587 * o[t + 1] + 0.114 * o[t + 2] < 150 ? 1 : 0;
        const ear = gblur(inkE, W, H, 4 * W / 450).map((v) => Math.min(1, Math.max(0, (v - 0.04) / 0.08)));
        const hw = new Float32Array(N);
        for (let p = 0; p < N; p++) hw[p] = Math.min(1, hair[p] * 3);
        const rad = 8, ker = []; let ks = 0; for (let k = -rad; k <= rad; k++) { const v = Math.exp(-0.5 * (k / 3.5) ** 2); ker.push(v); ks += v; }
        const t1 = new Float32Array(N), hb = new Float32Array(N);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * hw[y * W + Math.min(W - 1, Math.max(0, x + k))]; t1[y * W + x] = v / ks; }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -rad; k <= rad; k++) v += ker[k + rad] * t1[Math.min(H - 1, Math.max(0, y + k)) * W + x]; hb[y * W + x] = v / ks; }
        for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
          const t = p * 4; if (!o[t + 3]) continue;
          const [qx, qy] = inMean(x, y), face = Math.exp(-0.5 * (((qx - 270) / 152) ** 2 + ((qy - 335) / 232) ** 2) ** 3);
          const keep = Math.max(Math.min(1, face * 1.3), neckAt(x, y, 0.55, 0.25), Math.min(1, hb[p] * 2.5), fore[p], earAt(x, y) * ear[p]);
          o[t + 3] *= keep;
        }
      }
    }
    if (weights.eyeColor && EYE_COLORS[weights.eyeColor]) tintEyes(o, W, H, [[160, 229], [281, 228]].map(([x, y]) => { const [dx, dy] = flowAt(x, y); return [x * W / 450 + dx, y * H / 600 + dy]; }), EYE_COLORS[weights.eyeColor]);
    if (BlendFace.DEBUG) BlendFace.DEBUG.warped = new Float32Array(o);
    const face = document.createElement("canvas"); face.width = W; face.height = H;
    face.getContext("2d").putImageData(out, 0, 0);
    ctx.drawImage(face, 0, 0);
    return canvas;
  }
  // Who sits inside a face: the share of every angel at one point (fx, fy as fractions of the picture's width and
  // height), by the same part masks and hair rule the drawing uses. Returns [[key, share]], largest first.
  function who(weights, fx, fy, W = 450, H = 600) {
    const M = regionMasks(W, H), x = Math.max(0, Math.min(W - 1, Math.round(fx * W))), y = Math.max(0, Math.min(H - 1, Math.round(fy * H))), p = y * W + x;
    const META = ["sexMix", "lead", "neutral", "hairColor", "eyeColor", "hairTint", "skinTone"];
    const regions = weights.regions ? Object.fromEntries(Object.entries(weights.regions).map(([k, v]) => [k, norm(v)])) : null;
    const out = {};
    if (!regions) { for (const [k, v] of Object.entries(norm(Object.fromEntries(Object.entries(weights).filter(([k]) => !META.includes(k)))))) out[layerOf(k)] = v; }
    else {
      const lead = weights.lead || (regions.hair ? Object.entries(regions.hair).sort((a, b) => b[1] - a[1])[0][0] : null);
      const hair = lead ? { [lead]: 1 } : regions.hair, ip = lead ? M.inner[p] : 1;
      for (const r of M.keys) {
        const mix = r === "hair" ? hair : regions[r] || {};
        for (const [k, v] of Object.entries(mix)) out[layerOf(k)] = (out[layerOf(k)] || 0) + ip * v * M.R[r][p] * (lead && r !== "hair" && FEAT_ONLY(layerOf(k)) ? M.feat[p] : 1);
      }
      if (lead) out[layerOf(lead)] = (out[layerOf(lead)] || 0) + (1 - ip);
    }
    const t = Object.values(out).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(out).map(([k, v]) => [k, v / t]).filter(([, v]) => v > 0.002).sort((a, b) => b[1] - a[1]);
  }
  // A small picture of one angel's own portrait, as it sits in the shared frame (for the "who sits inside" view).
  const thumbs = {};
  function thumb(key, sex) {
    const s = sex === "f" ? "f" : "m", id = s + ":" + layerOf(key);
    return (thumbs[id] ||= layer(id).then((ly) => {
      const c = document.createElement("canvas"), W = ly.data.width, H = ly.data.height, cw = 120, ch = 150;
      const full = document.createElement("canvas"); full.width = W; full.height = H; full.getContext("2d").putImageData(ly.data, 0, 0);
      c.width = cw; c.height = ch;
      const x = c.getContext("2d"); x.fillStyle = "#f3e6c8"; x.fillRect(0, 0, cw, ch);
      x.drawImage(full, W * 0.14, H * 0.1, W * 0.72, H * 0.6, 0, 0, cw, ch);
      return c.toDataURL("image/jpeg", 0.85);
    }));
  }
  return { render, who, thumb, ANGEL, EYE_COLORS, HAIR_COLORS, SKIN_TONES, ownSex: (key, sex) => !(BORROWED[sex] || []).includes(layerOf(key)), INNER: { cx: 270, cy: 352, rx: 155, ry: 225, k: 2.2 }, CARICATURE: { KT: 2.5, KS: 2.5, SIGMA: 8 }, DETAIL: { p: 6, pOut: 14, sigma: 22, sexP: 3, light: 0.3, lilly: 0.12, lillyTex: 0.03 }, HAIR: { sigma: 5, lo: 45, hi: 90 }, reset: () => (masks = null), DEBUG: null };
})();
