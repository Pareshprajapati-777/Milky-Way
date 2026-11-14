import { create } from 'zustand';
import { SimulationScale } from '../core/ScaleManager';
import { ScaleMode } from '../utils/astronomicalUnits';
import { CelestialBodyData, MoonData } from '../data/astronomy';

export interface PhysicsOverlays {
  showOrbits: boolean;
  showGravityWell: boolean;
  showLagrangePoints: boolean;
  showMagnetosphere: boolean;
  showHabitableZone: boolean;
  showGalacticArmsLabels: boolean;
  realisticScaleProportions: boolean; // Toggle between True 1:1 Scale vs Visual Enlarged Scale
}

export type SimulationStateMode =
  | 'GALAXY'
  | 'TRANSITION_TO_SOLAR'
  | 'SOLAR_SYSTEM'
  | 'PLANET_SELECTED'
  | 'TRANSITION_TO_GALAXY';

export type CameraProfile =
  | 'GALACTIC'
  | 'INTERSTELLAR'
  | 'SOLAR_SYSTEM'
  | 'PLANETARY';

export interface TransitionProgress {
  progress: number; // 0.0 to 1.0
  phase: 'LOCK' | 'ACCELERATE' | 'CRUISE' | 'DECELERATE' | 'ARRIVE';
  stageLabel: string;
  currentScaleLabel: string;
}

export function getTransitionPhase(t: number): TransitionProgress['phase'] {
  if (t < 0.20) return 'LOCK';
  if (t < 0.50) return 'ACCELERATE';
  if (t < 0.80) return 'CRUISE';
  if (t < 0.95) return 'DECELERATE';
  return 'ARRIVE';
}

export function getTransitionScaleLabel(t: number): string {
  if (t < 0.15) return '50,000 Light-Years (Galactic Disk)';
  if (t < 0.35) return '10,000 Light-Years (Orion-Cygnus Arm)';
  if (t < 0.55) return '500 Light-Years (Local Interstellar Chimney)';
  if (t < 0.75) return '1 Light-Year (Oort Cloud Boundary)';
  if (t < 0.90) return '80 AU (Kuiper Belt / Heliosphere)';
  return '1 AU (Terrestrial Planetary Realm)';
}

export interface SimulationState {
  currentScale: SimulationScale;
  selectedBodyId: string; // 'milky-way' | 'sgr-a' | 'sun' | 'earth' | 'saturn' ...
  julianDate: number;
  timeSpeedMultiplier: number; // 1 = real-time, 86400 = 1 day/sec
  isPaused: boolean;
  overlays: PhysicsOverlays;

  // Actions
  selectBody: (id: string, targetScale?: SimulationScale) => void;
  setTimeSpeed: (speed: number) => void;
  togglePause: () => void;
  toggleOverlay: (key: keyof PhysicsOverlays) => void;
  advanceTime: (deltaSeconds: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentScale: 'GALACTIC',
  selectedBodyId: 'milky-way',
  julianDate: 2461359.5, // Nov 2026 Epoch
  timeSpeedMultiplier: 3600, // 1 hour per second default
  isPaused: false,
  overlays: {
    showOrbits: true,
    showGravityWell: false,
    showLagrangePoints: false,
    showMagnetosphere: false,
    showHabitableZone: false,
    showGalacticArmsLabels: true,
    realisticScaleProportions: false,
  },

  selectBody: (id, targetScale) =>
    set((state) => ({
      selectedBodyId: id,
      currentScale:
        targetScale ??
        (id === 'milky-way'
          ? 'GALACTIC'
          : id === 'sgr-a'
          ? 'BLACK_HOLE'
          : id === 'sun'
          ? 'SOLAR_SYSTEM'
          : 'PLANETARY'),
    })),

  setTimeSpeed: (speed) => set({ timeSpeedMultiplier: speed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleOverlay: (key) =>
    set((state) => ({
      overlays: { ...state.overlays, [key]: !state.overlays[key] },
    })),
  advanceTime: (deltaSeconds) =>
    set((state) => {
      if (state.isPaused) return state;
      const deltaDays = (deltaSeconds * state.timeSpeedMultiplier) / 86400;
      return { julianDate: state.julianDate + deltaDays };
    }),
}));
