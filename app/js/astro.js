// Western astrology engine: angles, house systems, natal chart, aspects, chart wheel,
// synastry, life cycles (returns and major transits) and the cosmic calendar.
// Positions: apparent geocentric longitudes, tropical zodiac, true ecliptic of date (astronomy-engine).
const Astro = (() => {
  const Ast = window.Astronomy;
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const norm = (x) => ((x % 360) + 360) % 360;
  const diff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180; // signed a-b in (-180, 180]
  const sep = (a, b) => Math.abs(diff(a, b));

  const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const VS = "︎"; // text presentation for glyphs
  const SIGN_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g) => g + VS);
  const ELEMENT = ["Fire", "Earth", "Air", "Water"];
  const MODALITY = ["Cardinal", "Fixed", "Mutable"];
  const RULER = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune" };
  const signOf = (lon) => Math.floor(norm(lon) / 30);
  const fmtDeg = (lon) => {
    const d = norm(lon) % 30, deg = Math.floor(d), min = Math.floor((d - deg) * 60);
    return `${deg}°${String(min).padStart(2, "0")}′`;
  };
  const fmtPos = (lon) => `${fmtDeg(lon)} ${SIGNS[signOf(lon)]}`;

  const PLANETS = [
    { key: "Sun", glyph: "☉", w: 2 }, { key: "Moon", glyph: "☽", w: 2 }, { key: "Mercury", glyph: "☿", w: 1 }, { key: "Venus", glyph: "♀", w: 1 },
    { key: "Mars", glyph: "♂", w: 1 }, { key: "Jupiter", glyph: "♃", w: 1 }, { key: "Saturn", glyph: "♄", w: 1 }, { key: "Uranus", glyph: "♅", w: 0.5 },
    { key: "Neptune", glyph: "♆", w: 0.5 }, { key: "Pluto", glyph: "♇", w: 0.5 }, { key: "NorthNode", glyph: "☊", w: 0, label: "North Node" }
  ].map((p) => ({ ...p, glyph: p.glyph + VS }));
  const GLYPH = Object.fromEntries(PLANETS.map((p) => [p.key, p.glyph]));
  GLYPH.Ascendant = "AC"; GLYPH.Midheaven = "MC";
  const LABEL = (k) => ({ NorthNode: "North Node", Ascendant: "Ascendant", Midheaven: "Midheaven" }[k] || k);

  // ---------- single-body longitudes (fast, for searches) ----------
  // The Moon is seen where it was about 1.3 seconds ago (light-time), as in JPL Horizons and the Swiss Ephemeris.
  const LT_DAY_PER_AU = 499.00478384 / 86400;
  const moonApparent = (t) => Ast.EclipticGeoMoon(t.AddDays(-Ast.EclipticGeoMoon(t).dist * LT_DAY_PER_AU)).lon;
  function bodyLon(key, t) {
    if (key === "Sun") return Ast.SunPosition(t).elon;
    if (key === "Moon") return moonApparent(t);
    if (key === "MeanNode") { const T = t.tt / 36525; return norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T); }
    return Ast.Ecliptic(Ast.GeoVector(Ast.Body[key], t, true)).elon;
  }
  const at = (ms) => Ast.MakeTime(new Date(ms));

  // ---------- angles and houses ----------
  // True obliquity of the ecliptic (mean obliquity + nutation in obliquity), which goes with the apparent sidereal time
  // and the true ecliptic of date that the planets are given in. The mean value alone is off by up to 9.2″.
  function obliquity(t) {
    if (Ast.e_tilt) return Ast.e_tilt(t).tobl;
    const T = t.tt / 36525;
    return 23.439291111 - 0.0130041667 * T - 1.6667e-7 * T * T + 5.0278e-7 * T * T * T;
  }
  function angles(utcMs, lat, lon) {
    const t = at(utcMs);
    const eps = obliquity(t) * D2R;
    const ramc = norm(Ast.SiderealTime(t) * 15 + lon);
    const r = ramc * D2R, phi = lat * D2R;
    const mc = norm(Math.atan2(Math.sin(r), Math.cos(r) * Math.cos(eps)) * R2D);
    const asc = norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * R2D);
    return { asc, mc, ramc, eps: eps * R2D, lat };
  }
  // RA → ecliptic longitude for a point on the ecliptic.
  const raToLon = (ra, eps) => norm(Math.atan2(Math.sin(ra * D2R), Math.cos(ra * D2R) * Math.cos(eps * D2R)) * R2D);
  const decOf = (lam, eps) => Math.asin(Math.sin(eps * D2R) * Math.sin(lam * D2R)) * R2D;

  function placidus(a) {
    const { ramc, eps, lat } = a;
    const cusp = (fraction, above) => {
      // above: houses 11/12 measured from MC with the diurnal semi-arc; below: houses 2/3 from IC with the nocturnal arc.
      let lam = norm(ramc + (above ? fraction * 90 : 180 - fraction * 90));
      for (let i = 0; i < 60; i++) {
        const dec = decOf(lam, eps);
        const x = Math.tan(lat * D2R) * Math.tan(dec * D2R);
        if (Math.abs(x) >= 1) return null; // circumpolar: Placidus undefined
        const ad = Math.asin(x) * R2D;
        const ra = above ? ramc + fraction * (90 + ad) : ramc + 180 - fraction * (90 - ad);
        const next = raToLon(norm(ra), eps);
        if (sep(next, lam) < 1e-7) { lam = next; break; }
        lam = next;
      }
      return lam;
    };
    const c11 = cusp(1 / 3, true), c12 = cusp(2 / 3, true), c2 = cusp(2 / 3, false), c3 = cusp(1 / 3, false);
    if ([c11, c12, c2, c3].some((x) => x === null)) return null;
    const c = [null, a.asc, c2, c3, norm(a.mc + 180), norm(c11 + 180), norm(c12 + 180), norm(a.asc + 180), norm(c2 + 180), norm(c3 + 180), a.mc, c11, c12];
    return c;
  }
  function houses(a, system = "placidus") {
    if (system === "placidus") {
      const p = placidus(a);
      if (p) return { system: "Placidus", cusps: p };
      system = "porphyry";
    }
    if (system === "whole") {
      const s = Math.floor(a.asc / 30) * 30;
      return { system: "Whole Sign", cusps: [null, ...Array.from({ length: 12 }, (_, i) => norm(s + i * 30))] };
    }
    if (system === "equal") return { system: "Equal", cusps: [null, ...Array.from({ length: 12 }, (_, i) => norm(a.asc + i * 30))] };
    // Porphyry: trisect each quadrant (used where Placidus is undefined, above ~66° latitude)
    const ic = norm(a.mc + 180), q1 = norm(ic - a.asc) / 3, q2 = norm(norm(a.asc + 180) - ic) / 3;
    const c = [null, a.asc, norm(a.asc + q1), norm(a.asc + 2 * q1), ic, norm(ic + q2), norm(ic + 2 * q2)];
    for (let i = 7; i <= 12; i++) c[i] = norm(c[i - 6] + 180);
    return { system: "Porphyry", cusps: c };
  }
  function houseOf(lon, cusps) {
    for (let h = 1; h <= 12; h++) {
      const a = cusps[h], b = cusps[h === 12 ? 1 : h + 1];
      const span = norm(b - a), off = norm(lon - a);
      if (off < span) return h;
    }
    return 1;
  }

  // ---------- aspects ----------
  const ASPECTS = [
    { key: "conjunction", angle: 0, orb: 8, glyph: "☌", tone: "fusion" },
    { key: "sextile", angle: 60, orb: 5, glyph: "⚹", tone: "easy" },
    { key: "square", angle: 90, orb: 7, glyph: "□", tone: "hard" },
    { key: "trine", angle: 120, orb: 7, glyph: "△", tone: "easy" },
    { key: "quincunx", angle: 150, orb: 3, glyph: "⚻", tone: "adjust" },
    { key: "opposition", angle: 180, orb: 8, glyph: "☍", tone: "hard" }
  ];
  function orbFor(asp, a, b) {
    let o = asp.orb;
    if ([a, b].some((k) => k === "Sun" || k === "Moon")) o += 1.5;
    if ([a, b].some((k) => k === "NorthNode" || k === "Ascendant" || k === "Midheaven")) o -= 2;
    return Math.max(o, 1);
  }
  function findAspects(listA, listB = null, maxOrbScale = 1) {
    const out = [];
    const same = !listB;
    const B = listB || listA;
    for (let i = 0; i < listA.length; i++) {
      for (let j = same ? i + 1 : 0; j < B.length; j++) {
        const p = listA[i], q = B[j];
        if (same && ((p.key === "Ascendant" && q.key === "Midheaven") || (p.key === "Midheaven" && q.key === "Ascendant"))) continue;
        const d = sep(p.lon, q.lon);
        for (const asp of ASPECTS) {
          const orb = Math.abs(d - asp.angle), max = orbFor(asp, p.key, q.key) * maxOrbScale;
          if (orb <= max) { out.push({ a: p.key, b: q.key, aspect: asp.key, glyph: asp.glyph, tone: asp.tone, orb, exactness: 1 - orb / max }); break; }
        }
      }
    }
    return out.sort((x, y) => x.orb - y.orb);
  }

  // ---------- natal chart ----------
  function natal(utcMs, lat, lon, houseSystem = "placidus", timeKnown = true) {
    const t = at(utcMs), t2 = at(utcMs + 3600000);
    const L = HD.sky(utcMs), L2 = HD.sky(utcMs + 3600000);
    const ang = angles(utcMs, lat, lon);
    const hs = houses(ang, houseSystem);
    const planets = PLANETS.map((p) => {
      const lonP = L[p.key], speed = diff(L2[p.key], lonP) * 24;
      const s = signOf(lonP);
      return { key: p.key, glyph: p.glyph, label: p.label || p.key, lon: lonP, speed, retro: p.key !== "NorthNode" && speed < 0, sign: SIGNS[s], signIdx: s, deg: fmtDeg(lonP), house: houseOf(lonP, hs.cusps), w: p.w };
    });
    const points = [
      { key: "Ascendant", glyph: "AC", label: "Ascendant", lon: ang.asc, sign: SIGNS[signOf(ang.asc)], signIdx: signOf(ang.asc), deg: fmtDeg(ang.asc), house: 1, w: 2 },
      { key: "Midheaven", glyph: "MC", label: "Midheaven", lon: ang.mc, sign: SIGNS[signOf(ang.mc)], signIdx: signOf(ang.mc), deg: fmtDeg(ang.mc), house: 10, w: 1 }
    ];
    const all = timeKnown ? planets.concat(points) : planets;
    const aspects = findAspects(all);

    // Balance of elements and modalities (weighted: luminaries and Ascendant count double, outer planets half).
    const el = { Fire: 0, Earth: 0, Air: 0, Water: 0 }, mo = { Cardinal: 0, Fixed: 0, Mutable: 0 };
    all.forEach((p) => { if (!p.w) return; el[ELEMENT[p.signIdx % 4]] += p.w; mo[MODALITY[p.signIdx % 3]] += p.w; });
    const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);
    // Stelliums: 3+ planets (excluding node) in one sign or one house.
    const bySign = {}, byHouse = {};
    planets.filter((p) => p.key !== "NorthNode").forEach((p) => { (bySign[p.sign] ||= []).push(p.key); (byHouse[p.house] ||= []).push(p.key); });
    const stelliums = [
      ...Object.entries(bySign).filter(([, v]) => v.length >= 3).map(([k, v]) => ({ where: k, kind: "sign", planets: v })),
      ...(timeKnown ? Object.entries(byHouse).filter(([, v]) => v.length >= 3).map(([k, v]) => ({ where: `House ${k}`, kind: "house", planets: v })) : [])
    ];
    const elong = norm(L.Moon - L.Sun);
    const PH = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
    const ascSign = SIGNS[signOf(ang.asc)];
    const ruler = RULER[ascSign];
    const hemis = {
      east: planets.filter((p) => { const o = norm(p.lon - ang.mc); return o > 0 && o < 180 && timeKnown; }).length
    };
    return {
      utcMs, timeKnown, angles: ang, houseSystem: hs.system, cusps: hs.cusps, planets, points, all, aspects,
      sun: planets[0], moon: planets[1], asc: points[0], mc: points[1],
      elements: el, modalities: mo, topElement: top(el)[0][0], lowElement: top(el)[3][0], topModality: top(mo)[0][0], lowModality: top(mo)[2][0],
      stelliums, chartRuler: ruler, chartRulerPlanet: planets.find((p) => p.key === ruler),
      birthPhase: PH[Math.floor(((elong + 22.5) % 360) / 45)], retrogrades: planets.filter((p) => p.retro).map((p) => p.key), hemis
    };
  }

  // ---------- chart wheel SVG ----------
  const EL_COL = ["var(--el-fire)", "var(--el-earth)", "var(--el-air)", "var(--el-water)"];
  function wheel(c, opts = {}) {
    const S = 640, cx = S / 2, cy = S / 2;
    const R0 = 306, R1 = 262, R2 = 240, RP = 206, RA = 150;
    const base = c.timeKnown ? c.angles.asc : 0; // with no birth time, put 0° Aries on the left
    const ang = (lon) => (180 + norm(lon - base)) * D2R;
    const P = (lon, r) => [cx + r * Math.cos(ang(lon)), cy - r * Math.sin(ang(lon))];
    const arc = (a0, a1, r0, r1) => {
      const [x0, y0] = P(a0, r1), [x1, y1] = P(a1, r1), [x2, y2] = P(a1, r0), [x3, y3] = P(a0, r0);
      return `M${x0} ${y0} A${r1} ${r1} 0 0 0 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 0 1 ${x3} ${y3}Z`;
    };
    let g = "";
    // zodiac ring
    for (let i = 0; i < 12; i++) {
      g += `<path class="zw-seg" d="${arc(i * 30, i * 30 + 30, R1, R0)}" fill="${EL_COL[i % 4]}"/>`;
      const [x, y] = P(i * 30 + 15, (R0 + R1) / 2);
      g += `<text class="zw-sign" x="${x}" y="${y}" dy="0.36em"><title>${SIGNS[i]}</title>${SIGN_GLYPH[i]}</text>`;
    }
    for (let d = 0; d < 360; d += 5) {
      const len = d % 30 === 0 ? 0 : d % 10 === 0 ? 9 : 5;
      if (!len) continue;
      const [x0, y0] = P(d, R1), [x1, y1] = P(d, R1 - len);
      g += `<line class="zw-tick" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`;
    }
    // houses
    if (c.timeKnown) {
      for (let h = 1; h <= 12; h++) {
        const a = c.cusps[h], b = c.cusps[h === 12 ? 1 : h + 1];
        const [x0, y0] = P(a, R2), [x1, y1] = P(a, RA);
        const axis = h === 1 || h === 4 || h === 7 || h === 10;
        g += `<line class="zw-cusp ${axis ? "axis" : ""}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`;
        const mid = a + norm(b - a) / 2;
        const [hx, hy] = P(mid, (R2 + RA) / 2 + 22);
        g += `<text class="zw-house" x="${hx}" y="${hy}" dy="0.35em">${h}</text>`;
      }
      for (const [lon, lbl] of [[c.angles.asc, "AC"], [norm(c.angles.asc + 180), "DC"], [c.angles.mc, "MC"], [norm(c.angles.mc + 180), "IC"]]) {
        const [x, y] = P(lon, R0 + 18);
        g += `<text class="zw-angle" x="${x}" y="${y}" dy="0.35em">${lbl}</text>`;
      }
    }
    // aspect lines
    const pts = c.timeKnown ? c.all : c.planets;
    const posOf = Object.fromEntries(pts.map((p) => [p.key, p.lon]));
    for (const a of c.aspects) {
      if (a.aspect === "conjunction") continue;
      const [x0, y0] = P(posOf[a.a], RA), [x1, y1] = P(posOf[a.b], RA);
      g += `<line class="zw-asp ${a.tone}" data-asp="${a.a}|${a.b}" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" style="opacity:${(0.3 + 0.7 * a.exactness).toFixed(2)}"><title>${LABEL(a.a)} ${a.aspect} ${LABEL(a.b)} (${a.orb.toFixed(1)}°)</title></line>`;
    }
    // planets with collision spreading
    const items = c.planets.map((p) => ({ ...p, show: p.lon })).sort((a, b) => a.lon - b.lon);
    for (let pass = 0; pass < 30; pass++) {
      let moved = false;
      for (let i = 0; i < items.length; i++) {
        const a = items[i], b = items[(i + 1) % items.length];
        // Signed gap, so a planet nudged past its neighbour still counts as crowded (an unsigned gap would read ~360°
        // and leave the two glyphs on top of each other). Re-centre the pair 7.5° apart, keeping their order.
        const gap = diff(b.show, a.show);
        if (gap > -90 && gap < 7.5 - 1e-9 && items.length > 1) { const mid = a.show + gap / 2; a.show = norm(mid - 3.75); b.show = norm(mid + 3.75); moved = true; }
      }
      if (!moved) break;
    }
    for (const p of items) {
      const [tx0, ty0] = P(p.lon, R2), [tx1, ty1] = P(p.lon, R2 - 10);
      const [lx, ly] = P(p.show, RP + 12);
      const [gx, gy] = P(p.show, RP);
      const [dx, dy] = P(p.show, RP - 22);
      g += `<g class="zw-pl" data-planet="${p.key}"><line class="zw-tick pl" x1="${tx0}" y1="${ty0}" x2="${tx1}" y2="${ty1}"/><line class="zw-lead" x1="${tx1}" y1="${ty1}" x2="${lx}" y2="${ly}"/>
        <circle cx="${gx}" cy="${gy}" r="14"/><text class="zw-pg" x="${gx}" y="${gy}" dy="0.36em">${p.glyph}</text>
        <text class="zw-pd" x="${dx}" y="${dy}" dy="0.35em">${Math.floor(norm(p.lon) % 30)}°${p.retro ? "ʀ" : ""}</text><title>${p.label} ${p.deg} ${p.sign}${p.retro ? " (retrograde)" : ""}${c.timeKnown ? ", house " + p.house : ""}</title></g>`;
    }
    if (opts.outer) { // transit or partner planets on an outer track
      for (const p of opts.outer) {
        const [x, y] = P(p.lon, R0 + 22);
        g += `<g class="zw-out"><circle cx="${x}" cy="${y}" r="12"/><text x="${x}" y="${y}" dy="0.36em">${GLYPH[p.key] || p.key}</text><title>${opts.outerLabel || "Transit"} ${LABEL(p.key)} ${fmtPos(p.lon)}</title></g>`;
      }
    }
    const pad = opts.outer ? 40 : 26;
    return `<svg class="zwheel" viewBox="${-pad} ${-pad} ${S + 2 * pad} ${S + 2 * pad}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Birth chart wheel">
      <circle cx="${cx}" cy="${cy}" r="${R0}" class="zw-outer"/><circle cx="${cx}" cy="${cy}" r="${R1}" class="zw-line"/><circle cx="${cx}" cy="${cy}" r="${R2}" class="zw-line"/>
      <circle cx="${cx}" cy="${cy}" r="${RA}" class="zw-inner"/>${g}</svg>`;
  }

  // ---------- synastry ----------
  const SYN = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendant"];
  function synastry(a, b) {
    const pick = (c) => c.all.filter((p) => SYN.includes(p.key));
    const asp = findAspects(pick(a), pick(b), 0.8).filter((x) => x.aspect !== "quincunx");
    let harmony = 0, tension = 0;
    asp.forEach((x) => { const w = x.exactness * ((x.a === "Sun" || x.a === "Moon" || x.b === "Sun" || x.b === "Moon") ? 1.4 : 1); if (x.tone === "easy") harmony += w; else if (x.tone === "hard") tension += w; else harmony += w * 0.6, tension += w * 0.4; });
    const elA = a.sun.signIdx % 4, elB = b.sun.signIdx % 4;
    const compatEl = elA === elB || (elA + elB === 2 && elA !== elB) || (Math.min(elA, elB) === 1 && Math.max(elA, elB) === 3) || (Math.min(elA, elB) === 0 && Math.max(elA, elB) === 2);
    return { aspects: asp, harmony, tension, sunElements: [ELEMENT[elA], ELEMENT[elB]], sunCompatible: compatEl };
  }

  // ---------- searches ----------
  // Find moments in [from, to] where body longitude crosses (target + offset). Returns ms timestamps.
  function crossings(key, target, fromMs, toMs, stepDays) {
    const hits = [];
    let t0 = fromMs, f0 = diff(bodyLon(key, at(t0)), target);
    for (let t1 = fromMs + stepDays * 864e5; t1 <= toMs; t1 += stepDays * 864e5) {
      const f1 = diff(bodyLon(key, at(t1)), target);
      if (f0 !== 0 && Math.sign(f0) !== Math.sign(f1) && Math.abs(f0) < 30 && Math.abs(f1) < 30) {
        let lo = t0, hi = t1, flo = f0;
        for (let i = 0; i < 40 && hi - lo > 6e4; i++) {
          const mid = (lo + hi) / 2, fm = diff(bodyLon(key, at(mid)), target);
          if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
        }
        hits.push((lo + hi) / 2);
      }
      t0 = t1; f0 = f1;
    }
    return hits;
  }

  // Major life cycles for a natal chart, from birth to age 90.
  function lifeCycles(c, birthMs) {
    // Start after 330 days: in the first months a retrograde planet can loop back over its own birth position,
    // which is not a return.
    const Y = 365.2425 * 864e5, end = birthMs + 90 * Y, start = birthMs + 330 * 864e5;
    const natalOf = (k) => c.planets.find((p) => p.key === k).lon;
    const ev = [];
    const add = (key, kind, body, offsets, step) => offsets.forEach(([off, label]) => {
      const hits = crossings(body, norm(natalOf(body === "MeanNode" ? "NorthNode" : body) + off), start, end, step);
      // group passes within 14 months (retrograde loops) into one period
      const groups = [];
      hits.forEach((h) => { const last = groups[groups.length - 1]; if (last && h - last[last.length - 1] < 425 * 864e5) last.push(h); else groups.push([h]); });
      groups.forEach((gp) => ev.push({ key, kind, label, body, passes: gp, start: gp[0], end: gp[gp.length - 1], age: (gp[0] - birthMs) / Y }));
    });
    add("jupiterReturn", "return", "Jupiter", [[0, "Jupiter Return"]], 4);
    add("saturnSquare", "square", "Saturn", [[90, "Saturn waxing square"], [270, "Saturn waning square"]], 4);
    add("saturnOpposition", "opposition", "Saturn", [[180, "Saturn Opposition"]], 4);
    add("saturnReturn", "return", "Saturn", [[0, "Saturn Return"]], 4);
    add("uranusSquare", "square", "Uranus", [[90, "Uranus waxing square"], [270, "Uranus waning square"]], 6);
    add("uranusOpposition", "opposition", "Uranus", [[180, "Uranus Opposition"]], 6);
    add("neptuneSquare", "square", "Neptune", [[90, "Neptune Square"]], 8);
    add("plutoSquare", "square", "Pluto", [[90, "Pluto Square"]], 8);
    // Nodal return: the mean node is used (smooth 18.6-year cycle).
    const nn = c.planets.find((p) => p.key === "NorthNode").lon;
    crossings("MeanNode", nn, start, end, 10).forEach((h) => ev.push({ key: "nodalReturn", kind: "return", label: "Nodal Return", body: "NorthNode", passes: [h], start: h, end: h, age: (h - birthMs) / Y }));
    return ev.sort((a, b) => a.start - b.start);
  }

  // ---------- cosmic calendar ----------
  const QUARTER = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
  function events(fromMs, toMs) {
    const out = [];
    let mq = Ast.SearchMoonQuarter(at(fromMs));
    while (mq.time.date.getTime() < toMs) {
      out.push({ ms: mq.time.date.getTime(), kind: "moon", quarter: mq.quarter, title: QUARTER[mq.quarter], moonSign: SIGNS[signOf(bodyLon("Moon", mq.time))] });
      mq = Ast.NextMoonQuarter(mq);
    }
    try {
      let le = Ast.SearchLunarEclipse(at(fromMs));
      while (le.peak.date.getTime() < toMs) { if (le.kind !== "penumbral" || true) out.push({ ms: le.peak.date.getTime(), kind: "eclipse", title: `${le.kind[0].toUpperCase() + le.kind.slice(1)} lunar eclipse`, sign: SIGNS[signOf(bodyLon("Moon", le.peak))] }); le = Ast.NextLunarEclipse(le.peak); }
      let se = Ast.SearchGlobalSolarEclipse(at(fromMs));
      while (se.peak.date.getTime() < toMs) { out.push({ ms: se.peak.date.getTime(), kind: "eclipse", title: `${se.kind[0].toUpperCase() + se.kind.slice(1)} solar eclipse`, sign: SIGNS[signOf(bodyLon("Sun", se.peak))] }); se = Ast.NextGlobalSolarEclipse(se.peak); }
    } catch (e) { /* eclipse search unavailable */ }
    // Ingresses and retrograde stations, sampled daily then refined.
    for (const key of ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
      let tPrev = fromMs, lPrev = bodyLon(key, at(tPrev)), sPrev = diff(bodyLon(key, at(tPrev + 864e5)), lPrev);
      for (let t = fromMs + 864e5; t <= toMs + 864e5; t += 864e5) {
        const l = bodyLon(key, at(t)), s = diff(bodyLon(key, at(t + 864e5)), l);
        if (signOf(l) !== signOf(lPrev)) {
          let lo = tPrev, hi = t;
          const sp = signOf(lPrev);
          for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (signOf(bodyLon(key, at(mid))) === sp) lo = mid; else hi = mid; }
          if (hi >= fromMs && hi < toMs) out.push({ ms: hi, kind: "ingress", body: key, title: `${key} enters ${SIGNS[signOf(l)]}`, sign: SIGNS[signOf(l)], retro: s < 0 });
        }
        if (key !== "Sun" && Math.sign(s) !== Math.sign(sPrev)) {
          let lo = tPrev, hi = t;
          for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2, sm = diff(bodyLon(key, at(mid + 36e5)), bodyLon(key, at(mid))); if (Math.sign(sm) === Math.sign(sPrev)) lo = mid; else hi = mid; }
          if (hi >= fromMs && hi < toMs) out.push({ ms: hi, kind: "station", body: key, title: `${key} turns ${s < 0 ? "retrograde" : "direct"}`, retro: s < 0, sign: SIGNS[signOf(l)] });
        }
        tPrev = t; lPrev = l; sPrev = s;
      }
    }
    return out.sort((a, b) => a.ms - b.ms);
  }

  // Light-weight day score for calendars: transiting Sun, Moon, Mercury, Venus, Mars against natal personal points.
  function dayScore(natalChart, ms) {
    if (!natalChart) return null;
    const L = {};
    for (const k of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter"]) L[k] = bodyLon(k, at(ms));
    const natalPts = natalChart.all.filter((p) => ["Sun", "Moon", "Venus", "Mars", "Mercury", "Ascendant"].includes(p.key));
    let score = 0;
    const hits = [];
    for (const [k, lon] of Object.entries(L)) for (const n of natalPts) {
      const d = sep(lon, n.lon);
      for (const asp of ASPECTS) {
        if (asp.key === "quincunx") continue;
        const max = k === "Moon" ? 5 : 2.5, orb = Math.abs(d - asp.angle);
        if (orb <= max) {
          // Benefics (Venus, Jupiter) help even through hard angles; Mars carries the friction; the Moon sets the daily tone.
          const w = (1 - orb / max) * (k === "Moon" ? 1 : k === "Jupiter" || k === "Sun" ? 0.6 : 0.9);
          const benefic = k === "Venus" || k === "Jupiter";
          if (asp.tone === "easy") score += w;
          else if (asp.tone === "hard") score += benefic ? w * 0.25 : k === "Mars" ? -w * 1.2 : -w;
          else score += benefic ? w : k === "Mars" ? -w * 0.6 : w * 0.3;
          hits.push({ t: k, n: n.key, aspect: asp.key, tone: asp.tone, orb });
        }
      }
    }
    return { score, hits, moonSign: SIGNS[signOf(L.Moon)], moonLon: L.Moon, sunLon: L.Sun };
  }

  // ---------- Chinese zodiac ----------
  const ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const ANIMAL_GLYPH = ["🐀", "🐂", "🐅", "🐇", "🐉", "🐍", "🐎", "🐐", "🐒", "🐓", "🐕", "🐖"];
  const STEM_EL = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
  const lnyCache = {};
  // Chinese New Year: the second new moon after the December solstice, dated in China time (UTC+8).
  function lunarNewYear(year) {
    if (lnyCache[year]) return lnyCache[year];
    const sol = Ast.Seasons(year - 1).dec_solstice;
    const nm1 = Ast.SearchMoonPhase(0, sol, 40);
    const nm2 = Ast.SearchMoonPhase(0, nm1.AddDays(1), 40);
    const cn = new Date(nm2.date.getTime() + 8 * 3600e3);
    return (lnyCache[year] = `${cn.getUTCFullYear()}-${String(cn.getUTCMonth() + 1).padStart(2, "0")}-${String(cn.getUTCDate()).padStart(2, "0")}`);
  }
  function chinese(dateStr) {
    const y = Number(dateStr.slice(0, 4));
    const cy = dateStr < lunarNewYear(y) ? y - 1 : y;
    const i = (((cy - 4) % 12) + 12) % 12, stem = (((cy - 4) % 10) + 10) % 10;
    return { year: cy, animal: ANIMALS[i], glyph: ANIMAL_GLYPH[i], element: STEM_EL[stem], polarity: stem % 2 === 0 ? "Yang" : "Yin", newYear: lunarNewYear(cy), animalIdx: i };
  }

  return { SIGNS, SIGN_GLYPH, ELEMENT, MODALITY, RULER, PLANETS, GLYPH, ASPECTS, LABEL, fmtPos, fmtDeg, signOf, sep, diff, norm,
    angles, houses, houseOf, natal, wheel, findAspects, synastry, lifeCycles, events, dayScore, chinese, lunarNewYear, bodyLon, crossings, obliquity, moonApparent };
})();
