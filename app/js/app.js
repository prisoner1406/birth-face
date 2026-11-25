// Birth Face: people, their faces from the exact rising degree, and the discovery of which parts of a chart
// really match real faces.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (x) => `${Math.round(x * 100)}%`;
  const ELS = ["Fire", "Air", "Water", "Earth"];
  const FEATS = [["face", "Face shape and jaw"], ["brows", "Brow and forehead"], ["eyes", "Eyes"], ["nose", "Nose"], ["mouth", "Mouth and lips"], ["hair", "Hair"]];
  const GL = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄" };
  const THE = (p) => (p === "Sun" || p === "Moon" ? "the " + p : p);

  // ---------- storage (this computer only) ----------
  const KEY = "birthface.v1";
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)) || null; } catch { data = null; }
  data ||= { people: [], active: null, obs: [], calib: null };
  data.desc ||= {}; // descriptions in words: { personId: { question: answer } }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage full or blocked: kept for this session */ } };
  const person = () => data.people.find((p) => p.id === data.active) || data.people[0] || null;
  let tab = "face";

  // ---------- the chart ----------
  const charts = new Map();
  function chartOf(p) {
    const k = JSON.stringify([p.date, p.time, p.place]);
    if (charts.has(k)) return charts.get(k);
    const [y, mo, d] = p.date.split("-").map(Number), [h, mi, s] = p.time.split(":").map(Number);
    const utc = Daily.zonedToUtc(y, mo, d, h, mi, p.place.tz) + (s || 0) * 1000;
    const natal = Astro.natal(utc, p.place.lat, p.place.lon, "placidus", true);
    charts.set(k, natal);
    return natal;
  }
  // The face: every face of the chart combined (elemental 60%, planetary 40%), then the rising degree's own layer.
  function faceOf(p) {
    const natal = chartOf(p), fe = Faces.features(natal, { name: p.name }), L = Rising.layers(natal), C = Rising.contributions(L);
    // The hair leader is a portrait of the person's own sex: the strongest angel in the hair that has one.
    const outSex = Faces.sexMix(natal, p.sex).outline || "m";
    const chartLead = Faces.hairLeader(fe, (k) => !BlendFace.ownSex || BlendFace.ownSex(k, outSex)), lead = p.hairLead || chartLead;
    const mix = (a, b, ka, kb) => { const o = {}; for (const [k, v] of Object.entries(a)) o[k] = (o[k] || 0) + ka * v; for (const [k, v] of Object.entries(b)) o[k] = (o[k] || 0) + kb * v; return o; };
    const regions = {}, neutral = {};
    for (const x of fe.features) {
      if (x.key === "hair") { regions.hair = x.angels; neutral.hair = x.neutral.angels; continue; }
      const K = Rising.SHARE[x.key] || 0;
      regions[x.key] = mix(mix(x.angels, x.planets, 0.6, 0.4), C, 1 - K, K);
      neutral[x.key] = mix(mix(x.neutral.angels, x.neutral.planets, 0.6, 0.4), C, 1 - K, K);
    }
    Faces.moonEyes(regions, neutral, fe); // the Moon's own angel draws the eyes
    const f = Rising.femininity(natal, L), own = p.sex === "f" ? "f" : "m";
    const K = Faces.OTHER_SEX, sexMix = own === "m" ? { m: 1 - K * f, f: K * f, outline: "m" } : { f: 1 - K * (1 - f), m: K * (1 - f), outline: "f" };
    return { natal, fe, L, C, lead, chartLead, regions, neutral, sexMix, femininity: f, spec: { regions, lead, neutral: { regions: neutral }, sexMix, ...(p.hairLead && p.hairKeepColor !== false ? { hairColor: chartLead } : {}), ...(p.eyeColor && BlendFace.EYE_COLORS && BlendFace.EYE_COLORS[p.eyeColor] ? { eyeColor: p.eyeColor } : {}), ...(p.hairTint && BlendFace.HAIR_COLORS && BlendFace.HAIR_COLORS[p.hairTint] ? { hairTint: p.hairTint } : {}), ...(p.skinTone && BlendFace.SKIN_TONES && BlendFace.SKIN_TONES[p.skinTone] ? { skinTone: p.skinTone } : {}) } };
  }

  // ---------- people list ----------
  function renderPeople() {
    $("#people").innerHTML = data.people.map((p) => `<button type="button" data-id="${p.id}" class="${p.id === (person() || {}).id ? "on" : ""}"><span>${esc(p.name)}</span><small>${esc(p.date.slice(0, 4))}</small></button>`).join("");
    $("#people").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { data.active = b.dataset.id; save(); render(); }));
  }

  // ---------- screens ----------
  function render() {
    renderPeople();
    const p = person(), main = $("#main");
    if (!p) { main.innerHTML = `<div class="empty"><h1>Birth Face</h1><p class="sub">Your face read from the sky rising at the exact minute of your birth: the Egyptian decan, Varahamihira's drekkana, the navamsa and Lilly's degrees, over the angels and faces of your whole chart.</p><button type="button" class="btn" id="first">Add the first person</button></div>`; $("#first").addEventListener("click", () => openDialog(null)); return; }
    let F;
    try { F = faceOf(p); } catch (e) { console.error(e); main.innerHTML = `<p class="err">Could not cast this chart. Check the date, time and place.</p>`; return; }
    const L = F.L, natal = F.natal;
    const TABS = [["face", "Face"], ["rising", "The rising degree"], ["describe", "Describe yourself"], ["discover", "Observations & discovery"]];
    main.innerHTML = `<h1>${esc(p.name)}</h1><p class="sub">Born ${esc(p.date)} at ${esc(p.time)} in ${esc(p.place.label)} · rising ${Math.floor(L.deg)}°${String(Math.floor((L.deg % 1) * 60)).padStart(2, "0")}′ ${esc(L.sign)} <button type="button" class="btn ghost" id="edit" style="margin-left:8px;padding:4px 12px">Edit</button></p>
      <div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join("")}</div>
      <div id="body"></div>`;
    $("#edit").addEventListener("click", () => openDialog(p));
    main.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
    const body = $("#body");
    if (tab === "face") faceTab(body, p, F);
    else if (tab === "rising") risingTab(body, p, F);
    else if (tab === "describe") describeTab(body, p);
    else discoverTab(body, p);
  }

  function faceTab(body, p, F) {
    const L = F.L, name = (k) => Faces.ANGEL_NAME[k] || k;
    const top = (o, n = 6) => { const t = Object.values(o).reduce((a, b) => a + b, 0) || 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k, v / t]); };
    body.innerHTML = `<section class="card"><div class="hero">
        <figure class="face" id="face"><canvas></canvas><span class="wait">Drawing the face…</span><span class="dot" hidden></span><figcaption>${esc(p.name)}, from the sky at birth</figcaption></figure>
        <div><h2>Who sits inside this face</h2><div id="who"><p class="fine">Point at the face (the forehead, an eye, the nose, the lips, the jaw) to see who sits there and in what share.</p></div>
          <p class="hair-pick"><label>Hair from <select id="hair"><option value="">The chart's choice: ${esc(name(F.chartLead))}</option>${[["Archangels", ["michael", "gabriel", "raphael", "uriel", "anael", "khamael", "sachiel", "cassiel"]], ["Zodiac angels", Object.values(Faces.SIGN_ANGEL)], ["Shem angels", Array.from({ length: 72 }, (_, i) => "shem" + String(i + 1).padStart(2, "0"))], ["Lunar angels", Array.from({ length: 28 }, (_, i) => "mansion" + String(i + 1).padStart(2, "0"))], ["Lilly's faces", Array.from({ length: 84 }, (_, i) => "lilly" + String(i + 1).padStart(2, "0"))]].map(([g, ks]) => `<optgroup label="${g}">${ks.map((k) => `<option value="${k}"${k === p.hairLead ? " selected" : ""}>${esc(name(k))}</option>`).join("")}</optgroup>`).join("")}</select></label>${p.hairLead ? `<label class="keep"><input type="checkbox" id="hair-color"${p.hairKeepColor !== false ? " checked" : ""}> Keep the chart's hair colour</label>` : ""}<small>Only the hair changes; the head and the face stay the chart's.</small></p>
          <p class="hair-pick"><label>Skin tone <select id="skin"><option value="">As the engraving draws it</option>${[["fair", "Fair"], ["light", "Light"], ["light-olive", "Light olive"], ["medium", "Medium"], ["olive", "Olive"], ["tan", "Tan"], ["brown", "Brown"], ["dark-brown", "Dark brown"], ["deep", "Deep"]].map(([k, l]) => `<option value="${k}"${k === p.skinTone ? " selected" : ""}>${l}</option>`).join("")}</select></label><small>Your own choice: the lines stay as drawn.</small></p>
          <p class="hair-pick"><label>Hair colour <select id="hairtint"><option value="">As the engraving draws it</option>${[["black", "Black"], ["dark-brown", "Dark brown"], ["brown", "Brown"], ["light-brown", "Light brown"], ["auburn", "Auburn"], ["red", "Red"], ["dark-blonde", "Dark blonde"], ["blonde", "Blonde"], ["platinum", "Platinum"], ["grey", "Grey"], ["white", "White"]].map(([k, l]) => `<option value="${k}"${k === p.hairTint ? " selected" : ""}>${l}</option>`).join("")}</select></label><small>Your own choice too.</small></p>
          <p class="hair-pick"><label>Eye colour <select id="eye"><option value="">As the portraits draw them</option>${[["dark-brown", "Dark brown"], ["brown", "Brown"], ["hazel", "Hazel"], ["amber", "Amber"], ["green", "Green"], ["grey", "Grey"], ["blue", "Blue"], ["light-blue", "Light blue"]].map(([k, l]) => `<option value="${k}"${k === p.eyeColor ? " selected" : ""}>${l}</option>`).join("")}</select></label><small>Your own choice: the chart leaves colouring out.</small></p>
          <h3>Made from</h3><ul class="layers">
            <li><span class="g">✦</span><span><b>The whole chart</b>: the archangels of its elements with the zodiac, Shem and lunar angels and Lilly's faces (60%), and the planetary archangels (40%), part by part.</span></li>
            <li><span class="g">↑</span><span><b>The rising degree</b>, ${Math.floor(L.deg)}° ${esc(L.sign)}: a third of the face shape, brow and nose, a fifth of the mouth and a little of the eyes, from the decan, the drekkana, the angels of the Name and the navamsa (the tab "The rising degree").</span></li>
            ${F.fe.mansion && F.fe.mansion.drawn ? `<li><span class="g">☾</span><span><b>The eyes</b>: ${pct(Faces.MOON_EYES)} from ${esc(F.fe.mansion.name || Faces.ANGEL_NAME[F.fe.mansion.key])}, the angel of the mansion the Moon stood in at birth (the Moon rules the eyes).</span></li>` : ""}
            <li><span class="g">⚥</span><span><b>Masculine and feminine</b>: ${pct(F.femininity)} feminine by the chart, the drekkana's figure and Lilly's degree; ${p.sex === "f" ? "her" : "his"} own sex leads.</span></li>
          </ul></div></div></section>
      <section class="card"><h2>Part by part</h2>${FEATS.map(([k, l]) => `<h3>${l}</h3><div class="strip">${top(k === "hair" ? { [F.lead]: 1 } : F.regions[k]).map(([a, v]) => `<figure data-thumb="${a}"><span class="img"></span>${esc(name(a))}<small>${pct(v)}</small></figure>`).join("")}</div>`).join("")}</section>`;
    $("#hair").addEventListener("change", (e) => { p.hairLead = e.target.value || null; save(); render(); });
    $("#eye").addEventListener("change", (e) => { p.eyeColor = e.target.value || null; save(); render(); });
    $("#hairtint").addEventListener("change", (e) => { p.hairTint = e.target.value || null; save(); render(); });
    $("#skin").addEventListener("change", (e) => { p.skinTone = e.target.value || null; save(); render(); });
    $("#hair-color")?.addEventListener("change", (e) => { p.hairKeepColor = e.target.checked; save(); render(); });
    const fig = $("#face"), cv = fig.querySelector("canvas");
    BlendFace.render(cv, F.spec, p.sex).then(() => fig.querySelector(".wait").remove()).catch((e) => { console.error(e); fig.querySelector(".wait").textContent = "The face could not be drawn."; });
    body.querySelectorAll("[data-thumb]").forEach((el) => BlendFace.thumb(el.dataset.thumb, p.sex).then((src) => { el.querySelector(".img").style.backgroundImage = `url(${src})`; }).catch(() => {}));
    const who = $("#who"), dot = fig.querySelector(".dot"), WHERE = [[0.3, "the forehead"], [0.45, "the eyes and brows"], [0.56, "the nose and cheeks"], [0.66, "the mouth"], [0.78, "the chin and jaw"], [1, "the neck"]];
    let last = 0;
    const show = (ev) => {
      const b = cv.getBoundingClientRect(), pt = ev.touches ? ev.touches[0] : ev, fx = (pt.clientX - b.left) / b.width, fy = (pt.clientY - b.top) / b.height;
      if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;
      const fb = fig.getBoundingClientRect(); dot.hidden = false; dot.style.left = pt.clientX - fb.left + "px"; dot.style.top = pt.clientY - fb.top + "px";
      if (performance.now() - last < 60) return; last = performance.now();
      const list = BlendFace.who({ regions: F.regions, lead: F.lead }, fx, fy).slice(0, 7);
      who.innerHTML = `<p class="fine">At ${(WHERE.find(([y]) => fy < y) || WHERE[5])[1]}</p><ul class="who">${list.map(([k, v]) => `<li data-thumb="${k}"><span class="mini"></span><b>${esc(name(k))}</b><span class="bar"><i style="width:${Math.max(3, Math.round(v / list[0][1] * 100))}%"></i></span><em>${pct(v)}</em></li>`).join("")}</ul>`;
      who.querySelectorAll("[data-thumb]").forEach((li) => BlendFace.thumb(li.dataset.thumb, p.sex).then((src) => { const m = li.querySelector(".mini"); if (m) m.style.backgroundImage = `url(${src})`; }).catch(() => {}));
    };
    fig.addEventListener("mousemove", show); fig.addEventListener("touchstart", show, { passive: true });
  }

  function risingTab(body, p, F) {
    const L = F.L, sh = L.shem, name = (k) => Faces.ANGEL_NAME[k] || k;
    const dm = (d) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, "0")}′`;
    body.innerHTML = `<section class="card"><h2>The sky rising at the minute of birth</h2>
      <p class="sub">The Ascendant moves a degree in about four minutes, so these are the most exact layers of the birth moment the tradition ever reached. Each adds a portrait or a testimony to the face.</p>
      <ul class="layers">
        <li><span class="g">${GL[L.decan.lord]}</span><span><b>The Egyptian decan.</b> Before the zodiac signs, the Egyptians watched thirty-six star-groups rise, each ten degrees. Rising at ${dm(L.deg)} ${esc(L.sign)} is the ${["first", "second", "third"][L.decan.n - 1]} decan of ${esc(L.sign)}, given in the Chaldean order to <b>${esc(THE(L.decan.lord))}</b>. Its face: ${esc(name(Faces.lillyKey(L.decan.lord, L.sign)))}, as Lilly describes ${esc(THE(L.decan.lord))} in ${esc(L.sign)} (${pct(Rising.MIX.decan)} of the rising layer).</span></li>
        <li><span class="g">◈</span><span><b>The drekkana</b> (Varahamihira, Brihat Jataka 27). Counted in the sidereal zodiac, your Ascendant is ${dm(L.sidereal.deg)} ${esc(L.sidereal.sign)}, in its ${["first", "second", "third"][L.drekkana.n - 1]} drekkana: <i>${esc(L.drekkana.figure)}</i>. Its lord is <b>${esc(THE(L.drekkana.lord))}</b> (the lord of the ${["rising", "fifth", "ninth"][L.drekkana.n - 1]} sign, Brihat Jataka I.12), whose face in ${esc(L.sign)} takes ${pct(Rising.MIX.drekkana)} of the rising layer${L.drekkana.sex ? `; the figure is a ${L.drekkana.sex === "m" ? "man" : "woman"}, a testimony of the ${L.drekkana.sex === "m" ? "masculine" : "feminine"}` : ""}.</span></li>
        <li><span class="g">✡</span><span><b>The angels of the Name.</b> The decan's two halves are held by ${esc(sh[0].name)} and ${esc(sh[1].name)}; your rising degree is ${esc(sh.find((s) => s.rising).name)}'s. Together ${pct(Rising.MIX.shem)} of the rising layer.</span></li>
        <li><span class="g">◇</span><span><b>The navamsa.</b> The ninth of the sidereal sign, read in Jyotish for the body: <b>${esc(L.navamsa)}</b>, whose angel ${esc(name(Faces.SIGN_ANGEL[L.navamsa]))} takes ${pct(Rising.MIX.navamsa)} of the rising layer.</span></li>
        <li><span class="g">°</span><span><b>Lilly's degree</b> (Christian Astrology, p. 116, after Al-Biruni). The ${L.degNo}${["th", "st", "nd", "rd"][(L.degNo % 10 < 4 && Math.floor(L.degNo / 10) !== 1) ? L.degNo % 10 : 0]} degree of ${esc(L.sign)} is <b>${L.lilly.sex === "m" ? "masculine" : "feminine"}</b>, a testimony to the face's masculine and feminine, and <b>${esc(L.lilly.light)}</b>. Lilly reads light and dark degrees for the colouring of the skin, which these faces leave out.</span></li>
      </ul>
      <p class="fine">The rising layer shapes ${pct(Rising.SHARE.face)} of the face shape, ${pct(Rising.SHARE.brows)} of the brow and nose and ${pct(Rising.SHARE.eyes)} of the eyes and mouth; the rest of the face comes from the whole chart. Taking the lords of the decan and the drekkana in the rising sign for their faces is this app's way of joining these traditions, not a rule any one author gives. Drekkana figures after M. D. Neely's translation (2007), condensed.</p></section>`;
  }

  // ---------- observations and discovery ----------
  // For each person with an observation, every factor of the chart that points to an element for that feature.
  function factorsOf(p, feat) {
    const natal = chartOf(p), pl = (k) => natal.planets.find((x) => x.key === k), L = Rising.layers(natal), F = faceOf(p);
    const elOf = (sign) => ELS[[0, 3, 1, 2][Rising.SIGNS.indexOf(sign) % 4]];
    const drawn = Faces.featureElements({ angels: feat === "hair" ? { [F.lead]: 1 } : F.regions[feat] });
    const t = Faces.temperament(natal).shares;
    return {
      "The face as drawn": Object.entries(drawn).sort((a, b) => b[1] - a[1])[0][0],
      "Temperament": Object.entries(t).sort((a, b) => b[1] - a[1])[0][0],
      "Rising sign": elOf(natal.asc.sign), "Ruler of the Ascendant": elOf(pl(Rising.RULER[natal.asc.sign]).sign),
      "Sun's sign": elOf(natal.sun.sign), "Moon's sign": elOf(natal.moon.sign), "Venus's sign": elOf(pl("Venus").sign), "Mars's sign": elOf(pl("Mars").sign), "Mercury's sign": elOf(pl("Mercury").sign),
      "Decan lord's sign": elOf(pl(L.decan.lord).sign), "Drekkana lord's sign": elOf(pl(L.drekkana.lord).sign), "Navamsa": elOf(L.navamsa), "Sidereal rising sign": elOf(L.sidereal.sign)
    };
  }
  function discoverTab(body, p) {
    const obsOf = (pid, f) => (data.obs.find((o) => o.pid === pid && o.feature === f) || {}).element || "";
    const people = new Set(data.obs.map((o) => o.pid).concat(Object.keys(data.desc).filter((k) => Object.keys(data.desc[k]).length))).size;
    // Every person's feature, from a direct observation or else from their description in words.
    const allObs = [...data.obs];
    for (const q of data.people) for (const [f] of FEATS) if (!allObs.some((o) => o.pid === q.id && o.feature === f)) { const e = Describe.featureElement(data.desc[q.id] || {}, f); if (e) allObs.push({ pid: q.id, feature: f, element: e }); }
    const rows = FEATS.map(([f, label]) => {
      const list = allObs.filter((o) => o.feature === f && data.people.some((q) => q.id === o.pid));
      if (!list.length) return null;
      const score = {};
      for (const o of list) { const fx = factorsOf(data.people.find((q) => q.id === o.pid), f); for (const [k, e] of Object.entries(fx)) (score[k] ||= [0, 0]), score[k][1]++, e === o.element && score[k][0]++; }
      return { f, label, n: list.length, score };
    }).filter(Boolean);
    const factors = rows.length ? Object.keys(rows[0].score) : [];
    body.innerHTML = `<section class="card"><h2>What ${esc(p.name)}'s features really look like</h2>
      <p class="sub">For each part of the face, choose the description closest to the real person. Nothing here changes the chart or the face: it is kept to test which parts of a chart actually match real faces.</p>
      <div class="obs">${FEATS.map(([f, label]) => `<label>${label}<select data-f="${f}"><option value="">Not recorded</option>${ELS.map((e) => `<option value="${e}"${obsOf(p.id, f) === e ? " selected" : ""}>${e}: ${esc(Faces.FEATURE_LOOK[f][e])}</option>`).join("")}</select></label>`).join("")}</div></section>
      <section class="card"><h2>Discovery</h2>
      <p class="sub">Observations and descriptions of ${people} ${people === 1 ? "person" : "people"}. For every observed feature, how often each part of the chart points to the element the real feature has. By chance alone a factor matches about one time in four (25%); a factor that keeps matching well above that, across many people, is one that really works.</p>
      ${rows.length ? `<div style="overflow-x:auto"><table><thead><tr><th>Factor</th>${rows.map((r) => `<th>${esc(r.label)} <small>(${r.n})</small></th>`).join("")}</tr></thead><tbody>${factors.map((k) => `<tr><td>${esc(k)}</td>${rows.map((r) => { const [h, n] = r.score[k]; return `<td>${h}/${n} <small>${pct(h / n)}</small></td>`; }).join("")}</tr>`).join("")}</tbody></table></div>
      <p class="fine">With only a few people these numbers mean little: a factor can match two of two by luck. Ten or more people with exact birth times (family, friends, people whose birth certificates are known) begin to tell the true from the lucky.</p>` : `<p class="fine">Record the features of a few people with exact birth times to see which parts of the chart match.</p>`}</section>`;
    body.querySelectorAll("select[data-f]").forEach((s) => s.addEventListener("change", () => {
      data.obs = data.obs.filter((o) => !(o.pid === p.id && o.feature === s.dataset.f));
      if (s.value) data.obs.push({ pid: p.id, feature: s.dataset.f, element: s.value });
      save(); render();
    }));
  }

  // ---------- describe yourself ----------
  function describeTab(body, p) {
    const ans = data.desc[p.id] || {};
    const filled = Object.values(ans).filter(Boolean).length;
    body.innerHTML = `<section class="card"><h2>Describe ${esc(p.name)} in words</h2>
      <p class="sub">The real face and build, described rather than photographed: nothing here is a picture, and nothing changes the face the chart draws. The answers are compared with the birth chart to see how much of the real person the chart explains.</p>
      <div class="obs">${Describe.QUESTIONS.map(([k, q, opts]) => `<label>${esc(q)}<select data-q="${k}"><option value="">Not answered</option>${opts.map(([v, l]) => `<option value="${v}"${ans[k] === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`).join("")}</div></section>
      <section class="card"><h2>How much the chart explains</h2><div id="rel">${filled < 6 ? `<p class="fine">Answer at least six questions (${filled} so far) to measure it.</p>` : `<p class="fine">Comparing with 300 other birth moments… <span id="relp">0%</span></p>`}</div></section>`;
    body.querySelectorAll("select[data-q]").forEach((s) => s.addEventListener("change", () => { (data.desc[p.id] ||= {})[s.dataset.q] = s.value; if (!s.value) delete data.desc[p.id][s.dataset.q]; save(); describeTab(body, p); }));
    if (filled < 6) return;
    const token = (describeTab.token = (describeTab.token || 0) + 1); // a newer answer makes this result stale
    Describe.relevance(chartOf(p), p.place, ans, 300, (f) => { const e = $("#relp"); if (e && token === describeTab.token) e.textContent = pct(f); }).then((r) => {
      const el = $("#rel"); if (!el || token !== describeTab.token) return;
      const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
      const verdict = r.percentile >= 0.9 ? "fits the description far better than chance" : r.percentile >= 0.7 ? "fits the description better than most birth moments" : r.percentile >= 0.4 ? "fits about as well as a random birth moment" : "fits worse than most birth moments";
      el.innerHTML = `<p class="lead" style="font-size:19px">${esc(p.name)}'s chart <b>${verdict}</b>: it explains this description better than <b>${pct(r.percentile)}</b> of ${r.samples} other birth moments at the same place.</p>
        <div class="obs"><div><h3>The description leans to</h3><p>${top(r.description.planets, 3).map(([k, v]) => `${GL[k]} ${THE(k)} ${pct(v)}`).join(" · ")}<br>${top(r.description.elements, 2).map(([k, v]) => `${k} ${pct(v)}`).join(" · ")}</p></div>
          <div><h3>The chart leans to</h3><p>${top(r.chart.planets, 3).map(([k, v]) => `${GL[k]} ${THE(k)} ${pct(v)}`).join(" · ")}<br>${top(r.chart.elements, 2).map(([k, v]) => `${k} ${pct(v)}`).join(" · ")}</p></div></div>
        <h3>Answer by answer</h3><table><thead><tr><th>Feature</th><th>Described</th><th>Strongest support in the chart</th></tr></thead><tbody>${r.perAnswer.map((a) => `<tr><td>${esc(a.q)}</td><td>${esc(a.answer)}</td><td>${a.lift >= 1.15 ? "✓ " : a.lift >= 0.85 ? "~ " : "✗ "}${esc(GL[a.by] ? THE(a.by) : a.by)} <small>(${a.lift >= 1.15 ? "strong" : a.lift >= 0.85 ? "average" : "weak"} in the chart)</small></td></tr>`).join("")}</tbody></table>
        <p class="fine">Each answer points to the planets and elements the tradition gives it (Lilly's descriptions of the planets' bodies; the four temperaments). ✓ the chart emphasises it, ~ about average, ✗ the chart does not. The comparison with other birth moments is what tells real fit from coincidence; with more people described, the Observations & discovery tab shows which parts of the chart keep matching.</p>`;
    });
  }

  // ---------- the person dialog ----------
  const dlg = $("#dlg"), form = $("#pf");
  let editing = null, place = null, cityIndex = null;
  const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function searchCities(q) {
    if (typeof CITY_DB === "undefined") return [];
    cityIndex ||= CITY_DB.rows.split("\n").map((row) => { const f = row.split("|"); return { name: f[0], key: fold(f[1] || f[0]) + " " + fold(f[0]), cc: f[2], admin: CITY_DB.admin[f[3]], lat: +f[4], lon: +f[5], tz: CITY_DB.tz[f[6]] }; });
    let regions; try { regions = new Intl.DisplayNames(["en"], { type: "region" }); } catch { regions = null; }
    const [cq, ...rest] = fold(q).split(",").map((x) => x.trim()), rq = rest.join(" ").trim();
    const country = (c) => { try { return regions ? regions.of(c.cc) : c.cc; } catch { return c.cc; } };
    const out = [];
    for (const c of cityIndex) {
      if (rq && !fold(c.admin + " " + country(c)).includes(rq)) continue;
      if (c.key.startsWith(cq) || c.key.includes(" " + cq)) out.push({ ...c, country: country(c) });
      if (out.length >= 8) break;
    }
    return out;
  }
  const setPlace = (pl) => { place = pl; form.place.value = pl ? pl.label : ""; $("#pf-info").textContent = pl ? `${pl.lat.toFixed(3)}°, ${pl.lon.toFixed(3)}° · ${pl.tz}` : ""; $("#pf-sugg").hidden = true; };
  form.place.addEventListener("input", () => {
    place = null; $("#pf-info").textContent = "";
    const q = form.place.value.trim(), ul = $("#pf-sugg");
    if (q.length < 2) { ul.hidden = true; return; }
    const list = searchCities(q);
    ul.innerHTML = list.length ? list.map((c, i) => `<li data-i="${i}">${esc(c.name)}<small>${esc([c.admin, c.country].filter(Boolean).join(", "))}</small></li>`).join("") : `<li>No city found: try the nearest larger town.</li>`;
    ul.hidden = false;
    ul.querySelectorAll("li[data-i]").forEach((li) => li.addEventListener("click", () => { const c = list[li.dataset.i]; setPlace({ label: [c.name, c.admin, c.country].filter(Boolean).join(", "), lat: c.lat, lon: c.lon, tz: c.tz }); }));
  });
  function openDialog(p) {
    editing = p; form.reset(); $("#pf-err").textContent = "";
    $("#pf-title").textContent = p ? `Edit ${p.name}` : "Add a person";
    $("#pf-del").hidden = !p;
    if (p) { form.name.value = p.name; form.date.value = p.date; form.time.value = p.time; form.sex.value = p.sex; setPlace(p.place); } else setPlace(null);
    dlg.showModal(); form.name.focus();
  }
  $("#add").addEventListener("click", () => openDialog(null));
  $("#pf-cancel").addEventListener("click", () => dlg.close());
  $("#pf-del").addEventListener("click", () => {
    if (!editing || !confirm(`Delete ${editing.name} and their observations?`)) return;
    data.people = data.people.filter((p) => p.id !== editing.id); data.obs = data.obs.filter((o) => o.pid !== editing.id);
    data.active = data.people[0]?.id || null; save(); dlg.close(); render();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#pf-err"), name = form.name.value.trim(), date = form.date.value, time = (form.time.value || "").replace(/^(\d\d:\d\d):00$/, "$1");
    if (!name || !date || !time) { err.textContent = "Name, date and exact time of birth are needed."; return; }
    if (!place) { err.textContent = "Pick the place of birth from the list, so the time zone is right."; return; }
    const p = { id: editing?.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), name, date, time, place, sex: form.sex.value, hairLead: editing?.hairLead || null, hairKeepColor: editing?.hairKeepColor ?? true, eyeColor: editing?.eyeColor || null, hairTint: editing?.hairTint || null, skinTone: editing?.skinTone || null };
    if (editing) data.people = data.people.map((q) => (q.id === p.id ? p : q)); else data.people.push(p);
    data.active = p.id; save(); dlg.close(); tab = "face"; render();
  });

  render();
})();
