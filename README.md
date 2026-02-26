# Classic WOW TBC Fast Route 1-70

A web app for planning character leveling in **WoW Classic + TBC**, with support for:
- starting level,
- faction, race, and class,
- quest chain progression,
- territory control state (Alliance / Horde / Contested),
- zone minimap visuals and route progress tracking.

## What This Site Does

This site helps players quickly understand **which quests to do right now** to follow a clean 1-70 route without chaotic zone jumping.  
After initial setup, users simply mark quests as completed and the app automatically suggests the next step.

## Key Features

- Start configuration: faction, race, class, starting level.
- Race-class and faction-race validation (invalid combinations are blocked).
- Automatic route progression after quest completion.
- Quest completion animation: strike-through -> fade -> remove.
- Local zone images for the minimap (`public/zone-images`).
- Side burger menu for route sources.
- Persistent state in `localStorage` (session survives page reload/reopen).

## Tech Stack

- React 18
- Vite 5
- CSS (custom UI, no component framework)

## Run Locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
  App.jsx          # main UI and route logic
  quests.js        # route data, zones, source links
  styles.css       # application styles

public/
  zone-images/     # local zone images for minimap
  faction-icons/   # faction crest icons

scripts/
  download-zone-images.mjs  # utility to refresh local zone images
```

## Useful Scripts

- `npm run dev` — run development server
- `npm run build` — create production build
- `npm run preview` — preview production build locally
- `npm run download:zone-images` — refresh local zone images

## GitHub Deployment

The repository is ready to publish.  
For GitHub Pages, deploy from the `dist/` output using any preferred workflow for Vite apps.

## License

This project is built as a player tool for WoW leveling route planning.
