// The 22 Major Arcana as used by the Destiny Matrix (8 = Justice, 11 = Strength, 22 = The Fool).
// Card art: Rider–Waite–Smith deck (Pamela Colman Smith, 1909), public domain, bundled in app/img/cards.
// The printed numerals on Justice and Strength are swapped to match this numbering (build/fix-card-numerals.py).
const RWS = (file) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=360`;

const ARCANA = {
  1: {
    name: "The Magician", roman: "I", symbol: "∞", img: RWS("RWS_Tarot_01_Magician.jpg"),
    keywords: ["will", "skill", "beginnings"],
    essence: "Raw will meeting the right tools. You turn a spark of an idea into something people can touch, often before anyone else sees it is possible.",
    strength: "Quick hands and a quick mind. You start things, connect people and make the first move look easy.",
    trap: "Scattering your fire across ten projects, or using charm to steer people instead of being straight with them.",
    firstStep: "Pick one idea you keep talking about and finish the smallest working version of it this week."
  },
  2: {
    name: "The High Priestess", roman: "II", symbol: "☾", img: RWS("RWS_Tarot_02_High_Priestess.jpg"),
    keywords: ["intuition", "silence", "knowing"],
    essence: "The quiet knower behind the veil. You read rooms, moods and motives long before anyone says a word.",
    strength: "Deep intuition and the gift of keeping a confidence. People feel safe telling you what they tell no one else.",
    trap: "Hiding behind mystery, waiting passively, and distrusting your own inner voice until it is too late.",
    firstStep: "Write down one hunch each morning for seven days, then check how many came true."
  },
  3: {
    name: "The Empress", roman: "III", symbol: "♀", img: RWS("RWS_Tarot_03_Empress.jpg"),
    keywords: ["abundance", "beauty", "nurture"],
    essence: "Fertile ground. Wherever you settle, things grow: gardens, families, businesses, friendships.",
    strength: "Warmth, taste and a talent for making a space feel alive and welcoming.",
    trap: "Smothering with care, overindulging, or measuring your worth by how much others need you.",
    firstStep: "Spend one afternoon creating something beautiful purely for your own pleasure."
  },
  4: {
    name: "The Emperor", roman: "IV", symbol: "♂", img: RWS("RWS_Tarot_04_Emperor.jpg"),
    keywords: ["authority", "order", "structure"],
    essence: "Authority and order. You carry the weight of a stone throne that does not topple, even when everyone around you grows tense.",
    strength: "A word that holds. A fixed point others use to find their bearings.",
    trap: "Yielding feels worse than losing. Being in control starts to matter more than being close.",
    firstStep: "In the next conflict where you are right, step back and let the other person have their way."
  },
  5: {
    name: "The Hierophant", roman: "V", symbol: "⚷", img: RWS("RWS_Tarot_05_Hierophant.jpg"),
    keywords: ["teaching", "tradition", "meaning"],
    essence: "The keeper of lineage. You hold knowledge that has been tested by time and you know how to pass it on.",
    strength: "A natural teacher and mentor. You give people a framework they can live by.",
    trap: "Preaching instead of listening, or clinging to rules that no longer serve anyone.",
    firstStep: "Teach one thing you know well to someone younger, and ask them to teach you something back."
  },
  6: {
    name: "The Lovers", roman: "VI", symbol: "♡", img: RWS("RWS_Tarot_06_Lovers.jpg"),
    keywords: ["choice", "union", "values"],
    essence: "The heart at a crossroads. Your path is shaped by the choices you make with love, and by love.",
    strength: "Real empathy and the ability to create harmony and beauty between people.",
    trap: "Pleasing everyone, avoiding choices, and losing yourself inside other people's expectations.",
    firstStep: "Make one decision this week based only on what you value, and say it out loud without apology."
  },
  7: {
    name: "The Chariot", roman: "VII", symbol: "⚔", img: RWS("RWS_Tarot_07_Chariot.jpg"),
    keywords: ["drive", "victory", "movement"],
    essence: "Momentum with direction. You move forward by holding two opposing forces in one steady grip.",
    strength: "Determination, discipline and the energy to travel, compete and win.",
    trap: "Running without a destination, or winning battles that were never worth fighting.",
    firstStep: "Write the one goal you are racing toward. Cross off one activity that does not lead there."
  },
  8: {
    name: "Justice", roman: "VIII", symbol: "⚖", img: RWS("RWS_Tarot_11_Justice.jpg"),
    keywords: ["truth", "balance", "consequence"],
    essence: "The scales that do not lie. You feel cause and effect in your bones and want the world to be fair.",
    strength: "Clear judgment, honesty and the courage to hold yourself and others accountable.",
    trap: "Harsh judgment, black-and-white thinking, and keeping score in relationships.",
    firstStep: "Forgive one old debt, someone else's or your own, and close the ledger for good."
  },
  9: {
    name: "The Hermit", roman: "IX", symbol: "✦", img: RWS("RWS_Tarot_09_Hermit.jpg"),
    keywords: ["wisdom", "solitude", "depth"],
    essence: "The lantern on the mountain. Your clarity comes in quiet, and you light the way for those who follow.",
    strength: "Depth of thought, expertise and the patience to study what others skim.",
    trap: "Isolation, coldness, and hoarding your wisdom for fear it will not be understood.",
    firstStep: "Share one thing you have figured out alone, with one person, in plain words."
  },
  10: {
    name: "Wheel of Fortune", roman: "X", symbol: "☸", img: RWS("RWS_Tarot_10_Wheel_of_Fortune.jpg"),
    keywords: ["flow", "luck", "cycles"],
    essence: "The turning wheel. Life moves you through cycles, and luck finds you when you stay in motion.",
    strength: "Easy-going faith, adaptability and a knack for being in the right place at the right time.",
    trap: "Waiting for luck instead of acting, or drifting wherever the current goes.",
    firstStep: "Say yes to one unexpected invitation this month and follow where it leads."
  },
  11: {
    name: "Strength", roman: "XI", symbol: "♌", img: RWS("RWS_Tarot_08_Strength.jpg"),
    keywords: ["power", "courage", "stamina"],
    essence: "Gentle hands on a lion's jaw. You hold enormous energy and the calm needed to tame it.",
    strength: "Endurance, physical vitality and the courage to take on what scares others.",
    trap: "Burning out, forcing things through sheer effort, or letting anger lead.",
    firstStep: "Replace one act of force this week with patience, and notice what changes."
  },
  12: {
    name: "The Hanged Man", roman: "XII", symbol: "⟲", img: RWS("RWS_Tarot_12_Hanged_Man.jpg"),
    keywords: ["surrender", "perspective", "service"],
    essence: "The world seen upside down. You see what others miss because you are willing to stand where nobody else will.",
    strength: "Creativity, compassion and a gift for seeing a problem from a completely new angle.",
    trap: "Martyrdom, self-sacrifice that nobody asked for, and feeling stuck while waiting to be rescued.",
    firstStep: "Name one situation where you play the victim, and take one action that is only for you."
  },
  13: {
    name: "Death", roman: "XIII", symbol: "☠", img: RWS("RWS_Tarot_13_Death.jpg"),
    keywords: ["transformation", "endings", "renewal"],
    essence: "The great transformer. You clear what is finished so that something truer can be born.",
    strength: "Fearless change. You can cut ties, rebuild from zero and help others through crisis.",
    trap: "Clinging to what is dead, or destroying everything instead of only what is finished.",
    firstStep: "Let go of one object, habit or obligation you have outgrown, today."
  },
  14: {
    name: "Temperance", roman: "XIV", symbol: "⚗", img: RWS("RWS_Tarot_14_Temperance.jpg"),
    keywords: ["balance", "healing", "moderation"],
    essence: "The alchemist pouring water between cups. You blend opposites into something healing.",
    strength: "Patience, a sense of measure and a calming presence that soothes others.",
    trap: "Avoiding conflict so much that nothing ever changes, or losing balance in excess.",
    firstStep: "Choose one area of life in extremes and set a gentle, middle-path rule for it."
  },
  15: {
    name: "The Devil", roman: "XV", symbol: "⛧", img: RWS("RWS_Tarot_15_Devil.jpg"),
    keywords: ["desire", "magnetism", "shadow"],
    essence: "Raw magnetism and appetite. You understand money, desire and power better than most.",
    strength: "Charisma, sensuality and the drive to achieve big material results.",
    trap: "Addictions, manipulation and chains you pretend you cannot remove.",
    firstStep: "Name one dependency, a habit, a person or a craving, and loosen it by one notch."
  },
  16: {
    name: "The Tower", roman: "XVI", symbol: "ϟ", img: RWS("RWS_Tarot_16_Tower.jpg"),
    keywords: ["breakthrough", "revelation", "rebuilding"],
    essence: "Lightning on the tower. Sudden clarity knocks down what was built on false foundations.",
    strength: "Resilience and the vision to build something stronger from the ruins.",
    trap: "Pride, rigidity and creating chaos to avoid facing a deeper truth.",
    firstStep: "Ask a trusted person for honest feedback on a plan, and change one thing they point out."
  },
  17: {
    name: "The Star", roman: "XVII", symbol: "★", img: RWS("RWS_Tarot_17_Star.jpg"),
    keywords: ["hope", "talent", "inspiration"],
    essence: "The star over still water. You carry hope and talent that inspire others simply by being seen.",
    strength: "Creative gifts, optimism and the ability to make people believe in a better future.",
    trap: "Hiding your light, chasing fame for its own sake, or waiting to be discovered.",
    firstStep: "Share one piece of your creative work publicly this week, unfinished or not."
  },
  18: {
    name: "The Moon", roman: "XVIII", symbol: "☽", img: RWS("RWS_Tarot_18_Moon.jpg"),
    keywords: ["imagination", "dreams", "illusion"],
    essence: "Moonlight on a winding path. Your imagination is vast, and your fears can feel just as real.",
    strength: "Vivid imagination, mystical sensitivity and a feel for hidden currents.",
    trap: "Anxiety, illusions and believing the worst stories your mind tells you.",
    firstStep: "Write down your biggest fear, then list three facts that contradict it."
  },
  19: {
    name: "The Sun", roman: "XIX", symbol: "☀", img: RWS("RWS_Tarot_19_Sun.jpg"),
    keywords: ["joy", "success", "warmth"],
    essence: "Sunlight on a child's face. You radiate warmth, generosity and an easy kind of success.",
    strength: "Optimism, leadership and a presence that makes others feel seen.",
    trap: "Needing to be the centre of attention, or burning others with too much brightness.",
    firstStep: "Give one person your full attention and praise this week, with no agenda."
  },
  20: {
    name: "Judgement", roman: "XX", symbol: "♫", img: RWS("RWS_Tarot_20_Judgement.jpg"),
    keywords: ["awakening", "family", "calling"],
    essence: "The trumpet that wakes the sleepers. You carry the wisdom of your family line and the call to renew it.",
    strength: "Rebirth, forgiveness and the ability to bring people and generations together.",
    trap: "Old family grievances, judging others harshly, and refusing to hear your own calling.",
    firstStep: "Contact one relative you have drifted from, and ask them a question about your family's past."
  },
  21: {
    name: "The World", roman: "XXI", symbol: "⊕", img: RWS("RWS_Tarot_21_World.jpg"),
    keywords: ["completion", "freedom", "horizon"],
    essence: "The dancer inside the wreath. Your soul wants the whole world: travel, cultures, wide horizons.",
    strength: "A global mind, diplomacy and the gift of finishing what you start.",
    trap: "Feeling caged by small places, or endless searching without ever arriving.",
    firstStep: "Plan one journey, even a short one, to a place you have never been."
  },
  22: {
    name: "The Fool", roman: "XXII", symbol: "◌", img: RWS("RWS_Tarot_00_Fool.jpg"),
    keywords: ["freedom", "play", "trust"],
    essence: "The traveller at the cliff's edge. You are free, curious and open to whatever life offers next.",
    strength: "Spontaneity, lightness and a childlike trust that opens doors.",
    trap: "Irresponsibility, fear of commitment and running away when life gets serious.",
    firstStep: "Keep one promise this week that you are tempted to break, and enjoy the freedom it gives."
  }
};

// Card art is bundled with the app (works offline). Two decks: the Archangel deck (default) and the classic
// Rider–Waite–Smith. The choice lives in window.ArcanaDeck ("archangel" or "rws") and is read at render time.
const CARD_DECKS = { archangel: "img/cards-archangel/", rws: "img/cards/" };
const CARD_SM_W = { archangel: [320, 640], rws: [250, 500] };
const deckKey = () => (typeof window !== "undefined" && CARD_DECKS[window.ArcanaDeck] ? window.ArcanaDeck : "archangel");
// Sharp small copies (build/make-small-images.py) are offered to the browser for cards shown small.
for (const n in ARCANA) Object.defineProperty(ARCANA[n], "srcset", { enumerable: false, get: () => { const k = deckKey(), [w1, w2] = CARD_SM_W[k]; return `${CARD_DECKS[k]}sm/${n}.jpg ${w1}w, ${CARD_DECKS[k]}${n}.jpg ${w2}w`; } });
// The width a card is drawn at, for the browser to pick the right copy.
const cardSizes = (size) => (size === "sm" ? "160px" : size === "lg" ? "280px" : "220px");
for (const n in ARCANA) Object.defineProperty(ARCANA[n], "img", { enumerable: true, get: () => `${CARD_DECKS[(typeof window !== "undefined" && window.ArcanaDeck) || "archangel"] || CARD_DECKS.archangel}${n}.jpg` });
