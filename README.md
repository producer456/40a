# Bio 40A Disease Study

A modular study tool for **BIO 40A — Human Anatomy & Physiology I**. Each
disease is one JSON file that wires together body regions, symptom groups,
anatomical/histological terms, and public-domain reference plates. Adding a
new disease is a matter of dropping a new file in `diseases/` — no UI code
changes required.

The MVP disease is **Alopecia Areata Totalis**, mapped to 40 terms from the
epithelial / connective tissue glossary.

## Quick start

No build step. Vanilla HTML + ES modules.

```bash
git clone https://github.com/producer456/40a.git
cd 40a
python3 -m http.server 8000
# visit http://localhost:8000
```

(`file://` doesn't work because the loader uses `fetch` to read the disease
JSON, and most browsers block cross-origin `fetch` to local files.)

## Project layout

```
40a/
├── index.html              Disease picker landing page
├── study.html              Main study tool — loads ?disease=<id>
├── css/
│   ├── tokens.css          CSS custom properties (colors, fonts, spacing)
│   ├── base.css            Reset, typography, layout primitives
│   ├── components.css      Buttons, chips, panels, tabs
│   └── plates.css          Histology tab styles
├── js/
│   ├── state.js            Single state object with a tiny pub/sub API
│   ├── storage.js          localStorage wrapper for quiz progress
│   ├── data/
│   │   ├── schema.js       Disease shape + validation
│   │   └── loader.js       Fetches and validates a disease
│   ├── views/              (Body chart, info panel, histology, modal — next pass)
│   └── svg/                (Body figure SVG modules — next pass)
├── diseases/
│   ├── _index.json         Available diseases (drives the picker)
│   ├── _template.json      Empty template for new diseases
│   └── at-totalis.json     Alopecia Areata Totalis (MVP)
└── scripts/
    └── validate-disease.mjs   Lints disease JSON against the schema
```

## Adding a new disease

```bash
cp diseases/_template.json diseases/<your-id>.json
# edit fields
node scripts/validate-disease.mjs diseases/<your-id>.json
# add an entry to diseases/_index.json:
#   { "id": "<your-id>", "title": "...", "subtitle": "...", "termCount": N, "tissueDomain": "..." }
# reload index.html — your disease is in the picker
```

`validate-disease.mjs` checks:

- All required top-level fields are present
- Every `symptomGroups[].regions` reference exists in `regionLabels`
- Every term referenced by a histology plate is declared by some symptom
  group (catches typos that would otherwise silently break the term lookup)

## Disease schema

See `js/data/schema.js` for full JSDoc typedefs, or `diseases/_template.json`
for a fillable starting point.

```jsonc
{
  "id": "at-totalis",
  "title": "Alopecia Areata Totalis",
  "subtitle": "An Anatomical Study",
  "course": "Bio 40A",
  "bodyFigure": "male-anterior",
  "diagnosticFinding": { "name": "...", "desc": "...", "regions": [...] },
  "regionLabels": { "scalp": "Scalp", ... },
  "symptomGroups": [
    {
      "id": "hairloss",
      "title": "Total Body Hair Loss",
      "desc": "...",
      "regions": ["scalp", "eyebrows"],
      "terms": [{ "name": "ectoderm", "desc": "..." }]
    }
  ],
  "histologyPlates": [
    {
      "id": "hair-follicle",
      "number": "II.A",
      "title": "Hair Follicle & Pilosebaceous Unit",
      "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Gray944.png",
      "imageAlt": "...",
      "fallbackText": "commons.wikimedia.org/wiki/File:Gray944.png",
      "caption": "...",
      "attribution": "...",
      "sourceUrl": "...",
      "terms": ["ectoderm", "epithelial tissue", ...]
    }
  ]
}
```

## State module

`js/state.js` exposes a tiny pub/sub:

```js
state.subscribe(listener);    // returns an unsubscribe fn
state.set({ activeRegion });  // shallow merge + notify
state.get();                  // current state
state.reset();                // clears selection (keeps disease)
```

Views subscribe and re-render on relevant changes. No diffing, no virtual DOM.

## Storage module

`js/storage.js` wraps `localStorage` with a per-disease namespace and falls
back to in-memory if `localStorage` is unavailable (private browsing).

```js
storage.saveProgress('at-totalis', { revealedTerms: [...] });
storage.loadProgress('at-totalis');
storage.clearProgress('at-totalis');
```

## Status

This is the **scaffold + data-lift** checkpoint. Working:

- Disease picker (`index.html`)
- Disease loader + validator
- State + storage primitives
- `at-totalis.json` with all 40 terms lifted from the original prototype

Next pass: port the body chart SVG, info panel, histology grid, term modal,
and explore/quiz controls — `study.html` currently shows a stub that
confirms the data loaded.

## Reference

The original single-file prototype is `at_body_chart.html`. It's the design
reference, not the source of truth — the JSON in `diseases/` is canonical.
