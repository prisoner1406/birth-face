// Birth Face: run with `node build/test-rising.js`.
const fs = require("fs");
const A = require("../node_modules/astronomy-engine");
global.window = { Astronomy: A };
const J = (f) => fs.readFileSync(__dirname + "/../app/js/" + f, "utf8");
eval(["arcana.js", "matrix.js", "humandesign.js", "astro.js", "extras.js", "daily.js", "dignity.js", "faces.js", "rising.js", "describe.js", "shem/index.js", "mansion/index.js", "lilly/index.js"].map(J).join("\n") + ";global.Astro=Astro;global.Daily=Daily;global.Faces=Faces;global.Rising=Rising;global.Describe=Describe;global.SHEM_HAVE=SHEM_HAVE;global.MANSION_HAVE=MANSION_HAVE;global.LILLY_HAVE=LILLY_HAVE;");
let fail = 0;
const ok = (n, c, x = "") => { console.log((c ? "PASS " : "FAIL ") + n + (x ? "  " + x : "")); if (!c) fail++; };
ok("36 drekkana figures", Rising.DREKKANA.length === 36);
// Elvis: 12° Sagittarius rising (tropical).
const elvis = Astro.natal(Date.UTC(1935, 0, 8, 10, 35), 34.26, -88.70, "placidus", true), L = Rising.layers(elvis);
ok("decan: second decan of Sagittarius, the Moon (Chaldean)", L.sign === "Sagittarius" && L.decan.n === 2 && L.decan.lord === "Moon", JSON.stringify(L.decan));
ok("Lilly's degree for 13° Sagittarius: feminine, light", L.lilly.sex === "f" && L.lilly.light === "light", JSON.stringify(L.lilly));
ok("drekkana: sidereal, lord of the 1st, 5th or 9th sign from the rising sign", ["Jupiter", "Mars", "Sun"].includes(L.drekkana.lord) && L.sidereal.sign === "Scorpio", `${L.sidereal.sign} ${L.sidereal.deg.toFixed(1)}° · ${L.drekkana.n} · ${L.drekkana.lord} · ${L.drekkana.figure}`);
ok("Shem pair of the decan includes the rising angel", L.shem.length === 2 && L.shem.some((s) => s.rising));
let bad = 0;
for (let k = 0; k < 300; k++) {
  const n = Astro.natal(Date.UTC(1950, 0, 1) + k * 864e5 * 73.3 + k * 36e5 * 3.1, 30, 10, "placidus", true), l = Rising.layers(n), c = Rising.contributions(l);
  if (Math.abs(Object.values(c).reduce((a, b) => a + b, 0) - 1) > 1e-9) bad++;
  const f = Rising.femininity(n, l); if (!(f >= 0 && f <= 1)) bad++;
  if (!["light", "dark", "smoky", "void"].includes(l.lilly.light)) bad++;
}
ok("300 charts: every layer found, contributions sum to 1", bad === 0);
ok("no layers without a birth time", Rising.layers(Astro.natal(Date.UTC(1990, 5, 1), 35, 20, "placidus", false)) === null);
(async () => {
  const n = Astro.natal(Date.UTC(1990, 3, 3, 8), 51.5, -0.12, "placidus", true), c = Describe.chartProfile(n);
  // A description built from the chart's own strongest planet must fit it better than one from its weakest.
  const top = Object.entries(c.planets).sort((a, b) => b[1] - a[1]), best = top[0][0], worst = top[6][0];
  const pick = (planet) => Object.fromEntries(Describe.QUESTIONS.map(([k, , opts]) => [k, opts.slice().sort((a, b) => (b[2][planet] || 0) - (a[2][planet] || 0))[0][0]]));
  const rb = await Describe.relevance(n, { lat: 51.5, lon: -0.12 }, pick(best), 120), rw = await Describe.relevance(n, { lat: 51.5, lon: -0.12 }, pick(worst), 120);
  ok("a description in the chart's strongest planet fits it better than one in its weakest", rb.score > rw.score && rb.percentile > rw.percentile, `${best}: ${(rb.percentile * 100).toFixed(0)}th percentile · ${worst}: ${(rw.percentile * 100).toFixed(0)}th`);
  ok("every question has answers with significations", Describe.QUESTIONS.length >= 12 && Describe.QUESTIONS.every(([, , o]) => o.length >= 2));
  ok("feature element from words", Describe.featureElement({ lips: "full" }, "mouth") === "Water" && Describe.featureElement({ hairTexture: "curly" }, "hair") === "Fire");
  console.log(fail ? `\n${fail} FAILED` : "\nAll Birth Face checks passed");
  process.exit(fail ? 1 : 0);
})();
