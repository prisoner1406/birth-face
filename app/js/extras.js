// Numerology (Pythagorean), tarot spreads and journal insights.
const Numerology = (() => {
  const VAL = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9, S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8 };
  const VOWELS = new Set(["A", "E", "I", "O", "U"]);
  const MASTER = new Set([11, 22, 33]);
  const KARMIC = new Set([13, 14, 16, 19]);
  const dsum = (n) => String(n).split("").reduce((s, d) => s + Number(d), 0);
  // Reduce to a single digit, keeping master numbers; record any karmic-debt number passed through.
  function reduce(n, trail) {
    while (n > 9 && !MASTER.has(n)) { if (trail && KARMIC.has(n)) trail.push(n); n = dsum(n); }
    return n;
  }
  const clean = (name) => (name || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z ]/g, " ").split(/\s+/).filter(Boolean);

  function nameNumber(name, filter) {
    const trail = [];
    const parts = clean(name).map((w) => reduce(w.split("").filter(filter).reduce((s, ch) => s + VAL[ch], 0), trail)).filter((x) => x > 0);
    if (!parts.length) return null;
    const total = parts.reduce((a, b) => a + b, 0);
    return { value: reduce(total, trail), karmic: [...new Set(trail)] };
  }

  function profile(dateStr, fullName, today = new Date()) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const trail = [];
    const lpRaw = reduce(m) + reduce(d) + reduce(dsum(y));
    const lifePath = reduce(lpRaw, trail);
    if (KARMIC.has(d)) trail.push(d);
    const birthday = d > 9 && !MASTER.has(d) ? dsum(d) > 9 ? dsum(dsum(d)) : dsum(d) : d;
    const expression = fullName ? nameNumber(fullName, () => true) : null;
    const soulUrge = fullName ? nameNumber(fullName, (c) => VOWELS.has(c)) : null;
    const personality = fullName ? nameNumber(fullName, (c) => !VOWELS.has(c)) : null;
    const maturity = expression ? reduce(lifePath + expression.value) : null;
    const pYear = (yr) => reduce(reduce(m) + reduce(d) + reduce(dsum(yr)));
    const personalYear = pYear(today.getFullYear());
    const personalMonth = reduce(personalYear + today.getMonth() + 1);
    const personalDay = reduce(personalMonth + today.getDate());
    // Pinnacles and challenges (four life chapters).
    const rm = reduce(m), rd = reduce(d), ry = reduce(dsum(y));
    const firstEnd = 36 - (lifePath > 9 ? dsum(lifePath) : lifePath);
    const pinnacles = [reduce(rm + rd), reduce(rd + ry)];
    pinnacles.push(reduce(pinnacles[0] + pinnacles[1]), reduce(rm + ry));
    const s = (n) => (n > 9 ? dsum(n) : n);
    const ch1 = Math.abs(s(rm) - s(rd)), ch2 = Math.abs(s(rd) - s(ry));
    const challenges = [ch1, ch2, Math.abs(ch1 - ch2), Math.abs(s(rm) - s(ry))];
    const ages = [[0, firstEnd], [firstEnd + 1, firstEnd + 9], [firstEnd + 10, firstEnd + 18], [firstEnd + 19, null]];
    return { lifePath, birthday, expression, soulUrge, personality, maturity, personalYear, personalMonth, personalDay, karmicDebt: [...new Set(trail.concat(expression?.karmic || []))], pinnacles, challenges, ages, years: Array.from({ length: 9 }, (_, i) => ({ year: today.getFullYear() + i, n: pYear(today.getFullYear() + i) })) };
  }
  return { profile, reduce };
})();

const Tarot = (() => {
  const rnd = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
  function draw(count, reversals = true) {
    const deck = Array.from({ length: 22 }, (_, i) => i + 1);
    for (let i = deck.length - 1; i > 0; i--) { const j = rnd(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    return deck.slice(0, count).map((n) => ({ n, reversed: reversals && rnd(4) === 0 }));
  }
  return { draw };
})();

const Insights = (() => {
  // Average journal mood grouped by any key; only groups with at least `min` entries are kept.
  function byKey(entries, key, min = 2) {
    const g = {};
    entries.forEach((e) => { const k = e[key]; if (k == null || !e.mood) return; (g[k] ||= []).push(e.mood); });
    return Object.entries(g).filter(([, v]) => v.length >= min).map(([k, v]) => ({ k, avg: v.reduce((a, b) => a + b, 0) / v.length, n: v.length })).sort((a, b) => b.avg - a.avg);
  }
  return { byKey };
})();
