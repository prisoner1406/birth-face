// Human Design: ephemeris (astronomy-engine), gates, centers, type, authority, variables, transits,
// relationship (connection) charts and BodyGraph SVG.
const HD = (() => {
  const Ast = window.Astronomy;

  // Gate order around the Rave Mandala, starting with gate 41 at 302° tropical (2° Aquarius).
  const GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
  const GATE_START = 302;

  const GATE_NAMES = { 1: "Self-Expression", 2: "Direction of the Self", 3: "Ordering", 4: "Formulization", 5: "Fixed Rhythms", 6: "Friction", 7: "The Role of the Self", 8: "Contribution", 9: "Focus", 10: "Behavior of the Self", 11: "Ideas", 12: "Caution", 13: "The Listener", 14: "Power Skills", 15: "Extremes", 16: "Skills", 17: "Opinions", 18: "Correction", 19: "Wanting", 20: "The Now", 21: "The Hunter", 22: "Openness", 23: "Assimilation", 24: "Rationalization", 25: "Spirit of the Self", 26: "The Egoist", 27: "Caring", 28: "The Game Player", 29: "Saying Yes", 30: "Feelings", 31: "Influence", 32: "Continuity", 33: "Privacy", 34: "Power", 35: "Change", 36: "Crisis", 37: "Friendship", 38: "The Fighter", 39: "Provocation", 40: "Aloneness", 41: "Contraction", 42: "Growth", 43: "Insight", 44: "Alertness", 45: "The Gatherer", 46: "Determination of the Self", 47: "Realization", 48: "Depth", 49: "Principles", 50: "Values", 51: "Shock", 52: "Stillness", 53: "Beginnings", 54: "Ambition", 55: "Spirit", 56: "Stimulation", 57: "Intuitive Clarity", 58: "Vitality", 59: "Sexuality", 60: "Acceptance", 61: "Mystery", 62: "Details", 63: "Doubt", 64: "Confusion" };

  const CENTERS = {
    Head: { label: "Head", gates: [64, 61, 63], motor: false },
    Ajna: { label: "Ajna", gates: [47, 24, 4, 17, 43, 11], motor: false },
    Throat: { label: "Throat", gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16], motor: false },
    G: { label: "G Center", gates: [1, 13, 25, 46, 2, 15, 10, 7], motor: false },
    Heart: { label: "Heart (Ego)", gates: [21, 40, 26, 51], motor: true },
    Sacral: { label: "Sacral", gates: [34, 5, 14, 29, 59, 9, 3, 42, 27], motor: true },
    Spleen: { label: "Spleen", gates: [48, 57, 44, 50, 32, 28, 18], motor: false },
    SolarPlexus: { label: "Solar Plexus", gates: [36, 22, 37, 6, 49, 55, 30], motor: true },
    Root: { label: "Root", gates: [53, 60, 52, 19, 39, 41, 58, 38, 54], motor: true }
  };
  const GATE_CENTER = {};
  for (const [c, def] of Object.entries(CENTERS)) def.gates.forEach((g) => (GATE_CENTER[g] = c));

  const CHANNELS = [
    [1, 8, "Inspiration"], [2, 14, "The Beat"], [3, 60, "Mutation"], [4, 63, "Logic"], [5, 15, "Rhythm"],
    [6, 59, "Intimacy"], [7, 31, "The Alpha"], [9, 52, "Concentration"], [10, 20, "Awakening"], [10, 34, "Exploration"],
    [10, 57, "Perfected Form"], [11, 56, "Curiosity"], [12, 22, "Openness"], [13, 33, "The Prodigal"], [16, 48, "The Wavelength"],
    [17, 62, "Acceptance"], [18, 58, "Judgment"], [19, 49, "Synthesis"], [20, 34, "Charisma"], [20, 57, "The Brainwave"],
    [21, 45, "Money"], [23, 43, "Structuring"], [24, 61, "Awareness"], [25, 51, "Initiation"], [26, 44, "Surrender"],
    [27, 50, "Preservation"], [28, 38, "Struggle"], [29, 46, "Discovery"], [30, 41, "Recognition"], [32, 54, "Transformation"],
    [34, 57, "Power"], [35, 36, "Transitoriness"], [37, 40, "Community"], [39, 55, "Emoting"], [42, 53, "Maturation"],
    [47, 64, "Abstraction"]
  ];

  const BODIES = [
    { key: "Sun", sym: "☉" }, { key: "Earth", sym: "⊕" }, { key: "Moon", sym: "☽" },
    { key: "NorthNode", sym: "☊", label: "North Node" }, { key: "SouthNode", sym: "☋", label: "South Node" },
    { key: "Mercury", sym: "☿" }, { key: "Venus", sym: "♀" }, { key: "Mars", sym: "♂" }, { key: "Jupiter", sym: "♃" },
    { key: "Saturn", sym: "♄" }, { key: "Uranus", sym: "♅" }, { key: "Neptune", sym: "♆" }, { key: "Pluto", sym: "♇" }
  ];

  const norm = (x) => ((x % 360) + 360) % 360;
  const deg = (rad) => (rad * 180) / Math.PI;

  // True (osculating) lunar node from the Moon's position and velocity in the ecliptic of date.
  function trueNode(t) {
    const cart = (s) => {
      const lo = (s.lon * Math.PI) / 180, la = (s.lat * Math.PI) / 180;
      return [s.dist * Math.cos(la) * Math.cos(lo), s.dist * Math.cos(la) * Math.sin(lo), s.dist * Math.sin(la)];
    };
    const dt = 1 / 24;
    const r0 = cart(Ast.EclipticGeoMoon(t));
    const r1 = cart(Ast.EclipticGeoMoon(t.AddDays(-dt)));
    const r2 = cart(Ast.EclipticGeoMoon(t.AddDays(dt)));
    const v = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
    const hx = r0[1] * v[2] - r0[2] * v[1];
    const hy = r0[2] * v[0] - r0[0] * v[2];
    return norm(deg(Math.atan2(hx, -hy)));
  }

  function longitudes(t) {
    const out = {};
    out.Sun = Ast.SunPosition(t).elon;
    out.Earth = norm(out.Sun + 180);
    // Light-time: the Moon is seen where it stood about 1.3 s earlier (as in JPL Horizons' apparent positions).
    out.Moon = Ast.EclipticGeoMoon(t.AddDays(-Ast.EclipticGeoMoon(t).dist * 499.00478384 / 86400)).lon;
    out.NorthNode = trueNode(t);
    out.SouthNode = norm(out.NorthNode + 180);
    for (const b of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]) {
      out[b] = Ast.Ecliptic(Ast.GeoVector(Ast.Body[b], t, true)).elon;
    }
    return out;
  }

  // Gate → line → color → tone subdivision of a longitude.
  function gateOf(lon) {
    const x = norm(lon - GATE_START);
    const idx = Math.floor(x / 5.625);
    const within = x - idx * 5.625;
    const line = Math.min(6, Math.floor(within / 0.9375) + 1);
    const inLine = within - (line - 1) * 0.9375;
    const color = Math.min(6, Math.floor(inLine / 0.15625) + 1);
    const inColor = inLine - (color - 1) * 0.15625;
    const tone = Math.min(6, Math.floor(inColor / (0.15625 / 6)) + 1);
    return { gate: GATE_ORDER[idx], line, color, tone, lon };
  }

  function activations(t) {
    const lons = longitudes(t);
    const res = {};
    for (const b of BODIES) res[b.key] = gateOf(lons[b.key]);
    return res;
  }

  // Design moment: when the Sun stood exactly 88° of arc earlier (≈ 88–89 days before birth).
  function designTime(birthT) {
    const target = norm(Ast.SunPosition(birthT).elon - 88);
    return Ast.SearchSunLongitude(target, birthT.AddDays(-100), 20);
  }

  const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const signOf = (lon) => SIGNS[Math.floor(norm(lon) / 30)];
  const zodiac = (lon) => {
    const s = Math.floor(lon / 30), d = lon - s * 30;
    return `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, "0")}′ ${SIGNS[s]}`;
  };

  const PROFILE_NAMES = { 1: "Investigator", 2: "Hermit", 3: "Martyr", 4: "Opportunist", 5: "Heretic", 6: "Role Model" };

  const TYPE_INFO = {
    "Generator": { strategy: "To Respond", signature: "Satisfaction", notSelf: "Frustration", share: "≈ 37%",
      about: "The life force of the world. Your Sacral is a renewable engine: when you wait for something to respond to and follow the gut 'uh-huh', work becomes deeply satisfying." },
    "Manifesting Generator": { strategy: "To Respond, then Inform", signature: "Satisfaction", notSelf: "Frustration & Anger", share: "≈ 33%",
      about: "A fast, multi-passionate builder. You have Sacral power wired to the Throat, so once you respond you can move quickly, skip steps and juggle several paths. Tell people before you change direction." },
    "Manifestor": { strategy: "To Inform", signature: "Peace", notSelf: "Anger", share: "≈ 8%",
      about: "The initiator. You do not need to wait for anything to start. Informing the people affected before you act removes resistance and keeps your path clear." },
    "Projector": { strategy: "Wait for the Invitation", signature: "Success", notSelf: "Bitterness", share: "≈ 21%",
      about: "The guide. You see others deeply and are designed to direct energy, not to generate it. Your gifts land when you are recognised and invited in the big things: work, love, home." },
    "Reflector": { strategy: "Wait a Lunar Cycle", signature: "Surprise", notSelf: "Disappointment", share: "≈ 1%",
      about: "The mirror of the community. With every center open, you sample everyone around you. Give big decisions about 28 days so you can feel them through every phase of the Moon." }
  };

  const AUTHORITY_INFO = {
    "Emotional": "Your clarity comes in waves. Never decide in the high or the low: sleep on it, and wait until the feeling settles into a calm 'yes'.",
    "Sacral": "Your gut answers in the moment with a sound or a pull: 'uh-huh' or 'uhn-uhn'. Let people ask you yes/no questions and trust the first bodily response.",
    "Splenic": "A quiet, one-time instinct in the now. It speaks once and softly, about safety and health. If it feels off, it is off.",
    "Ego Manifested": "Ask: what do I want, and do I have the willpower for it? Speak your desires out loud and listen to what you hear yourself commit to.",
    "Ego Projected": "Your heart knows. Decide by what you truly want for yourself, said out loud to someone you trust, and listen for the 'I'.",
    "Self-Projected": "Talk it out. Your truth becomes clear as you hear your own voice describe what feels like you and what direction is right.",
    "Mental (Environmental)": "No inner authority: your clarity comes from the right places and people. Talk things through with trusted sounding boards and notice how the environment feels.",
    "Lunar": "Watch your feelings about a decision over a full Moon cycle (about 28 days). Clarity comes from the pattern, not from a single moment."
  };

  // Right Angle Cross names, grouped in families of four Sun gates.
  const RAX = { Sphinx: [1, 2, 7, 13], Laws: [3, 50, 60, 56], Explanation: [4, 49, 23, 43], Consciousness: [5, 35, 64, 63], Eden: [6, 36, 12, 11],
    Contagion: [8, 14, 30, 29], Planning: [9, 16, 40, 37], "the Vessel of Love": [10, 15, 25, 46], Service: [17, 18, 58, 52], "the Four Ways": [19, 33, 44, 24],
    "the Sleeping Phoenix": [20, 34, 55, 59], Tension: [21, 48, 38, 39], Rulership: [22, 47, 26, 45], "the Unexpected": [27, 28, 31, 41], Maya: [32, 42, 62, 61], Penetration: [51, 57, 53, 54] };
  const RAX_BY_GATE = {};
  for (const [n, gs] of Object.entries(RAX)) gs.forEach((g) => (RAX_BY_GATE[g] = n));

  // Left Angle Cross names (each name is shared by a pair of Sun gates).
  const LAX = { Defiance: [1, 2], Wishes: [3, 50], Revolution: [4, 49], Separation: [5, 35], "the Plane": [6, 36], Masks: [7, 13], Uncertainty: [8, 14], Identification: [9, 16],
    Prevention: [10, 15], Education: [11, 12], Upheaval: [17, 18], Refinement: [19, 33], Duality: [20, 34], Endeavour: [21, 48], Informing: [22, 47], Dedication: [23, 43],
    Incarnation: [24, 44], Healing: [25, 46], Confrontation: [26, 45], Alignment: [27, 28], Industry: [29, 30], "the Alpha": [31, 41], Limitation: [32, 42], Migration: [37, 40],
    Individualism: [38, 39], "the Clarion": [51, 57], Demands: [52, 58], Cycles: [53, 54], Spirit: [55, 59], Distraction: [56, 60], Obscuration: [61, 62], Dominion: [63, 64] };
  const LAX_BY_GATE = {};
  for (const [n, gs] of Object.entries(LAX)) gs.forEach((g) => (LAX_BY_GATE[g] = n));
  // Juxtaposition Cross names, one per Sun gate.
  const JXC = { 1: "Self-Expression", 2: "the Driver", 3: "Mutation", 4: "Formulization", 5: "Habits", 6: "Conflict", 7: "Interaction", 8: "Contribution", 9: "Focus", 10: "Behavior",
    11: "Ideas", 12: "Articulation", 13: "Listening", 14: "Empowering", 15: "Extremes", 16: "Experimentation", 17: "Opinions", 18: "Correction", 19: "Need", 20: "the Now",
    21: "Control", 22: "Grace", 23: "Assimilation", 24: "Rationalization", 25: "Innocence", 26: "the Trickster", 27: "Caring", 28: "Risks", 29: "Commitment", 30: "Fates",
    31: "Influence", 32: "Conservation", 33: "Retreat", 34: "Power", 35: "Experience", 36: "Crisis", 37: "Bargains", 38: "Opposition", 39: "Provocation", 40: "Denial",
    41: "Fantasy", 42: "Completion", 43: "Insight", 44: "Alertness", 45: "Possession", 46: "Serendipity", 47: "Oppression", 48: "Depth", 49: "Principles", 50: "Values",
    51: "Shock", 52: "Stillness", 53: "Beginnings", 54: "Ambition", 55: "Moods", 56: "Stimulation", 57: "Intuition", 58: "Vitality", 59: "Strategy", 60: "Limitation",
    61: "Thinking", 62: "Detail", 63: "Doubts", 64: "Confusion" };

  // Build gate activation map: gate -> {p, d, t, a, b, ...} flags.
  function addActs(map, acts, flag) {
    Object.values(acts).forEach(({ gate }) => {
      const a = map.get(gate) || {};
      a[flag] = true;
      map.set(gate, a);
    });
    return map;
  }

  // Channels, defined centers, type and authority from any activation map.
  function structure(active) {
    const channels = CHANNELS.filter(([a, b]) => active.has(a) && active.has(b))
      .map(([a, b, name]) => ({ a, b, name, key: `${a}-${b}`, from: GATE_CENTER[a], to: GATE_CENTER[b] }));
    const defined = new Set();
    channels.forEach((c) => { defined.add(c.from); defined.add(c.to); });

    const adj = {};
    Object.keys(CENTERS).forEach((c) => (adj[c] = new Set()));
    channels.forEach((c) => { adj[c.from].add(c.to); adj[c.to].add(c.from); });
    const reach = (start) => {
      const seen = new Set([start]); const q = [start];
      while (q.length) { const n = q.shift(); adj[n].forEach((m) => { if (!seen.has(m)) { seen.add(m); q.push(m); } }); }
      return seen;
    };
    const throatReach = defined.has("Throat") ? reach("Throat") : new Set();
    const motorToThroat = ["Heart", "Sacral", "SolarPlexus", "Root"].some((m) => throatReach.has(m));

    let type;
    if (defined.size === 0) type = "Reflector";
    else if (defined.has("Sacral")) type = motorToThroat ? "Manifesting Generator" : "Generator";
    else if (motorToThroat) type = "Manifestor";
    else type = "Projector";

    let authority;
    if (type === "Reflector") authority = "Lunar";
    else if (defined.has("SolarPlexus")) authority = "Emotional";
    else if (defined.has("Sacral")) authority = "Sacral";
    else if (defined.has("Spleen")) authority = "Splenic";
    else if (defined.has("Heart")) authority = adj.Heart.has("Throat") || type === "Manifestor" ? "Ego Manifested" : "Ego Projected";
    else if (defined.has("G") && throatReach.has("G")) authority = "Self-Projected";
    else authority = "Mental (Environmental)";

    const seen = new Set(); let groups = 0;
    defined.forEach((c) => { if (!seen.has(c)) { groups++; reach(c).forEach((x) => seen.add(x)); } });
    const definition = ["No Definition", "Single Definition", "Split Definition", "Triple Split Definition", "Quadruple Split Definition"][groups] || `${groups} groups`;

    return { channels, defined, type, authority, definition, groups };
  }

  const arrow = (a) => (a.tone <= 3 ? "left" : "right");
  function variables(pers, des) {
    return {
      determination: { color: des.Sun.color, tone: des.Sun.tone, arrow: arrow(des.Sun) },
      environment: { color: des.NorthNode.color, tone: des.NorthNode.tone, arrow: arrow(des.NorthNode) },
      motivation: { color: pers.Sun.color, tone: pers.Sun.tone, arrow: arrow(pers.Sun) },
      perspective: { color: pers.NorthNode.color, tone: pers.NorthNode.tone, arrow: arrow(pers.NorthNode) }
    };
  }

  function chart(utcMs) {
    const t = Ast.MakeTime(new Date(utcMs));
    const dt = designTime(t);
    const pers = activations(t);
    const des = activations(dt);
    const active = addActs(addActs(new Map(), pers, "p"), des, "d");
    const s = structure(active);
    const pl = pers.Sun.line, dl = des.Sun.line;
    const angle = pl === 4 && dl === 1 ? "Juxtaposition Cross" : pl >= 5 ? "Left Angle Cross" : "Right Angle Cross";
    const crossGates = `${pers.Sun.gate}/${pers.Earth.gate} | ${des.Sun.gate}/${des.Earth.gate}`;
    const sg = pers.Sun.gate;
    const crossName = angle === "Right Angle Cross" ? `Right Angle Cross of ${RAX_BY_GATE[sg]}` : angle === "Left Angle Cross" ? `Left Angle Cross of ${LAX_BY_GATE[sg]}` : `Juxtaposition Cross of ${JXC[sg]}`;
    const lonsP = longitudes(t);
    return {
      utcMs, birth: t.date, design: dt.date, pers, des, active, ...s,
      profile: `${pl}/${dl}`, profileLines: [pl, dl], profileName: `${PROFILE_NAMES[pl]} / ${PROFILE_NAMES[dl]}`,
      cross: `${crossName} (${crossGates})`, crossAngle: angle, crossGates,
      sunSign: signOf(lonsP.Sun), moonSign: signOf(lonsP.Moon), sunZodiac: zodiac(lonsP.Sun),
      variables: variables(pers, des),
      ...TYPE_INFO[s.type], authorityAbout: AUTHORITY_INFO[s.authority]
    };
  }

  // ---------- accuracy tools ----------
  // Reference: apparent geocentric longitudes for 1 Jan 2000, 12:00 TT (standard published ephemeris values).
  const REF_J2000 = { Sun: 280.3725, Moon: 223.3238, Mercury: 271.8894, Venus: 241.5658, Mars: 327.9633, Jupiter: 25.2531, Saturn: 40.3958, Uranus: 314.8092, Neptune: 303.1931, Pluto: 251.4547, NorthNode: 123.9531 };
  function selfTest() {
    const l = longitudes(Ast.MakeTime(new Date(Date.UTC(2000, 0, 1, 11, 58, 55, 816))));
    const rows = Object.entries(REF_J2000).map(([k, ref]) => ({ body: k, ref, got: l[k], arcsec: Math.abs(((l[k] - ref + 540) % 360) - 180) * 3600 }));
    return { rows, worst: Math.max(...rows.map((r) => r.arcsec)) };
  }

  // A compact fingerprint of everything a reading depends on.
  const signature = (c) => [c.type, c.authority, c.profile, c.definition, c.channels.map((x) => x.key).join(","), [...c.defined].sort().join(",")].join("|");

  // How far the birth time can move (in minutes) before the chart changes, and what changes first.
  function sensitivity(utcMs, maxMin = 720) {
    const base = chart(utcMs), sig = signature(base);
    const diff = (c) => {
      const out = [];
      if (c.type !== base.type) out.push(`Type becomes ${c.type}`);
      if (c.authority !== base.authority) out.push(`Authority becomes ${c.authority}`);
      if (c.profile !== base.profile) out.push(`Profile becomes ${c.profile}`);
      const a = new Set(base.channels.map((x) => x.key)), b = new Set(c.channels.map((x) => x.key));
      [...b].filter((k) => !a.has(k)).forEach((k) => out.push(`Channel ${k} appears`));
      [...a].filter((k) => !b.has(k)).forEach((k) => out.push(`Channel ${k} disappears`));
      if (!out.length && c.definition !== base.definition) out.push(`Definition becomes ${c.definition}`);
      return out;
    };
    const edge = (dir) => {
      let lo = 0, hi = null;
      for (const step of [2, 5, 10, 20, 40, 80, 160, 320, 640, maxMin]) {
        if (signature(chart(utcMs + dir * step * 60000)) !== sig) { hi = step; break; }
        lo = step;
      }
      if (hi === null) return { minutes: maxMin, open: true, changes: [] };
      while (hi - lo > 1) { const mid = Math.floor((lo + hi) / 2); if (signature(chart(utcMs + dir * mid * 60000)) !== sig) hi = mid; else lo = mid; }
      return { minutes: lo, open: false, changes: diff(chart(utcMs + dir * hi * 60000)) };
    };
    return { earlier: edge(-1), later: edge(1) };
  }

  // Every activation with its distance to the nearest line boundary, converted to minutes of birth time.
  function boundaries(c) {
    const speed = (key, t0) => { // degrees per day
      const a = longitudes(Ast.MakeTime(new Date(t0 - 3600000)))[key], b = longitudes(Ast.MakeTime(new Date(t0 + 3600000)))[key];
      return (((b - a + 540) % 360) - 180) * 12;
    };
    const rows = [];
    for (const [side, acts, t0] of [["Personality", c.pers, c.utcMs], ["Design", c.des, c.design.getTime()]]) {
      for (const b of BODIES) {
        const a = acts[b.key];
        const within = norm(a.lon - GATE_START) % 0.9375;
        const toEdge = Math.min(within, 0.9375 - within);
        const v = Math.abs(speed(b.key, t0));
        rows.push({ side, body: b.label || b.key, sym: b.sym, gate: a.gate, line: a.line, arcmin: toEdge * 60, minutes: v > 1e-6 ? (toEdge / v) * 1440 : Infinity });
      }
    }
    return rows.sort((x, y) => x.minutes - y.minutes);
  }

  // When the birth time is unknown: every outcome that occurs during the 24 hours of the local birth date.
  function dayScan(startUtcMs, stepMin = 15) {
    const tally = { type: {}, authority: {}, profile: {} };
    const n = Math.round(1440 / stepMin);
    for (let i = 0; i < n; i++) {
      const c = chart(startUtcMs + i * stepMin * 60000);
      for (const k of Object.keys(tally)) tally[k][c[k]] = (tally[k][c[k]] || 0) + stepMin;
    }
    return tally;
  }

  // Today's planets laid over a natal chart.
  function transits(natal, whenMs = Date.now()) {
    const t = Ast.MakeTime(new Date(whenMs));
    const acts = activations(t);
    const active = new Map();
    natal.active.forEach((v, g) => active.set(g, { ...v }));
    addActs(active, acts, "t");
    const s = structure(active);
    const natalKeys = new Set(natal.channels.map((c) => c.key));
    const newChannels = s.channels.filter((c) => !natalKeys.has(c.key)).map((c) => {
      const natalHas = [c.a, c.b].filter((g) => natal.active.has(g));
      return { ...c, kind: natalHas.length ? "completes" : "transit" };
    });
    const newCenters = [...s.defined].filter((c) => !natal.defined.has(c));
    return { acts, active, defined: s.defined, newChannels, newCenters, sunGate: acts.Sun, earthGate: acts.Earth, moonGate: acts.Moon };
  }

  // Connection chart between two people.
  function connection(a, b) {
    const active = new Map();
    a.active.forEach((_, g) => active.set(g, { a: true }));
    b.active.forEach((_, g) => active.set(g, { ...(active.get(g) || {}), b: true }));
    const s = structure(active);
    const has = (c, g) => c.active.has(g);
    const kinds = { electromagnetic: [], companionship: [], dominanceA: [], dominanceB: [], compromise: [] };
    s.channels.forEach((ch) => {
      const aFull = has(a, ch.a) && has(a, ch.b), bFull = has(b, ch.a) && has(b, ch.b);
      const aAny = has(a, ch.a) || has(a, ch.b), bAny = has(b, ch.a) || has(b, ch.b);
      if (aFull && bFull) kinds.companionship.push(ch);
      else if (aFull && !bAny) kinds.dominanceA.push(ch);
      else if (bFull && !aAny) kinds.dominanceB.push(ch);
      else if (aFull || bFull) kinds.compromise.push(ch);
      else kinds.electromagnetic.push(ch);
    });
    return { active, ...s, kinds };
  }

  // Planet longitudes for any moment (used by the daily mood).
  function sky(ms) {
    const l = longitudes(Ast.MakeTime(new Date(ms)));
    const later = longitudes(Ast.MakeTime(new Date(ms + 3600000)));
    l.mercuryRetro = (((later.Mercury - l.Mercury + 540) % 360) - 180) < 0;
    return l;
  }

  // ---------- BodyGraph SVG ----------
  const SHAPES = {
    Head: "240,18 190,92 290,92",
    Ajna: "190,118 290,118 240,196",
    Throat: "200,228 280,228 280,308 200,308",
    G: "240,330 292,382 240,434 188,382",
    Heart: "338,404 306,452 372,452",
    Spleen: "56,470 56,572 132,521",
    SolarPlexus: "424,470 424,572 348,521",
    Sacral: "200,480 280,480 280,560 200,560",
    Root: "200,598 280,598 280,672 200,672"
  };
  const GP = {
    64: [215, 88], 61: [240, 88], 63: [265, 88],
    47: [215, 124], 24: [240, 124], 4: [265, 124], 17: [218, 150], 11: [262, 150], 43: [240, 182],
    62: [215, 233], 23: [240, 233], 56: [265, 233], 16: [205, 250], 20: [205, 280], 35: [275, 246], 12: [275, 266], 45: [275, 292],
    31: [215, 303], 8: [240, 303], 33: [265, 303],
    7: [224, 350], 1: [240, 338], 13: [256, 350], 10: [196, 382], 25: [284, 382], 15: [224, 414], 2: [240, 426], 46: [256, 414],
    21: [329, 425], 51: [316, 444], 26: [334, 447], 40: [360, 447],
    48: [68, 482], 57: [88, 495], 44: [108, 506], 50: [118, 530], 32: [100, 541], 28: [82, 553], 18: [64, 563],
    36: [412, 482], 22: [392, 495], 37: [372, 506], 6: [362, 530], 49: [380, 541], 55: [398, 553], 30: [416, 563],
    5: [215, 485], 14: [240, 485], 29: [265, 485], 34: [205, 500], 27: [205, 535], 59: [275, 535], 42: [215, 555], 3: [240, 555], 9: [265, 555],
    53: [215, 603], 60: [240, 603], 52: [265, 603], 54: [205, 618], 38: [205, 640], 58: [205, 662], 19: [275, 618], 39: [275, 640], 41: [275, 662]
  };
  const CENTER_FILL = { Head: "#e2c065", Ajna: "#7fa77a", Throat: "#c9955a", G: "#e2c065", Heart: "#c0605a", Spleen: "#c9955a", SolarPlexus: "#c9955a", Sacral: "#c0605a", Root: "#c9955a" };
  const PALETTES = {
    natal: { d: "var(--hd-des)", p: "var(--hd-pers)" },
    transit: { d: "var(--hd-des)", p: "var(--hd-pers)", t: "var(--hd-transit)" },
    connection: { a: "var(--hd-a)", b: "var(--hd-b)" }
  };

  // c: { active: Map(gate -> flags), defined: Set }, mode: palette name.
  function bodygraph(c, mode = "natal", highlightCenters = new Set()) {
    const pal = PALETTES[mode];
    const half = (g, mid) => {
      const a = c.active.get(g); if (!a) return "";
      const cols = Object.keys(pal).filter((k) => a[k]).map((k) => pal[k]);
      if (!cols.length) return "";
      const [x, y] = GP[g];
      const dx = mid[0] - x, dy = mid[1] - y, L = Math.hypot(dx, dy) || 1;
      const w = 6 / cols.length;
      return cols.map((col, i) => {
        const off = (i - (cols.length - 1) / 2) * w;
        const ox = (-dy / L) * off, oy = (dx / L) * off;
        return `<line x1="${x + ox}" y1="${y + oy}" x2="${mid[0] + ox}" y2="${mid[1] + oy}" stroke="${col}" stroke-width="${cols.length > 1 ? w + 0.4 : 6}" stroke-linecap="${cols.length > 1 ? "butt" : "round"}"/>`;
      }).join("");
    };
    const chans = CHANNELS.map(([a, b]) => {
      const [x1, y1] = GP[a], [x2, y2] = GP[b];
      const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
      return `<line class="hd-chan" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>${half(a, mid)}${half(b, mid)}`;
    }).join("");
    const centers = Object.entries(SHAPES).map(([k, pts]) => {
      const def = c.defined.has(k);
      return `<polygon class="hd-center ${def ? "def" : ""} ${highlightCenters.has(k) ? "glow" : ""}" data-center="${k}" points="${pts}" fill="${def ? CENTER_FILL[k] : "#fffdf7"}"><title>${CENTERS[k].label}: ${def ? "defined" : "open"}</title></polygon>`;
    }).join("");
    const gates = Object.entries(GP).map(([g, [x, y]]) => {
      const a = c.active.get(Number(g));
      return `<g class="hd-gate ${a ? "on" : ""}" data-gate="${g}"><circle cx="${x}" cy="${y}" r="7.5"/><text x="${x}" y="${y}" dy="0.35em">${g}</text><title>Gate ${g} · ${GATE_NAMES[g]}</title></g>`;
    }).join("");
    return `<svg class="bodygraph" viewBox="30 0 420 690" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BodyGraph">
      <g>${chans}</g><g>${centers}</g><g>${gates}</g></svg>`;
  }

  return { gateOf, chart, sky, selfTest, sensitivity, boundaries, dayScan, transits, connection, bodygraph, BODIES, GATE_NAMES, GATE_CENTER, CENTERS, CHANNELS, zodiac, PROFILE_NAMES };
})();
