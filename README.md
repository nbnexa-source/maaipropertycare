# threejs-scroll-scene

A 3D scene where the camera follows a path as you scroll. Built with Three.js
and GSAP ScrollTrigger. If you have "reduce motion" turned on, it snaps between
views instead of sweeping.

**Live demo:** _add your GitHub Pages / Vercel link here_

![Demo](docs/demo.gif)

## Features

- Camera path with one waypoint per page section
- Motion tied to scroll position, so it plays forward and backward
- Reduced-motion fallback (snaps to the section in view instead of animating)
- Floating shapes with fog for depth
- No 3D assets to download — everything is generated in code

## Prerequisites

- Node 20 or newer

## Install

```bash
npm install
npm run dev
```

## Usage

Scroll. Each section is a stop on the camera path. To change the journey, edit
the `WAYPOINTS` array near the top of `src/main.ts`:

```ts
const WAYPOINTS = [
  { camera: [0, 0, 6], look: [0, 0, 0] }, // one entry per <section>
  // ...
];
```

Add a section in `index.html` with the next `data-step` number and a matching
waypoint, and it just works.

## Config

| What | Where | Notes |
| --- | --- | --- |
| Camera stops | `WAYPOINTS` in `src/main.ts` | `camera` is where it sits, `look` is where it points. |
| Scroll smoothing | `scrub: 1` in `src/main.ts` | Higher = laggier/smoother; `true` = locked to scroll. |
| Fog density | `scene.fog` | How quickly distant shapes fade out. |
| Shape count | the `for` loop | Number of floating shapes. |

## Fork this

1. Swap the floating shapes for your own model (import a `GLTFLoader` and add it
   to the scene).
2. Rewrite the section copy in `index.html` for your story.
3. Retune `WAYPOINTS` so the camera frames each section the way you want.
4. Replace `docs/demo.gif` and add your live link at the top.

## License

MIT — see [LICENSE](LICENSE).
