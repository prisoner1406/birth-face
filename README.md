# Birth Face

**A face drawn from the sky at the minute you were born.**

Birth Face is a Windows desktop app. Enter a birth date, an exact time and a place, and it draws a face from the birth chart alone. No photograph is ever used. The face is a blend of over two hundred hand-drawn angel portraits, each weighed by the oldest ways the tradition reads appearance from the heavens: the rising degree, the elements, the planets, and the angels of the Name and of the Moon.

![Three charts, three faces](docs/three-charts.jpg)

*Three birth charts, three faces. Each is drawn only from its chart: one leaning to water and earth, one to fire, one to air and fire.*

---

## How a face is made

Every part of the face (the face shape, brow, eyes, nose, mouth, hair and outline) is read from the places in the chart that the tradition gives it, and drawn from the portraits that stand for those places.

| Layer | What it brings | Source |
|---|---|---|
| **The four elements** | The temperament: fire, air, water and earth in the chart's own proportions, through their archangels Michael, Raphael, Gabriel and Uriel | The temperament tally after William Lilly, *Christian Astrology* (1647) |
| **The planets** | The seven planetary archangels, by each planet's strength in the chart | Ptolemy, *Tetrabiblos* III.11–12 |
| **The zodiac angels** | The angels of the signs each feature is read from (the rising sign for the frame, the Moon for the eyes and mouth, Venus for the nose) | Agrippa; the Golden Dawn |
| **The 72 angels of the Name** | The Shem ha-Mephorash, each holding five degrees of the zodiac, weighed by where the planets stand | Exodus 14:19–21 |
| **The 28 lunar angels** | The angel of the Moon's mansion at birth, in the eyes and the expression | Barrett, *The Magus* (1801), after Agrippa |
| **Lilly's 84 faces** | The face shape Lilly gives each planet in each sign, for the lord of the Ascendant, any planet rising, and the Moon | Lilly, *Christian Astrology* |

![The layers of one face](docs/layers.jpg)

*One chart, layer by layer: the combined face, then the faces of its elements, its planets, its angels of the Name, its lunar angel, and every angel at once.*

### The rising degree

Birth Face reads the exact degree rising on the eastern horizon in four of the oldest ways, and gives it a third of the face shape, brow and nose:

- **The Egyptian decan:** the ten degrees rising and the planet that rules them, with the two angels of the Name holding its halves.
- **Varahamihira's drekkana** (*Brihat Jataka*, ch. 27): the figure rising, a man or a woman, and its lord.
- **The rising navamsa:** the ninth part of the sign, read for the body.
- **Lilly's degrees** (*Christian Astrology*, p. 116): whether the rising degree is masculine or feminine, and light, dark, smoky or void.

### Masculine and feminine

Every angel is drawn twice, as a man and as a woman. A face blends the two by the chart's own balance (Ptolemy, *Tetrabiblos* I.6 and I.12), while the hair and outline always come from the person's own sex.

![The eight archangels](docs/archangels.jpg)

*Eight of the portraits: the archangels of the four elements and the seven planets.*

---

## Clean blending

Faces are blended as in composite-face research: every portrait is set on one shared face by its irises, its shape and its drawing are blended separately, and the result is warped to the blended shape. So eyes, lips and jaw line up and nothing doubles or ghosts.

- **Choose the hair:** any portrait's hair can be chosen, and only the hair changes. The face, brows, jaw and neck stay the chart's.

![The same face with five different hairs](docs/hair-only.jpg)

*The same chart's face with the hair of Gabriel, Michael, Uriel, Cassiel and Raphael.*

- **Choose the eye colour:** the chart and the tradition leave colouring out (skin, hair and eye colour come from family, not the sky), so eye colour is your own choice.
- **See who sits inside:** point at any spot (the forehead, an eye, the lips) to see which angels make it, and in what share.

---

## Four tabs

1. **Face:** the face, who sits inside it, and each part of the face with its strongest portraits.
2. **The rising degree:** every ancient layer of the exact birth minute, and what each gives the face.
3. **Describe yourself:** describe a real face and build in words (never a photo), and see how well the chart explains it, compared with hundreds of other birth moments at the same place.
4. **Observations & discovery:** with several people described, which parts of the chart keep matching the faces they describe.

---

## What it is, and what it is not

Birth Face is an image of a tradition: the faces the old astrologers said the sky gives, drawn from your own chart. It is not a photograph and does not claim to predict how anyone looks. Real faces also carry family, ancestry and life. The **Describe yourself** and **Observations & discovery** tabs are there to test the tradition honestly, one described face at a time.

Angels in Birth Face are witnessed, not invoked: the app draws on how the traditions picture them and makes no prayers or rituals.

---

## Running it

```
npm install
npm start          # run the app
npm test           # the rising-degree checks
npm run dist       # build the Windows installer (dist/installer)
```

The portraits are original illustrations made for the app.
