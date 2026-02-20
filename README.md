# ENR Regulation, Compliance & Market Intelligence Monitor

A browser-based ENR monitoring prototype focused on real regulatory and market-intelligence domains.

## What it does

- Maps agent connector coverage across practical ENR sources (NERSA, DMRE/IPP Office, Gazette/EIA, Eskom grid bulletins, WIPO/CIPC, IEA/IRENA/BNEF).
- Scores three ENR barometers:
  - Battery Manufacturing
  - Independent Power Producers (IPPs)
  - Wind & Solar Farms
- Uses 1-5 indicator scoring to produce module and overall status:
  - `< 2.8` = At risk
  - `2.8 - <4` = Watchlist
  - `>= 4` = Stable
- Automatically flags indicator scores `<= 2` as priority legal/compliance escalations.
- Exports JSON snapshots for integration into downstream reporting pipelines.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Configure for your environment

Update `app.js`:

- `sourceFeeds`: your active data connectors and cadence.
- `modules`: your barometer definitions and indicator set.
