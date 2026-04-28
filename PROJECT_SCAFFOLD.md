# Bio 40A Disease Study Tool — Project Scaffold

## Project name
`bio40a-disease-study`

## What this is
A modular study tool for Bio 40A (Human Anatomy & Physiology I) that takes a disease + a glossary of anatomical/histological terms and renders an interactive study chart connecting:
- **Body regions** (where symptoms manifest)
- **Symptom groups** (what the patient experiences)
- **Anatomical/histological terms** (the underlying tissue mechanisms)
- **Histology plates** (public-domain reference illustrations)

The MVP disease is **Alopecia Areata Totalis**, mapped to 40 terms from the connective tissue / epithelial tissue glossary. Architecture must support adding more diseases (e.g., emphysema → respiratory tissue terms, atherosclerosis → cardiovascular terms) without code rewrites.

## Goals
1. Replace the existing single-file HTML prototype with a clean, maintainable project structure
2. Make adding a new disease a matter of dropping a new JSON/JS data file — no UI changes
3. Keep the same vintage clinical aesthetic from the prototype (Cormorant Garamond + Courier New + paper/ink palette)
4. Stay simple: vanilla JS preferred over React, no build step required, runs from `file://`
5. Persist quiz progress in localStorage so quiz state survives reloads

## Non-goals
- No backend, no database, no auth
- No npm dependencies that require a bundler
- No SPA framework — keep it boring and durable
- Not a flashcard app — this is a *systems* study tool, not rote memorization

## Stack
- Vanilla HTML/CSS/JS (ES modules)
- One small dev server for local testing (`python3 -m http.server` is fine; no build pipeline)
- Optional: a tiny script to validate disease JSON files against a schema

## Existing prototype reference
The prototype file is `at_body_chart.html`. Treat it as design reference, not source of truth. Re-architect, don't port verbatim. Key behaviors to preserve:
- Two-tab layout: **Body Chart** (interactive SVG) + **Histology** (public-domain reference plates)
- Click body region → see all symptom groups affecting it, with terms
- Click term → highlight all body regions that term touches
- Explore mode (descriptions visible) vs Quiz mode (descriptions hidden, click to reveal)
- Clickable term chips on histology plates open a detail modal
- Reset button clears selection state

## Directory structure

```
bio40a-disease-study/
├── README.md                   # Setup, usage, how to add a disease
├── index.html                  # Disease picker landing page
├── study.html                  # Main study tool (loads ?disease=at-totalis)
├── css/
│   ├── tokens.css              # CSS custom properties (colors, fonts, spacing)
│   ├── base.css                # Reset, typography, layout primitives
│   ├── components.css          # Buttons, chips, panels, tabs, modal
│   └── plates.css              # Histology tab specific styles
├── js/
│   ├── main.js                 # Entry point — reads URL param, loads disease, mounts views
│   ├── state.js                # Single state object + subscribe pattern (no framework)
│   ├── storage.js              # localStorage wrapper for quiz progress
│   ├── views/
│   │   ├── tabs.js             # Tab switching
│   │   ├── body-chart.js       # SVG body chart — region click handlers
│   │   ├── info-panel.js       # Right-side info panel (region/term details)
│   │   ├── histology.js        # Histology plates rendering
│   │   ├── modal.js            # Term detail modal (used from plates)
│   │   └── controls.js         # Mode toggle, reset
│   ├── data/
│   │   ├── schema.js           # JSDoc typedefs for disease data shape
│   │   └── loader.js           # Fetches and validates disease JSON
│   └── svg/
│       └── body-male-anterior.js   # Returns SVG markup for the body figure
├── diseases/
│   ├── _index.json             # List of available diseases (id, title, term count)
│   ├── at-totalis.json         # Alopecia Areata Totalis (the MVP)
│   └── _template.json          # Empty template for adding new diseases
├── assets/
│   └── plates/                 # Optional: cached public-domain images if Wikimedia fails
└── scripts/
    └── validate-disease.mjs    # Node script that lints disease JSON against schema
```

## Disease data schema

Every disease lives in `diseases/<disease-id>.json` and conforms to this shape:

