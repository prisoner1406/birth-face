// Daily Insight engine: everything about one calendar day at one place.
// Western astrology (Moon aspects, void-of-course, ingresses, planetary hours), Vedic Panchang
// (tithi, nakshatra, yoga, karana, Rahu Kalam and muhurtas), numerology, the Maya calendars,
// the Chinese almanac, biorhythms, and a minute-by-minute mood timeline built from all of them.
const Daily = (() => {
  const Ast = window.Astronomy;
  const norm = (x) => ((x % 360) + 360) % 360;
  const diff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;
  const at = (ms) => Ast.MakeTime(new Date(ms));
  const H = 3600e3, MIN = 60e3, DAY = 864e5;
  const lon = (key, ms) => Astro.bodyLon(key, at(ms));

  // ---------- time-zone helpers ----------
  const fmtCache = {};
  function parts(ms, tz) {
    const f = (fmtCache[tz] ||= new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }));
    const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
  }
  function zonedToUtc(y, mo, d, h, mi, tz) {
    const off = (ts) => { const p = parts(ts, tz); return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - ts; };
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    const utc = guess - off(guess);
    return guess - off(utc);
  }
  const isoIn = (tz, ms = Date.now()) => { const p = parts(ms, tz); return `${p.y}-${String(p.mo).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`; };
  const jdn = (y, mo, d) => Math.floor(Date.UTC(y, mo - 1, d) / DAY) + 2440588;

  // ---------- generic root finding ----------
  // Bisect a sign change of f between lo and hi down to ~20 seconds.
  function bisect(f, lo, hi, flo) {
    for (let i = 0; i < 40 && hi - lo > 20e3; i++) {
      const mid = (lo + hi) / 2, fm = f(mid);
      if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
    }
    return (lo + hi) / 2;
  }
  // Segments of an integer-valued index function over [from, to], with true start/end times.
  function spans(idx, from, to, step = 30 * MIN, reach = 3 * DAY) {
    const findChange = (t0, dir) => {
      const i0 = idx(t0);
      for (let t = t0 + dir * step; Math.abs(t - t0) <= reach; t += dir * step) {
        if (idx(t) !== i0) {
          let a = t - dir * step, b = t;
          for (let k = 0; k < 40 && Math.abs(b - a) > 20e3; k++) { const m = (a + b) / 2; if (idx(m) === i0) a = m; else b = m; }
          return dir > 0 ? b : a;
        }
      }
      return null;
    };
    const out = [];
    let t = from;
    let start = findChange(from, -1);
    while (t < to) {
      const i = idx(t);
      const end = findChange(t, 1);
      out.push({ i, start, end });
      if (end === null) break;
      start = end; t = end + 1000;
    }
    return out;
  }

  // ---------- Sun and day structure ----------
  function sunFrame(dayStart, dayEnd, lat, lonDeg) {
    const obs = new Ast.Observer(lat, lonDeg, 0);
    const rs = (dir, from) => { try { const r = Ast.SearchRiseSet(Ast.Body.Sun, obs, dir, at(from), 1.2); return r ? r.date.getTime() : null; } catch { return null; } };
    const alt = (dir, from, a) => { try { const r = Ast.SearchAltitude(Ast.Body.Sun, obs, dir, at(from), 1.2, a); return r ? r.date.getTime() : null; } catch { return null; } };
    const rise = rs(+1, dayStart), set = rise ? rs(-1, rise) : rs(-1, dayStart);
    const prevSet = rise ? rs(-1, rise - 1.2 * DAY) : null;
    const nextRise = set ? rs(+1, set) : null;
    let noon = null;
    try { noon = Ast.SearchHourAngle(Ast.Body.Sun, obs, 0, at(dayStart), +1).time.date.getTime(); } catch {}
    const dawn = alt(+1, dayStart, -6), dusk = set ? alt(-1, set - H, -6) : null;
    const polar = !(rise && set && prevSet && nextRise && rise < set && set < dayEnd + DAY);
    return { rise, set, prevSet, nextRise, noon, dawn, dusk, polar };
  }

  // ---------- planetary hours (Chaldean order) ----------
  const CHALDEAN = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
  const DAY_RULER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]; // by weekday, Sunday = 0
  function planetaryHours(sun, weekday, dayStart, dayEnd) {
    const ruler = DAY_RULER[weekday], prevRuler = DAY_RULER[(weekday + 6) % 7];
    let rise = sun.rise, set = sun.set, prevSet = sun.prevSet, nextRise = sun.nextRise;
    let approx = false;
    if (sun.polar) { // no true sunrise/sunset: use 06:00 and 18:00 local, and say so
      approx = true;
      rise = dayStart + 6 * H; set = dayStart + 18 * H; prevSet = dayStart - 6 * H; nextRise = dayEnd + 6 * H;
    }
    const out = [];
    const seq = (r, i) => CHALDEAN[(CHALDEAN.indexOf(r) + i) % 7];
    const prevNight = (rise - prevSet) / 12, dayLen = (set - rise) / 12, night = (nextRise - set) / 12;
    for (let i = 0; i < 12; i++) out.push({ ruler: seq(prevRuler, 12 + i), start: prevSet + i * prevNight, end: prevSet + (i + 1) * prevNight, night: true, n: 13 + i, dayRuler: prevRuler });
    for (let i = 0; i < 12; i++) out.push({ ruler: seq(ruler, i), start: rise + i * dayLen, end: rise + (i + 1) * dayLen, night: false, n: 1 + i, dayRuler: ruler });
    for (let i = 0; i < 12; i++) out.push({ ruler: seq(ruler, 12 + i), start: set + i * night, end: set + (i + 1) * night, night: true, n: 13 + i, dayRuler: ruler });
    return { ruler, hours: out.filter((h) => h.end > dayStart && h.start < dayEnd), approx };
  }

  // ---------- the Moon ----------
  const ASPECT_ANGLES = [[0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"], [240, "trine"], [270, "square"], [300, "sextile"]];
  const OTHERS = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  // Exact Moon aspects to moving planets (targets = keys) or fixed natal points (targets = [{key, lon}]).
  function moonAspects(from, to, targets, samples) {
    const res = [];
    for (const tg of targets) {
      const fixed = typeof tg === "object";
      const key = fixed ? tg.key : tg;
      const tLon = (i, ms) => (fixed ? tg.lon : ms === undefined ? samples.P[key][i] : lon(key, ms));
      for (const [ang, name] of ASPECT_ANGLES) {
        let f0 = diff(samples.moon[0] - tLon(0), ang);
        for (let i = 1; i < samples.t.length; i++) {
          const f1 = diff(samples.moon[i] - tLon(i), ang);
          if (Math.sign(f0) !== Math.sign(f1) && Math.abs(f0) < 20 && Math.abs(f1) < 20) {
            const f = (ms) => diff(lon("Moon", ms) - (fixed ? tg.lon : lon(key, ms)), ang);
            const ms = bisect(f, samples.t[i - 1], samples.t[i], f0);
            if (ms >= from && ms < to) res.push({ ms, target: key, aspect: name, angle: ang, natal: fixed });
          }
          f0 = f1;
        }
      }
    }
    return res.sort((a, b) => a.ms - b.ms);
  }
  function sampleSky(from, to, step = H) {
    const t = [], moon = [], P = Object.fromEntries(OTHERS.map((k) => [k, []]));
    for (let ms = from; ms <= to + step; ms += step) {
      t.push(ms); moon.push(lon("Moon", ms));
      for (const k of OTHERS) P[k].push(lon(k, ms));
    }
    return { t, moon, P };
  }
  function moonIngresses(samples) {
    const out = [];
    for (let i = 1; i < samples.t.length; i++) {
      const s0 = Math.floor(samples.moon[i - 1] / 30), s1 = Math.floor(samples.moon[i] / 30);
      if (s0 !== s1) {
        let a = samples.t[i - 1], b = samples.t[i];
        for (let k = 0; k < 40 && b - a > 20e3; k++) { const m = (a + b) / 2; if (Math.floor(lon("Moon", m) / 30) === s0) a = m; else b = m; }
        out.push({ ms: b, from: s0, to: s1 });
      }
    }
    return out;
  }
  // Void of course: from the Moon's last exact Ptolemaic aspect to Sun..Pluto until it leaves the sign.
  function voidPeriods(ingresses, aspects) {
    const out = [];
    for (let i = 0; i < ingresses.length; i++) {
      const ing = ingresses[i];
      const prevIng = i ? ingresses[i - 1].ms : null;
      const before = aspects.filter((a) => a.ms < ing.ms && (prevIng === null || a.ms > prevIng));
      if (!before.length && prevIng === null) continue; // not enough history to know
      const last = before[before.length - 1];
      out.push({ start: last ? last.ms : prevIng, end: ing.ms, lastAspect: last || null, sign: ing.from, nextSign: ing.to });
    }
    return out;
  }

  // ---------- Vedic Panchang (sidereal, Lahiri / Chitrapaksha ayanamsa) ----------
  // The official Lahiri definition (Indian Calendar Reform Committee): 23°15'00.658" on 21 March 1956 0h TT,
  // carried forward by IAU 2006 general precession in longitude, plus nutation (true ayanamsa),
  // matching the values published by Drik Panchang and the Indian Astronomical Ephemeris.
  const LAHIRI_T0 = (2435553.5 - 2451545.0) / 36525, LAHIRI_A0 = 23.250182778;
  const precession = (T) => (5028.796195 * T + 1.1054348 * T * T + 0.00007964 * T * T * T) / 3600;
  function ayanamsa(ms) {
    const t = at(ms), T = t.tt / 36525;
    let dpsi = 0;
    try { dpsi = Ast.e_tilt(t).dpsi / 3600; } catch { /* nutation unavailable: mean ayanamsa */ }
    return LAHIRI_A0 + precession(T) - precession(LAHIRI_T0) + dpsi;
  }
  const elong = (ms) => norm(lon("Moon", ms) - lon("Sun", ms));
  const sidMoon = (ms) => norm(lon("Moon", ms) - ayanamsa(ms));
  const sidSun = (ms) => norm(lon("Sun", ms) - ayanamsa(ms));
  const NAK = 360 / 27;
  const tithiIdx = (ms) => Math.floor(elong(ms) / 12);
  const nakIdx = (ms) => Math.floor(sidMoon(ms) / NAK);
  const yogaIdx = (ms) => Math.floor(norm(sidMoon(ms) + sidSun(ms)) / NAK);
  const karanaIdx = (ms) => Math.floor(elong(ms) / 6);
  const MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
  const karanaName = (k) => (k === 0 ? "Kimstughna" : k === 57 ? "Shakuni" : k === 58 ? "Chatushpada" : k === 59 ? "Naga" : MOVABLE[(k - 1) % 7]);
  const HINDU_MONTHS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
  function hinduMonth(ms) {
    const nm = Ast.SearchMoonPhase(0, at(ms - 31 * DAY), 31).date.getTime();
    let prevNm = nm, t = nm;
    while (t <= ms) { prevNm = t; t = Ast.SearchMoonPhase(0, at(t + DAY), 31).date.getTime(); }
    const r1 = Math.floor(sidSun(prevNm) / 30), r2 = Math.floor(sidSun(t) / 30);
    return { name: HINDU_MONTHS[(r1 + 1) % 12], adhika: r1 === r2, from: prevNm, to: t };
  }
  // Rahu Kalam, Yamaganda, Gulika: 1-based eighth of daylight by weekday (Sunday = 0).
  const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULIKA = [7, 6, 5, 4, 3, 2, 1];
  function muhurtas(sun, weekday) {
    if (sun.polar) return null;
    const part = (sun.set - sun.rise) / 8;
    const slot = (n) => ({ start: sun.rise + (n - 1) * part, end: sun.rise + n * part });
    const dayM = (sun.set - sun.rise) / 15, nightM = (sun.rise - sun.prevSet) / 15;
    const mid = sun.rise + (sun.set - sun.rise) / 2;
    return {
      rahu: slot(RAHU[weekday]), yamaganda: slot(YAMA[weekday]), gulika: slot(GULIKA[weekday]),
      abhijit: { start: mid - dayM / 2, end: mid + dayM / 2, weak: weekday === 3 },
      brahma: { start: sun.rise - 2 * nightM, end: sun.rise - nightM }
    };
  }

  // ---------- numerology ----------
  const dsum = (n) => String(n).split("").reduce((s, d) => s + Number(d), 0);
  function numbers(y, mo, d, profileDate) {
    const universalRaw = dsum(y) + dsum(mo) + dsum(d);
    const universal = Numerology.reduce(universalRaw);
    const [, bmo, bd] = profileDate.split("-").map(Number);
    const p = Numerology.profile(profileDate, "", new Date(y, mo - 1, d));
    const pmRaw = p.personalMonth;
    const compound = pmRaw + d;
    const cyc = Matrix.cycles(bd, bmo, new Date(y, mo - 1, d));
    const uArc = Matrix.r(d + mo + dsum(y));
    return { universal, universalRaw, personalDay: p.personalDay, personalMonth: p.personalMonth, personalYear: p.personalYear, compound, dayArcana: cyc.day, universalArcana: uArc };
  }

  // ---------- Maya ----------
  const TZ_SIGNS = ["Imix", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok", "Chuwen", "Eb'", "B'en", "Ix", "Men", "K'ib'", "Kab'an", "Etz'nab'", "Kawak", "Ajaw"];
  const HAAB = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];
  const DS_SEALS = ["Red Dragon", "White Wind", "Blue Night", "Yellow Seed", "Red Serpent", "White Worldbridger", "Blue Hand", "Yellow Star", "Red Moon", "White Dog", "Blue Monkey", "Yellow Human", "Red Skywalker", "White Wizard", "Blue Eagle", "Yellow Warrior", "Red Earth", "White Mirror", "Blue Storm", "Yellow Sun"];
  const DS_TONES = ["Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic", "Resonant", "Galactic", "Solar", "Planetary", "Spectral", "Crystal", "Cosmic"];
  function maya(y, mo, d) {
    const j = jdn(y, mo, d), k = j - 584283; // GMT correlation
    const tone = (((k + 3) % 13) + 13) % 13 + 1, sign = (((k + 19) % 20) + 20) % 20;
    const hp = (((k + 348) % 365) + 365) % 365;
    const haab = { day: hp % 20, month: HAAB[Math.floor(hp / 20)] };
    // Long Count
    let r = k; const b = Math.floor(r / 144000); r -= b * 144000; const ka = Math.floor(r / 7200); r -= ka * 7200; const tu = Math.floor(r / 360); r -= tu * 360; const wi = Math.floor(r / 20); const ki = r - wi * 20;
    // Dreamspell: anchor 26 July 2013 = Kin 164; 29 February does not advance the count.
    const A = jdn(2013, 7, 26);
    let days = j - A;
    if (days >= 0) { let c = 0; for (let yy = 2013; yy <= y; yy++) { if (!((yy % 4 === 0 && yy % 100 !== 0) || yy % 400 === 0)) continue; const f = jdn(yy, 2, 29); if (f > A && f <= j) c++; } days -= c; }
    else { let c = 0; for (let yy = y; yy <= 2013; yy++) { if (!((yy % 4 === 0 && yy % 100 !== 0) || yy % 400 === 0)) continue; const f = jdn(yy, 2, 29); if (f > j && f <= A) c++; } days += c; }
    const kin = ((((163 + days) % 260) + 260) % 260) + 1;
    return { tone, sign, signName: TZ_SIGNS[sign], color: ["Red", "White", "Black", "Yellow"][sign % 4], haab, longCount: [b, ka, tu, wi, ki].join("."),
      kin, dsSeal: (kin - 1) % 20, dsTone: (kin - 1) % 13, dsName: `${DS_SEALS[(kin - 1) % 20].split(" ")[0]} ${DS_TONES[(kin - 1) % 13]} ${DS_SEALS[(kin - 1) % 20].split(" ").slice(1).join(" ")}`, feb29: mo === 2 && d === 29 };
  }

  // ---------- Chinese almanac ----------
  const STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
  const STEM_CH = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCHES = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];
  const BRANCH_CH = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const STEM_EL = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"];
  const OFFICERS = ["Establish", "Remove", "Full", "Balance", "Stable", "Initiate", "Destruction", "Danger", "Success", "Receive", "Open", "Close"];
  const SIX_HARMONY = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // Rat-Ox, Tiger-Pig, Rabbit-Dog, Dragon-Rooster, Snake-Monkey, Horse-Goat
  function chinese(y, mo, d, noonMs, birthAnimalIdx) {
    const i60 = (jdn(y, mo, d) + 49) % 60;
    const stem = i60 % 10, branch = i60 % 12;
    const monthBranch = (Math.floor(norm(lon("Sun", noonMs) - 315) / 30) + 2) % 12;
    const officer = (branch - monthBranch + 12) % 12;
    const clash = (branch + 6) % 12;
    let you = null;
    if (birthAnimalIdx !== null && birthAnimalIdx !== undefined) {
      const a = birthAnimalIdx;
      you = a === clash ? "clash" : SIX_HARMONY[a] === branch ? "harmony" : a % 4 === branch % 4 && a !== branch ? "trine" : a === branch ? "same" : "neutral";
    }
    // Double hours: Zi hour (23:00–01:00) stem follows the day stem.
    const ziStem = (stem % 5) * 2;
    const hours = Array.from({ length: 12 }, (_, i) => ({ branch: i, animal: ANIMALS[i], stem: (ziStem + i) % 10, from: (i * 2 + 23) % 24, to: (i * 2 + 1) % 24, clashYou: birthAnimalIdx != null && (i + 6) % 12 === birthAnimalIdx, clashDay: (i + 6) % 12 === branch }));
    return { i60, stem, branch, pillar: `${STEMS[stem]} ${BRANCHES[branch]}`, hanzi: STEM_CH[stem] + BRANCH_CH[branch], element: STEM_EL[stem], polarity: stem % 2 ? "Yin" : "Yang", animal: ANIMALS[branch], monthBranch, monthAnimal: ANIMALS[monthBranch], officer, officerName: OFFICERS[officer], clash, clashAnimal: ANIMALS[clash], you, hours, STEMS, BRANCHES, ANIMALS };
  }

  // ---------- biorhythm ----------
  function biorhythm(birthIso, y, mo, d) {
    const [by, bm, bd] = birthIso.split("-").map(Number);
    const n = jdn(y, mo, d) - jdn(by, bm, bd);
    const v = (p, k = 0) => Math.sin((2 * Math.PI * (n + k)) / p);
    const one = (p) => ({ value: v(p), tomorrow: v(p, 1), critical: Math.sign(v(p)) !== Math.sign(v(p, 1)) || Math.abs(v(p)) < 0.07 });
    return { days: n, physical: one(23), emotional: one(28), intellectual: one(33) };
  }

  // ---------- colours ----------
  const COLORS = {
    red: { name: "Red", hex: "#c0392b" }, orange: { name: "Orange", hex: "#e07b28" }, yellow: { name: "Yellow", hex: "#e3b51f" }, green: { name: "Green", hex: "#3f9a4a" },
    blue: { name: "Blue", hex: "#3d86c6" }, indigo: { name: "Indigo", hex: "#3b3f9e" }, violet: { name: "Violet", hex: "#8048b8" }, pink: { name: "Rose pink", hex: "#d9709a" },
    gold: { name: "Gold", hex: "#cfa12a" }, silver: { name: "Silver", hex: "#aeb4bf" }, white: { name: "White", hex: "#f2efe6" }, black: { name: "Black", hex: "#22222a" },
    coral: { name: "Coral", hex: "#e5735e" }, pearl: { name: "Pearl", hex: "#ece3cd" }, brown: { name: "Earth brown", hex: "#8a6a45" }, skyblue: { name: "Light blue", hex: "#7fb8e6" }
  };
  const NUM_COLOR = { 1: "red", 2: "orange", 3: "yellow", 4: "green", 5: "blue", 6: "indigo", 7: "violet", 8: "pink", 9: "gold", 11: "silver", 22: "coral", 33: "pearl" };
  const PLANET_COLOR = { Sun: "gold", Moon: "silver", Mars: "red", Mercury: "orange", Jupiter: "blue", Venus: "green", Saturn: "indigo" };
  const THAI_DAY = ["red", "yellow", "pink", "green", "orange", "skyblue", "violet"];
  const VEDIC_GRAHA = { Sun: "orange", Moon: "white", Mars: "red", Mercury: "green", Jupiter: "yellow", Venus: "white", Saturn: "black" };
  const ELEMENT_COLOR = ["red", "brown", "yellow", "blue"]; // Fire, Earth, Air, Water
  const WUXING = { Wood: "green", Fire: "red", Earth: "yellow", Metal: "white", Water: "black" };
  const MAYA_COLOR = { Red: "red", White: "white", Black: "black", Blue: "blue", Yellow: "yellow" };
  // Colour families used to find what the traditions agree on.
  const FAMILY = { red: "red", coral: "red", pink: "pink", orange: "orange", yellow: "yellow", gold: "yellow", green: "green", blue: "blue", skyblue: "blue", indigo: "indigo", violet: "violet", silver: "white", white: "white", pearl: "white", black: "black", brown: "brown" };
  function colors(ruler, weekday, nums, moonSignIdx, cn, my) {
    const sources = [
      { from: "Your personal day number", detail: `Numerology ${nums.personalDay}`, key: NUM_COLOR[nums.personalDay], personal: true },
      { from: "Universal day number", detail: `Numerology ${nums.universal}`, key: NUM_COLOR[nums.universal] },
      { from: "Planetary ruler of the day", detail: `${ruler} (Western tradition)`, key: PLANET_COLOR[ruler], weekday: true },
      { from: "Thai colour of the day", detail: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekday], key: THAI_DAY[weekday], weekday: true },
      { from: "Vedic graha of the day", detail: `${ruler} (Navagraha)`, key: VEDIC_GRAHA[ruler], weekday: true },
      { from: "Element of the Moon's sign", detail: `${Astro.SIGNS[moonSignIdx]} · ${Astro.ELEMENT[moonSignIdx % 4]}`, key: ELEMENT_COLOR[moonSignIdx % 4] },
      { from: "Chinese day element", detail: `${cn.element} (${cn.pillar})`, key: WUXING[cn.element] },
      { from: "Maya day sign direction", detail: `${my.color} ${my.signName}`, key: MAYA_COLOR[my.color] }
    ].map((s) => ({ ...s, ...COLORS[s.key], family: FAMILY[s.key] }));
    // The day's colour: the family most collective traditions agree on; ties go to the traditions tied to the weekday's ruling planet.
    const tally = {};
    sources.filter((s) => !s.personal).forEach((s) => { tally[s.family] = (tally[s.family] || 0) + 1 + (s.weekday ? 0.01 : 0); });
    const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    const collectiveFam = ranked[0][0];
    const collective = sources.filter((s) => !s.personal).find((s) => s.family === collectiveFam);
    const soul = sources[0];
    const agree = sources.filter((s) => s.family === soul.family).length;
    return { soul, collective: { ...collective, votes: sources.filter((s) => !s.personal && s.family === collectiveFam).length }, sources, agree, tally: ranked.map(([k, v]) => [k, Math.round(v)]) };
  }

  // ---------- mood timeline ----------
  const HOUR_TONE = { Jupiter: 1, Venus: 0.9, Sun: 0.5, Mercury: 0.3, Moon: 0.2, Mars: -0.6, Saturn: -0.8 };
  function aspectTone(target, aspect) {
    const benefic = target === "Venus" || target === "Jupiter";
    const malefic = target === "Mars" || target === "Saturn" || target === "Pluto";
    if (aspect === "trine" || aspect === "sextile") return benefic ? 1 : malefic ? 0.45 : 0.7;
    if (aspect === "square" || aspect === "opposition") return benefic ? -0.25 : malefic ? -1 : target === "Uranus" || target === "Neptune" ? -0.6 : -0.65;
    // conjunction
    return benefic ? 1 : malefic ? -0.9 : target === "Uranus" ? -0.35 : target === "Neptune" ? -0.2 : target === "Sun" ? -0.1 : 0.2;
  }
  const CATS = {
    love: { Venus: 1, Moon: 0.4, Jupiter: 0.3, Sun: 0.1, Mercury: 0.1, Mars: 0, Saturn: -0.6 },
    work: { Jupiter: 1, Sun: 0.85, Saturn: 0.35, Mercury: 0.5, Mars: 0.25, Venus: 0.2, Moon: 0 },
    talk: { Mercury: 1, Moon: 0.3, Venus: 0.3, Jupiter: 0.3, Sun: 0.2, Mars: -0.2, Saturn: -0.3 },
    energy: { Mars: 1, Sun: 0.6, Jupiter: 0.3, Mercury: 0.1, Venus: 0, Moon: -0.2, Saturn: -0.4 },
    spirit: { Moon: 0.8, Jupiter: 0.6, Saturn: 0.4, Venus: 0.3, Sun: 0.2, Mercury: 0, Mars: -0.4 }
  };
  const CAT_TARGET = { love: ["Venus", "Jupiter", "Moon"], work: ["Jupiter", "Sun", "Saturn", "Mercury"], talk: ["Mercury"], energy: ["Mars", "Sun"], spirit: ["Neptune", "Jupiter", "Moon"] };

  function timeline(dayStart, dayEnd, ph, moonAsp, natalAsp, voids, mu, karanas, ingresses, step = 10 * MIN) {
    const slots = [];
    const gauss = (dt) => Math.exp(-((dt / (2.2 * H)) ** 2));
    for (let t = dayStart; t < dayEnd; t += step) {
      const mid = t + step / 2;
      const hour = ph.hours.find((h) => mid >= h.start && mid < h.end);
      const f = [];
      let s = 0;
      if (hour) { s += HOUR_TONE[hour.ruler] * 0.55; }
      for (const a of moonAsp) { const g = gauss(mid - a.ms); if (g > 0.05) { const v = aspectTone(a.target, a.aspect) * g * 0.8; s += v; if (g > 0.35) f.push(a); } }
      for (const a of natalAsp) { const g = gauss(mid - a.ms); if (g > 0.05) { const v = aspectTone(a.target, a.aspect) * g * 0.95; s += v; if (g > 0.35) f.push(a); } }
      const voc = voids.find((v) => mid >= v.start && mid < v.end);
      const flags = [];
      if (voc) { s = s > 0 ? s * 0.6 : s; flags.push("voc"); }
      if (mu) {
        if (mid >= mu.rahu.start && mid < mu.rahu.end) { s -= 0.55; flags.push("rahu"); }
        if (mid >= mu.yamaganda.start && mid < mu.yamaganda.end) { s -= 0.35; flags.push("yama"); }
        if (mid >= mu.gulika.start && mid < mu.gulika.end) { s -= 0.15; flags.push("gulika"); }
        if (mid >= mu.abhijit.start && mid < mu.abhijit.end && !mu.abhijit.weak) { s += 0.6; flags.push("abhijit"); }
        if (mid >= mu.brahma.start && mid < mu.brahma.end) { s += 0.45; flags.push("brahma"); }
      }
      const kar = karanas.find((k) => mid >= k.start && (k.end === null || mid < k.end));
      if (kar && kar.name === "Vishti") { s -= 0.35; flags.push("vishti"); }
      // Category scores for "best time for".
      const cat = {};
      for (const [c, w] of Object.entries(CATS)) {
        let v = hour ? w[hour.ruler] : 0;
        for (const a of moonAsp.concat(natalAsp)) {
          if (!CAT_TARGET[c].includes(a.target)) continue;
          const g = gauss(mid - a.ms); if (g < 0.05) continue;
          v += aspectTone(a.target, a.aspect) * g * 0.9;
        }
        if (c === "talk" && voc) v -= 0.8;
        if (c === "spirit" && (voc || flags.includes("brahma"))) v += 0.5;
        if (flags.includes("rahu") && c !== "spirit") v -= 0.9;
        if (flags.includes("vishti") && c !== "spirit") v -= 0.3;
        cat[c] = v + s * 0.35;
      }
      slots.push({ t, mid, score: s, hour, aspects: f, voc, flags, cat });
    }
    return slots;
  }
  const LEVELS = [
    { key: "radiant", min: 0.75, name: "Radiant" }, { key: "flowing", min: 0.25, name: "Flowing" }, { key: "steady", min: -0.25, name: "Steady" },
    { key: "tense", min: -0.75, name: "Tense" }, { key: "heavy", min: -Infinity, name: "Heavy" }
  ];
  const levelOf = (s) => LEVELS.find((l) => s >= l.min);
  function windows(slots) {
    // Smooth over 30 minutes, then group runs of the same level; absorb runs shorter than 40 minutes.
    const sm = slots.map((x, i) => { const a = slots.slice(Math.max(0, i - 2), i + 3); return a.reduce((p, q) => p + q.score, 0) / a.length; });
    let runs = [];
    sm.forEach((v, i) => { const lv = levelOf(v); const last = runs[runs.length - 1]; if (last && last.level.key === lv.key) { last.to = i; last.sum += v; } else runs.push({ level: lv, from: i, to: i, sum: v }); });
    const len = (r) => r.to - r.from + 1;
    for (let pass = 0; pass < 200; pass++) {
      // absorb the shortest run under 50 minutes into its longer neighbour
      let shortIdx = -1;
      runs.forEach((r, i) => { if (len(r) < 5 && (shortIdx < 0 || len(r) < len(runs[shortIdx]))) shortIdx = i; });
      if (shortIdx < 0) break;
      const r = runs[shortIdx], prev = runs[shortIdx - 1], next = runs[shortIdx + 1];
      const into = !prev ? next : !next ? prev : len(prev) >= len(next) ? prev : next;
      if (!into) break;
      into.from = Math.min(into.from, r.from); into.to = Math.max(into.to, r.to); into.sum += r.sum;
      runs.splice(shortIdx, 1);
      // re-merge neighbours of the same level
      runs = runs.reduce((acc, x) => { const l = acc[acc.length - 1]; if (l && l.level.key === x.level.key) { l.to = x.to; l.sum += x.sum; } else acc.push(x); return acc; }, []);
    }
    return runs.map((r) => {
      const sl = slots.slice(r.from, r.to + 1);
      const avg = sm.slice(r.from, r.to + 1).reduce((a, b) => a + b, 0) / sl.length;
      const rulers = [...new Set(sl.map((x) => x.hour?.ruler).filter(Boolean))];
      const aspects = [...new Map(sl.flatMap((x) => x.aspects).map((a) => [a.ms + a.target + a.natal, a])).values()].sort((a, b) => a.ms - b.ms);
      const flags = [...new Set(sl.flatMap((x) => x.flags))];
      return { start: sl[0].t, end: sl[sl.length - 1].t + (sl[1] ? sl[1].t - sl[0].t : 10 * MIN), level: levelOf(avg), avg, rulers, aspects, flags };
    });
  }
  function bestTimes(slots, sun, dayStart) {
    const wakeFrom = Math.max(dayStart + 6 * H, sun.dawn || dayStart + 6 * H) , wakeTo = dayStart + 23 * H;
    const out = {};
    for (const c of Object.keys(CATS)) {
      const pool = slots.filter((x) => (c === "spirit" ? x.t >= dayStart + 4 * H : x.t >= wakeFrom) && x.t < wakeTo);
      if (!pool.length) continue;
      // best 60-minute block
      let best = null;
      for (let i = 0; i + 5 < pool.length; i++) {
        const blk = pool.slice(i, i + 6);
        if (blk[5].t - blk[0].t > 60 * MIN) continue;
        const v = blk.reduce((a, b) => a + b.cat[c], 0) / 6;
        if (!best || v > best.v) best = { v, i };
      }
      if (!best) continue;
      let a = best.i, b = best.i + 5;
      const thr = best.v - 0.25;
      while (a > 0 && pool[a - 1].cat[c] >= thr && b - a < 17) a--;
      while (b < pool.length - 1 && pool[b + 1].cat[c] >= thr && b - a < 17) b++;
      const mid = pool[Math.floor((a + b) / 2)];
      const blk = pool.slice(a, b + 1);
      const aspects = [...new Set(blk.flatMap((x) => x.aspects))].filter((x) => aspectTone(x.target, x.aspect) > 0 && (x.natal || CAT_TARGET[c].includes(x.target)));
      out[c] = { start: pool[a].t, end: pool[b].t + 10 * MIN, score: best.v, ruler: mid.hour?.ruler, aspects, flags: [...new Set(blk.flatMap((x) => x.flags))].filter((f) => f === "brahma" || f === "abhijit" || (c === "spirit" && f === "voc")) };
    }
    return out;
  }

  // ---------- main ----------
  const cache = new Map();
  function compute({ date, tz, lat, lon: lonDeg, natal, birthDate, birthAnimalIdx, timeKnown }) {
    const key = [date, tz, lat, lonDeg, birthDate, natal ? natal.utcMs : "", timeKnown].join("|");
    if (cache.has(key)) return cache.get(key);
    const [y, mo, d] = date.split("-").map(Number);
    const dayStart = zonedToUtc(y, mo, d, 0, 0, tz);
    const nd = new Date(Date.UTC(y, mo - 1, d + 1));
    const dayEnd = zonedToUtc(nd.getUTCFullYear(), nd.getUTCMonth() + 1, nd.getUTCDate(), 0, 0, tz);
    const noon = zonedToUtc(y, mo, d, 12, 0, tz);
    const weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();

    const sun = sunFrame(dayStart, dayEnd, lat, lonDeg);
    const ph = planetaryHours(sun, weekday, dayStart, dayEnd);

    // Sky sampled hourly from 3 days before to 1 day after, for aspects, ingresses and void-of-course.
    const samples = sampleSky(dayStart - 3 * DAY, dayEnd + DAY);
    const allMoonAsp = moonAspects(dayStart - 3 * DAY, dayEnd + DAY, OTHERS, samples);
    const ingresses = moonIngresses(samples);
    const voids = voidPeriods(ingresses, allMoonAsp).filter((v) => v.end > dayStart && v.start < dayEnd);
    const moonAsp = allMoonAsp.filter((a) => a.ms >= dayStart - 3 * H && a.ms < dayEnd + 3 * H);
    const todayIngress = ingresses.filter((i) => i.ms >= dayStart && i.ms < dayEnd);
    let natalAsp = [];
    if (natal) {
      const pts = natal.all.filter((p) => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Ascendant", "Midheaven"].includes(p.key) && (timeKnown || (p.key !== "Ascendant" && p.key !== "Midheaven")))
        .map((p) => ({ key: p.key, lon: p.lon }));
      const s2 = { t: samples.t, moon: samples.moon, P: samples.P };
      natalAsp = moonAspects(dayStart - 3 * H, dayEnd + 3 * H, pts, s2);
    }

    // Moon state at noon and at the start/end of the day.
    const moonNoon = lon("Moon", noon), sunNoon = lon("Sun", noon);
    const el = norm(moonNoon - sunNoon);
    const illum = Ast.Illumination(Ast.Body.Moon, at(noon)).phase_fraction;
    const quarters = [];
    let mq = Ast.SearchMoonQuarter(at(dayStart - DAY));
    while (mq.time.date.getTime() < dayEnd) { if (mq.time.date.getTime() >= dayStart) quarters.push({ ms: mq.time.date.getTime(), quarter: mq.quarter }); mq = Ast.NextMoonQuarter(mq); }
    const prevNew = Ast.SearchMoonPhase(0, at(noon - 30 * DAY), 30).date.getTime();
    let lastNew = prevNew; { let t = prevNew; while (t <= noon) { lastNew = t; t = Ast.SearchMoonPhase(0, at(t + DAY), 31).date.getTime(); } }
    const moonAge = (noon - lastNew) / DAY;
    let moonrise = null, moonset = null;
    try { const obs = new Ast.Observer(lat, lonDeg, 0); const r = Ast.SearchRiseSet(Ast.Body.Moon, obs, +1, at(dayStart), 1); const s = Ast.SearchRiseSet(Ast.Body.Moon, obs, -1, at(dayStart), 1); moonrise = r && r.date.getTime() < dayEnd ? r.date.getTime() : null; moonset = s && s.date.getTime() < dayEnd ? s.date.getTime() : null; } catch {}

    // Whole-sky snapshot at noon, retrogrades, ingresses and stations.
    const sky = Object.fromEntries(["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].map((k) => [k, lon(k, noon)]));
    const retro = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].filter((k) => diff(lon(k, noon + H), sky[k]) < 0);
    const events = Astro.events(dayStart, dayEnd).filter((e) => e.kind !== "moon");
    // Slow transits to the birth chart within 1°.
    let transits = [];
    if (natal) {
      const tr = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].map((k) => ({ key: k, lon: sky[k] }));
      const np = natal.all.filter((p) => p.key !== "NorthNode" && (timeKnown || (p.key !== "Ascendant" && p.key !== "Midheaven")));
      transits = Astro.findAspects(tr, np, 1).filter((a) => a.orb <= (["Sun", "Mercury", "Venus", "Mars"].includes(a.a) ? 1.2 : 1) && a.aspect !== "quincunx").slice(0, 8);
    }

    // Panchang
    const pFrom = dayStart, pTo = dayEnd;
    const tithis = spans(tithiIdx, pFrom, pTo).map((s) => ({ ...s, n: s.i + 1 }));
    const naks = spans(nakIdx, pFrom, pTo).map((s) => ({ ...s, pada: null }));
    const yogas = spans(yogaIdx, pFrom, pTo);
    const karanas = spans(karanaIdx, pFrom, pTo, 20 * MIN).map((s) => ({ ...s, name: karanaName(s.i) }));
    const refT = sun.rise && !sun.polar ? sun.rise : dayStart + 6 * H;
    const atRise = { tithi: tithiIdx(refT), nak: nakIdx(refT), pada: Math.floor((sidMoon(refT) % NAK) / (NAK / 4)) + 1, yoga: yogaIdx(refT), karana: karanaName(karanaIdx(refT)) };
    const ayan = ayanamsa(noon);
    const mu = muhurtas(sun, weekday);
    const hm = hinduMonth(noon);
    const sid = { sun: sidSun(noon), moon: sidMoon(noon) };

    const nums = numbers(y, mo, d, birthDate);
    const my = maya(y, mo, d);
    const cn = chinese(y, mo, d, noon, birthAnimalIdx);
    const bio = biorhythm(birthDate, y, mo, d);
    const moonSignIdx = Math.floor(moonNoon / 30);
    const gates = HD.gateOf ? { sun: HD.gateOf(sky.Sun), earth: HD.gateOf(norm(sky.Sun + 180)), moon: HD.gateOf(moonNoon) } : null;
    const col = colors(ph.ruler, weekday, nums, moonSignIdx, cn, my);

    const slots = timeline(dayStart, dayEnd, ph, moonAsp.filter((a) => a.ms > dayStart - 4 * H), natalAsp, voids, mu, karanas, ingresses);
    const win = windows(slots);
    const best = bestTimes(slots, sun, dayStart);

    const res = {
      date, tz, lat, lon: lonDeg, y, mo, d, weekday, dayStart, dayEnd, noon, sun, ph, ruler: ph.ruler,
      moon: { lon: moonNoon, sign: moonSignIdx, elong: el, illum, age: moonAge, quarters, ingresses: todayIngress, startSign: Math.floor(lon("Moon", dayStart) / 30), endSign: Math.floor(lon("Moon", dayEnd - 1) / 30), rise: moonrise, set: moonset, waxing: el < 180 },
      moonAsp: moonAsp.filter((a) => a.ms >= dayStart && a.ms < dayEnd), natalAsp: natalAsp.filter((a) => a.ms >= dayStart && a.ms < dayEnd), voids,
      sky, retro, events, transits,
      panchang: { tithis, naks, yogas, karanas, atRise, ayan, mu, month: hm, sid, vara: ph.ruler },
      nums, maya: my, chinese: cn, bio, colors: col, gates, slots, windows: win, best
    };
    cache.set(key, res);
    if (cache.size > 12) cache.delete(cache.keys().next().value);
    return res;
  }

  return { compute, isoIn, parts, zonedToUtc, sampleSky, moonAspects, moonIngresses, voidPeriods, OTHERS, ayanamsa, maya, chinese, biorhythm, planetaryHours, muhurtas, sunFrame, levelOf, LEVELS, COLORS, NUM_COLOR, CHALDEAN, DAY_RULER, TZ_SIGNS, DS_SEALS, DS_TONES, OFFICERS, ANIMALS, STEMS, BRANCHES, karanaName, jdn };
})();
