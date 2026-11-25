// Birth Face: a person's real face and build described in words (no photograph), and how well the birth chart
// explains that description.
//
// Each answer carries the significations the tradition gives it: the planet whose "corporature" Lilly describes
// that way (Christian Astrology, the planets' shapes and forms) and the element whose temperament has it (the
// Galenic temperaments as the astrologers read them). The chart's own emphasis on the planets (Faces.planetary,
// with the lords of the rising degree) and on the elements (the temperament) is then compared with the
// description's, and the same comparison is made with hundreds of other birth moments at the same place, so the
// result says how much better the person's own chart fits than chance.
const Describe = (() => {
  // [key, question, [[value, answer, { planet: weight, ...element: weight }]]]
  const S = (s) => Object.fromEntries(s.split(" ").map((x) => { const [k, v] = x.split(":"); return [k, +(v || 1)]; }));
  const QUESTIONS = [
    ["height", "Height", [["short", "Short", S("Saturn:0.5 Moon Venus:0.5 Earth:0.5 Water:0.5")], ["middle", "Middle height", S("Mars Sun:0.5 Air:0.5")], ["tall", "Tall", S("Jupiter Mercury Sun:0.5 Air Fire:0.5")]]],
    ["build", "Build", [["lean", "Lean, slender", S("Mercury Saturn Earth Fire:0.5")], ["medium", "Medium, well-proportioned", S("Venus Sun:0.5 Air")], ["sturdy", "Sturdy, strong-boned", S("Mars Saturn:0.5 Fire")], ["full", "Full, fleshy, soft", S("Moon Jupiter Venus:0.5 Water")]]],
    ["faceShape", "Face shape", [["long", "Long and narrow", S("Mercury Saturn Earth")], ["oval", "Oval", S("Jupiter Venus:0.5 Air")], ["round", "Round, full", S("Moon Venus Sun:0.5 Water")], ["square", "Broad or square", S("Mars Saturn:0.5 Fire Earth:0.5")]]],
    ["jaw", "Jaw and chin", [["soft", "Soft, rounded", S("Moon Venus Water")], ["firm", "Firm, defined", S("Mars Saturn:0.5 Fire Earth:0.5")], ["narrow", "Narrow, pointed chin", S("Mercury Air:0.5 Earth:0.5")]]],
    ["brows", "Brows", [["heavy", "Heavy, low, straight", S("Saturn Mars:0.5 Earth")], ["arched", "Strong, arched", S("Mars Sun:0.5 Fire")], ["fine", "Fine, light", S("Venus Mercury:0.5 Air Water:0.5")]]],
    ["eyeSet", "Eyes, how they sit", [["deep", "Deep-set, under heavy lids", S("Saturn Moon:0.5 Earth Water:0.5")], ["level", "Level, ordinary", S("Venus:0.5 Air")], ["prominent", "Prominent, large, wide open", S("Sun Jupiter Moon:0.5 Fire:0.5 Water:0.5")]]],
    ["eyeSize", "Eyes, size", [["small", "Small", S("Saturn Mercury Earth")], ["medium", "Medium", S("Venus:0.5 Air")], ["large", "Large", S("Sun Jupiter Venus:0.5 Water:0.5 Fire:0.5")]]],
    ["noseLength", "Nose, length", [["short", "Short", S("Moon Venus Water")], ["medium", "Medium", S("Jupiter:0.5 Air")], ["long", "Long", S("Mercury Saturn:0.5 Earth")]]],
    ["noseShape", "Nose, shape", [["thin", "Thin, sharp, narrow bridge", S("Mercury Earth")], ["straight", "Straight, even", S("Venus:0.5 Jupiter:0.5 Air")], ["full", "Broad or thick", S("Saturn Mars:0.5 Earth:0.5 Fire:0.5")], ["rounded", "Soft, with a rounded tip", S("Moon Venus Water")]]],
    ["lips", "Lips", [["thin", "Thin", S("Mercury Saturn:0.5 Earth")], ["medium", "Medium", S("Air")], ["full", "Full, the lower fuller", S("Venus Moon Water")], ["wide", "Wide mouth, sharply drawn", S("Mars Sun:0.5 Fire")]]],
    ["hairTexture", "Hair, texture", [["straight", "Straight", S("Saturn:0.5 Moon:0.5 Earth Water:0.5")], ["wavy", "Wavy", S("Venus Jupiter Air")], ["curly", "Curly or springy", S("Mars Sun Fire")]]],
    ["hairAmount", "Hair, amount", [["thin", "Thin or fine", S("Saturn:0.5 Mercury:0.5 Earth:0.5 Air:0.5")], ["thick", "Thick, plentiful", S("Moon Jupiter Mars:0.5 Water:0.5 Fire:0.5")]]],
    ["beard", "Beard (if any)", [["none", "Little or none", S("Mercury Venus:0.5 Air:0.5")], ["full", "Full", S("Jupiter Mars:0.5 Fire:0.5")], ["na", "Doesn't apply", {}]]],
    ["bearing", "Bearing", [["quick", "Quick, nimble", S("Mercury Mars:0.5 Air Fire:0.5")], ["upright", "Upright, stately", S("Sun Jupiter Fire:0.5")], ["calm", "Calm, slow", S("Moon Venus:0.5 Water")], ["grave", "Grave, inward, looking down", S("Saturn Earth")]]]
  ];
  const PLANETS = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"], ELEMENTS = ["Fire", "Air", "Water", "Earth"];
  const unit = (o, keys) => { const t = keys.reduce((a, k) => a + (o[k] || 0), 0) || 1; return Object.fromEntries(keys.map((k) => [k, (o[k] || 0) / t])); };

  // The description as a share of each planet and element.
  function profile(answers) {
    const o = {};
    for (const [key, , opts] of QUESTIONS) {
      const a = opts.find(([v]) => v === answers[key]); if (!a) continue;
      for (const [k, w] of Object.entries(a[2])) o[k] = (o[k] || 0) + w;
    }
    return { planets: unit(o, PLANETS), elements: unit(o, ELEMENTS), n: Object.keys(answers).filter((k) => answers[k]).length };
  }
  // The chart's own emphasis: the planets that shape the body (with the lords of the rising decan and drekkana),
  // and the temperament's elements.
  function chartProfile(natal) {
    const pl = Object.fromEntries(Faces.planetary(natal).map((x) => [x.planet, x.share])), L = typeof Rising !== "undefined" ? Rising.layers(natal) : null;
    const planets = {};
    for (const p of PLANETS) planets[p] = 0.7 * (pl[p] || 0);
    if (L) { planets[L.decan.lord] += 0.15; planets[L.drekkana.lord] += 0.15; } else for (const p of PLANETS) planets[p] += 0.3 * (pl[p] || 0);
    return { planets: unit(planets, PLANETS), elements: unit(Faces.temperament(natal).shares, ELEMENTS) };
  }
  // How alike two shares are: 1 when identical, 0 when they share nothing.
  const sim = (a, b, keys) => 1 - 0.5 * keys.reduce((s, k) => s + Math.abs((a[k] || 0) - (b[k] || 0)), 0);
  const score = (d, c) => 0.6 * sim(d.planets, c.planets, PLANETS) + 0.4 * sim(d.elements, c.elements, ELEMENTS);

  // How well the chart explains the description, against `samples` other birth moments at the same place spread
  // over the decades around the birth. Returns { score, percentile, perPlanet, perAnswer }.
  async function relevance(natal, place, answers, samples = 300, onProgress) {
    const d = profile(answers), c = chartProfile(natal), own = score(d, c);
    const lat = place ? place.lat : 0, lon = place ? place.lon : 0;
    let below = 0, total = 0, seed = 12345;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let i = 0; i < samples; i++) {
      const ms = natal.utcMs + (rnd() - 0.5) * 60 * 365.25 * 864e5;
      const s = score(d, chartProfile(Astro.natal(ms, lat, lon, "placidus", true)));
      if (s < own) below++; total++;
      if (i % 25 === 0) { if (onProgress) onProgress(i / samples); await new Promise((r) => setTimeout(r, 0)); }
    }
    // For every answer, the planet or element of the chart that supports it most, and whether the chart leans that way.
    const perAnswer = [];
    for (const [key, q, opts] of QUESTIONS) {
      const a = opts.find(([v]) => v === answers[key]); if (!a || !Object.keys(a[2]).length) continue;
      const best = Object.keys(a[2]).map((k) => [k, PLANETS.includes(k) ? c.planets[k] * 7 : c.elements[k] * 4]).sort((x, y) => y[1] - x[1])[0];
      perAnswer.push({ key, q, answer: a[1], by: best[0], lift: best[1] });
    }
    return { score: own, percentile: total ? below / total : 0, description: d, chart: c, perAnswer, samples: total };
  }
  // The element a feature's answers point to (for the discovery table).
  const FEATURE_OF = { face: ["faceShape", "jaw"], brows: ["brows"], eyes: ["eyeSet", "eyeSize"], nose: ["noseLength", "noseShape"], mouth: ["lips"], hair: ["hairTexture", "hairAmount"] };
  function featureElement(answers, feature) {
    const o = {};
    for (const key of FEATURE_OF[feature] || []) { const q = QUESTIONS.find(([k]) => k === key), a = q && q[2].find(([v]) => v === answers[key]); if (a) for (const e of ELEMENTS) o[e] = (o[e] || 0) + (a[2][e] || 0); }
    const top = Object.entries(o).sort((x, y) => y[1] - x[1])[0];
    return top && top[1] > 0 ? top[0] : null;
  }
  return { QUESTIONS, PLANETS, ELEMENTS, profile, chartProfile, relevance, featureElement };
})();
