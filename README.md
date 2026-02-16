# AI Readiness Audit Toolkit

A lightweight browser app for law-firm technology and communications teams to run AI readiness audits for businesses.

## What it does

- Captures business and audit contact details.
- Scores six AI readiness categories (1-5).
- Includes extended South African financial-sector AI research questions (Q19-Q24).
- Includes a multi-select checklist of generative AI value-chain use cases.
- Displays visual graphs:
  - Peer benchmark graph: AI adoption by sector in South African financial services
  - Peer benchmark graph: intended AI investment bands (2024)
  - Category score bar graph for each audit
  - Maturity donut graph for each audit
- Generates practical recommendations.
- Lets you download audit files as JSON, CSV, and text report (`.txt`).

## Logo setup

Add the provided leopard logo image to this path:

`assets/leopard-logo.png`

The main banner loads the logo from that path.

## Chart rendering

- Peer benchmark charts use Chart.js via CDN in `index.html`.
- If Chart.js is unavailable, the app falls back to canvas-drawn bars for the peer charts.

## Run locally

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Where to add X

Open `app.js` and edit:

