# AtomSim V2

A 3D particle simulation inspired by **VSEPR theory** from 11th grade chemistry, demonstrating how atoms arrange themselves into molecular geometries through physics-based repulsion.

**Live demo:** [cirqatha.github.io/AtomSim](https://cirqatha.github.io/AtomSim/)

---

<img width="1918" height="908" alt="image" src="https://github.com/user-attachments/assets/366bd20f-8c74-44c1-8112-34e4f3d390de" />


---

## What is this?

V1 was built in VPython with no controls or interaction. V2 is a complete rewrite in **Three.js**, with a proper UI, orbit controls, and a much smoother simulation — all written by reading raw documentation.

The simulation places particles around a central atom and lets repulsive forces push them apart until they settle into stable molecular geometries (like tetrahedral, trigonal planar, etc.).

---

## Features

- Set any number of particles and simulate them
- **Render End Frame** mode = skips live updates and only shows the final result, saving performance for large counts
- Orbit controls to rotate and zoom the scene
- Particle count guide showing safe performance ranges
- Cylinders drawn between stable, neighbouring particles

---
<img width="1918" height="911" alt="image" src="https://github.com/user-attachments/assets/8378a54f-2ac2-42cb-9126-3156ad88c89a" />


---

## How it works

**Forces** — Every frame, each particle calculates repulsion from every other particle. These forces are summed into one final force vector per particle.

**Velocities** — Updated using `v = u + at`, then multiplied by `0.9` every frame to simulate energy loss (dampening).

**Positions** — Calculated with `s = ut + ½at²`. A normalisation factor keeps particles loosely bound to a sphere — like a stretchy string. At 10% normalisation they can drift slightly but won't fly away.

**Stability & Connections** — When a particle moves less than `0.1` units between frames, it's considered stable. Cylinders are then drawn to its nearest neighbours.

**The "Magic Numbers"** — Some values (force constants, radius, damping) are hand-tuned. A perfectly accurate simulation would need many more factors. These numbers keep the structures visually correct and the motion smooth.

---

<!-- Image of cylinder connections forming a molecule here -->

---

## Running locally

```bash
# Clone the repo
git clone https://github.com/cirqatha/AtomSim.git
cd AtomSim

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Built with

- [Three.js](https://threejs.org/) — 3D rendering
- [Vite](https://vitejs.dev/) — build tool
- Raw documentation and no AI-generated code 💪
