// Destiny Matrix: calculation, age forecast, personal cycles, couple matrix and chart drawing.
const Matrix = (() => {
  // Any number above 22 is reduced by adding its digits (repeated until it fits).
  const r = (n) => {
    while (n > 22) n = String(n).split("").reduce((s, d) => s + Number(d), 0);
    return n === 0 ? 22 : n;
  };
  const digits = (n) => String(n).split("").reduce((s, d) => s + Number(d), 0);

  // Build every point of the matrix from the three base numbers.
  function fromBase(A, B, C) {
    const D = r(A + B + C);
    const E = r(A + B + C + D);
    const F = r(A + B), G = r(B + C), Y = r(C + D), K = r(D + A);
    const A2 = r(A + E), B2 = r(B + E), C2 = r(C + E), D2 = r(D + E);
    const A1 = r(A + A2), B1 = r(B + B2), C1 = r(C + C2), D1 = r(D + D2);
    const A3 = r(A2 + E), B3 = r(B2 + E);
    // Inner points of the ancestral (diagonal) square
    const F2 = r(F + E), G2 = r(G + E), Y2 = r(Y + E), K2 = r(K + E);
    const F1 = r(F + F2), G1 = r(G + G2), Y1 = r(Y + Y2), K1 = r(K + K2);
    const X = r(C2 + D2);
    const LOVE = r(X + D2);
    const MONEY = r(X + C2);
    const SKY = r(B + D), EARTH = r(A + C);
    const PERSONAL = r(SKY + EARTH);
    const MALE = r(F + Y), FEMALE = r(G + K);
    const SOCIAL = r(MALE + FEMALE);
    const SPIRITUAL = r(PERSONAL + SOCIAL);
    const PLANETARY = r(SOCIAL + SPIRITUAL);

    const chakras = [
      { name: "Sahasrara", sub: "Crown · mission", color: "#7b5ea7", phys: A, energy: B },
      { name: "Ajna", sub: "Third eye · vision", color: "#3f5f9e", phys: A1, energy: B1 },
      { name: "Vishuddha", sub: "Throat · expression", color: "#4b9bb5", phys: A2, energy: B2 },
      { name: "Anahata", sub: "Heart · relationships", color: "#5e9a6b", phys: A3, energy: B3 },
      { name: "Manipura", sub: "Solar plexus · power", color: "#c9a227", phys: E, energy: E },
      { name: "Svadhisthana", sub: "Sacral · pleasure", color: "#d07a35", phys: C2, energy: D2 },
      { name: "Muladhara", sub: "Root · body", color: "#b0413e", phys: C, energy: D }
    ].map((c) => ({ ...c, emotion: r(c.phys + c.energy) }));
    const total = { phys: r(chakras.reduce((s, c) => s + c.phys, 0)), energy: r(chakras.reduce((s, c) => s + c.energy, 0)) };
    total.emotion = r(total.phys + total.energy);

    const m = {
      A, B, C, D, E, F, G, Y, K, A1, A2, A3, B1, B2, B3, C1, C2, D1, D2, F1, F2, G1, G2, Y1, Y2, K1, K2,
      X, LOVE, MONEY, SKY, EARTH, PERSONAL, MALE, FEMALE, SOCIAL, SPIRITUAL, PLANETARY, chakras, total
    };
    m.ages = ageChart(m);
    return m;
  }

  function calculate(day, month, year) {
    return fromBase(r(day), r(month), r(digits(year)));
  }

  // The perimeter of the matrix is a life clock: A = 0, F = 10, B = 20 … K = 70, back to A at 80.
  // Each 10-year side is split into eighths (1¼ years) by repeated halving.
  const CLOCK = ["A", "F", "B", "G", "C", "Y", "D", "K"];
  function ageChart(m) {
    const out = [];
    CLOCK.forEach((k, i) => {
      const v0 = m[k], v10 = m[CLOCK[(i + 1) % 8]];
      const mid = r(v0 + v10), q1 = r(v0 + mid), q3 = r(mid + v10);
      const vals = [v0, r(v0 + q1), q1, r(q1 + mid), mid, r(mid + q3), q3, r(q3 + v10)];
      vals.forEach((n, j) => out.push({ from: i * 10 + j * 1.25, to: i * 10 + (j + 1) * 1.25, n, vertex: j === 0 ? k : null, side: i, step: j }));
    });
    return out;
  }
  const fmtAge = (x) => String(+x.toFixed(2));
  const ageLabel = (p) => `${fmtAge(p.from)}–${fmtAge(p.to)}`;
  const ageAt = (m, age) => m.ages.find((p) => age >= p.from && age < p.to) || m.ages[m.ages.length - 1];

  // Personal cycles (numerology year / month / day arcana).
  function personalYear(day, month, year) { return r(r(day) + r(month) + r(digits(year))); }
  function cycles(day, month, date = new Date()) {
    const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
    const year = personalYear(day, month, y);
    const monthN = r(year + mo);
    const dayN = r(monthN + r(d));
    return { year, month: monthN, day: dayN };
  }

  // Frequency of each arcana across the meaningful points.
  const MAIN_KEYS = ["A", "B", "C", "D", "E", "F", "G", "Y", "K", "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "F1", "F2", "G1", "G2", "Y1", "Y2", "K1", "K2", "X", "LOVE", "MONEY", "SKY", "EARTH", "PERSONAL", "MALE", "FEMALE", "SOCIAL", "SPIRITUAL", "PLANETARY"];
  function frequencies(m) {
    const count = {};
    MAIN_KEYS.forEach((k) => (count[m[k]] = (count[m[k]] || 0) + 1));
    const dominant = Object.entries(count).map(([n, c]) => ({ n: Number(n), c })).sort((a, b) => b.c - a.c || a.n - b.n);
    const missing = Array.from({ length: 22 }, (_, i) => i + 1).filter((n) => !count[n]);
    return { dominant, missing };
  }

  // Couple matrix: the base numbers of two people added together.
  function couple(m1, m2) {
    return fromBase(r(m1.A + m2.A), r(m1.B + m2.B), r(m1.C + m2.C));
  }

  const SECTIONS = [
    { key: "A", title: "Personality Traits", source: "Point A, the left vertex of the matrix: your day of birth (above 22 the digits are added, e.g. 29 gives 11).", asks: "How do you act and how do others see you?" },
    { key: "B", title: "Gifts & Talents", source: "Point B, the top vertex: your month of birth.", asks: "What did you bring with you, and where does inspiration come from?" },
    { key: "C", title: "Material World", source: "Point C, the right vertex: the digits of your birth year added together (and again if the sum is above 22).", asks: "How do you build, earn and handle the physical world?" },
    { key: "D", title: "Karmic Tail", source: "Point D, the bottom vertex: A + B + C. Read together with D1 and D2 as the karmic tail code.", asks: "Which lesson keeps returning until you learn it?" },
    { key: "E", title: "Comfort Zone", source: "The centre of the matrix: A + B + C + D.", asks: "Where do you feel at home, and what quietly restores you?" },
    { key: "LOVE", title: "Love & Partnership", source: "The love point on the relationship line: (C2 + D2) + D2.", asks: "What kind of partner and bond lets you flourish?" },
    { key: "MONEY", title: "Money Channel", source: "The money point on the relationship line: (C2 + D2) + C2.", asks: "Which activity opens the flow of money for you?" },
    { key: "PERSONAL", title: "Personal Purpose", source: "Sky line (B + D) plus Earth line (A + C). Most active between ages 20 and 40.", asks: "What are you here to master for yourself?" },
    { key: "SOCIAL", title: "Social Purpose", source: "Paternal line (F + Y) plus maternal line (G + K). Most active between 40 and 60.", asks: "What do you offer your family, community and work?" },
    { key: "SPIRITUAL", title: "Spiritual Purpose", source: "Personal purpose plus social purpose. Most active after 60.", asks: "What is the soul's lesson behind the whole life?" },
    { key: "PLANETARY", title: "Planetary Purpose", source: "Social purpose plus spiritual purpose.", asks: "What do you leave behind for the world?" }
  ];

  const POINT_INFO = {
    A: ["Personality", "Day of birth"], B: ["Talents", "Month of birth"], C: ["Material world", "Year of birth"],
    D: ["Karmic tail", "A + B + C"], E: ["Comfort zone", "A + B + C + D"],
    F: ["Paternal gifts", "A + B · age 10"], G: ["Maternal gifts", "B + C · age 30"],
    Y: ["Paternal tasks", "C + D · age 50"], K: ["Maternal tasks", "D + A · age 70"],
    A1: ["Outer self", "A + A2"], A2: ["Inner self", "A + E"], A3: ["Heart's wish", "A2 + E"],
    B1: ["Hidden talent", "B + B2"], B2: ["Talent in use", "B + E"], B3: ["Heart's talent", "B2 + E"],
    C1: ["Money entry", "C + C2"], C2: ["Money task", "C + E"],
    D1: ["Karmic lesson", "D + D2"], D2: ["Karmic root", "D + E"],
    F1: ["Father's line · spirit", "F + F2"], F2: ["Father's line · heart", "F + E"],
    G1: ["Mother's line · spirit", "G + G2"], G2: ["Mother's line · heart", "G + E"],
    Y1: ["Father's line · matter", "Y + Y2"], Y2: ["Father's line · root", "Y + E"],
    K1: ["Mother's line · matter", "K + K2"], K2: ["Mother's line · root", "K + E"],
    X: ["Relationship balance", "C2 + D2"], LOVE: ["Love point", "X + D2"], MONEY: ["Money point", "X + C2"]
  };

  // ---------- SVG chart ----------
  const CX = 340, CY = 340, R = 240;
  const DIRS = { A: 180, F: 225, B: 270, G: 315, C: 0, Y: 45, D: 90, K: 135 };
  const polar = (deg, rad) => [CX + rad * Math.cos((deg * Math.PI) / 180), CY + rad * Math.sin((deg * Math.PI) / 180)];

  function layout() {
    const p = {};
    for (const [k, deg] of Object.entries(DIRS)) p[k] = polar(deg, R);
    for (const k of ["A", "B", "C", "D"]) { p[k + "1"] = polar(DIRS[k], R - 50); p[k + "2"] = polar(DIRS[k], R - 96); }
    for (const k of ["F", "G", "Y", "K"]) { p[k + "1"] = polar(DIRS[k], R - 46); p[k + "2"] = polar(DIRS[k], R - 86); }
    p.A3 = polar(180, R - 144); p.B3 = polar(270, R - 144);
    p.E = [CX, CY];
    const [c2x, c2y] = p.C2, [d2x, d2y] = p.D2;
    p.X = [(c2x + d2x) / 2 + 18, (c2y + d2y) / 2 + 18];
    p.MONEY = [(p.X[0] + c2x) / 2 + 12, (p.X[1] + c2y) / 2 + 4];
    p.LOVE = [(p.X[0] + d2x) / 2 + 4, (p.X[1] + d2y) / 2 + 12];
    return p;
  }

  function draw(m, opts = {}) {
    const p = layout();
    const ring = (key, rad, cls) => {
      const [x, y] = p[key];
      return `<g class="mpt ${cls}" data-key="${key}" tabindex="0" role="button" aria-label="${(POINT_INFO[key] || [key])[0]}: ${m[key]} ${ARCANA[m[key]].name}">
        <circle cx="${x}" cy="${y}" r="${rad}"/><text x="${x}" y="${y}" dy="0.36em">${m[key]}</text></g>`;
    };
    const line = (a, b, cls = "") => `<line class="${cls}" x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}"/>`;

    // Age clock: an outer octagon with the 64 age arcana.
    const OUT = R + 46;
    const vtx = CLOCK.map((k) => polar(DIRS[k], OUT));
    const ageMarks = m.ages.map((a) => {
      const [x0, y0] = vtx[a.side], [x1, y1] = vtx[(a.side + 1) % 8];
      const t = a.step / 8;
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const cur = opts.age != null && opts.age >= a.from && opts.age < a.to;
      if (a.step === 0) return `<g class="mage-v ${cur ? "cur" : ""}"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y}" dy="0.35em">${a.from}</text></g>`;
      return `<g class="mage-p ${cur ? "cur" : ""}" data-age="${a.from}"><circle cx="${x}" cy="${y}" r="9"/><text x="${x}" y="${y}" dy="0.36em">${a.n}</text><title>Age ${ageLabel(a)}: ${a.n} ${ARCANA[a.n].name}</title></g>`;
    }).join("");

    const rays = Array.from({ length: 16 }, (_, i) => {
      const [x1, y1] = polar(i * 22.5, 40), [x2, y2] = polar(i * 22.5, R - 10);
      return `<line class="mray" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }).join("");

    return `<svg viewBox="0 0 680 680" class="matrix-svg" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="mglow"><stop offset="0" stop-color="#ead9a2" stop-opacity=".6"/><stop offset="1" stop-color="#ead9a2" stop-opacity="0"/></radialGradient></defs>
      <polygon class="mclock" points="${vtx.map((v) => v.join(",")).join(" ")}"/>
      <circle cx="${CX}" cy="${CY}" r="${R - 30}" fill="url(#mglow)"/>
      ${rays}
      <g class="mlines">
        <polygon points="${["A", "B", "C", "D"].map((k) => p[k].join(",")).join(" ")}"/>
        <polygon points="${["F", "G", "Y", "K"].map((k) => p[k].join(",")).join(" ")}"/>
        ${line("A", "C")}${line("B", "D")}${line("F", "Y", "diag")}${line("G", "K", "diag")}
        ${line("C2", "D2", "lovemoney")}
      </g>
      ${ageMarks}
      ${["F", "G", "Y", "K"].map((k) => ring(k, 23, "anc")).join("")}
      ${["F1", "G1", "Y1", "K1", "F2", "G2", "Y2", "K2"].map((k) => ring(k, 13, "anc-in")).join("")}
      ${ring("A", 27, "main ck-crown")}${ring("B", 27, "main ck-crown")}${ring("C", 27, "main ck-root")}${ring("D", 27, "main ck-root")}
      ${ring("A1", 18, "l1 ck-ajna")}${ring("B1", 18, "l1 ck-ajna")}${ring("C1", 18, "l1")}${ring("D1", 18, "l1")}
      ${ring("A2", 18, "l2 ck-throat")}${ring("B2", 18, "l2 ck-throat")}${ring("C2", 18, "l2 ck-sacral")}${ring("D2", 18, "l2 ck-sacral")}
      ${["A3", "B3"].map((k) => ring(k, 15, "l3 ck-heart")).join("")}
      ${ring("X", 14, "lm")}${ring("MONEY", 14, "money")}${ring("LOVE", 14, "love")}
      ${ring("E", 34, "center")}
      <text class="mtag" x="${p.MONEY[0] + 21}" y="${p.MONEY[1] - 4}">$</text>
      <text class="mtag" x="${p.LOVE[0] - 4}" y="${p.LOVE[1] + 29}">♡</text>
    </svg>`;
  }

  return { calculate, couple, draw, cycles, personalYear, frequencies, ageAt, ageLabel, SECTIONS, POINT_INFO, r };
})();
