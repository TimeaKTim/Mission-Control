# 🚀 Mission Control — Space Simulator

> An interactive solar system simulator covering 7 stages of orbital mechanics and rocket trajectory planning.

🌐 **[Live Demo →](https://your-url.vercel.app)**

---

## What it does

Mission Control simulates planetary physics and rocket travel across the solar system. Starting from basic escape velocity calculations, it builds up to finding optimal transfer windows between planets while accounting for real orbital mechanics.

All 7 stages are implemented and fully interactive.

---

## Stages

| Stage | Title                      | Description                                                      |
| ----- | -------------------------- | ---------------------------------------------------------------- |
| 01    | **Escape Velocities**      | Computes escape velocity for all 9 planets using v = √(2GM/r)    |
| 02    | **Launch Parameters**      | Time and distance to reach escape velocity given rocket specs    |
| 03    | **Interplanetary Journey** | Full journey planner: acceleration, cruise, deceleration phases  |
| 04    | **Planetary Simulator**    | Animated orbital simulator — input any day, see planet positions |
| 05    | **Transfer Window Finder** | Finds optimal launch windows; solar system freezes on launch     |
| 06    | **Dynamic Transfer**       | Like Stage 5 but planets keep moving — uses iterative intercept  |
| 07    | **GUI**                    | Full space-themed React UI with canvas animations                |

---

## Tech Stack

- **React 19** + **TypeScript** — UI and type-safe physics logic
- **Tailwind CSS** — Space-themed dark UI
- **Vite** — Build tooling
- **Canvas API** — All orbital and journey animations
- **No physics libraries** — All math implemented from scratch

---

## Architecture

```
src/
├── components/         # One component per stage + shared UI
├── context/            # MissionContext — shared file data across all stages
├── hooks/              # useTransferSearch — async window search with progress
├── utils/
│   ├── physics.ts      # Pure physics functions (escape velocity, travel time…)
│   ├── orbitGeometry.ts# 2D orbital math, collision detection, intercept solver
│   ├── parsePlanets.ts # Robust file parser with error handling
│   ├── parseRocket.ts
│   ├── parseSolar.ts
│   └── planetConstants.ts # Shared planet colors, icons, sizes
└── types/              # TypeScript interfaces
```

Key design decisions:

- **Physics is pure** — all calculation functions are side-effect free and fully testable
- **Upload once** — files are parsed into context and shared across all stages
- **Async search** — transfer window search defers to the next tick so the UI doesn't freeze
- **Log-scale orbits** — makes inner and outer planets visible simultaneously

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Input files

The app accepts three data files (included in `/public`):

- `Planetary_Data.txt` — planet diameters and masses
- `Rocket_Data.txt` — engine count and acceleration
- `Solar_System_Data.txt` — orbital periods and radii

---

## Key formulas

**Escape velocity:** `v = √(2GM/r)`

**Time to escape:** `t = v_escape / a_total`

**Distance during burn:** `d = ½ · a · t²`

**Planet angle:** `θ = (day / period) × 360°`

**Intercept (Stage 6):** Iterative convergence — aim for destination position, compute travel time, recalculate destination position at arrival, repeat until convergence.
