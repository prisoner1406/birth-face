// 3.4 — Essential and accidental dignities, receptions, house lords and the Hermetic Lots.
// Tables follow the classical sources: domicile and exaltation (Ptolemy, Tetrabiblos I.17–19),
// Dorothean triplicity lords (Dorotheus I.1), Egyptian bounds (Ptolemy I.21, Valens), Chaldean faces,
// and William Lilly's point scores (Christian Astrology, 1647: +5 / +4 / +3 / +2 / +1, −5 / −4, peregrine −5).
// The Lots use the day and night formulas of Paulus Alexandrinus (Introduction, ch. 23).
const Dignity = (() => {
  const norm = (x) => ((x % 360) + 360) % 360;
  const diff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;
  const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const SEVEN = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  // Traditional sign rulers (before Uranus, Neptune and Pluto were found).
  const RULER = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const EXALT = { Sun: [0, 19], Moon: [1, 3], Mercury: [5, 15], Venus: [11, 27], Mars: [9, 28], Jupiter: [3, 15], Saturn: [6, 21] };
  const EXALT_OF = Object.fromEntries(Object.entries(EXALT).map(([k, [s]]) => [s, k]));
  // Dorothean triplicity lords: [day, night, participating] for Fire, Earth, Air, Water.
  const TRIP = [["Sun", "Jupiter", "Saturn"], ["Venus", "Moon", "Mars"], ["Saturn", "Mercury", "Jupiter"], ["Venus", "Mars", "Moon"]];
  // Egyptian bounds: [lord, end degree] in each sign.
  const BOUNDS = [
    [["Jupiter", 6], ["Venus", 12], ["Mercury", 20], ["Mars", 25], ["Saturn", 30]],
    [["Venus", 8], ["Mercury", 14], ["Jupiter", 22], ["Saturn", 27], ["Mars", 30]],
    [["Mercury", 6], ["Jupiter", 12], ["Venus", 17], ["Mars", 24], ["Saturn", 30]],
    [["Mars", 7], ["Venus", 13], ["Mercury", 19], ["Jupiter", 26], ["Saturn", 30]],
    [["Jupiter", 6], ["Venus", 11], ["Saturn", 18], ["Mercury", 24], ["Mars", 30]],
    [["Mercury", 7], ["Venus", 17], ["Jupiter", 21], ["Mars", 28], ["Saturn", 30]],
    [["Saturn", 6], ["Mercury", 14], ["Jupiter", 21], ["Venus", 28], ["Mars", 30]],
    [["Mars", 7], ["Venus", 11], ["Mercury", 19], ["Jupiter", 24], ["Saturn", 30]],
    [["Jupiter", 12], ["Venus", 17], ["Mercury", 21], ["Saturn", 26], ["Mars", 30]],
    [["Mercury", 7], ["Jupiter", 14], ["Venus", 22], ["Saturn", 26], ["Mars", 30]],
    [["Mercury", 7], ["Venus", 13], ["Jupiter", 20], ["Mars", 25], ["Saturn", 30]],
    [["Venus", 12], ["Jupiter", 16], ["Mercury", 19], ["Mars", 28], ["Saturn", 30]]
  ];
  // Chaldean order of the faces (decans), starting with Mars at 0° Aries.
  const FACE_ORDER = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"];
  // Mean daily motion (Lilly's table), to call a planet fast or slow.
  const MEAN = { Sun: 0.9856, Moon: 13.1764, Mercury: 0.9856, Venus: 0.9856, Mars: 0.524, Jupiter: 0.0831, Saturn: 0.0335 };
  const DIURNAL = ["Sun", "Jupiter", "Saturn"], NOCTURNAL = ["Moon", "Venus", "Mars"];
  const JOY = { Mercury: 1, Moon: 3, Venus: 5, Mars: 6, Sun: 9, Jupiter: 11, Saturn: 12 };

  const signOf = (lon) => Math.floor(norm(lon) / 30);
  const ruler = (s) => RULER[s];
  const detrimentOf = (p, s) => RULER[(s + 6) % 12] === p;
  const fallOf = (p, s) => EXALT[p] && (EXALT[p][0] + 6) % 12 === s;
  const bound = (lon) => { const s = signOf(lon), d = norm(lon) - s * 30; return BOUNDS[s].find(([, end]) => d < end)[0]; };
  const face = (lon) => FACE_ORDER[Math.floor(norm(lon) / 10) % 7];
  const tripLords = (s) => TRIP[s % 4];

  // Every lord of one degree of the zodiac, with Lilly's points.
  function lordsOf(lon, day) {
    const s = signOf(lon), t = tripLords(s);
    const tripLord = day === null ? null : day ? t[0] : t[1];
    const pts = {};
    const add = (p, n) => { if (p) pts[p] = (pts[p] || 0) + n; };
    add(RULER[s], 5); add(EXALT_OF[s], 4); add(tripLord, 3); add(bound(lon), 2); add(face(lon), 1);
    const almuten = Object.entries(pts).sort((a, b) => b[1] - a[1] || SEVEN.indexOf(a[0]) - SEVEN.indexOf(b[0]));
    return { domicile: RULER[s], exaltation: EXALT_OF[s] || null, triplicity: t, tripLord, bound: bound(lon), face: face(lon), points: pts, almuten: almuten[0][0], tie: almuten[1] && almuten[1][1] === almuten[0][1] ? almuten[1][0] : null };
  }

  // A planet's own essential dignity score at its place (Lilly).
  function essential(p, lon, day) {
    const s = signOf(lon), L = lordsOf(lon, day);
    const has = [];
    if (L.domicile === p) has.push(["domicile", 5]);
    if (L.exaltation === p) has.push(["exaltation", 4]);
    if (day === null ? L.triplicity.slice(0, 2).includes(p) : L.tripLord === p) has.push(["triplicity", 3]);
    if (L.bound === p) has.push(["bound", 2]);
    if (L.face === p) has.push(["face", 1]);
    const debil = [];
    if (detrimentOf(p, s)) debil.push(["detriment", -5]);
    if (fallOf(p, s)) debil.push(["fall", -4]);
    const peregrine = has.length === 0;
    const score = has.reduce((a, [, n]) => a + n, 0) + debil.reduce((a, [, n]) => a + n, 0) + (peregrine ? -5 : 0);
    return { has, debil, peregrine, score, lords: L };
  }

  function isDay(natal) { return natal.timeKnown ? norm(natal.sun.lon - natal.asc.lon) > 180 : null; }

  // Accidental fortitudes and debilities, from Lilly's table (Christian Astrology, p. 115).
  // Fixed stars precessed from their J2000 longitudes at 50.29″ a year.
  const STARS = [["Regulus", 149.83, 6], ["Spica", 203.83, 5], ["Algol", 56.17, -5]];
  const HOUSE_PTS = { 1: 5, 10: 5, 4: 4, 7: 4, 11: 4, 2: 3, 5: 3, 9: 2, 3: 1, 12: -5, 6: -2, 8: -2 };
  function accidental(natal, pl, day) {
    const out = [];
    const sun = natal.sun, sp = pl.speed;
    if (natal.timeKnown && HOUSE_PTS[pl.house] !== undefined) out.push({ k: "house", v: HOUSE_PTS[pl.house], t: `in the ${ord(pl.house)} house` });
    if (pl.key !== "Sun" && pl.key !== "Moon") out.push(sp < 0 ? { k: "retro", v: -5, t: "retrograde" } : { k: "direct", v: 4, t: "direct" });
    if (pl.key !== "Sun") {
      if (pl.key !== "Moon" && Math.abs(sp) < MEAN[pl.key] * 0.1) out.push({ k: "slow", v: -2, t: "stationary, barely moving" });
      else out.push(Math.abs(sp) > MEAN[pl.key] ? { k: "swift", v: 2, t: `swift (${Math.abs(sp).toFixed(2)}° a day, average ${MEAN[pl.key]}°)` } : { k: "slow", v: -2, t: `slow (${Math.abs(sp).toFixed(2)}° a day, average ${MEAN[pl.key]}°)` });
      const e = diff(pl.lon, sun.lon); // negative: rises before the Sun (oriental)
      if (["Mars", "Jupiter", "Saturn"].includes(pl.key)) out.push(e < 0 ? { k: "oriental", v: 2, t: "oriental, rising before the Sun" } : { k: "occidental", v: -2, t: "occidental, setting after the Sun" });
      else if (["Mercury", "Venus"].includes(pl.key)) out.push(e > 0 ? { k: "occidental", v: 2, t: "occidental, an evening star" } : { k: "oriental", v: -2, t: "oriental, a morning star" });
      else out.push(e > 0 ? { k: "waxing", v: 2, t: "increasing in light" } : { k: "waning", v: -2, t: "decreasing in light" });
      const d = Math.abs(e);
      if (d <= 17 / 60) out.push({ k: "cazimi", v: 5, t: "cazimi, in the heart of the Sun" });
      else if (d <= 8.5) out.push({ k: "combust", v: -5, t: `combust, ${d.toFixed(1)}° from the Sun` });
      else if (d <= 17) out.push({ k: "beams", v: -4, t: `under the Sun's beams, ${d.toFixed(1)}° away` });
      else out.push({ k: "free", v: 5, t: "free of the Sun's beams" });
    }
    // Partile aspects (same degree number) with the benefics, malefics and the Nodes.
    const deg = (x) => Math.floor(norm(x) % 30), sg = (x) => signOf(x);
    const partile = (o, gap) => deg(o) === deg(pl.lon) && ((sg(o) - sg(pl.lon) + 12) % 12 === gap || (sg(pl.lon) - sg(o) + 12) % 12 === gap);
    for (const o of natal.planets) {
      if (o.key === pl.key) continue;
      if (["Jupiter", "Venus"].includes(o.key)) {
        if (partile(o.lon, 0)) out.push({ k: "partile", v: 5, t: `partile conjunction with ${o.key}` });
        else if (partile(o.lon, 4)) out.push({ k: "partile", v: 4, t: `partile trine with ${o.key}` });
        else if (partile(o.lon, 2)) out.push({ k: "partile", v: 3, t: `partile sextile with ${o.key}` });
      } else if (["Mars", "Saturn"].includes(o.key)) {
        if (partile(o.lon, 0)) out.push({ k: "partile", v: -5, t: `partile conjunction with ${o.key}` });
        else if (partile(o.lon, 6)) out.push({ k: "partile", v: -4, t: `partile opposition with ${o.key}` });
        else if (partile(o.lon, 3)) out.push({ k: "partile", v: -3, t: `partile square with ${o.key}` });
      } else if (o.key === "NorthNode") {
        if (partile(o.lon, 0)) out.push({ k: "partile", v: 4, t: "partile conjunction with the North Node" });
        else if (partile(o.lon + 180, 0)) out.push({ k: "partile", v: -4, t: "partile conjunction with the South Node" });
      }
    }
    const yrs = (natal.utcMs - Date.UTC(2000, 0, 1, 12)) / (365.25 * 864e5);
    for (const [name, lon2000, v] of STARS) {
      const d = Math.abs(diff(pl.lon, lon2000 + yrs * 50.29 / 3600));
      if (d <= 5) out.push({ k: "star", v, t: `with ${name}, ${d.toFixed(1)}° away` });
    }
    if (day !== null) {
      const merc = pl.key === "Mercury" ? (diff(pl.lon, sun.lon) < 0 ? "diurnal" : "nocturnal") : null;
      const diurnal = DIURNAL.includes(pl.key) || merc === "diurnal";
      const nocturnal = NOCTURNAL.includes(pl.key) || merc === "nocturnal";
      if ((day && diurnal) || (!day && nocturnal)) out.push({ k: "sect", v: 0, t: `of the ${day ? "day" : "night"} team, the chart's own side` });
      else if (diurnal || nocturnal) out.push({ k: "outsect", v: 0, t: `of the ${day ? "night" : "day"} team, working against the chart's grain` });
    }
    return out;
  }
  const ord = (n) => n + (["th", "st", "nd", "rd"][n] && n < 4 ? ["th", "st", "nd", "rd"][n] : "th");
  const wholeSign = (lon, ascLon) => ((signOf(lon) - signOf(ascLon) + 12) % 12) + 1;
  // House of a point in the chart's own house system (the one chosen in Settings).
  const houseIn = (natal, lon) => (typeof Astro !== "undefined" && natal.cusps ? Astro.houseOf(lon, natal.cusps) : wholeSign(lon, natal.asc.lon));

  // Mutual receptions by domicile and exaltation.
  function receptions(planets) {
    const out = [];
    for (let i = 0; i < planets.length; i++) for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i], b = planets[j];
      const sa = signOf(a.lon), sb = signOf(b.lon);
      const dom = RULER[sa] === b.key && RULER[sb] === a.key;
      const ex = EXALT_OF[sa] === b.key && EXALT_OF[sb] === a.key;
      const mixed = !dom && !ex && ((RULER[sa] === b.key && EXALT_OF[sb] === a.key) || (EXALT_OF[sa] === b.key && RULER[sb] === a.key));
      if (dom || ex || mixed) out.push({ a: a.key, b: b.key, kind: dom ? "domicile" : ex ? "exaltation" : "mixed" });
    }
    return out;
  }

  // Lots (day formula; reversed by night).
  const LOT_DEF = [
    ["Fortune", "Moon", "Sun", "the body, health and what comes to you by luck"],
    ["Spirit", "Sun", "Moon", "the mind, your intentions and the work you choose"],
    ["Eros", "Venus", "@Spirit", "desire, love and what you long for"],
    ["Necessity", "@Fortune", "Mercury", "duty, limits and what you cannot escape"],
    ["Courage", "@Fortune", "Mars", "daring, boldness and conflict"],
    ["Victory", "Jupiter", "@Spirit", "faith, success and what you win"],
    ["Nemesis", "@Fortune", "Saturn", "what you must face, endure and set right"]
  ];
  function lots(natal) {
    if (!natal.timeKnown) return [];
    const day = isDay(natal), L = Object.fromEntries(natal.planets.map((p) => [p.key, p.lon])), asc = natal.asc.lon;
    const res = {};
    for (const [name, x, y, about] of LOT_DEF) {
      const v = (k) => (k[0] === "@" ? res[k.slice(1)].lon : L[k]);
      const lon = day ? norm(asc + v(x) - v(y)) : norm(asc + v(y) - v(x));
      res[name] = { name, lon, about, sign: SIGNS[signOf(lon)], house: houseIn(natal, lon), lord: RULER[signOf(lon)], formula: day ? `Ascendant + ${x.replace("@", "Lot of ")} − ${y.replace("@", "Lot of ")}` : `Ascendant + ${y.replace("@", "Lot of ")} − ${x.replace("@", "Lot of ")}` };
    }
    return Object.values(res);
  }

  // The full report for a chart.
  function report(natal) {
    const day = isDay(natal);
    const planets = natal.planets.filter((p) => SEVEN.includes(p.key));
    const recs = receptions(planets);
    const rows = planets.map((pl) => {
      const e = essential(pl.key, pl.lon, day);
      for (const r of recs) {
        if (r.a !== pl.key && r.b !== pl.key) continue;
        const other = r.a === pl.key ? r.b : r.a;
        if (r.kind === "domicile" && !e.has.some((h) => h[0] === "domicile")) e.has.push([`reception with ${other}`, 5]);
        else if (r.kind === "exaltation" && !e.has.some((h) => h[0] === "exaltation")) e.has.push([`reception with ${other}`, 4]);
      }
      if (e.peregrine && e.has.length) e.peregrine = false;
      e.score = e.has.reduce((a, [, n]) => a + n, 0) + e.debil.reduce((a, [, n]) => a + n, 0) + (e.peregrine ? -5 : 0);
      const acc = accidental(natal, pl, day);
      const accScore = acc.reduce((a, x) => a + x.v, 0);
      const total = e.score + accScore;
      return { key: pl.key, lon: pl.lon, sign: SIGNS[signOf(pl.lon)], ess: e, acc, accScore, total, dispositor: RULER[signOf(pl.lon)] };
    });
    // Final dispositor: follow each planet to the ruler of its sign until it loops.
    const chain = (k) => { const seen = [k]; let cur = k; for (let i = 0; i < 8; i++) { const p = planets.find((x) => x.key === cur); const nx = RULER[signOf(p.lon)]; if (seen.includes(nx)) { seen.push(nx); break; } seen.push(nx); cur = nx; } return seen; };
    const ends = new Set(planets.map((p) => { const c = chain(p.key); return c[c.length - 1] === c[c.length - 2] ? c[c.length - 1] : null; }));
    const finalDispositor = ends.size === 1 && [...ends][0] ? [...ends][0] : null;
    // House lords: the traditional ruler of the sign on each cusp, and the house that ruler occupies.
    const houses = natal.timeKnown ? Array.from({ length: 12 }, (_, i) => {
      const cusp = natal.cusps ? natal.cusps[i] : norm(natal.asc.lon + i * 30);
      const s = signOf(cusp), lord = RULER[s];
      const lp = planets.find((p) => p.key === lord);
      return { house: i + 1, cusp, sign: SIGNS[s], lord, lordHouse: houseIn(natal, lp.lon), lordSign: SIGNS[signOf(lp.lon)], occupants: natal.planets.filter((p) => p.key !== "NorthNode" && houseIn(natal, p.lon) === i + 1).map((p) => p.key) };
    }) : [];
    const ascLords = natal.timeKnown ? lordsOf(natal.asc.lon, day) : null;
    const sorted = rows.slice().sort((a, b) => b.total - a.total);
    return {
      day, rows, receptions: recs, lots: lots(natal), houses, finalDispositor,
      chartRuler: natal.timeKnown ? RULER[signOf(natal.asc.lon)] : null, ascLords, strongest: sorted[0].key, weakest: sorted[sorted.length - 1].key
    };
  }

  return { report, houseIn, lordsOf, essential, accidental, STARS, HOUSE_PTS, receptions, lots, isDay, bound, face, ruler, wholeSign, signOf, SIGNS, SEVEN, RULER, EXALT, TRIP, BOUNDS, FACE_ORDER, MEAN, JOY, LOT_DEF };
})();
if (typeof module !== "undefined") module.exports = Dignity;
