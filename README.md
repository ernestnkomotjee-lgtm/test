# ENR Regulation, Compliance & Market Intelligence Monitor

A lightweight browser prototype for an Energy & Natural Resources (ENR) monitoring device.

## What it does

- Tracks agential source connectivity against key news and database feeds.
- Produces a compliance barometer for **Battery Manufacturing**.
- Produces a compliance barometer for **Independent Power Producers (IPPs)**.
- Produces a compliance barometer for **Wind & Solar Farms**.
- Flags weak indicators (score <= 2) as priority intelligence actions.
- Exports a timestamped JSON snapshot for downstream systems.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Configure modules and sources

Edit `app.js`:

- `sourceFeeds` for the connected monitoring streams.
- `modules` for each barometer and its scoring indicators.
