# TEDxKPRIT 2026 — The Fifth Dimension

A cinematic, interaction-first event website for TEDxKPRIT 2026.

Live at [tedxkprit.in](https://tedxkprit.in) via GitHub Pages (`main` branch, root path).

## Layout

The static site lives at the repository root so GitHub Pages can serve it directly:

```
index.html          2026 single-page experience
register.html       registration-interest route
css/styles.css      design tokens + components
js/app.js           sliders, nested rails, reveals, navigation, forms
assets/             2026 brand art, speakers, students, team
2025/               TEDxKPRIT 2025 recap, served at /2025/
server.js, src/     optional Express + MongoDB API (not used by Pages)
```

## UI architecture

- Single-page experience with dedicated registration route.
- Every major content system uses a horizontal interaction model: dimensional lenses, speakers, team chapters, team members, journey, and partners.
- Speakers use a full-bleed editorial slider with one featured profile and reveal teasers.
- Team uses a nested slider: chapter navigation controls the lead story while each chapter has its own independent member rail.
- Partners use a narrative partnership slider rather than a static logo grid.
- CSS is component-oriented and responsive with a single design token layer in `css/styles.css`.
- `js/app.js` contains reusable slider, nested rail, reveal, navigation, pointer and form behaviors.

## Run

The site is static and can be opened directly, but the Express server adds the API
routes and serves the same root directory:

```bash
npm ci
npm run check
npm start
```

Open `http://localhost:3000`.

For development:

```bash
npm run dev
```

## Environment

Create a `.env` file. MongoDB is required only for persistent contact and
registration-interest submissions; without `MONGODB_URI` the server runs in
static/API demo mode and those two endpoints return `503`.

```
PORT=3000
MONGODB_URI=
```

## Accessibility

Keyboard navigation, focus states, skip navigation and `prefers-reduced-motion` support are included.
