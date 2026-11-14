/**
 * ============================================================================
 * SIMULATION STATE MACHINE & NAVIGATION STORE
 * ============================================================================
 * Explicit state machine to prevent animation race conditions, camera fighting,
 * and broken transition states during multi-scale exploration.
 * ============================================================================
 */

import { ScaleMode } from '../utils/astronomicalUnits';
import { CelestialBodyData, MoonData } from '../data/astronomy';

export type SimulationState =
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

export interface SimulationStoreState {
  currentState: SimulationState;
  scaleMode: ScaleMode;
  selectedBody: CelestialBodyData | null;
  selectedMoon: MoonData | null;
  timeScale: number;
  isPaused: boolean;
  activeLOD: 'HIGH' | 'MEDIUM' | 'LOW';
  showOrbits: boolean;
  showMoons: boolean;
  showAsteroids: boolean;
  showLabels: boolean;
  showHabitableZone: boolean;
  showScientificDebug: boolean;
  showDisclosureModal: boolean;
}
