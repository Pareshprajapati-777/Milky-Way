# 🌌 Milky Way & Solar System 3D Interactive Simulation

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-black.svg)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/@react--three/fiber-8.18-darkgreen.svg)](https://docs.pmnd.rs/react-three-fiber/)
[![Vite](https://img.shields.io/badge/Vite-6.1-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An astronomically accurate, photorealistic **3D WebGL simulator** bridging cosmic scales—from the **100,000 light-year Milky Way galaxy** down to the **supermassive black hole Sagittarius A\***, the **Solar System**, and planetary surfaces with real-time physics and orbital dynamics.

Built using **React, Three.js, React Three Fiber, Zustand**, and custom **GLSL Shaders**, inspired by NASA Eyes and SpaceEngine.

---

## 🚀 Key Highlights & Astrophysics Features

### 1. 🌀 Multi-Scale Universe Navigation
- **Continuous Multi-Scale Zoom:** Seamlessly transition across orders of magnitude:
  $$\text{Local Group} \longleftrightarrow \text{Milky Way (100 kly)} \longleftrightarrow \text{Orion-Cygnus Arm} \longleftrightarrow \text{Solar System (AU)} \longleftrightarrow \text{Planetary Surface (KM)}$$
- **Zero Z-Fighting:** Enabled with `logarithmicDepthBuffer: true` and a **Floating Origin Coordinate System** to eliminate floating-point precision jitter.
- **Continuous Exponential Scale Zoom:** Smoothstep opacity cross-fading where Milky Way dust and star clouds softly dissolve as the camera penetrates into the Orion Spur while the Solar System smoothly scales in.

---

### 2. 🕳️ Relativistic Black Hole (Sagittarius A*)
- Located at the dynamical galactic core `(0, 0, 0)`.
- **Exact Relativistic Radii:**
  - Schwarzschild Radius ($R_s = \frac{2GM}{c^2} \approx 0.127\text{ AU}$).
  - Photon Sphere ($R_{\text{ph}} = 1.5 R_s \approx 0.19\text{ AU}$).
- **Custom Doppler-Beamed Accretion Disk Shader:**
  - Relativistic Doppler beaming makes the approaching plasma stream bright blue-white while the receding side appears as dim crimson-red.
  - Gravitational redshift near the event horizon with dynamic FBM turbulence.
  - Real-time Gravitational Lensing and Einstein Ring distortion halo.

---

### 3. 🪐 High-Precision Orbital Physics Engine
- **Newton-Raphson Keplerian Solver:**
  Solves Kepler's transcendental equation for eccentric anomaly $E$:
  $$M = E - e \sin E \implies E_{n+1} = E_n - \frac{E_n - e \sin E_n - M}{1 - e \cos E_n}$$
- **J2000 Ephemeris Elements:** Propagates 3D heliocentric positions using NASA JPL orbital elements ($a, e, i, \Omega, \omega, L$).
- **Instantaneous Velocity Gradient (Vis-Viva Equation):**
  $$v^2 = \mu \left(\frac{2}{r} - \frac{1}{a}\right)$$
- **60 FPS Zero-Rerender Telemetry:** Throttled at 10Hz via direct DOM Ref mutators (`innerText`), eliminating React virtual DOM overhead during real-time planetary tracking.

---

### 4. 🛰️ Interactive Physics Overlays ("Physics Maps" Mode)
- **3D Spacetime Fabric (Gravitational Potential Well):**
  Deformable wireframe grid bending according to gravitational potential $\Phi(x, z) \propto -\sum \frac{GM_i}{r_i}$ beneath the Sun, Jupiter, Earth, and Sgr A*.
- **Lagrange Points ($L_1 \text{ to } L_5$) & Hill Spheres:**
  Live gravitational equilibrium positions for Sun-Earth and Sun-Jupiter, featuring a dedicated marker for the **James Webb Space Telescope (JWST)** at Earth-Sun $L_2$.
- **Van Allen Dipole Belts & Parker Spiral:**
  Planetary dipole magnetic field lines and Archimedean spiral solar wind streams emanating from the rotating Sun.
- **Hohmann Transfer Orbit Trajectory:**
  Interactive orbital transfer calculator displaying transfer duration ($t_{\text{tx}}$) and total $\Delta v$ impulse budget (e.g., Earth $\rightarrow$ Mars).

---

### 5. ☀️ Photorealistic Sun & Planetary Shaders
- **Solar Photosphere & Corona:**
  - Dynamic turbulent convection granulation with FBM noise.
  - Organic sunspot groups with realistic umbra, penumbra, and limb darkening falloff.
  - 3-layer back-face additive corona streamers and 2,600 prominence plasma particles.
- **Earth Day/Night Terminator:**
  - Real 8K day color map smoothly transitioning through a warm twilight band into an emissive 8K city night lights map.
  - Rayleigh atmospheric rim glow and specular ocean reflections.
- **Saturn Ring Shadows & Gas Giants:**
  - Multi-division oblate spheroids with alpha-mapped high-resolution planetary rings.

---

## 📁 Project Architecture

```
Milky-Way/
├── public/
│   ├── textures/                 # 4K/8K planetary & star maps
│   └── audio/                    # Space drones, UI clicks, warp transitions
├── scripts/
│   ├── runPhysicsValidation.js   # Automated 10-point physics validation suite
│   └── testOrbitalPhysics.js     # Standalone Keplerian solver unit tests
├── src/
│   ├── core/                     # Pure Physics, Math & Coordinate Engines
│   │   ├── ScaleManager.ts       # Multi-scale cross-fade & coordinate conversion
│   │   ├── KeplerSolver.ts       # Newton-Raphson orbital solver & state vectors
│   │   ├── GalacticDynamics.ts   # Logarithmic spirals & Dark Matter rotation curve
│   │   └── RelativityEngine.ts   # Schwarzschild radius, ISCO, gravitational lensing
│   ├── shaders/                  # Modular GLSL Shaders
│   │   ├── blackhole/            # Relativistic Doppler accretion & lensing shaders
│   │   ├── galaxy/               # Volumetric dust, H-II nebulae & star diffraction
│   │   ├── sun/                  # Boiling plasma granulation & coronal streamers
│   │   ├── planets/              # Rayleigh atmosphere & Earth day/night terminator
│   │   └── index.ts              # Unified shaders export
│   ├── data/
│   │   ├── astronomy.ts          # Physical constants, masses, radii, temperatures
│   │   ├── planetaryOrbits.ts    # Central NASA JPL J2000 Keplerian elements
│   │   └── galacticCatalog.ts    # Coordinates for Sgr A*, Orion Spur, Nebulae, Stars
│   ├── state/
│   │   ├── simulationMachine.ts  # State machine, Julian Date & Physics Overlays state
│   │   └── useSimulationStore.ts # Zero-rerender Zustand store for UI & navigation
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── SimulationScene.tsx      # Master Canvas with LogarithmicDepthBuffer
│   │   │   ├── CameraController.tsx     # Smooth camera rig, scale handoff & tracking
│   │   │   ├── GalaxyPostProcessing.tsx # UnrealBloomPass HDR bloom pipeline
│   │   │   ├── WarpTunnel.tsx           # Relativistic space flight particles
│   │   │   ├── galaxy/
│   │   │   │   ├── MilkyWayGalaxy.tsx   # 240,000+ stars, 4 logarithmic arms & dust
│   │   │   │   └── SagittariusABody.tsx # 3D relativistic black hole at (0,0,0)
│   │   │   ├── solarsystem/
│   │   │   │   ├── SolarSystem.tsx      # Heliocentric coordinate system
│   │   │   │   ├── SunBody.tsx          # Custom shader sun + multi-layer corona
│   │   │   │   ├── PlanetBody.tsx       # Realistic PBR planets + atmospheres
│   │   │   │   ├── MoonBody.tsx         # Hierarchical natural satellites
│   │   │   │   ├── AsteroidBelt.tsx     # GPU instanced Main & Kuiper belts
│   │   │   │   └── OrbitPath.tsx        # Fading gradient Keplerian orbits
│   │   │   └── physics-overlays/
│   │   │       ├── GravityWellGrid.tsx  # 3D curved spacetime fabric (-GM/r)
│   │   │       ├── LagrangeMarkers.tsx  # L1-L5 points & JWST marker
│   │   │       ├── Magnetosphere.tsx    # Dipole field lines & Parker solar wind
│   │   │       └── HohmannTransferOrbit.tsx # Interactive Δv & transfer trajectory
│   │   └── ui/
│   │       ├── HeaderNav.tsx            # Scale breadcrumbs & search trigger
│   │       ├── Omnibar.tsx              # Quick celestial body search & teleport
│   │       ├── LeftNavTools.tsx         # Physics overlay toggles & scale switches
│   │       ├── TelemetryCard.tsx        # 60 FPS zero-rerender live physics HUD
│   │       ├── BottomControlDeck.tsx    # Time scrubber (1x to 10,000x), Play/Pause
│   │       └── ScientificDebugHUD.tsx   # FPS, Julian Date, true anomaly telemetry
│   ├── utils/
│   │   ├── astronomicalUnits.ts
│   │   ├── orbitalPhysics.ts
│   │   ├── realisticTextures.ts
│   │   └── soundEngine.ts               # Web Audio API space ambience & resonance
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/Pareshprajapati-777/Milky-Way.git

# Navigate to project directory
cd Milky-Way

# Install dependencies
npm install
```

### Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Production Build
Compile TypeScript and generate an optimized production bundle:
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Comprehensive Test & Regression Suite
Execute the automated 89-point test suites covering celestial mechanics, JPL Horizons multi-epoch validation, navigation integrity, graphics presets, and Phase 6 regression tests:
```bash
npm test
```
The test suite executes:
- `scripts/runPhysicsValidation.js`: 10-point core celestial mechanics tests
- `scripts/validatePhase1Physics.ts`: 10-point solver & coordinate transformation tests
- `scripts/validatePhase2Science.ts`: 10-point astrophysical accuracy & moon tests
- `scripts/validatePhase3Navigation.ts`: 7-point camera, state, and UI transition tests
- `scripts/validatePhase4Performance.ts`: 7-point memory, shader, and PRNG tests
- `scripts/validatePhase5QA.ts`: 40-point full QA audit across 9 testing layers
- `scripts/validatePhase6Regression.ts`: 5-point defect repair & regression tests

---

## ⌨️ Controls & Interaction Guide

| Action | Control |
| :--- | :--- |
| **Rotate View** | Left Click + Drag |
| **Pan Camera** | Right Click + Drag |
| **Zoom In / Out** | Mouse Wheel / Trackpad Pinch |
| **Focus / Select Planet** | Left Click on planet sphere or select via Bottom Deck |
| **Teleport / Search** | Click search icon or open Omnibar |
| **Physics Overlays** | Toggle Gravity Grid, Lagrange Points, Magnetosphere, or Hohmann Transfer from the left toolbar |
| **Time Controls** | Play/Pause, reset to J2000 epoch, or adjust speed multiplier up to 10,000x |

---

## 📜 Scientific References & Acknowledgments
- **NASA Jet Propulsion Laboratory (JPL) Horizons Ephemeris:** Authoritative J2000 planetary elements.
- **Standish, E. M. (1992):** Keplerian Elements for Approximate Positions of Major Planets.
- **Reid et al. (2019):** VLBA astrometric measurement of Sagittarius A\* and Sun's galactic orbit.
- **Lin & Shu (1964):** Density Wave Theory for spiral galaxies.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).

