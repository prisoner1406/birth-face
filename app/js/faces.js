// Your Face in the Stars: the facial archetype of each rising sign, from the astrological tradition (Ptolemy,
// Tetrabiblos III.11; William Lilly, Christian Astrology, 1647; later Western practice). In that tradition the face and
// body are shown chiefly by the rising sign (the Ascendant), coloured by its ruling planet and by any planet close to
// the Ascendant; the Moon shows the changing expression. These are the tradition's descriptions, not measurements.
// Colouring (skin, hair, eyes) is deliberately left out: the archetype is about form, features and bearing.
const Faces = (() => {
  const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  // Traditional rulers (the ones the tradition uses for the body).
  const RULER = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };

  const ARCH = {
    Aries: {
      title: "The Ram", essence: "the face of the pioneer: alert, direct, ready to move",
      shape: "A lean, sinewy build and a longish face that narrows to the chin.",
      features: "Strong, often arched brows set close above the eyes; a prominent or slightly hooked nose; a firm mouth.",
      eyes: "Quick, sharp eyes that look straight at you.",
      bearing: "Leans slightly forward, as if already on the way somewhere; moves fast and decisively.",
      expression: "Frank and eager; anger and enthusiasm both show at once.",
      keys: ["strong brows", "direct gaze", "lean face", "forward energy"]
    },
    Taurus: {
      title: "The Bull", essence: "the face of the gardener: calm, sensual, rooted",
      shape: "A solid, well-set body, a strong neck and a broad face with a softly rounded jaw.",
      features: "Full lips, a well-shaped mouth, thick or curling hair and a short, sturdy nose.",
      eyes: "Large, steady, often heavy-lidded eyes with a calm, unhurried look.",
      bearing: "Stands firmly, moves slowly and gracefully; a pleasant, restful presence.",
      expression: "Placid and kind; slow to anger, slow to change.",
      keys: ["full lips", "strong neck", "calm eyes", "steady presence"]
    },
    Gemini: {
      title: "The Twins", essence: "the face of the messenger: bright, curious, youthful",
      shape: "Tall or upright and slender, with long arms and hands and a light, quick build.",
      features: "A narrow, expressive face, a fine nose and a mobile mouth that is often smiling or talking.",
      eyes: "Bright, darting eyes that take in everything at once.",
      bearing: "Restless and lively; gestures with the hands, looks younger than their years.",
      expression: "Changes from moment to moment with every new idea.",
      keys: ["bright eyes", "mobile mouth", "youthful look", "expressive hands"]
    },
    Cancer: {
      title: "The Crab", essence: "the face of the mother: soft, protective, moonlit",
      shape: "A rounded, full face, often wider at the cheeks, on a softer, smaller frame.",
      features: "Delicate features, a small nose and a gentle, sometimes pouting mouth.",
      eyes: "Soft, moist, feeling eyes that reflect every mood.",
      bearing: "Moves sideways around a subject before approaching it; shy at first, then warm.",
      expression: "Tender and changeable, like the Moon's phases.",
      keys: ["round face", "soft features", "feeling eyes", "gentle look"]
    },
    Leo: {
      title: "The Lion", essence: "the face of the king: radiant, proud, warm-hearted",
      shape: "A large, well-formed head and broad shoulders; an upright, generous frame.",
      features: "A wide brow, a strong, well-cut nose and a mane of thick hair.",
      eyes: "Large, bright, open eyes with a warm, commanding look.",
      bearing: "Stands tall and is noticed when entering a room; walks with dignity.",
      expression: "Sunny and magnanimous; the smile lights up the whole face.",
      keys: ["mane of hair", "upright bearing", "warm eyes", "radiant smile"]
    },
    Virgo: {
      title: "The Maiden", essence: "the face of the healer: refined, modest, attentive",
      shape: "A slender, well-proportioned body and an oval face that keeps its youth for a long time.",
      features: "Fine, regular features, a straight nose and a neat, composed mouth.",
      eyes: "Clear, intelligent, observant eyes that notice details.",
      bearing: "Neat and composed, careful in movement; quietly elegant.",
      expression: "Thoughtful and reserved, with a sudden, shy warmth.",
      keys: ["oval face", "refined features", "observant eyes", "neat composure"]
    },
    Libra: {
      title: "The Scales", essence: "the face of the peacemaker: graceful, balanced, charming",
      shape: "A well-proportioned, graceful body and a pleasant, symmetrical face.",
      features: "Balanced, harmonious features, often dimples and a lovely, easy smile.",
      eyes: "Soft, kind eyes that invite you in.",
      bearing: "Moves with grace and courtesy; pleasing to look at, pleasant to be near.",
      expression: "Agreeable and diplomatic; a smile that smooths things over.",
      keys: ["symmetry", "dimples", "easy smile", "graceful bearing"]
    },
    Scorpio: {
      title: "The Scorpion", essence: "the face of the mystic: intense, magnetic, private",
      shape: "A strong, compact build and a squarish or broad face with firm bone structure.",
      features: "Heavy or strongly drawn brows, a prominent nose and a firm, controlled mouth.",
      eyes: "Deep-set, penetrating eyes with a gaze that is hard to hold.",
      bearing: "Still and watchful; reveals little, misses nothing.",
      expression: "Guarded and magnetic; feeling runs deep beneath a calm surface.",
      keys: ["penetrating gaze", "strong brows", "firm jaw", "magnetic stillness"]
    },
    Sagittarius: {
      title: "The Archer", essence: "the face of the pilgrim: open, frank, far-seeing",
      shape: "A tall, well-formed body and a long or oval face with a high forehead.",
      features: "A frank, open face, a well-shaped nose and a wide, ready smile.",
      eyes: "Lively, cheerful eyes that look to the horizon.",
      bearing: "Long-striding and athletic; at ease outdoors and on the move.",
      expression: "Jovial, honest and hopeful; laughs easily.",
      keys: ["high forehead", "open smile", "tall frame", "cheerful eyes"]
    },
    Capricorn: {
      title: "The Sea-Goat", essence: "the face of the elder: serious, enduring, dignified",
      shape: "A lean, often bony frame and a long, angular face with marked bone structure.",
      features: "Prominent cheekbones and chin, a thin, firm mouth and a straight nose.",
      eyes: "Steady, serious eyes that weigh what they see.",
      bearing: "Reserved and upright; looks older when young and younger when old.",
      expression: "Grave and composed, with a dry, rare smile.",
      keys: ["strong cheekbones", "angular face", "steady eyes", "quiet dignity"]
    },
    Aquarius: {
      title: "The Water-Bearer", essence: "the face of the visionary: clear, friendly, original",
      shape: "A well-set, often tall body and a clear, open, well-formed face.",
      features: "A broad forehead and some striking or unusual feature that makes the face memorable.",
      eyes: "Clear, friendly eyes with a slightly distant, far-off look.",
      bearing: "Upright and easy; friendly with everyone yet hard to know closely.",
      expression: "Calm and kindly, with flashes of surprise and humour.",
      keys: ["clear face", "broad forehead", "far-off gaze", "one striking feature"]
    },
    Pisces: {
      title: "The Fishes", essence: "the face of the dreamer: soft, compassionate, otherworldly",
      shape: "A softer, often smaller frame and a rounded, gentle face.",
      features: "Soft, sensitive features, a full mouth and a fluid, expressive face.",
      eyes: "Large, dreamy, liquid eyes that seem to look beyond the room.",
      bearing: "Moves gently, almost flowing; absorbs the mood of whoever is near.",
      expression: "Compassionate and wistful; feelings drift across the face like weather.",
      keys: ["dreamy eyes", "soft features", "gentle face", "flowing grace"]
    }
  };

  // How each planet colours the face when it rules the rising sign or sits close to the Ascendant.
  const PLANET = {
    Sun: { word: "radiance", text: "adds warmth and radiance: a confident face that seems lit from within" },
    Moon: { word: "softness", text: "softens and rounds the face and makes the expression changeable and feeling" },
    Mercury: { word: "quickness", text: "sharpens the eyes, quickens the expression and keeps the face youthful" },
    Venus: { word: "beauty", text: "brings beauty and softness: pleasing proportions, an attractive mouth, often dimples" },
    Mars: { word: "edge", text: "sharpens the features and strengthens the jaw; there is often a small scar or mark on the face or head" },
    Jupiter: { word: "fullness", text: "fills out the face and frame and gives a generous, kindly smile" },
    Saturn: { word: "structure", text: "makes the face leaner and more bony, the eyes deeper set and the look more serious" },
    Uranus: { word: "originality", text: "adds something striking or unusual that people remember" },
    Neptune: { word: "dreaminess", text: "veils the eyes with a dreamy, otherworldly quality" },
    Pluto: { word: "intensity", text: "deepens the gaze into something intense and magnetic" },
    NorthNode: { word: "", text: "" }
  };
  const ORD = (n) => n + (["th", "st", "nd", "rd"][((n % 100) - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");
  const norm = (x) => ((x % 360) + 360) % 360;
  const dist = (a, b) => { const d = Math.abs(norm(a) - norm(b)) % 360; return d > 180 ? 360 - d : d; };

  // Read the face from a natal chart (Astro.natal). Without a birth time there is no rising sign, so the
  // reading says so and offers only the Sun and Moon, which the tradition treats as secondary for the face.
  function read(natal) {
    if (!natal) return null;
    const moonSign = natal.moon.sign, sunSign = natal.sun.sign;
    if (!natal.timeKnown) { const b = { timeKnown: false, traits: [], sun: { sign: sunSign, ...ARCH[sunSign] }, moon: { sign: moonSign, ...ARCH[moonSign] } }; return { ...b, ...three(natal, b) }; }
    const asc = natal.asc.lon, sign = natal.asc.sign, deg = norm(asc) % 30;
    const ruler = RULER[sign], rp = natal.planets.find((p) => p.key === ruler);
    // Planets close to the Ascendant (within 8°, on either side) mark the face strongly; within 1st house counts too.
    const near = natal.planets.filter((p) => p.key !== "NorthNode" && (dist(p.lon, asc) <= 8 || p.house === 1))
      .map((p) => ({ key: p.key, orb: dist(p.lon, asc), house: p.house, sign: p.sign, conj: dist(p.lon, asc) <= 8 }))
      .sort((a, b) => a.orb - b.orb);
    // Near a sign boundary the face blends the two signs.
    let cusp = null;
    if (deg < 2) cusp = { sign: SIGNS[(SIGNS.indexOf(sign) + 11) % 12], side: "start" };
    else if (deg > 28) cusp = { sign: SIGNS[(SIGNS.indexOf(sign) + 1) % 12], side: "end" };
    // The colours of the face, strongest first: rising sign, ruler, near planets, Moon.
    const colours = [];
    if (rp) colours.push({ from: "ruler", planet: ruler, sign: rp.sign, house: rp.house, text: `${ruler}, ruler of your ${sign} rising, ${PLANET[ruler].text}. It sits in ${rp.sign} (${ORD(rp.house)} house), so a touch of ${ARCH[rp.sign].title.replace("The ", "the ")} shows too: ${ARCH[rp.sign].keys.slice(0, 2).join(" and ")}.` });
    for (const n of near) {
      if (n.key === ruler) continue;
      colours.push({ from: "near", planet: n.key, orb: n.orb, text: `${n.key} ${n.conj ? `rises with your Ascendant (${n.orb.toFixed(1)}° away)` : "is in your 1st house"} and ${PLANET[n.key].text}.` });
    }
    const traits = [...new Set([...ARCH[sign].keys, ...(rp ? [PLANET[ruler].word] : []), ...near.filter((n) => n.key !== ruler).map((n) => PLANET[n.key].word)].filter(Boolean))];
    const base = { timeKnown: true, sign, deg, ascLon: asc, arch: ARCH[sign], ruler, rulerPlanet: rp, near, cusp, cuspArch: cusp ? ARCH[cusp.sign] : null, colours, traits, moon: { sign: moonSign, ...ARCH[moonSign] } };
    return { ...base, ...three(natal, base) };
  }

  // ---------- all three signs: rising, Sun and Moon ----------
  // The face as a blend of the "big three". Each sign shapes the part of the face the tradition gives it:
  //   rising sign → structure and bearing (the body, the first impression)
  //   Sun         → features and presence (brow, nose, mouth: the light of the self)
  //   Moon        → eyes and expression (feeling, the changing face)
  // Weights start at rising 50%, Sun 30%, Moon 20%; a luminary rising with the Ascendant, in the 1st house,
  // or ruling the rising sign counts for more. Signs shared between positions add up ("doubly Pisces").
  const poss = (t) => (/s$/.test(t) ? `${t}'` : `${t}'s`);
  const bare = (sign) => ARCH[sign].title.replace(/^The /, "");
  function three(natal, base) {
    const sun = natal.sun, moon = natal.moon;
    let w = base.timeKnown ? { rising: 0.5, sun: 0.3, moon: 0.2 } : { rising: 0, sun: 0.6, moon: 0.4 };
    const boost = [];
    if (base.timeKnown) {
      for (const [k, p] of [["sun", sun], ["moon", moon]]) {
        const orb = dist(p.lon, base.ascLon);
        if (orb <= 8 || p.house === 1) { w[k] += 0.15; boost.push({ k, why: orb <= 8 ? `rises with your Ascendant (${orb.toFixed(1)}° away)` : "sits in your 1st house" }); }
      }
      if (base.ruler === "Sun") { w.sun += 0.1; boost.push({ k: "sun", why: `rules your ${base.sign} rising` }); }
      if (base.ruler === "Moon") { w.moon += 0.1; boost.push({ k: "moon", why: `rules your ${base.sign} rising` }); }
    }
    const tot = w.rising + w.sun + w.moon; for (const k in w) w[k] /= tot;
    // Within 1° of a sign boundary the Sun or Moon blends in the neighbouring sign.
    const edge = (p) => { const d = ((p.lon % 30) + 30) % 30; return d < 1 ? SIGNS[(SIGNS.indexOf(p.sign) + 11) % 12] : d > 29 ? SIGNS[(SIGNS.indexOf(p.sign) + 1) % 12] : null; };
    // Without a birth time the Moon may have changed sign during the day.
    let moonMaybe = null;
    if (!base.timeKnown && typeof Astro !== "undefined" && natal.utcMs) {
      const signAt = (ms) => SIGNS[Math.floor(Astro.bodyLon("Moon", window.Astronomy.MakeTime(new Date(ms))) / 30) % 12];
      const a = signAt(natal.utcMs - 12 * 36e5), b = signAt(natal.utcMs + 12 * 36e5);
      if (a !== b) moonMaybe = [a, b];
    }
    const R = base.timeKnown ? base.sign : sun.sign, S = sun.sign, M = moon.sign;
    const layers = {
      rising: base.timeKnown ? { sign: R, arch: ARCH[R], weight: w.rising, parts: "structure and bearing" } : null,
      sun: { sign: S, arch: ARCH[S], weight: w.sun, parts: "features and presence", edge: edge(sun) },
      moon: { sign: M, arch: ARCH[M], weight: w.moon, parts: "eyes and expression", edge: edge(moon), maybe: moonMaybe }
    };
    // The composite face, part by part.
    const composite = {
      shape: { text: ARCH[R].shape, from: base.timeKnown ? "rising" : "sun", sign: R },
      bearing: { text: ARCH[R].bearing, from: base.timeKnown ? "rising" : "sun", sign: R },
      features: { text: ARCH[S].features, from: "sun", sign: S },
      eyes: { text: ARCH[M].eyes, from: "moon", sign: M },
      expression: { text: ARCH[M].expression, from: "moon", sign: M }
    };
    // e.g. "The Archer, with the Sea-Goat's features and the Fishes' eyes".
    let name;
    if (!base.timeKnown) name = M === S ? `${ARCH[S].title}, through and through` : `${ARCH[S].title}, with ${poss("the " + bare(M))} eyes`;
    else if (S === R && M === R) name = `${ARCH[R].title}, through and through`;
    else if (S === R) name = `${ARCH[R].title} in form and features, with ${poss("the " + bare(M))} eyes`;
    else if (M === R) name = `${ARCH[R].title}, with ${poss("the " + bare(S))} features and its own eyes`;
    else if (M === S) name = `${ARCH[R].title}, with ${poss("the " + bare(S))} features and eyes`;
    else name = `${ARCH[R].title}, with ${poss("the " + bare(S))} features and ${poss("the " + bare(M))} eyes`;
    const pick = (sign, n, prefer) => { const k = ARCH[sign].keys; const p = k.filter((x) => prefer.test(x)); return [...p, ...k.filter((x) => !prefer.test(x))].slice(0, n); };
    const traits3 = [...new Set([
      ...(base.timeKnown ? pick(R, 2, /face|frame|build|bearing|neck|presence|grace|composure|stillness|energy|symmetry|dignity/) : []),
      ...pick(S, 2, /brow|lips|nose|jaw|cheek|smile|forehead|feature|mane|dimple|hands|mouth/),
      ...pick(M, 2, /eyes|gaze|look/),
      ...(base.traits || []).filter((t) => Object.values(PLANET).some((pl) => pl.word === t))
    ])];
    const signs = [R, S, M];
    const counts = signs.reduce((o, s) => ((o[s] = (o[s] || 0) + 1), o), {});
    const repeated = Object.entries(counts).filter(([, c]) => c > 1).map(([s, c]) => ({ sign: s, times: c }));
    return { layers, weights: w, boosts: boost, composite, name, traits3, repeated, big3: { rising: base.timeKnown ? R : null, sun: S, moon: M } };
  }
  // ---------- temperament: the four elements, the four archangels ----------
  // The classical temperament tally (Lilly's method as reconstructed and weighted by Dorian Greenbaum, Temperament:
  // Astrology's Forgotten Key, 2005): ten points on each axis, hot/cold and moist/dry.
  //   Ascendant sign by element 2 · Ascendant ruler by its nature 1 · almuten of the Ascendant by its nature 1 ·
  //   Moon's sign by element 2 · the Moon's ruler by the element of its sign 1 · Moon's quarter 1 · Sun's season 2
  // Mercury and Venus take their nature from their phase: oriental (rising before the Sun) hot and moist;
  // occidental, Mercury cold and dry and Venus cold and moist.
  // Hot+dry is choleric (fire, Michael), hot+moist sanguine (air, Raphael), cold+moist phlegmatic (water, Gabriel),
  // cold+dry melancholic (earth, Uriel).
  const Q = { Fire: ["hot", "dry"], Earth: ["cold", "dry"], Air: ["hot", "moist"], Water: ["cold", "moist"] };
  const ELEM = ["Fire", "Earth", "Air", "Water"];
  const TEMPER = {
    Fire: {
      name: "Choleric", element: "Fire", angel: "Michael", q: "hot and dry", img: "michael",
      build: "Lean, firm and muscular: a compact, energetic frame.",
      face: "Sharp, defined features: a strong jaw and nose and well-marked brows.",
      eyes: "Keen, bright, piercing eyes.", hair: "Thick hair, often curling.", manner: "Quick, upright and decisive in movement.",
      season: "Summer births (Ptolemy): moderate height, robust, large eyes, thick curling hair."
    },
    Air: {
      name: "Sanguine", element: "Air", angel: "Raphael", q: "hot and moist", img: "raphael",
      build: "Well-proportioned and well-fleshed, upright and graceful.",
      face: "An open, full, pleasant face with even features and a ready smile.",
      eyes: "Clear, cheerful, lively eyes.", hair: "Abundant hair.", manner: "Light, lively and sociable in movement.",
      season: "Spring births (Ptolemy): well-favoured, of good stature and robust, with good eyes."
    },
    Water: {
      name: "Phlegmatic", element: "Water", angel: "Gabriel", q: "cold and moist", img: "gabriel",
      build: "Softer and fuller, rounded rather than angular.",
      face: "A round, smooth face with soft, gentle features.",
      eyes: "Large, mild, calm eyes.", hair: "Fine, soft, straight hair.", manner: "Slow, calm and unhurried in movement.",
      season: "Winter births (Ptolemy): moderate height, straight hair, little body hair, somewhat graceful."
    },
    Earth: {
      name: "Melancholic", element: "Earth", angel: "Uriel", q: "cold and dry", img: "uriel",
      build: "Lean, spare and long-boned.",
      face: "A long, narrow face with defined bones and a serious brow.",
      eyes: "Deep-set, thoughtful, steady eyes.", hair: "Straight, fine hair.", manner: "Deliberate, reserved and quiet in bearing.",
      season: "Autumn births (Ptolemy): spare and slender, with good eyes."
    }
  };
  const elemOfQ = (a, b) => (a === "hot" ? (b === "dry" ? "Fire" : "Air") : b === "dry" ? "Earth" : "Water");
  const PQ = { Saturn: ["cold", "dry"], Jupiter: ["hot", "moist"], Mars: ["hot", "dry"], Sun: ["hot", "dry"], Moon: ["cold", "moist"] };
  const sdiff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;
  function natureOf(planet, natal) {
    if (PQ[planet]) return { q: PQ[planet], note: "" };
    const p = natal.planets.find((x) => x.key === planet), oriental = sdiff(p.lon, natal.sun.lon) < 0;
    if (oriental) return { q: ["hot", "moist"], note: "oriental, rising before the Sun" };
    return { q: planet === "Mercury" ? ["cold", "dry"] : ["cold", "moist"], note: "occidental, setting after the Sun" };
  }
  function temperament(natal) {
    const facs = [];
    const add = (label, detail, q, pts) => facs.push({ label, detail, q, pts, element: elemOfQ(q[0], q[1]) });
    const elQ = (sign) => Q[ELEM[SIGNS.indexOf(sign) % 4]];
    if (natal.timeKnown) {
      const asc = natal.asc;
      add("Rising sign", `${asc.sign} (${ELEM[asc.signIdx % 4].toLowerCase()})`, elQ(asc.sign), 2);
      const ruler = RULER[asc.sign], rn = natureOf(ruler, natal);
      add("Ruler of the Ascendant", `${ruler}${rn.note ? `, ${rn.note}` : ""}`, rn.q, 1);
      if (typeof Dignity !== "undefined") {
        const al = Dignity.lordsOf(asc.lon, Dignity.isDay(natal)).almuten, an = natureOf(al, natal);
        add("Almuten of the Ascendant", `${al}, the planet with most dignity at the rising degree${an.note ? ` (${an.note})` : ""}`, an.q, 1);
      }
    }
    const moon = natal.moon, mr = RULER[moon.sign], mrp = natal.planets.find((x) => x.key === mr);
    add("Moon's sign", `${moon.sign} (${ELEM[moon.signIdx % 4].toLowerCase()})`, elQ(moon.sign), 2);
    add("Ruler of the Moon", `${mr} in ${mrp.sign} (${ELEM[mrp.signIdx % 4].toLowerCase()})`, elQ(mrp.sign), 1);
    const el = ((moon.lon - natal.sun.lon) % 360 + 360) % 360;
    const quarter = el < 90 ? ["first quarter (new to half Moon)", ["hot", "moist"]] : el < 180 ? ["second quarter (half to full Moon)", ["hot", "dry"]] : el < 270 ? ["third quarter (full to half Moon)", ["cold", "dry"]] : ["fourth quarter (half to new Moon)", ["cold", "moist"]];
    add("Moon's quarter", quarter[0], quarter[1], 1);
    const si = natal.sun.signIdx, season = si < 3 ? ["spring", ["hot", "moist"]] : si < 6 ? ["summer", ["hot", "dry"]] : si < 9 ? ["autumn", ["cold", "dry"]] : ["winter", ["cold", "moist"]];
    add("Season of birth", `Sun in ${natal.sun.sign}: ${season[0]}`, season[1], 2);
    const axes = { hot: 0, cold: 0, moist: 0, dry: 0 };
    for (const f of facs) { axes[f.q[0]] += f.pts; axes[f.q[1]] += f.pts; }
    const total = facs.reduce((a, f) => a + f.pts, 0);
    const shares = { Fire: 0, Air: 0, Water: 0, Earth: 0 };
    for (const f of facs) shares[f.element] += f.pts / total;
    const tie = { hc: axes.hot === axes.cold, md: axes.moist === axes.dry };
    const pick = (a, b) => (axes[a] === axes[b] ? null : axes[a] > axes[b] ? a : b);
    const hc = pick("hot", "cold"), md = pick("moist", "dry");
    // Ranked elements: the axis result first; ties fall back on the shares.
    const ranked = Object.entries(shares).sort((a, b) => b[1] - a[1]).map(([e]) => e);
    const primary = hc && md ? elemOfQ(hc, md) : ranked[0];
    const secondary = ranked.find((e) => e !== primary);
    return { factors: facs, axes, total, shares, primary, secondary, tie, balanced: !hc || !md, TEMPER };
  }

  // Ptolemy, Tetrabiblos III.11: the planets on the eastern horizon shape the body differently when oriental
  // (morning, rising before the Sun) and occidental (evening). Colouring is left out.
  const PTOLEMY = {
    Saturn: ["robust, with curling hair, moderate eyes and middling stature", "slender and small, with straight hair, rather graceful"],
    Jupiter: ["tall and commanding, with large eyes and moderately curling hair", "of average stature, with lank hair or a high hairline"],
    Mars: ["tall and robust, with thick, somewhat curling hair", "of middle height, lean, with small eyes and straight hair"],
    Venus: ["shapely and graceful, softly full, with bright, beautiful eyes", "shapely and graceful, softly full, with bright, beautiful eyes"],
    Mercury: ["of moderate height and graceful, with small eyes and moderately curling hair", "lean and spare, with straight hair and glancing, brilliant eyes"],
    Sun: ["more impressive and robust", "more impressive and robust"],
    Moon: ["better proportioned and slenderer, softer in temperament", "better proportioned and slenderer, softer in temperament"]
  };
  const STATURE = {
    larger: ["Leo", "Virgo", "Sagittarius"], smaller: ["Pisces", "Cancer", "Capricorn"],
    proportioned: ["Virgo", "Libra", "Sagittarius"], uneven: ["Scorpio", "Pisces", "Taurus"],
    upper: ["Aries", "Taurus", "Leo"], slenderFront: ["Sagittarius", "Scorpio", "Gemini"]
  };
  function ptolemy(natal) {
    const out = { planets: [], stature: [] };
    if (!natal.timeKnown) return out;
    for (const p of natal.planets) {
      if (!PTOLEMY[p.key]) continue;
      const d = Math.abs(sdiff(p.lon, natal.asc.lon));
      if (d > 8 && p.house !== 1) continue;
      const oriental = p.key === "Sun" || sdiff(p.lon, natal.sun.lon) < 0;
      out.planets.push({ planet: p.key, oriental, text: PTOLEMY[p.key][oriental ? 0 : 1], orb: d });
    }
    const s = natal.asc.sign;
    if (STATURE.larger.includes(s)) out.stature.push(`${s} rising makes the body larger`);
    if (STATURE.smaller.includes(s)) out.stature.push(`${s} rising makes the body smaller`);
    if (STATURE.proportioned.includes(s)) out.stature.push(`${s} gives a well-proportioned, graceful form`);
    if (STATURE.uneven.includes(s)) out.stature.push(`${s} gives a less even, more distinctive build`);
    if (STATURE.upper.includes(s)) out.stature.push(`${s} makes the head, shoulders and chest the stronger part`);
    if (STATURE.slenderFront.includes(s)) out.stature.push(`${s} makes the front of the body slender and the back strong`);
    return out;
  }

  // ---------- more ancient knowledge of the face ----------
  // Each planet's strength (Lilly's essential + accidental dignity, from dignity.js).
  function strengths(natal) {
    if (typeof Dignity === "undefined") return null;
    const rows = Dignity.report(natal).rows;
    return Object.fromEntries(rows.map((r) => [r.key, r.total]));
  }
  const the = (p) => (p === "Sun" || p === "Moon" ? `the ${p}` : p);
  const level = (t) => (t >= 7 ? "strong" : t >= -2 ? "balanced" : "tested");

  // Ptolemy's melothesia (Tetrabiblos III.12): the planet that rules each sense and part of the head.
  // The Sun rules sight and all right-hand parts, the Moon taste and all left-hand parts; Saturn the right ear,
  // Mars the left ear, Venus smell, Mercury speech and the tongue, Jupiter touch. Venus also makes the eyes bright (III.11).
  const SENSES = [
    { sense: "Sight", part: "the eyes", planet: "Sun" },
    { sense: "Speech", part: "the tongue and the voice", planet: "Mercury" },
    { sense: "Smell", part: "the nose", planet: "Venus" },
    { sense: "Taste", part: "the mouth", planet: "Moon" },
    { sense: "Hearing", part: "the right ear", planet: "Saturn" },
    { sense: "Hearing", part: "the left ear", planet: "Mars" },
    { sense: "Touch", part: "the skin and feeling", planet: "Jupiter" }
  ];
  const LVL_TEXT = {
    strong: "well dignified, so the tradition counts this a strong, well-formed and notable part of you",
    balanced: "of middling dignity, so this part is even and unremarkable in the tradition",
    tested: "weak in dignity, so the tradition counts this your more sensitive part, the one to care for"
  };
  function melothesia(natal) {
    const st = strengths(natal); if (!st) return null;
    const rows = SENSES.map((s) => { const t = st[s.planet] ?? 0, l = level(t); return { ...s, total: t, level: l, text: `Ptolemy gives ${s.sense.toLowerCase()} (${s.part}) to ${the(s.planet)}. Your ${s.planet} is ${LVL_TEXT[l]}.` }; });
    const sun = st.Sun ?? 0, moon = st.Moon ?? 0;
    const sides = Math.abs(sun - moon) < 2 ? "Your Sun and Moon are of near-equal strength, so the two sides of your face are balanced in the tradition."
      : sun > moon ? `Your Sun (${sun > 0 ? "+" : ""}${sun}) is stronger than your Moon (${moon > 0 ? "+" : ""}${moon}), so the right side of your face is the stronger, more defined side in the tradition.`
      : `Your Moon (${moon > 0 ? "+" : ""}${moon}) is stronger than your Sun (${sun > 0 ? "+" : ""}${sun}), so the left side of your face is the stronger, more expressive side in the tradition.`;
    const venus = st.Venus ?? 0, eyes = venus >= 7 ? "Your Venus is strong, and Ptolemy says Venus makes the eyes bright as well as beautiful." : null;
    return { rows, sides, eyes };
  }

  // Metoposcopy (Girolamo Cardano, Metoposcopia, written 1558, printed 1658): seven horizontal lines of the forehead,
  // top to bottom, belong to Saturn, Jupiter, Mars, the Sun, Venus, Mercury and the Moon. Read from the chart, the
  // strongest planets mark the clearest lines.
  const LINES = [
    ["Saturn", "the line of endurance and deep thought"], ["Jupiter", "the line of fortune and honour"], ["Mars", "the line of courage and will"],
    ["Sun", "the line of renown and spirit"], ["Venus", "the line of love and grace"], ["Mercury", "the line of wit and speech"], ["Moon", "the line of feeling, dreams and journeys"]
  ];
  function metoposcopy(natal) {
    const st = strengths(natal); if (!st) return null;
    const lines = LINES.map(([planet, meaning], i) => ({ n: i + 1, planet, meaning, total: st[planet] ?? 0 }));
    const sorted = lines.slice().sort((a, b) => b.total - a.total);
    const clear = sorted.slice(0, 2).map((l) => l.planet), faint = sorted.slice(-2).map((l) => l.planet);
    return { lines: lines.map((l) => ({ ...l, mark: clear.includes(l.planet) ? "clear" : faint.includes(l.planet) ? "faint" : "even" })), clear, faint };
  }

  // Chinese face reading (Mian Xiang): five face shapes for the five phases. Teachers differ on the details; these
  // follow the common modern teaching. The Day Master (the heavenly stem of the day pillar) names your own element.
  const MIAN = {
    Wood: { shape: "Long and rectangular, with a high forehead, prominent cheekbones and a strong, straight nose.", nature: "growing, upright and principled" },
    Fire: { shape: "Pointed at the forehead or the chin and widest through the middle, with bright, lively eyes.", nature: "warm, quick and expressive" },
    Earth: { shape: "Square and solid, with a broad jaw, full cheeks and a full mouth.", nature: "steady, nourishing and dependable" },
    Metal: { shape: "Oval to square with fine, well-defined bones and clear, even features.", nature: "precise, refined and resolute" },
    Water: { shape: "Round and soft, full and fleshy, with a broad forehead and a gentle chin.", nature: "deep, flowing and adaptable" }
  };

  // The planetary face: the seven planetary archangels, each weighted as Ptolemy reads the body (Tetrabiblos III.11):
  // the planets on or ruling the eastern horizon, and the Moon, shape the form most; a planet's own strength
  // (Lilly's dignity) lets it show more clearly. Michael Sun, Gabriel Moon, Raphael Mercury, Anael Venus,
  // Khamael Mars, Sachiel Jupiter, Cassiel Saturn.
  const PLANET_ANGEL = { Sun: "michael", Moon: "gabriel", Mercury: "raphael", Venus: "anael", Mars: "khamael", Jupiter: "sachiel", Saturn: "cassiel" };
  const ANGEL_NAME = { malchidiel: "Malchidiel", asmodel: "Asmodel", ambriel: "Ambriel", muriel: "Muriel", verchiel: "Verchiel", hamaliel: "Hamaliel",
    zuriel: "Zuriel", barbiel: "Barbiel", adnachiel: "Adnachiel", hanael: "Hanael", cambiel: "Cambiel", barchiel: "Barchiel", uriel: "Uriel", michael: "Michael", gabriel: "Gabriel", raphael: "Raphael", anael: "Anael", khamael: "Khamael", sachiel: "Sachiel", cassiel: "Cassiel" };
  // ---------- deeper testimonies of the body ----------
  // The bright stars Ptolemy gives a planetary nature (Tetrabiblos I.9), from their J2000 right ascension and
  // declination, turned to ecliptic longitude and carried to the birth date by precession. [name, RA h m s,
  // Dec d m s, natures; a nature after "~" is the lesser one].
  const STAR_DATA = [
    ["Alcyone (the Pleiades)", [3, 47, 29.1], [24, 6, 18], "Moon Mars"], ["Algol", [3, 8, 10.1], [40, 57, 20], "Saturn Jupiter"],
    ["Aldebaran", [4, 35, 55.2], [16, 30, 33], "Mars"], ["Rigel", [5, 14, 32.3], [-8, 12, 6], "Jupiter Saturn"],
    ["Capella", [5, 16, 41.4], [45, 59, 53], "Mars Mercury"], ["Betelgeuse", [5, 55, 10.3], [7, 24, 25], "Mars Mercury"],
    ["Sirius", [6, 45, 8.9], [-16, 42, 58], "Jupiter ~Mars"], ["Castor", [7, 34, 35.9], [31, 53, 18], "Mercury"],
    ["Procyon", [7, 39, 18.1], [5, 13, 30], "Mercury ~Mars"], ["Pollux", [7, 45, 18.9], [28, 1, 34], "Mars"],
    ["Regulus", [10, 8, 22.3], [11, 58, 2], "Mars Jupiter"], ["Spica", [13, 25, 11.6], [-11, 9, 41], "Venus ~Mars"],
    ["Arcturus", [14, 15, 39.7], [19, 10, 57], "Jupiter Mars"], ["Antares", [16, 29, 24.5], [-26, 25, 55], "Mars ~Jupiter"],
    ["Vega", [18, 36, 56.3], [38, 47, 1], "Venus Mercury"], ["Altair", [19, 50, 47.0], [8, 52, 6], "Mars Jupiter"],
    ["Deneb Algedi", [21, 47, 2.4], [-16, 7, 38], "Saturn Jupiter"], ["Fomalhaut", [22, 57, 39.0], [-29, 37, 20], "Venus Mercury"]
  ];
  const STARS_J2000 = (() => {
    const R = Math.PI / 180, e = 23.4392911 * R;
    return STAR_DATA.map(([name, [h, m, s], [d, dm, ds], nat]) => {
      const a = (h + m / 60 + s / 3600) * 15 * R, sg = d < 0 ? -1 : 1, dec = sg * (Math.abs(d) + dm / 60 + ds / 3600) * R;
      const lon = ((Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(dec) * Math.sin(e), Math.cos(a)) / R) % 360 + 360) % 360;
      const natures = nat.split(" ").map((x) => (x[0] === "~" ? [x.slice(1), 0.5] : [x, 1]));
      return { name, lon, natures };
    });
  })();
  // Stars within 1½° of a point, at the date of birth (general precession in longitude, IAU 2006).
  function starsOn(lon, ms) {
    const T = (ms - Date.UTC(2000, 0, 1, 12)) / (36525 * 864e5), prec = (5028.796195 * T + 1.1054348 * T * T) / 3600;
    return STARS_J2000.map((s) => ({ ...s, at: (s.lon + prec) % 360, d: dist(s.lon + prec, lon) })).filter((s) => s.d <= 1.5);
  }
  // The rising navamsa (Jyotish): the sidereal Ascendant (Lahiri ayanamsa) in ninths of a sign, counted through the
  // zodiac; the navamsa of the Ascendant is read for the body and appearance.
  function navamsaOf(natal) {
    if (!natal.timeKnown || typeof Daily === "undefined" || !Daily.ayanamsa) return null;
    const sid = ((natal.asc.lon - Daily.ayanamsa(natal.utcMs)) % 360 + 360) % 360;
    return { sign: SIGNS[Math.floor(sid / (30 / 9)) % 12], sid, rasi: SIGNS[Math.floor(sid / 30)] };
  }
  // Every deeper testimony of the body, for the page and for the planetary weights.
  function deeper(natal) {
    if (!natal.timeKnown || typeof Dignity === "undefined") return null;
    const asc = natal.asc.lon, day = Dignity.isDay(natal), lords = Dignity.lordsOf(asc, day);
    const ASPECTS = [[60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"]];
    const aspects = [];
    for (const p of natal.planets) {
      if (!PLANET_ANGEL[p.key]) continue;
      const d = dist(p.lon, asc);
      for (const [ang, name] of ASPECTS) if (Math.abs(d - ang) <= 6) aspects.push({ planet: p.key, name, orb: Math.abs(d - ang) });
    }
    return {
      bound: lords.bound, face: lords.face, tripLord: lords.tripLord, day,
      sectLight: day ? "Sun" : "Moon", aspects,
      starsAsc: starsOn(asc, natal.utcMs), starsMoon: starsOn(natal.moon.lon, natal.utcMs),
      navamsa: navamsaOf(natal)
    };
  }

  function planetary(natal) {
    const st = strengths(natal) || {}, dp = deeper(natal);
    const out = [];
    let almuten = null;
    if (natal.timeKnown && typeof Dignity !== "undefined") almuten = Dignity.lordsOf(natal.asc.lon, Dignity.isDay(natal)).almuten;
    for (const planet of Object.keys(PLANET_ANGEL)) {
      const p = natal.planets.find((x) => x.key === planet), why = [];
      let w = 1;
      const t = st[planet] ?? 0;
      w += Math.max(-10, Math.min(20, t)) / 10;
      if (t >= 7) why.push("strong in dignity"); else if (t <= -3) why.push("weak in dignity");
      if (planet === "Moon") { w += 1; why.push("the Moon shapes the body"); }
      if (planet === "Sun") w += 0.5;
      if (natal.timeKnown) {
        if (RULER[natal.asc.sign] === planet) { w += 2; why.push(`rules your ${natal.asc.sign} rising`); }
        if (almuten === planet) { w += 1; why.push("almuten of your Ascendant"); }
        const d = dist(p.lon, natal.asc.lon);
        if (d <= 8) { w += 3 * (1 - d / 10); why.push(`rises with your Ascendant (${d.toFixed(1)}°)`); }
        else if (p.house === 1) { w += 1.5; why.push("in your 1st house"); }
        // The deeper lords of the rising degree, its aspects, the light of the sect and the stars it rises with.
        if (dp) {
          if (dp.bound === planet) { w += 0.75; why.push("lord of the bound of your Ascendant"); }
          if (dp.face === planet) { w += 0.5; why.push("lord of the face (decan) of your Ascendant"); }
          if (dp.tripLord === planet) { w += 0.5; why.push(`triplicity lord of your Ascendant by ${dp.day ? "day" : "night"}`); }
          if (dp.sectLight === planet) { w += 0.5; why.push(`light of the sect (born by ${dp.day ? "day" : "night"})`); }
          for (const a of dp.aspects) if (a.planet === planet) { w += 1 - a.orb / 6; why.push(`in ${a.name} to your Ascendant (${a.orb.toFixed(1)}°)`); }
          for (const [list, where, k] of [[dp.starsAsc, "your Ascendant", 1.5], [dp.starsMoon, "your Moon", 1]]) for (const s of list) {
            const tot = s.natures.reduce((x, [, v]) => x + v, 0), n = s.natures.find(([pl]) => pl === planet);
            if (n) { w += k * (1 - s.d / 2) * n[1] / tot; why.push(`${s.name} on ${where} has its nature`); }
          }
        }
      }
      out.push({ planet, angel: PLANET_ANGEL[planet], name: ANGEL_NAME[PLANET_ANGEL[planet]], w: Math.max(0.2, w), why });
    }
    const tot = out.reduce((a, x) => a + x.w, 0);
    out.forEach((x) => (x.share = x.w / tot));
    return out.sort((a, b) => b.share - a.share);
  }

  // ---------- feature by feature ----------
  // Each part of the face takes its own mix, from the places the tradition gives it: the rising sign the frame
  // and jaw (the 1st house is the body); Mars the head and brow (Aries rules the head); the Moon the eyes'
  // expression and the mouth (taste, III.12) and the Sun sight; Venus the nose (smell, III.12) and the beauty
  // of the lips; the temperament as a whole the hair and outline.
  const FEATURES = [
    { key: "hair", label: "Hair and outline", src: { temper: 1 }, why: "the temperament as a whole" },
    // Ptolemy (III.11) and Lilly judge the body from three: the rising sign, the lord of the Ascendant and the
    // Moon. So the lord weighs almost as much as the sign itself, and the Moon has its own part.
    { key: "face", label: "Face shape and jaw", src: { asc: 0.24, ruler: 0.2, moon: 0.12, bound: 0.05, decan: 0.05, trip: 0.04, aspects: 0.05, starsAsc: 0.05, navamsa: 0.08, temper: 0.25, sun: 0.1 }, why: "the rising sign, its lord and the Moon, the lords of the rising degree, the planets and stars that look at it, and its navamsa" },
    { key: "brows", label: "Brow and forehead", src: { mars: 0.3, sun: 0.2, asc: 0.15, starsAsc: 0.1, temper: 0.25 }, why: "Mars, ruler of Aries, the sign of the head, and the stars rising with you" },
    { key: "eyes", label: "Eyes", src: { moon: 0.35, sun: 0.2, starsMoon: 0.1, temper: 0.25, asc: 0.1 }, why: "the Moon's expression and the Sun's sight, and the stars with your Moon" },
    { key: "nose", label: "Nose", src: { venus: 0.35, sun: 0.2, asc: 0.2, temper: 0.25 }, why: "Venus, who rules smell" },
    { key: "mouth", label: "Mouth and lips", src: { moon: 0.3, venus: 0.25, starsMoon: 0.1, temper: 0.25, sun: 0.1 }, why: "the Moon, who rules taste and the mouth, Venus, and the stars with your Moon" }
  ];
  // Planetary emphasis for each feature (Ptolemy III.12 and the tradition above).
  const FEAT_PLANET = {
    hair: {}, face: { Saturn: 1.6, Jupiter: 1.4, Moon: 1.4 }, brows: { Mars: 1.8, Saturn: 1.3, Sun: 1.2 },
    eyes: { Sun: 1.8, Moon: 1.5, Venus: 1.3, Mercury: 1.2 }, nose: { Venus: 1.9 }, mouth: { Moon: 1.8, Venus: 1.4, Mercury: 1.3 }
  };
  const elOfSign = (sign) => ELEM[SIGNS.indexOf(sign) % 4];
  // The Sun is read by its season, as in the temperament tally: spring air, summer fire, autumn earth, winter water.
  const SEASON_EL = ["Air", "Fire", "Earth", "Water"];
  // opts.name: the person's name, whose letters also weigh the angels of the Name (nameLetters).
  function features(natal, opts = {}) {
    const temper = temperament(natal), pf = planetary(natal), dp = deeper(natal), nav = navamsaOf(natal);
    const pl = (k) => natal.planets.find((p) => p.key === k);
    // The deeper testimonies, each read as the place its planet stands in, as the other sources are: the lords of
    // the rising degree (bound, face, triplicity), the planets that aspect it (closer counts more), and the
    // planets whose nature the bright stars on the Ascendant and on the Moon share (Ptolemy I.9).
    const placeOf = (planet) => ({ [elOfSign(pl(planet).sign)]: 1 });
    const mixPlaces = (list) => { // [[planet, weight]] -> { element: share }
      const o = {}; let t = 0;
      for (const [planet, w] of list) { if (!w) continue; const e = elOfSign(pl(planet).sign); o[e] = (o[e] || 0) + w; t += w; }
      return t ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v / t])) : null;
    };
    const starPlanets = (stars) => stars.flatMap((s) => { const tot = s.natures.reduce((a, [, v]) => a + v, 0); return s.natures.map(([p, v]) => [p, (1 - s.d / 2) * v / tot]); });
    const deepEl = dp ? {
      bound: placeOf(dp.bound), decan: placeOf(dp.face), trip: dp.tripLord ? placeOf(dp.tripLord) : null,
      aspects: mixPlaces(dp.aspects.map((a) => [a.planet, 1 - a.orb / 6])),
      starsAsc: mixPlaces(starPlanets(dp.starsAsc)), starsMoon: mixPlaces(starPlanets(dp.starsMoon)),
      navamsa: nav ? { [elOfSign(nav.sign)]: 1 } : null
    } : {};
    const srcEl = {
      ...deepEl,
      temper: temper.shares, sun: { [SEASON_EL[Math.floor(natal.sun.signIdx / 3)]]: 1 }, moon: { [elOfSign(natal.moon.sign)]: 1 },
      venus: { [elOfSign(pl("Venus").sign)]: 1 }, mars: { [elOfSign(pl("Mars").sign)]: 1 },
      asc: natal.timeKnown ? { [elOfSign(natal.asc.sign)]: 1 } : null,
      ruler: natal.timeKnown ? { [elOfSign(pl(RULER[natal.asc.sign]).sign)]: 1 } : null
    };
    const srcLabel = {
      temper: "your temperament", sun: `your ${["spring", "summer", "autumn", "winter"][Math.floor(natal.sun.signIdx / 3)]} ${natal.sun.sign} Sun`, moon: `your ${natal.moon.sign} Moon`, venus: `Venus in ${pl("Venus").sign}`,
      mars: `Mars in ${pl("Mars").sign}`, asc: natal.timeKnown ? `your ${natal.asc.sign} rising` : "", ruler: natal.timeKnown ? `${RULER[natal.asc.sign]} in ${pl(RULER[natal.asc.sign]).sign}` : "",
      ...(dp ? {
        bound: `${dp.bound}, lord of its bound, in ${pl(dp.bound).sign}`, decan: `${dp.face}, lord of its decan, in ${pl(dp.face).sign}`,
        trip: dp.tripLord ? `${dp.tripLord}, its ${dp.day ? "day" : "night"} triplicity lord, in ${pl(dp.tripLord).sign}` : "",
        aspects: dp.aspects.length ? `${dp.aspects.map((a) => a.planet).join(" and ")} aspecting your Ascendant` : "",
        starsAsc: dp.starsAsc.length ? `${dp.starsAsc.map((s) => s.name).join(" and ")} on your Ascendant` : "",
        starsMoon: dp.starsMoon.length ? `${dp.starsMoon.map((s) => s.name).join(" and ")} on your Moon` : "",
        navamsa: nav ? `your ${nav.sign} navamsa` : ""
      } : {})
    };
    // The planetary face, feature by feature: the lords of the rising degree, the planets aspecting it and the
    // natures of the stars rising with it shape the frame and jaw (and a little the brow); the natures of the stars
    // with the Moon shape the eyes and the mouth.
    const deepBoost = { hair: {}, face: {}, brows: {}, eyes: {}, nose: {}, mouth: {} };
    const boost = (feat, planet, k) => { deepBoost[feat][planet] = (deepBoost[feat][planet] || 1) + k; };
    if (dp) {
      for (const p of [dp.bound, dp.face, dp.tripLord].filter(Boolean)) boost("face", p, 0.5);
      for (const a of dp.aspects) boost("face", a.planet, 0.5 * (1 - a.orb / 6));
      for (const [p, w] of starPlanets(dp.starsAsc)) { boost("face", p, 0.5 * w); boost("brows", p, 0.5 * w); }
      for (const [p, w] of starPlanets(dp.starsMoon)) { boost("eyes", p, 0.5 * w); boost("mouth", p, 0.5 * w); }
    }
    const out = FEATURES.map((f) => {
      const el = { Fire: 0, Air: 0, Water: 0, Earth: 0 };
      let tot = 0;
      const used = Object.entries(f.src).filter(([k]) => srcEl[k]);
      for (const [k, w] of used) tot += w;
      // Every feature rests on the temperament (55%); its own places in the chart shape the rest (45%).
      const own = used.filter(([k]) => k !== "temper"), ot = own.reduce((a, [, w]) => a + w, 0);
      const A = RULES[f.key].anchor;
      for (const [e, v] of Object.entries(temper.shares)) el[e] += (own.length ? A : 1) * v;
      for (const [k, w] of own) for (const [e, v] of Object.entries(srcEl[k])) el[e] += (1 - A) * (w / ot) * v;
      // Planetary: the base planetary weights, emphasised for this feature.
      const base = Object.fromEntries(pf.map((x) => [x.planet, x.share * (FEAT_PLANET[f.key][x.planet] || 1) * (deepBoost[f.key][x.planet] || 1)]));
      const bt = Object.values(base).reduce((a, b) => a + b, 0);
      const planets = Object.fromEntries(Object.entries(base).map(([k, v]) => [PLANET_ANGEL[k], v / bt]));
      const lead = used.slice().sort((a, b) => b[1] - a[1]).filter(([k]) => k !== "temper" && srcLabel[k]).slice(0, f.key === "face" ? 4 : 3).map(([k]) => srcLabel[k]);
      return { key: f.key, label: f.label, why: f.why, from: lead, elements: el, planets };
    });
    // What the drawing shows overall: each part weighted by roughly how much of the face it covers.
    // Each element is a group of two archangels (Ptolemy gives each planet its element's qualities): fire Michael
    // (Sun) and Khamael (Mars), air Raphael (Mercury) and Sachiel (Jupiter), water Gabriel (Moon) and Anael (Venus),
    // earth Uriel and Cassiel (Saturn). Within its element, each archangel's part follows its planet's strength in
    // the chart (Uriel, who has no planet, counts as an average planet). The element's own archangel leads.
    const pfShare = Object.fromEntries(pf.map((x) => [x.angel, x.share]));
    const split = {};
    for (const [el, pair] of Object.entries(ELEM_GROUP)) {
      const w = pair.map((a) => pfShare[a] ?? 1 / 7), t = w[0] + w[1];
      // The element's own archangel leads (60%); planet strength moves the split by up to 15 points either way.
      const a0 = Math.min(0.75, Math.max(0.45, 0.6 + 0.3 * (w[0] / t - 0.5)));
      split[el] = { [pair[0]]: a0, [pair[1]]: 1 - a0 };
    }
    // The zodiac angels (Agrippa, Golden Dawn) of the signs that shape each feature take 40% of it; the elemental
    // archangels the other 60%.
    // (nav: the rising navamsa, worked out above)
    const signOf = { sun: natal.sun.sign, moon: natal.moon.sign, venus: pl("Venus").sign, mars: pl("Mars").sign,
      asc: natal.timeKnown ? natal.asc.sign : null, ruler: natal.timeKnown ? pl(RULER[natal.asc.sign]).sign : null, navamsa: nav ? nav.sign : null,
      bound: dp ? pl(dp.bound).sign : null, decan: dp ? pl(dp.face).sign : null, trip: dp && dp.tripLord ? pl(dp.tripLord).sign : null };
    for (const x of out) {
      const ea = {};
      for (const [el, v] of Object.entries(x.elements)) for (const [a, k] of Object.entries(split[el])) ea[a] = (ea[a] || 0) + v * k;
      let src = Object.entries(SIGN_SRC[x.key]).filter(([k]) => signOf[k]);
      if (!src.length) src = [["sun", 1]];
      const st = src.reduce((a, [, w]) => a + w, 0), sa = {};
      for (const [k, w] of src) { const a = SIGN_ANGEL[signOf[k]]; sa[a] = (sa[a] || 0) + w / st; }
      x.signAngels = Object.entries(sa).map(([a, v]) => ({ angel: a, name: ANGEL_NAME[a], v, sign: Object.keys(SIGN_ANGEL).find((g) => SIGN_ANGEL[g] === a) }));
      x.angels = {};
      const S = RULES[x.key].signs;
      for (const [a, v] of Object.entries(ea)) x.angels[a] = (x.angels[a] || 0) + (1 - S) * v;
      for (const [a, v] of Object.entries(sa)) x.angels[a] = (x.angels[a] || 0) + S * v;
    }
    // The Shem ha-Mephorash angel of the rising degree (72 angels of 5° each from 0° Aries) shapes the structure
    // of the face: 30% of face shape and jaw, where the rising sign rules. Only when the birth time is known.
    const shem = shemOf(natal);
    // All the Shem angels blend (shemBlend): for the chart as a whole, and for each feature from the points the
    // tradition reads that feature from (the same points as its sign angels).
    const choir = shemBlend(natal, null, opts.name);
    const PT = { asc: "Ascendant", sun: "Sun", moon: "Moon", venus: "Venus", mars: "Mars", ruler: natal.timeKnown ? RULER[natal.asc.sign] : null };
    for (const x of out) {
      x.elemAngels = {}; x.signW = {};
      for (const [el, v] of Object.entries(x.elements)) for (const [a, k] of Object.entries(split[el])) x.elemAngels[a] = (x.elemAngels[a] || 0) + v * k;
      for (const sa of x.signAngels) x.signW[sa.angel] = sa.v;
      if (!choir) continue;
      const focus = {};
      for (const [k, w] of Object.entries(SIGN_SRC[x.key])) if (PT[k]) focus[PT[k]] = (focus[PT[k]] || 0) + w;
      const sb = shemBlend(natal, focus, opts.name);
      x.shemW = sb.weights; x.shemTop = sb.top.slice(0, 3);
    }
    if (choir) {
      // The main faces: the face shape and jaw take 30% from the Shem angels of the whole chart (those with at least
      // 1%; fainter ones cannot be seen at a third of one feature).
      const fx = out.find((x) => x.key === "face"); for (const a of Object.keys(fx.angels)) fx.angels[a] *= 0.7;
      const strong = Object.entries(choir.weights).filter(([, v]) => v >= 0.01), st = strong.reduce((a, [, v]) => a + v, 0);
      for (const [k, v] of strong) fx.angels[k] = 0.3 * v / st;
      fx.shem = shem;
    }
    // The average chart: the same rules with every element, planet, sign and Shem angel in equal shares. Each face
    // is drawn against its average-chart face and the difference strengthened (BlendFace), so what is distinctive
    // in a chart is not flattened by averaging many faces.
    {
      const ELEMS = ["Fire", "Air", "Water", "Earth"], uni = (keys) => Object.fromEntries(keys.map((k) => [k, 1 / keys.length]));
      const eaN = {};
      for (const el of ELEMS) { const [a0, a1] = ELEM_GROUP[el]; eaN[a0] = (eaN[a0] || 0) + 0.25 * 0.6; eaN[a1] = (eaN[a1] || 0) + 0.25 * 0.4; }
      const saN = uni(Object.values(SIGN_ANGEL)), have = typeof SHEM_HAVE !== "undefined" ? SHEM_HAVE : [];
      const shN = choir ? uni(have.map((n) => "shem" + String(n).padStart(2, "0"))) : null;
      for (const x of out) {
        const pb = Object.fromEntries(Object.keys(PLANET_ANGEL).map((pl) => [pl, FEAT_PLANET[x.key][pl] || 1])), pt = Object.values(pb).reduce((a, b) => a + b, 0);
        const planets = Object.fromEntries(Object.entries(pb).map(([pl, v]) => [PLANET_ANGEL[pl], v / pt]));
        const angels = {};
        for (const [a, v] of Object.entries(eaN)) angels[a] = (angels[a] || 0) + (1 - RULES[x.key].signs) * v;
        for (const [a, v] of Object.entries(saN)) angels[a] = (angels[a] || 0) + RULES[x.key].signs * v;
        if (shN && x.key === "face") { for (const a of Object.keys(angels)) angels[a] *= 0.7; for (const [a, v] of Object.entries(shN)) angels[a] = 0.3 * v; }
        const lnHave = typeof MANSION_HAVE !== "undefined" ? MANSION_HAVE : [], lnN = choir && lnHave.length ? uni(lnHave.map((n) => "mansion" + String(n).padStart(2, "0"))) : null;
        const adam = {}, orders = [archOrder(eaN, planets), saN, shN, lnN].filter(Boolean);
        for (const o of orders) for (const [k, v] of Object.entries(o)) adam[k] = (adam[k] || 0) + v / orders.length;
        x.neutral = { angels, planets, adam, shem: shN };
      }
    }
    const mansion = mansionOf(natal), mHave = typeof MANSION_HAVE !== "undefined" ? MANSION_HAVE : [];
    // The element portraits: the archangels' eyes and mouths are all drawn in one ideal style, but the twenty-eight
    // mansion angels were each drawn with their element's eyes and mouth (water full lips and sleepy lids, earth
    // deep-set eyes and a fuller lower lip, fire a wide, sharp mouth and almond eyes, air open eyes and a soft bow).
    // So in the eyes and the mouth, part of each elemental archangel's share (ELEMENT_PORTRAITS) goes to the mansion
    // angels of its element, equally, for the chart and for the average chart alike: each chart's elements then
    // show in the features the tradition gives them. The same rule for every chart.
    if (ELEMENT_PORTRAITS > 0) {
      // Every portrait of each element: its zodiac angels, the Shem angels of its signs, the angels of its mansions.
      const ex = { Fire: { lunar: [], all: [] }, Air: { lunar: [], all: [] }, Water: { lunar: [], all: [] }, Earth: { lunar: [], all: [] } };
      for (const n of mHave) { const k = "mansion" + String(n).padStart(2, "0"); ex[angelElement(k)].lunar.push(k); ex[angelElement(k)].all.push(k); }
      for (const n of (typeof SHEM_HAVE !== "undefined" ? SHEM_HAVE : [])) { const k = "shem" + String(n).padStart(2, "0"); ex[angelElement(k)].all.push(k); }
      for (const sg of SIGNS) ex[elOfSign(sg)].all.push(SIGN_ANGEL[sg]);
      // Each feature takes a part of its own (K) from the element portraits, divided by the feature's elements with
      // the predominant element leading (shares squared, as the tradition names a temperament by its predominant
      // quality). In the eyes and mouth the lunar angels lead, drawn element by element in exactly those features;
      // in the face shape, brow and nose every portrait of the element shares. Hair keeps its one leader. The
      // average chart gets the same part with the four elements equal.
      const PLAN = { eyes: [0.45, [["lunar", 0.75], ["all", 0.25]]], mouth: [0.45, [["lunar", 0.75], ["all", 0.25]]],
        face: [0.35, [["all", 1]]], brows: [0.35, [["all", 1]]], nose: [0.3, [["all", 0.75], ["lunar", 0.25]]] };
      const addPart = (o, shares, K, sets0) => {
        // A set with no portraits passes its share to the others (the shares always add up to 1).
        const st0 = sets0.filter(([set]) => ex.Fire[set].length), st = st0.reduce((a, [, f]) => a + f, 0);
        if (!st) return;
        const sets = st0.map(([set, f]) => [set, f / st]);
        for (const k of Object.keys(o)) o[k] *= 1 - K;
        for (const [el, sh] of Object.entries(shares)) for (const [set, frac] of sets) {
          const list = ex[el][set]; if (!list.length || !sh) continue;
          for (const k of list) o[k] = (o[k] || 0) + K * sh * frac / list.length;
        }
      };
      for (const x of out) {
        if (!PLAN[x.key]) continue;
        const [K0, sets] = PLAN[x.key], K = K0 * ELEMENT_PORTRAITS;
        if (!K) continue;
        const fe0 = featureElements(x), sq = Object.fromEntries(Object.entries(fe0).map(([e, v]) => [e, v * v])), t = Object.values(sq).reduce((a, b) => a + b, 0) || 1;
        addPart(x.angels, Object.fromEntries(Object.entries(sq).map(([e, v]) => [e, v / t])), K, sets);
        addPart(x.neutral.angels, { Fire: 0.25, Air: 0.25, Water: 0.25, Earth: 0.25 }, K, sets);
        x.elementPortraits = { K, shares: fe0 };
      }
    }
    // Lilly's faces: the portraits of the planets Lilly reads the body from take a part of every feature but the
    // hair (the hair keeps its one leader). They are already drawn as distinct people, so the average chart takes the
    // same part and it is shown as drawn, not strengthened further.
    const lilly = lillyFaces(natal), LK = { face: 0.3, brows: 0.25, eyes: 0.25, nose: 0.25, mouth: 0.25 };
    if (lilly.some((x) => x.drawn)) for (const x of out) {
      const K = LK[x.key]; if (!K) continue;
      for (const o of [x.angels, x.neutral.angels]) {
        for (const k of Object.keys(o)) o[k] *= 1 - K;
        for (const l of lilly) if (l.share) o[l.key] = (o[l.key] || 0) + K * l.share;
      }
    }
    // The angel of the Moon's mansion (the twenty-eight angels Agrippa names, as printed in Barrett's Magus): the
    // Moon rules the eyes and the expression and, with Venus, the mouth, so the angel of the mansion it stood in at
    // birth takes the Moon's own part of the eyes and of the mouth (as FEATURES reads them: 35% and 30%). It comes
    // last, after the element portraits and Lilly's faces, so that part is what the drawing really gets. Only with a
    // birth time: the Moon crosses a whole mansion in about a day.
    const MANSION_SHARE = Object.fromEntries(FEATURES.filter((f) => f.src.moon && (f.key === "eyes" || f.key === "mouth")).map((f) => [f.key, f.src.moon]));
    for (const x of out) {
      const k = MANSION_SHARE[x.key];
      if (!k) continue;
      if (mansion && mansion.drawn) { for (const a of Object.keys(x.angels)) x.angels[a] *= 1 - k; x.angels[mansion.key] = (x.angels[mansion.key] || 0) + k; x.mansion = mansion; }
      // The average chart: the Moon equally in every mansion.
      if (mansion && mansion.drawn && mHave.length) { const na = x.neutral.angels; for (const a of Object.keys(na)) na[a] *= 1 - k; for (const n of mHave) { const key = "mansion" + String(n).padStart(2, "0"); na[key] = (na[key] || 0) + k / mHave.length; } }
    }
    // The face of Adam: every angel at once. Each feature takes a quarter from each of the four orders: the
    // archangels (half by its elements, half by the planets: the same eight portraits, so one order, not two, or
    // they would take two fifths and draw the whole face, alike to the planetary face), the twelve angels of the
    // zodiac, the seventy-two angels of the Name and the twenty-eight angels of the Moon's mansions. Every angel of every order is in it: each
    // keeps an equal share (EQUAL), and the rest follows the chart, read from the places the tradition gives
    // each feature, as for the angels of the Name.
    for (const x of out) {
      const focus = {};
      for (const [k, w] of Object.entries(SIGN_SRC[x.key])) if (PT[k]) focus[PT[k]] = (focus[PT[k]] || 0) + w;
      x.zodiacW = choir ? zodiacBlend(natal, x.signW) : null;
      x.lunarW = choir ? mansionBlend(natal, focus) : null;
      const orders = [archOrder(x.elemAngels, x.planets), x.zodiacW || x.signW, x.shemW, x.lunarW].filter(Boolean);
      x.adam = {};
      for (const o of orders) for (const [k, v] of Object.entries(o)) x.adam[k] = (x.adam[k] || 0) + v / orders.length;
    }
    const AREA = { hair: 0.3, face: 0.3, brows: 0.1, eyes: 0.12, nose: 0.08, mouth: 0.1 };
    const drawn = { elements: {}, planets: {}, angels: {}, adam: {}, shem: {} };
    for (const x of out) for (const fld of ["elements", "planets", "angels", "adam"]) for (const [k, v] of Object.entries(x[fld])) drawn[fld][k] = (drawn[fld][k] || 0) + AREA[x.key] * v;
    if (choir) for (const x of out) for (const [k, v] of Object.entries(x.shemW)) drawn.shem[k] = (drawn.shem[k] || 0) + AREA[x.key] * v;
    return { features: out, temper, planetary: pf, drawn, split, shem, choir, mansion, lilly, name: opts.name ? nameLetters(opts.name) : null };
  }
  const SHEM = ["Vehuiah", "Jeliel", "Sitael", "Elemiah", "Mahasiah", "Lelahel", "Achaiah", "Cahetel", "Haziel", "Aladiah", "Lauviah I", "Hahaiah", "Iezalel", "Mebahel", "Hariel", "Hakamiah", "Lauviah II", "Caliel", "Leuviah", "Pahaliah", "Nelchael", "Ieiaiel", "Melahel", "Haheuiah", "Nith-Haiah", "Haaiah", "Jerathel", "Seheiah", "Reiiel", "Omael", "Lecabel", "Vasariah", "Iehuiah", "Lehahiah", "Chavakiah", "Menadel", "Aniel", "Haamiah", "Rehael", "Ieiazel", "Hahahel", "Mikael", "Veuliah", "Ielahiah", "Sealiah", "Ariel", "Asaliah", "Mihael", "Vehuel", "Daniel", "Hahasiah", "Imamiah", "Nanael", "Nithael", "Mebahiah", "Poiel", "Nemamiah", "Ieialel", "Harahel", "Mitzrael", "Umabel", "Iahhel", "Anauel", "Mehiel", "Damabiah", "Manakel", "Eiael", "Habuhiah", "Rochel", "Jabamiah", "Haiaiel", "Mumiah"];
  SHEM.forEach((nm, i) => (ANGEL_NAME["shem" + String(i + 1).padStart(2, "0")] = nm));
  // The Shem angel of a chart's rising degree: { n, key, name, sign, from, to, drawn (a face exists) }.
  function shemOf(natal) {
    if (!natal.timeKnown || !natal.asc) return null;
    const L = ((natal.asc.lon % 360) + 360) % 360, i = Math.floor(L / 5), key = "shem" + String(i + 1).padStart(2, "0");
    const have = typeof SHEM_HAVE !== "undefined" ? SHEM_HAVE : [];
    return { n: i + 1, key, name: SHEM[i], sign: SIGNS[Math.floor(i / 6)], from: (i % 6) * 5, to: (i % 6) * 5 + 5, deg: L % 30, drawn: have.includes(i + 1) };
  }
  // The 72 three-letter names, read from Exodus 14:19–21 (72 letters each): the first verse forward, the second
  // backward, the third forward, one letter from each (Rashi on Sukkah 45a). Checked against the Hebrew text.
  const SHEM_HE = ["והו", "ילי", "סיט", "עלם", "מהש", "ללה", "אכא", "כהת", "הזי", "אלד", "לאו", "ההע", "יזל", "מבה", "הרי", "הקם", "לאו", "כלי", "לוו", "פהל", "נלך", "ייי", "מלה", "חהו", "נתה", "האא", "ירת", "שאה", "ריי", "אום", "לכב", "ושר", "יחו", "להח", "כוק", "מנד", "אני", "חעם", "רהע", "ייז", "ההה", "מיך", "וול", "ילה", "סאל", "ערי", "עשל", "מיה", "והו", "דני", "החש", "עמם", "ננא", "נית", "מבה", "פוי", "נמם", "ייל", "הרח", "מצר", "ומב", "יהה", "ענו", "מחי", "דמב", "מנק", "איע", "חבו", "ראה", "יבם", "היי", "מום"];
  // Sefer Yetzirah: three mothers (elements), seven doubles (planets) and twelve simples (signs), the signs as printed
  // with Westcott's translation (1887), the doubles' planets as the Golden Dawn gives them (versions of the book differ).
  const LETTER = { "א": ["el", "Air"], "מ": ["el", "Water"], "ש": ["el", "Fire"],
    "ב": ["pl", "Mercury"], "ג": ["pl", "Moon"], "ד": ["pl", "Venus"], "כ": ["pl", "Jupiter"], "פ": ["pl", "Mars"], "ר": ["pl", "Sun"], "ת": ["pl", "Saturn"],
    "ה": ["sg", "Aries"], "ו": ["sg", "Taurus"], "ז": ["sg", "Gemini"], "ח": ["sg", "Cancer"], "ט": ["sg", "Leo"], "י": ["sg", "Virgo"],
    "ל": ["sg", "Libra"], "נ": ["sg", "Scorpio"], "ס": ["sg", "Sagittarius"], "ע": ["sg", "Capricorn"], "צ": ["sg", "Aquarius"], "ק": ["sg", "Pisces"] };
  const FINAL = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
  // The nine choirs, eight angels each from Vehuiah on (the French Kabbalah of Lenain, 1823), with the sephirah,
  // ruling prince and sphere Agrippa gives each order (De occulta philosophia III.10). The first two spheres are the
  // first mover and the fixed stars, not planets.
  const CHOIRS = [["Seraphim", "Kether", "Metatron", null], ["Cherubim", "Chokmah", "Raziel", null], ["Thrones", "Binah", "Tzaphkiel", "Saturn"],
    ["Dominions", "Chesed", "Tzadkiel", "Jupiter"], ["Powers", "Geburah", "Khamael", "Mars"], ["Virtues", "Tiphareth", "Raphael", "Sun"],
    ["Principalities", "Netzach", "Haniel", "Venus"], ["Archangels", "Hod", "Michael", "Mercury"], ["Angels", "Yesod", "Gabriel", "Moon"]];
  const CHALDEAN = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"]; // the decans' rulers from 0° Aries

  // Every Shem angel that has a face, weighted by the chart in four ways, as the tradition joins them:
  //   degree (50%)  each planet and angle lends weight to the angels around its degree (a bell curve 7.5° wide,
  //                 centred on each angel's five degrees: Agrippa's "quinaries"), the rising degree most, the
  //                 Sun and Moon next;
  //   letters (20%) the three letters of the angel's name, by the Sefer Yetzirah: a sign letter by how much of the
  //                 chart is in that sign, a planet letter by that planet's strength, a mother by the temperament;
  //   choir (15%)   the planet of the angel's choir (Agrippa's order of the spheres), by its strength in the chart;
  //   decan (15%)   the Chaldean ruler of the angel's decan, by its strength in the chart.
  // For one feature of the face, 35% of the degree half comes from the points that feature is read from.
  // Each part is shared out over the angels; then every angel keeps an equal share of a fifth of the whole, so all of
  // them are in it. Returns { weights: { shemNN: share }, top: [...] } with each angel's reasons.
  const EQUAL = 0.2; // every angel's equal share: all of them are in every face
  const CHOIR_W = { Ascendant: 3, Sun: 2, Moon: 2, Midheaven: 1, Mercury: 1, Venus: 1, Mars: 1, Jupiter: 1, Saturn: 1 };
  // focus (optional): { point: weight } for one feature of the face, e.g. the eyes { Moon: 0.7, Sun: 0.3 }. Then
  // the degree part is 70% from those points and 30% from the whole chart.
  // A name in Hebrew letters, after the usual English-Hebrew letter table (as in the Golden Dawn's): two-letter
  // sounds first (sh ש, th ת, ch ח, ph פ, ts/tz צ, ck כ, qu ק), then one letter each: a א, b ב, c כ (ס before e, i, y),
  // d ד, e ה, f פ, g ג, h ה, i י, j י, k כ, l ל, m מ, n נ, o ע, p פ, q ק, r ר, s ס, t ת, u ו, v ו, w ו, x כס, y י, z ז.
  // A name written in Hebrew is taken as it is. Returns { letters: [...], counts: { letter: n } }.
  const ONE = { a: "א", b: "ב", c: "כ", d: "ד", e: "ה", f: "פ", g: "ג", h: "ה", i: "י", j: "י", k: "כ", l: "ל", m: "מ", n: "נ", o: "ע", p: "פ", q: "ק", r: "ר", s: "ס", t: "ת", u: "ו", v: "ו", w: "ו", x: "כס", y: "י", z: "ז" };
  const TWO = { sh: "ש", th: "ת", ch: "ח", ph: "פ", ts: "צ", tz: "צ", ck: "כ", qu: "ק" };
  function nameLetters(name) {
    const t = String(name || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const letters = [];
    for (let i = 0; i < t.length; i++) {
      const ch = t[i], two = t.slice(i, i + 2);
      if (/[א-ת]/.test(ch)) { letters.push(FINAL[ch] || ch); continue; }
      if (TWO[two]) { letters.push(TWO[two]); i++; continue; }
      if (ch === "c" && /[eiy]/.test(t[i + 1] || "")) { letters.push("ס"); continue; }
      if (ONE[ch]) for (const h of ONE[ch]) letters.push(h);
    }
    const counts = {};
    for (const l of letters) counts[l] = (counts[l] || 0) + 1;
    return { letters, counts, text: letters.join("") };
  }
  function shemBlend(natal, focus, name) {
    const have = typeof SHEM_HAVE !== "undefined" ? SHEM_HAVE : [];
    if (!have.length) return null;
    const pts = natal.planets.filter((p) => CHOIR_W[p.key]).map((p) => [p.key, p.lon]);
    if (natal.timeKnown && natal.asc) { pts.push(["Ascendant", natal.asc.lon]); if (natal.mc) pts.push(["Midheaven", natal.mc.lon]); }
    const lonOf = Object.fromEntries(pts);
    const fpts = focus ? Object.entries(focus).filter(([k]) => lonOf[k] !== undefined).map(([k, w]) => [k, lonOf[k], w]) : [];
    // How much of the chart is in each sign; each planet's strength; the temperament. All scaled so 1 is average.
    const inSign = {}, ptsW = pts.reduce((a, [k]) => a + CHOIR_W[k], 0);
    for (const [k, lon] of pts) { const sg = SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)]; inSign[sg] = (inSign[sg] || 0) + CHOIR_W[k] / ptsW; }
    const plShare = Object.fromEntries(planetary(natal).map((x) => [x.planet, x.share]));
    const temper = temperament(natal).shares;
    const letterVal = ([kind, what]) => (kind === "sg" ? (inSign[what] || 0) * 12 : kind === "pl" ? (plShare[what] || 0) * 7 : (temper[what] || 0) * 4);
    const nm = name ? nameLetters(name) : null, parts = { degree: {}, focus: {}, letters: {}, choir: {}, decan: {}, name: {} }, info = {};
    if (nm && !nm.letters.length) nm.letters = null;
    for (const n of have) {
      const c = (n - 1) * 5 + 2.5;
      let w = 0; const by = [];
      for (const [k, lon] of pts) { const d = Math.abs(((lon - c + 540) % 360) - 180); w += CHOIR_W[k] * Math.exp(-0.5 * (d / 7.5) ** 2); if (d <= 2.5) by.push(k); }
      let fw = 0;
      for (const [, lon, wt] of fpts) { const d = Math.abs(((lon - c + 540) % 360) - 180); fw += wt * Math.exp(-0.5 * (d / 7.5) ** 2); }
      parts.focus[n] = fw;
      const he = SHEM_HE[n - 1], lets = [...he].map((ch) => LETTER[FINAL[ch] || ch]);
      const ch = CHOIRS[Math.floor((n - 1) / 8)], decan = CHALDEAN[Math.floor((n - 1) / 2) % 7];
      parts.degree[n] = w;
      parts.letters[n] = lets.reduce((a, l) => a + letterVal(l), 0) / 3;
      parts.choir[n] = ch[3] ? (plShare[ch[3]] || 0) * 7 : 1;
      parts.decan[n] = (plShare[decan] || 0) * 7;
      // The name: how many of the angel's three letters stand in your name (each letter a force of creation in the
      // Sefer Yetzirah); a small floor so an angel sharing none still counts.
      if (nm && nm.letters) parts.name[n] = 0.1 + [...he].reduce((a, c) => a + (nm.counts[FINAL[c] || c] || 0) / nm.letters.length, 0);
      info[n] = { shared: nm && nm.letters ? [...new Set([...he].map((c) => FINAL[c] || c).filter((c) => nm.counts[c]))] : [], by, he, lets: lets.map(([, what]) => what), choir: { name: ch[0], sephirah: ch[1], prince: ch[2], planet: ch[3] }, decan };
    }
    let MIX = fpts.length ? { focus: 0.35, degree: 0.15, letters: 0.2, choir: 0.15, decan: 0.15 } : { degree: 0.5, letters: 0.2, choir: 0.15, decan: 0.15 };
    // With a name, its letters take 15% and the rest share 85%.
    if (nm && nm.letters) MIX = { ...Object.fromEntries(Object.entries(MIX).map(([k, v]) => [k, v * 0.85])), name: 0.15 };
    const sums = Object.fromEntries(Object.keys(MIX).map((k) => [k, have.reduce((a, n) => a + parts[k][n], 0) || 1]));
    const weights = {}, top = [];
    for (const n of have) {
      const share = Object.fromEntries(Object.keys(MIX).map((k) => [k, parts[k][n] / sums[k]]));
      const v = (1 - EQUAL) * Object.keys(MIX).reduce((a, k) => a + MIX[k] * share[k], 0) + EQUAL / have.length;
      const key = "shem" + String(n).padStart(2, "0");
      weights[key] = v;
      // What lifts this angel most, as each part compares with an average angel's.
      const lift = Object.keys(MIX).map((k) => [k, share[k] * have.length]).sort((a, b) => b[1] - a[1]);
      top.push({ key, n, name: SHEM[n - 1], v, ...info[n], lift });
    }
    top.sort((a, b) => b.v - a.v);
    return { weights, top, mix: MIX };
  }
  // Masculine and feminine in the chart (Ptolemy, Tetrabiblos I.6 and I.12): fire and air signs are masculine,
  // earth and water feminine; the Sun, Mars, Jupiter and Saturn masculine, the Moon and Venus feminine, Mercury
  // common. The testimonies: the signs of the Ascendant, Sun and Moon (2 each), of the Ascendant's ruler (1) and of
  // the other planets (½ each), and the planets themselves by how strongly each shapes the body (2 in all).
  const PLANET_SEX = { Sun: 0, Mars: 0, Jupiter: 0, Saturn: 0, Moon: 1, Venus: 1, Mercury: 0.5 };
  function genderBalance(natal) {
    const fem = (sign) => (["Earth", "Water"].includes(elOfSign(sign)) ? 1 : 0);
    const pl = (k) => natal.planets.find((p) => p.key === k);
    const t = [["Sun", natal.sun.sign, 2], ["Moon", natal.moon.sign, 2]];
    if (natal.timeKnown) { t.unshift(["Ascendant", natal.asc.sign, 2]); t.push([`${RULER[natal.asc.sign]} (ruler of the Ascendant)`, pl(RULER[natal.asc.sign]).sign, 1]); }
    for (const k of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) t.push([k, pl(k).sign, 0.5]);
    const signs = t.map(([label, sign, w]) => ({ label, sign, w, f: fem(sign) }));
    const pf = planetary(natal), planets = pf.map((x) => ({ planet: x.planet, w: 2 * x.share, f: PLANET_SEX[x.planet] ?? 0.5 }));
    const tot = signs.reduce((a, x) => a + x.w, 0) + planets.reduce((a, x) => a + x.w, 0);
    const f = (signs.reduce((a, x) => a + x.w * x.f, 0) + planets.reduce((a, x) => a + x.w * x.f, 0)) / tot;
    return { feminine: f, masculine: 1 - f, signs, planets };
  }
  // How much of each set of faces the features take: a person's own sex leads, and the chart's other side adds a
  // little, at most OTHER_SEX (below). With no sex given,
  // the chart's balance alone. The hair and outline stay with the person's own sex (or the larger side).
  // How much the other side of a chart's masculine/feminine balance lends a person's features: at most OTHER_SEX.
  // The ancient chapters on appearance (Ptolemy III.11, Lilly) read the form from the rising sign, its ruler, the
  // planets rising and the Moon, never from the signs' gender, which speaks of temperament and character; so it
  // only lightly colours the features (a man with an all-feminine chart takes 15% from the women's portraits).
  const OTHER_SEX = 0.15;
  function sexMix(natal, sex) {
    const g = genderBalance(natal);
    if (sex === "m") return { m: 1 - OTHER_SEX * g.feminine, f: OTHER_SEX * g.feminine, outline: "m", balance: g };
    if (sex === "f") return { f: 1 - OTHER_SEX * g.masculine, m: OTHER_SEX * g.masculine, outline: "f", balance: g };
    return { m: g.masculine, f: g.feminine, outline: g.feminine > 0.5 ? "f" : "m", balance: g };
  }
  // The twenty-eight angels of the Moon's mansions, as Barrett prints them (The Magus, 1801, II p. 57) after Agrippa;
  // the fifth is spelt Gabiel, as in other copies, so it is not taken for the archangel.
  const MANSION_ANGELS = ["Geniel", "Enediel", "Anixiel", "Azariel", "Gabiel", "Dirachiel", "Scheliel", "Amnediel", "Barbiel", "Ardesiel", "Neciel", "Abdizuel", "Jazeriel", "Ergediel", "Atliel", "Azeruel", "Adriel", "Egibiel", "Amutiel", "Kyriel", "Bethnael", "Geliel", "Requiel", "Abrinael", "Agiel", "Tagriel", "Atheniel", "Amnixiel"];
  MANSION_ANGELS.forEach((nm, i) => (ANGEL_NAME["mansion" + String(i + 1).padStart(2, "0")] = nm));
  // The Moon's mansion at birth (28 equal mansions of 12°51′ from 0° Aries, as on the app's mansions page).
  // Where the chart's planets and angles stand, as shares of the twelve signs (CHOIR_W weights).
  function chartPoints(natal) {
    const pts = natal.planets.filter((p) => CHOIR_W[p.key]).map((p) => [p.key, p.lon]);
    if (natal.timeKnown && natal.asc) { pts.push(["Ascendant", natal.asc.lon]); if (natal.mc) pts.push(["Midheaven", natal.mc.lon]); }
    return pts;
  }
  // All twelve zodiac angels for one feature: 60% the angels of the signs the feature is read from (signW), 40% the
  // signs the whole chart stands in, then every angel's equal share.
  function zodiacBlend(natal, signW) {
    const pts = chartPoints(natal), tw = pts.reduce((a, [k]) => a + CHOIR_W[k], 0) || 1, inSign = {};
    for (const [k, lon] of pts) { const a = SIGN_ANGEL[SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)]]; inSign[a] = (inSign[a] || 0) + CHOIR_W[k] / tw; }
    const st = Object.values(signW || {}).reduce((a, b) => a + b, 0), out = {};
    for (const a of Object.values(SIGN_ANGEL)) out[a] = (1 - EQUAL) * (0.6 * (st ? (signW[a] || 0) / st : 1 / 12) + 0.4 * (inSign[a] || 0)) + EQUAL / 12;
    return out;
  }
  // All the angels of the Moon's mansions for one feature: the Moon's own mansion and its neighbours lead (the
  // mansions are the Moon's), then the mansions of the feature's own points (focus) and of the whole chart, closer
  // counting more, as for the angels of the Name; then every angel's equal share.
  function mansionBlend(natal, focus) {
    const have = typeof MANSION_HAVE !== "undefined" ? MANSION_HAVE : [];
    if (!have.length) return null;
    const pts = chartPoints(natal), lonOf = Object.fromEntries(pts), W = 360 / 28, sig = W * 0.67;
    const near = (lon, c) => { const d = Math.abs(((lon - c + 540) % 360) - 180); return Math.exp(-0.5 * (d / sig) ** 2); };
    const fpts = focus ? Object.entries(focus).filter(([k]) => lonOf[k] !== undefined) : [];
    const parts = { moon: {}, focus: {}, degree: {} };
    for (const n of have) {
      const c = (n - 0.5) * W;
      parts.moon[n] = near(natal.moon.lon, c);
      parts.focus[n] = fpts.reduce((a, [k, w]) => a + w * near(lonOf[k], c), 0);
      parts.degree[n] = pts.reduce((a, [k, lon]) => a + CHOIR_W[k] * near(lon, c), 0);
    }
    const MIX = fpts.length ? { moon: 0.4, focus: 0.3, degree: 0.3 } : { moon: 0.5, degree: 0.5 };
    const sums = Object.fromEntries(Object.keys(MIX).map((k) => [k, have.reduce((a, n) => a + parts[k][n], 0) || 1])), out = {};
    for (const n of have) out["mansion" + String(n).padStart(2, "0")] = (1 - EQUAL) * Object.keys(MIX).reduce((a, k) => a + MIX[k] * parts[k][n] / sums[k], 0) + EQUAL / have.length;
    return out;
  }
  // The eyes are drawn by the Moon's own angel. The Moon rules the eyes' look and expression, and the angel of the
  // mansion it stood in at birth is the one portrait of the Moon's exact place, so in the finished face it draws most
  // of the eyes (MOON_EYES); the Sun and the other portraits of the eyes keep the rest. Like Lilly's faces, it is
  // drawn as it is, not strengthened: the average chart takes the same angel for the same part (otherwise the
  // difference in its shading would be exaggerated into a pale or dark band across the eyes). Applied to a finished
  // face's regions (and its average chart's).
  const MOON_EYES = 0.7;
  function moonEyes(regions, neutral, fe) {
    const m = fe && fe.mansion; if (!m || !m.drawn || !regions || !regions.eyes) return;
    const put = (o, add) => {
      const t = Object.values(o).reduce((a, b) => a + b, 0) || 1;
      for (const k of Object.keys(o)) o[k] *= 1 - MOON_EYES;
      for (const [k, v] of Object.entries(add)) o[k] = (o[k] || 0) + MOON_EYES * t * v;
    };
    put(regions.eyes, { [m.key]: 1 });
    if (neutral && neutral.eyes) put(neutral.eyes, { [m.key]: 1 });
  }
  // The archangels as one order of Every angel at once: their elemental and planetary readings, half each.
  function archOrder(el, pl) {
    const os = [el, pl].filter(Boolean), o = {};
    for (const m of os) for (const [k, v] of Object.entries(m)) o[k] = (o[k] || 0) + v / os.length;
    return os.length ? o : null;
  }
  function mansionOf(natal) {
    if (!natal.timeKnown) return null;
    const L = ((natal.moon.lon % 360) + 360) % 360, i = Math.floor(L / (360 / 28)) % 28, key = "mansion" + String(i + 1).padStart(2, "0");
    const have = typeof MANSION_HAVE !== "undefined" ? MANSION_HAVE : [];
    return { n: i + 1, key, name: MANSION_ANGELS[i], into: L - i * (360 / 28), drawn: have.includes(i + 1) };
  }
  // ---------- your face now ----------
  // Ptolemy's seven ages of man (Tetrabiblos IV.10): each stage of life is ruled by a planet, in the order of
  // the spheres. [planet, from age, the stage].
  const AGES = [["Moon", 0, "infancy"], ["Mercury", 4, "childhood"], ["Venus", 14, "youth"], ["Sun", 22, "the prime of life"],
    ["Mars", 41, "maturity"], ["Jupiter", 56, "elder age"], ["Saturn", 68, "old age"]];
  const YEAR = 365.24219 * 864e5;
  // The chart as it stands at nowMs: the secondary progressed chart (a day after birth for each year of life,
  // its angles moving with the mean Sun), the ruler of the age of life, the lord of the year by annual
  // profection, and the Moon's mansion today. place: { lat, lon } of birth.
  function nowChart(natal, nowMs, place) {
    const age = Math.max(0, (nowMs - natal.utcMs) / YEAR);
    const hs = natal.houseSystem || "placidus", lat = place ? place.lat : 0, lon = place ? place.lon : 0;
    const prog = Astro.natal(natal.utcMs + age * 864e5, lat, lon, hs, natal.timeKnown);
    const stage = AGES.filter(([, from]) => age >= from).pop();
    const yearSign = natal.timeKnown ? SIGNS[(SIGNS.indexOf(natal.asc.sign) + Math.floor(age)) % 12] : null;
    const today = Astro.natal(nowMs, lat, lon, hs, false).moon.lon, ti = Math.floor((((today % 360) + 360) % 360) / (360 / 28)) % 28;
    const have = typeof MANSION_HAVE !== "undefined" ? MANSION_HAVE : [];
    return {
      age, prog, ageRuler: stage[0], stage: stage[2], yearSign, yearLord: yearSign ? RULER[yearSign] : null,
      todayMansion: { n: ti + 1, key: "mansion" + String(ti + 1).padStart(2, "0"), name: MANSION_ANGELS[ti], drawn: have.includes(ti + 1) }
    };
  }
  // Your face now: your birth face (60%), your progressed face (25%), the archangels of the ruler of your age of
  // life and of the lord of your year (5% each), and in the eyes and mouth, the expression of the day, the angel
  // of today's lunar mansion (5%; otherwise it goes to the birth face).
  function faceNow(natal, nowMs, place, opts = {}) {
    const nc = nowChart(natal, nowMs, place), birth = features(natal, opts), prog = features(nc.prog, opts);
    const SH = { birth: 0.6, prog: 0.25, age: 0.05, year: 0.05, today: 0.05 };
    const out = birth.features.map((x, i) => {
      const angels = {}, planets = {}, add = (o, k, v) => (o[k] = (o[k] || 0) + v);
      const todayHere = (x.key === "eyes" || x.key === "mouth") && nc.todayMansion.drawn;
      const wb = SH.birth + (todayHere ? 0 : SH.today) + (nc.yearLord ? 0 : SH.year);
      for (const [k, v] of Object.entries(x.angels)) add(angels, k, wb * v);
      for (const [k, v] of Object.entries(prog.features[i].angels)) add(angels, k, SH.prog * v);
      add(angels, PLANET_ANGEL[nc.ageRuler], SH.age);
      if (nc.yearLord) add(angels, PLANET_ANGEL[nc.yearLord], SH.year);
      if (todayHere) add(angels, nc.todayMansion.key, SH.today);
      for (const [k, v] of Object.entries(x.planets)) add(planets, k, wb * v);
      for (const [k, v] of Object.entries(prog.features[i].planets)) add(planets, k, SH.prog * v);
      add(planets, PLANET_ANGEL[nc.ageRuler], SH.age);
      if (nc.yearLord) add(planets, PLANET_ANGEL[nc.yearLord], SH.year);
      if (todayHere) add(planets, PLANET_ANGEL.Moon, SH.today);
      return { key: x.key, label: x.label, angels, planets, neutral: x.neutral };
    });
    const AREA = { hair: 0.3, face: 0.3, brows: 0.1, eyes: 0.12, nose: 0.08, mouth: 0.1 }, drawn = {};
    for (const x of out) for (const [k, v] of Object.entries(x.angels)) drawn[k] = (drawn[k] || 0) + AREA[x.key] * v;
    return { ...nc, features: out, drawn, birth, progFe: prog, shares: SH };
  }
  // The element portraits (below in features): every portrait drawn for an element represents it, not only its archangels.
  let ELEMENT_PORTRAITS = 1; // 0 turns the element portraits off (for comparison)
  // ---------- Lilly's faces ----------
  // William Lilly's description of the person a planet signifies in each sign (An Introduction to Astrology, ed.
  // Zadkiel 1852, pp. 180-190), body and face only, colouring and character left out. One portrait each.
  const LILLY_TEXT = {
    Saturn: ["a spare, raw-boned person, full-faced, with little beard", "a heavy, lumpish, awkward look, middle stature, not well made", "rather tall, with an oval face", "middle stature, rather short, a meagre face, languid eyes", "moderately large, broad round shoulders, a wide chest, large-boned, a surly look, sunken eyes, apt to stoop", "tall and spare, plentiful hair, a long head, a solid countenance", "above middle stature, an oval face, a large nose and forehead", "squat, thick-set, broad shoulders, short thick hair", "a large, well-made body", "lean and raw-boned, middle stature, small narrowed eyes, a long face, a stooping posture", "full-bodied, a large head and face, inclined to stoutness, middle stature, a sober bearing", "middle stature, a large head and a full eye, teeth sometimes uneven"],
    Jupiter: ["middle stature, rather lean, a quick and penetrating eye, a high nose, an oval face", "middle stature, stout and well-set, compact, rough curling hair", "a well-made, plump body above middle stature, full expressive eyes", "middle stature, an oval face, a plump body", "strong, well-proportioned and tall, curling hair, a full fiery eye, rather handsome", "full-statured, well built, handsome", "upright, tall and rather slender, an inviting face, a full eye, an oval face", "middle stature, stout and compact, coarse hair, a fleshy, full face", "tall and upright, an oval face, a full beard, hair receding early at the temples, a good eye, much expression", "small stature, a thin face, a little head, little beard, slight", "middle stature, well-set, rather stout and compact", "middle stature, a plump, fleshy body"],
    Mars: ["middle stature, well-set, large-boned, curling hair, an austere countenance", "middle stature, well-set, rather short, rough coarse hair, a broad face, a wide mouth, often a small mark on the face", "tall and well proportioned", "short, with little hair, the body ill-made", "rather tall and well-proportioned, an oval face, large eyes, a brisk, cheerful look", "middle-sized, well made, often a small mark on the face", "neatly made, rather tall, an oval face, soft hair, a somewhat delicate look", "well-set, middle stature, rather stout, curling hair, a broad, plain face", "tall, compact and well made, an oval face, a quick, penetrating eye", "small and thin, a little head, a thin face, lank hair", "well composed, rather stout, inclined to be tall", "short and fleshy"],
    Sun: ["a good stature, strong and well made, large eyes", "short and well-set, a large, broad face, a wide mouth, a large nose", "well-proportioned, above middle stature", "a small, irregular face", "strong, well-proportioned and portly, a full face, large, prominent staring eyes, often a mark on the face", "rather tall and slender, very well proportioned, plentiful hair", "upright, tall and slender, full eyes, an oval face", "remarkably square-built, full and fleshy, a broad face", "tall, handsome and well-proportioned, an oval face", "spare and thin, an oval face, soft hair, not curling", "middle stature, well made, a round, full face", "rather short, plump and fleshy, a round full face, very soft hair"],
    Venus: ["middle stature, rather tall and slender, a pensive look", "not tall but extremely well made, plump but not heavy, handsome", "above middle height, slender, upright and well made, soft hair", "short, fleshy, a round face", "reasonably tall, well composed, a round face, a full eye", "tall and well-proportioned, an oval face", "upright, tall and elegant, extremely well made, an oval, beautiful face with pleasing smiles and dimples, soft hair grown long", "short, stout and well-set, a broad face", "rather tall, well made, a fair oval face", "small, short, a thin face", "handsome and well formed, rather large", "middle stature, fleshy and plump, a round full face, a dimple in the chin"],
    Mercury: ["spare and thin, an oval face, curling hair", "middle-sized, thick-set, strong, short thick hair", "tall, upright and straight, well formed, a very intelligent look", "short, a thin, sharp face, small eyes, a sharp nose", "full and large, a round face, full eyes, a broad or high nose", "tall, slender, well-proportioned, a long face, an austere countenance", "tall and well made, not thin, smooth hair", "short and full, broad shoulders, curling hair", "tall, not heavy but large-boned and spare, an oval face, a large nose", "small, a thin face and figure", "middle height, rather fleshy, a full face, clear skin", "short and dumpy, a thin face"],
    Moon: ["middle stature, rather fleshy, a round face", "strong, well-set, rather short and stout", "tall, upright and comely", "middle stature, well proportioned and fleshy, a round, full face", "above middle size, strong and large-boned, large, prominent eyes, a full face", "rather tall, an oval face", "tall and well composed, smooth hair, a pleasant, cheerful countenance", "thick, short and heavy-set", "handsome and rather tall, an oval face, shining hair", "low stature, thin and slight, small features", "middle-sized, well made, rather stout, clear skin", "low stature but plump, a full, soft face, sleepy eyes"]
  };
  const LILLY_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
  const lillyKey = (planet, sign) => "lilly" + String(LILLY_ORDER.indexOf(planet) * 12 + SIGNS.indexOf(sign) + 1).padStart(2, "0");
  LILLY_ORDER.forEach((planet) => SIGNS.forEach((sign) => (ANGEL_NAME[lillyKey(planet, sign)] = `${planet === "Sun" || planet === "Moon" ? "the " + planet : planet} in ${sign}`)));
  // Lilly reads appearance from the lord of the Ascendant, any planet in the Ascendant, and the Moon. Returns the
  // portraits a chart calls up, with their shares: [{ key, planet, sign, role, w, text, drawn }].
  function lillyFaces(natal) {
    const have = typeof LILLY_HAVE !== "undefined" ? LILLY_HAVE : [];
    const pl = (k) => natal.planets.find((p) => p.key === k), out = [];
    const add = (planet, role, w) => {
      const sign = pl(planet).sign, key = lillyKey(planet, sign), prev = out.find((x) => x.key === key);
      if (prev) { prev.w += w; prev.role += " · " + role; return; }
      out.push({ key, planet, sign, role, w, text: LILLY_TEXT[planet][SIGNS.indexOf(sign)], drawn: have.includes(+key.slice(5)) });
    };
    if (natal.timeKnown) {
      add(RULER[natal.asc.sign], `lord of your ${natal.asc.sign} Ascendant`, 0.5);
      for (const planet of LILLY_ORDER) {
        const d = dist(pl(planet).lon, natal.asc.lon);
        if (d <= 8) add(planet, `rising with your Ascendant (${d.toFixed(1)}°)`, 0.4 * (1 - d / 10));
      }
    }
    add("Moon", "the Moon", natal.timeKnown ? 0.3 : 1);
    const drawn = out.filter((x) => x.drawn), t = drawn.reduce((a, x) => a + x.w, 0) || 1;
    for (const x of out) x.share = x.drawn ? x.w / t : 0;
    return out.sort((a, b) => b.share - a.share);
  }

  // ---------- the rules, and their calibration ----------
  // Two weights per feature that the tradition does not fix exactly: how much the temperament as a whole anchors
  // the feature against its own places in the chart (anchor, 55%), and how much the zodiac angels of its signs
  // take against the archangels of its elements (signs, 40%). Calibration may set them from observed people.
  const TRADITION = { anchor: 0.55, signs: 0.4 };
  const FEATURE_KEYS = ["hair", "face", "brows", "eyes", "nose", "mouth"];
  let RULES = Object.fromEntries(FEATURE_KEYS.map((k) => [k, { ...TRADITION }]));
  let CALIBRATED = null;
  function setCalibration(c) {
    CALIBRATED = c && c.rules ? c : null;
    RULES = Object.fromEntries(FEATURE_KEYS.map((k) => [k, { ...TRADITION, ...((CALIBRATED && CALIBRATED.rules[k]) || {}) }]));
  }
  const rules = () => ({ rules: RULES, calibrated: CALIBRATED, tradition: TRADITION });
  // Fit the rules to observations: [{ natal, feature, element }], each the real look of one feature of a person
  // with an exact birth time. For each feature, every pair of weights on a grid is tried; a pair replaces the
  // tradition's only when at least three different people were observed for that feature and it ranks the observed
  // look first for more of them (ties broken by the average share the observed element gets). Returns per feature
  // { n, before, after, rules } (before/after: how many observations the drawn face got right).
  function calibrate(obs) {
    const keep = setCalibration, saved = CALIBRATED;
    const ANCHORS = [0.35, 0.45, 0.55, 0.65, 0.75], SIGNS = [0.2, 0.3, 0.4, 0.5, 0.6];
    const out = {};
    for (const f of FEATURE_KEYS) {
      const list = obs.filter((o) => o.feature === f);
      const people = new Set(list.map((o) => o.id)).size;
      const evalWith = (r) => {
        setCalibration({ rules: { [f]: r } });
        let hits = 0, share = 0;
        for (const o of list) {
          const e = featureElements(features(o.natal, o.opts || {}).features.find((x) => x.key === f));
          if (Object.entries(e).sort((a, b) => b[1] - a[1])[0][0] === o.element) hits++;
          share += e[o.element];
        }
        return { hits, share: list.length ? share / list.length : 0 };
      };
      const base = evalWith(TRADITION);
      let best = { r: { ...TRADITION }, ...base };
      if (people >= 3) for (const a of ANCHORS) for (const s of SIGNS) {
        const v = evalWith({ anchor: a, signs: s });
        if (v.hits > best.hits || (v.hits === best.hits && v.share > best.share + 0.005)) best = { r: { anchor: a, signs: s }, ...v };
      }
      out[f] = { n: list.length, people, before: base.hits, after: best.hits, shareBefore: base.share, shareAfter: best.share, rules: best.hits > base.hits ? best.r : null };
    }
    keep(saved);
    return out;
  }

  // ---------- each feature in the four elements ----------
  // What each element gives each part of the face, after the classical temperaments (fire choleric, air sanguine,
  // water phlegmatic, earth melancholic) as Galenic medicine and the astrologers describe them. No colouring words.
  const FEATURE_LOOK = {
    hair: { Fire: "thick, springy hair, often curling", Air: "fine, abundant, softly waving hair", Water: "soft, smooth, fine hair", Earth: "dense, straight, heavy hair" },
    face: { Fire: "an angular, strong-boned face with high cheekbones", Air: "a balanced oval with fine bones", Water: "a round, soft face with full cheeks", Earth: "a long, lean face with a firm, squared jaw" },
    brows: { Fire: "strong, arched brows set close above the eyes", Air: "fine, even, open brows", Water: "soft, light, gently curved brows", Earth: "heavy, straight, low brows" },
    eyes: { Fire: "bright, almond-shaped, direct eyes", Air: "open, wide-set, lively eyes", Water: "large, gentle eyes under heavy, sleepy lids", Earth: "deep-set, steady eyes under heavy lids" },
    nose: { Fire: "a prominent nose, straight or slightly hooked", Air: "a fine, straight nose of medium length", Water: "a short, soft nose with a rounded tip", Earth: "a long, straight nose with a narrow bridge" },
    mouth: { Fire: "a wide mouth with sharply defined lips", Air: "medium lips with a soft bow", Water: "full, soft lips with a pronounced bow", Earth: "firm lips, the lower fuller than the upper" }
  };
  // The element of every angel in the faces: the archangels by their element, the zodiac angels by their sign, the
  // Shem angels by the sign their five degrees lie in, the mansion angels by the sign at the middle of their mansion.
  // The portrait the hair and outline come from. Galen reads the hair from the temperament as a whole, so it comes
  // from the temperament's leading element: the strongest portrait of that element in the hair's mix (one of the
  // person's own sex when ok(k) says so). Without that rule the rising sign's angel, which alone takes a fifth of
  // the hair, would lead even when the temperament leans elsewhere (an earth angel's hair on an air chart).
  function hairLeader(fe, ok = () => true) {
    const x = fe.features.find((f) => f.key === "hair");
    const rank = Object.entries(x.angels).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const lead = Object.entries(x.elements).sort((a, b) => b[1] - a[1])[0][0];
    return rank.find((k) => angelElement(k) === lead && ok(k)) || rank.find((k) => ok(k)) || rank[0];
  }
  function angelElement(k) {
    for (const [el, pair] of Object.entries(ELEM_GROUP)) if (pair.includes(k)) return el;
    const sg = Object.keys(SIGN_ANGEL).find((s) => SIGN_ANGEL[s] === k);
    if (sg) return elOfSign(sg);
    let m = /^shem(\d\d)$/.exec(k);
    if (m) return elOfSign(SIGNS[Math.floor((+m[1] - 1) / 6)]);
    m = /^mansion(\d\d)$/.exec(k);
    if (m) return elOfSign(SIGNS[Math.floor(((+m[1] - 0.5) * 360 / 28) / 30)]);
    m = /^lilly(\d\d)$/.exec(k);
    if (m) return elOfSign(SIGNS[(+m[1] - 1) % 12]);
    return null;
  }
  // How a feature's angels divide among the elements: { Fire, Air, Water, Earth }, summing to 1.
  function featureElements(x) {
    const o = { Fire: 0, Air: 0, Water: 0, Earth: 0 };
    let t = 0;
    for (const [k, v] of Object.entries(x.angels)) { const e = angelElement(k); if (e) { o[e] += v; t += v; } }
    if (t) for (const e of Object.keys(o)) o[e] /= t;
    return o;
  }
  // Rectification by appearance, the old way of correcting an uncertain birth time: every birth time within
  // `minutes` of the recorded one (minute by minute, same place) is cast, and those whose chart gives this feature
  // more of the element its owner recognises are returned, the strongest first and, among equals, the nearest.
  // Returns { base, results: [{ m, score, asc }] } (m: minutes from the recorded time).
  async function rectify(natal, place, feature, element, minutes, opts = {}, onProgress) {
    const hs = natal.houseSystem || "placidus", lat = place ? place.lat : 0, lon = place ? place.lon : 0;
    const score = (n) => featureElements(features(n, opts).features.find((x) => x.key === feature))[element];
    const base = score(natal), all = [];
    for (let m = -minutes; m <= minutes; m++) {
      if (!m) continue;
      const n = Astro.natal(natal.utcMs + m * 60000, lat, lon, hs, true);
      all.push({ m, score: score(n), asc: n.asc });
      if (m % 8 === 0) { if (onProgress) onProgress((m + minutes) / (2 * minutes)); await new Promise((r) => setTimeout(r, 0)); }
    }
    const r2 = (x) => Math.round(x * 200); // half-percent steps: among times that fit equally well, the nearest first
    const better = all.filter((x) => x.score > base + 0.01).sort((a, b) => r2(b.score) - r2(a.score) || Math.abs(a.m) - Math.abs(b.m));
    const picks = [];
    for (const x of better) { if (picks.every((p) => Math.abs(p.m - x.m) >= 4)) picks.push(x); if (picks.length === 3) break; }
    return { base, results: picks, searched: all.length };
  }
  const ELEM_ANGEL = { Fire: "Michael", Air: "Raphael", Water: "Gabriel", Earth: "Uriel" };
  const SIGN_ANGEL = { Aries: "malchidiel", Taurus: "asmodel", Gemini: "ambriel", Cancer: "muriel", Leo: "verchiel", Virgo: "hamaliel",
    Libra: "zuriel", Scorpio: "barbiel", Sagittarius: "adnachiel", Capricorn: "hanael", Aquarius: "cambiel", Pisces: "barchiel" };
  const SIGN_SRC = { hair: { asc: 0.5, sun: 0.25, moon: 0.25 }, face: { asc: 0.3, ruler: 0.25, moon: 0.15, navamsa: 0.1, bound: 0.07, decan: 0.07, trip: 0.06 }, brows: { mars: 0.5, sun: 0.5 },
    eyes: { moon: 0.7, sun: 0.3 }, nose: { venus: 0.6, sun: 0.4 }, mouth: { moon: 0.6, venus: 0.4 } };
  const ELEM_GROUP = { Fire: ["michael", "khamael"], Air: ["raphael", "sachiel"], Water: ["gabriel", "anael"], Earth: ["uriel", "cassiel"] };

  return { ARCH, PLANET, RULER, SIGNS, read, temperament, ptolemy, TEMPER, melothesia, metoposcopy, MIAN, planetary, PLANET_ANGEL, ANGEL_NAME, features, ELEM_ANGEL, ELEM_GROUP, SIGN_ANGEL, SHEM, SHEM_HE, CHOIRS, shemOf, shemBlend, genderBalance, sexMix, nameLetters, MANSION_ANGELS, mansionOf, deeper, navamsaOf, starsOn, STARS_J2000, AGES, nowChart, faceNow, FEATURE_LOOK, angelElement, featureElements, rectify, setCalibration, rules, calibrate, TRADITION, LILLY_TEXT, LILLY_ORDER, lillyKey, lillyFaces, hairLeader, moonEyes, MOON_EYES, OTHER_SEX, setElementPortraits: (v) => (ELEMENT_PORTRAITS = v) };
})();
