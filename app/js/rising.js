// Birth Face: the face read from the exact degree rising at birth, by the oldest layers of the tradition.
//   · the Egyptian decan: the ten degrees rising, under the planet the Chaldean order gives it, with the two
//     angels of the Name who hold its five-degree halves;
//   · Varahamihira's drekkana (Brihat Jataka, ch. 27, sidereal): the figure rising, man or woman, and its lord,
//     the lord of the rising sign, of the fifth sign from it, or of the ninth (Brihat Jataka I.12);
//   · the rising navamsa (Jyotish, sidereal): the ninth of the sign, read for the body;
//   · Lilly's degrees (Christian Astrology, p. 116, after Al-Biruni): whether the rising degree is masculine or
//     feminine, and light, dark, smoky or void.
// Uses Astro, Daily (ayanamsa), Faces (portraits, names, Lilly's faces).
const Rising = (() => {
  const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const RULER = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
  const CHALDEAN = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"];
  const norm = (x) => ((x % 360) + 360) % 360;

  // Varahamihira's 36 drekkana figures (Brihat Jataka 27, after M. D. Neely's translation, condensed): [sex, figure].
  // sex: "m", "f", or null where the verse names no person.
  const DREKKANA = [
    ["m", "a man wrapped in a white cloth at the hips, holding an uplifted axe, able to protect"], ["f", "a woman in a red garment, thinking of ornaments and food"], ["m", "a fierce man skilled in the arts, in red clothes, holding a raised staff"],
    ["f", "a woman with curled, trimmed hair, desiring ornaments"], ["m", "a man skilled with cart and plough, carrying a load on his shoulder"], [null, "a mind longing for the wild game of the mountain, at the forest's edge"],
    ["f", "a woman of beauty, honoured for her craft, one hand raised"], ["m", "a hero in a grove, in armour, bearing a bow"], ["m", "a man ornamented like Varuna, a poet skilled in dance and music, with a small bow"],
    ["m", "a man gathering leaves, roots and fruit among sandal trees"], ["f", "a woman crowned with lotuses, sheltered under a Palasha tree"], ["m", "a man adorned with ornaments, on a boat bound for the ocean"],
    ["m", "a man under a Shalmali tree, with a vulture, a jackal and a dog"], ["m", "a man with a pale wreath on his head and a drawn bow, dangerous as a lion"], ["m", "a man with a long beard and curly hair, carrying a staff, fruit and fish"],
    ["f", "a woman with a jar overflowing with flowers"], ["m", "a man with a pen, his head wrapped in cloth, keeping accounts, carrying a bow"], ["f", "a maiden in the finest white cloth, holding a water-pot, going to the temple"],
    ["m", "a man in a market with a scale, skilled in measures"], ["m", "a man seizing a pot to rush out, his mind on wife and children"], ["m", "a man with a golden quiver and armour, fearless among the forest animals"],
    ["f", "a woman come from the sea to the shore, her feet coiled with serpents"], ["f", "a woman surrounded by serpents, seeking comfort for her husband's sake"], [null, "a lion-like lord of beasts, guarding his land"],
    ["m", "a man with a fully drawn bow, guarding a hermitage"], ["f", "a woman seated in the Bhadrasana posture, with the goods of the sea"], ["m", "a man seated, holding a rod, in silk and an animal hide"],
    ["m", "a hairy man holding a rope snare"], ["f", "a woman learned in the arts, with iron ornaments in her ears"], ["m", "a man with a blanket, quiver, bow and armour, a jewelled pitcher on his shoulder"],
    ["m", "a man with a blanket, silk and an animal skin, his mind on oil, water and food"], ["f", "a woman with pots on her head, in a cart in the forest"], ["m", "a man wearing a crown, carrying pots of bark, leaves, oil and fruit"],
    ["m", "a man with a sacrificial ladle, pearls and conches, sailing the sea"], ["f", "a woman travelling by boat, with flags and banners raised"], ["m", "a man near a burrow, coiled by a serpent, weeping in the forest"]
  ];

  // Lilly's table of degrees (Christian Astrology p. 116): for each sign, runs of [last degree, letter].
  // Masculine or feminine (M/F); light, dark, smoky or void (L/D/S/V).
  const RUN = (s) => s.split(" ").map((x) => [+x.slice(1).split("-").pop(), x[0]]);
  const MF = ["M8 F9 M15 F22 M30", "F5 M11 F17 M21 F24 M30", "F5 M16 F22 M26 F30", "M2 F8 M10 F12 M23 F27 M30", "M5 F8 M15 F23 M30", "F8 M12 F20 M30",
    "M5 F15 M20 F27 M30", "M4 F14 M17 F24 M30", "M2 F5 M12 F24 M30", "M11 F19 M30", "M5 F15 M21 F25 M27 F30", "M10 F20 M23 F28 M30"].map(RUN);
  const LD = ["D3 L8 D16 L20 V24 L29 V30", "D3 L7 V12 L15 V20 L28 D30", "L4 D7 L12 V16 L22 D27 V30", "L12 D14 V18 S20 L28 V30", "D10 S20 V25 L30", "D5 L8 V10 L16 S22 V27 D30",
    "L5 D10 L18 D21 L27 V30", "D3 L8 V14 L22 S24 V29 D30", "L9 D12 L19 S23 L30", "D7 L10 S15 D22 V25 D30", "S4 L9 D13 L21 V25 L30", "D6 L12 D22 V25 L28 D30"].map(RUN);
  const at = (runs, deg) => runs.find(([end]) => deg <= end)[1];
  const LDN = { L: "light", D: "dark", S: "smoky", V: "void" };

  // Every layer of the rising degree for a chart (null without a birth time).
  function layers(natal) {
    if (!natal.timeKnown) return null;
    const asc = norm(natal.asc.lon), sign = SIGNS[Math.floor(asc / 30)], deg = asc % 30, degNo = Math.floor(deg) + 1;
    // Egyptian decan (tropical, as the app counts the decans and the Shem angels).
    const di = Math.floor(asc / 10), decanLord = CHALDEAN[di % 7];
    const shem = [2 * di + 1, 2 * di + 2].map((n) => ({ n, key: "shem" + String(n).padStart(2, "0"), name: Faces.SHEM[n - 1], rising: Math.floor(asc / 5) + 1 === n }));
    // Drekkana and navamsa (sidereal, Lahiri).
    const sid = norm(asc - Daily.ayanamsa(natal.utcMs)), sSign = SIGNS[Math.floor(sid / 30)], part = Math.floor((sid % 30) / 10);
    const dLord = RULER[SIGNS[(Math.floor(sid / 30) + [0, 4, 8][part]) % 12]];
    const [dSex, dFig] = DREKKANA[Math.floor(sid / 30) * 3 + part];
    const navamsa = SIGNS[Math.floor(sid / (30 / 9)) % 12];
    // Lilly's degree.
    const lSex = at(MF[SIGNS.indexOf(sign)], degNo), lLight = at(LD[SIGNS.indexOf(sign)], degNo);
    return {
      asc, sign, deg, degNo, decan: { n: di % 3 + 1, lord: decanLord }, shem,
      sidereal: { lon: sid, sign: sSign, deg: sid % 30 }, drekkana: { n: part + 1, lord: dLord, sex: dSex, figure: dFig }, navamsa,
      lilly: { sex: lSex === "M" ? "m" : "f", light: LDN[lLight] }
    };
  }

  // What the rising degree adds to the face: the portraits of the decan's lord and of the drekkana's lord in the
  // rising sign (Lilly's faces), the two angels of the Name of the decan, and the angel of the navamsa sign.
  const MIX = { decan: 0.35, drekkana: 0.3, shem: 0.2, navamsa: 0.15 };
  function contributions(L) {
    const have = typeof LILLY_HAVE !== "undefined" ? LILLY_HAVE : [], sh = typeof SHEM_HAVE !== "undefined" ? SHEM_HAVE : [];
    const out = {}, add = (k, v, ok) => { if (ok) out[k] = (out[k] || 0) + v; };
    const lk = (p) => Faces.lillyKey(p, L.sign);
    add(lk(L.decan.lord), MIX.decan, have.includes(+lk(L.decan.lord).slice(5)));
    add(lk(L.drekkana.lord), MIX.drekkana, have.includes(+lk(L.drekkana.lord).slice(5)));
    for (const s of L.shem) add(s.key, MIX.shem / 2, sh.includes(s.n));
    add(Faces.SIGN_ANGEL[L.navamsa], MIX.navamsa, true);
    const t = Object.values(out).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v / t]));
  }
  // How much of each part of the face the rising degree shapes (the hair keeps its one leader).
  const SHARE = { face: 0.35, brows: 0.3, nose: 0.3, eyes: 0.2, mouth: 0.2 };
  // The chart's masculine and feminine, with the rising degree's own testimonies: the drekkana's figure and
  // Lilly's degree each count as much as one of the chart's major testimonies (an eighth of the whole).
  function femininity(natal, L) {
    let f = Faces.genderBalance(natal).feminine;
    if (L) { const t = [L.drekkana.sex, L.lilly.sex].filter(Boolean); for (const s of t) f = f * (1 - 0.125) + 0.125 * (s === "f" ? 1 : 0); }
    return f;
  }
  return { layers, contributions, femininity, SHARE, MIX, DREKKANA, SIGNS, RULER };
})();