```json
{
  "id": "at-totalis",
  "title": "Alopecia Areata Totalis",
  "subtitle": "An Anatomical Study",
  "course": "Bio 40A",
  "diagnosticFinding": {
    "name": "histology",
    "desc": "peribulbar lymphocytes on punch biopsy",
    "regions": ["scalp", "eyebrows", "body-skin"]
  },
  "regionLabels": {
    "scalp": "Scalp",
    "eyebrows": "Eyebrows",
    "...": "..."
  },
  "bodyFigure": "male-anterior",
  "symptomGroups": [
    {
      "id": "hairloss",
      "title": "Total Body Hair Loss",
      "desc": "Scalp, brows, lashes, body, vibrissae all gone",
      "regions": ["scalp", "eyebrows", "eyelashes", "vibrissae", "ears", "axilla", "body-skin", "pubic"],
      "terms": [
        { "name": "ectoderm", "desc": "follicles are ectoderm-derived; the autoimmune target" },
        { "name": "epithelial tissue", "desc": "follicle is epithelial; what T cells attack" }
      ]
    }
  ],
  "histologyPlates": [
    {
      "id": "hair-follicle",
      "number": "II.A",
      "title": "Hair Follicle & Pilosebaceous Unit",
      "imageUrl": "https://commons.wikimedia.org/wiki/Special:FilePath/Gray944.png",
      "imageAlt": "Cross-section of skin showing hair follicle",
      "fallbackUrl": "https://commons.wikimedia.org/wiki/File:Gray944.png",
      "caption": "The autoimmune target itself...",
      "attribution": "Henry Vandyke Carter, Gray's Anatomy (1918). Public domain.",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gray944.png",
      "terms": ["ectoderm", "epithelial tissue", "matrix", "..."]
    }
  ]
}
```

The MVP `at-totalis.json` should contain all data already in the prototype's JS — just lifted into JSON.

## State module contract (`js/state.js`)

Export a single object with a small pub/sub API:

```js
// shape
{
  disease: null,        // loaded disease object
  mode: 'explore',      // 'explore' | 'quiz'
  activeRegion: null,   // string | null
  activeTerm: null,     // string | null
  activeTab: 'body',    // 'body' | 'histology'
  revealedTerms: Set    // for quiz mode persistence
}

// API
state.subscribe(listener)
state.set(partial)      // merges, notifies subscribers
state.get()             // returns current state
```

Views subscribe and re-render on relevant changes. Keep this dumb — no diffing, no virtual DOM. If render perf becomes a problem, optimize then, not now.

## Storage module (`js/storage.js`)

Wraps localStorage with a namespaced key per disease:

```js
storage.saveProgress(diseaseId, { revealedTerms: [...], lastVisited: ISO_DATE })
storage.loadProgress(diseaseId)
storage.clearProgress(diseaseId)
```

Survives page reload. Handles `localStorage` being unavailable (private browsing) by falling back to in-memory.

## Build/run instructions for README

```bash
# Clone and run
git clone <repo>
cd bio40a-disease-study
python3 -m http.server 8000
# Visit http://localhost:8000

# Validate a disease file
node scripts/validate-disease.mjs diseases/at-totalis.json

# Add a new disease
cp diseases/_template.json diseases/<your-id>.json
# Edit it
# Add an entry to diseases/_index.json
# Reload index.html
```

## Acceptance criteria for MVP

1. `index.html` lists available diseases (just AT Totalis at first), each linking to `study.html?disease=<id>`
2. `study.html` loads the disease JSON, renders body chart and histology tabs
3. All prototype interactions work: click region → terms; click term → regions; explore/quiz modes; reset
4. Quiz progress persists across reloads
5. Adding a second disease (even a stub one with 5 terms) requires zero JS changes
6. `validate-disease.mjs` catches malformed JSON before it crashes the UI
7. Page loads and is interactive even when Wikimedia images fail (graceful fallback)
8. No console errors on a clean load

## Stretch (not MVP)
- Search box that filters term chips as you type
- "Print mode" stylesheet for handwritten study notes
- Spaced-repetition layer on top of quiz mode
- Disease comparison view (two diseases side-by-side, shared terms highlighted)
- Per-disease custom body figures (e.g., respiratory diseases want lungs visible)

## Style/code rules
- ES modules with `<script type="module">`, no transpilation
- 2-space indent, single quotes in JS, double quotes in HTML attrs
- CSS: BEM-ish naming, no preprocessors, custom properties for all theme values
- Functions over classes unless state genuinely belongs together
- No external libraries except those needed for `validate-disease.mjs` (Ajv is fine if needed)
- Comments explain *why*, not *what*

## What to do first
1. Set up the directory structure
2. Lift the prototype's data into `diseases/at-totalis.json`
3. Build `state.js` and `storage.js` with tests in mind
4. Wire up `main.js` to load the disease and mount views
5. Port the body chart view, then info panel, then histology
6. Write the README
7. Add `diseases/_template.json` and a stub second disease to prove modularity
