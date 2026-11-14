import { create } from 'zustand';
import { ScaleMode } from '../utils/astronomicalUnits';
import { CelestialBodyData, MoonData } from '../data/astronomy';
import { SimulationState, CameraProfile, TransitionProgress, getTransitionPhase, getTransitionScaleLabel } from './simulationMachine';

export interface SimulationStore {
  // Navigation & Scale states
  currentState: SimulationState;
  scaleMode: ScaleMode;
  cameraProfile: CameraProfile;
  selectedBody: CelestialBodyData | null;
  selectedMoon: MoonData | null;
  selectedGalacticTarget: string | null;

  // Time & Physics controls
  timeScale: number;
  isPaused: boolean;
  activeLOD: 'HIGH' | 'MEDIUM' | 'LOW';

  // Overlays & Visualization toggles
  showOrbits: boolean;
  showMoons: boolean;
  showAsteroids: boolean;
  showLabels: boolean;
  showHabitableZone: boolean;
  showScientificDebug: boolean;
  showDisclosureModal: boolean;
  showGravityGrid: boolean;
  showLagrangePoints: boolean;
  showMagnetosphere: boolean;

  // Transition state
  transitionProgress: TransitionProgress | null;

  // Actions
  setState: (state: SimulationState) => void;
  setScaleMode: (mode: ScaleMode) => void;
  setSelectedBody: (body: CelestialBodyData | null) => void;
  setSelectedMoon: (moon: MoonData | null) => void;
  setSelectedGalacticTarget: (targetId: string | null) => void;
  setTimeScale: (scale: number) => void;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
  setActiveLOD: (lod: 'HIGH' | 'MEDIUM' | 'LOW') => void;
  toggleOrbits: () => void;
  toggleMoons: () => void;
  toggleAsteroids: () => void;
  toggleLabels: () => void;
  toggleHabitableZone: () => void;
  toggleScientificDebug: () => void;
  setShowDisclosureModal: (show: boolean) => void;
  toggleGravityGrid: () => void;
  toggleLagrangePoints: () => void;
  toggleMagnetosphere: () => void;
  setTransitionProgress: (progress: number | null) => void;
  resetToGalacticView: () => void;
  focusSolarSystem: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  currentState: 'GALAXY',
  scaleMode: 'enhanced',
  cameraProfile: 'GALACTIC',
  selectedBody: null,
  selectedMoon: null,
  selectedGalacticTarget: null,

  timeScale: 1.0,
  isPaused: false,
  activeLOD: 'HIGH',

  showOrbits: true,
  showMoons: true,
  showAsteroids: true,
  showLabels: true,
  showHabitableZone: false,
  showScientificDebug: false,
  showDisclosureModal: false,
  showGravityGrid: false,
  showLagrangePoints: false,
  showMagnetosphere: false,

  transitionProgress: null,

  setState: (state) => set({ currentState: state }),
  setScaleMode: (mode) => set({ scaleMode: mode }),
  setSelectedBody: (body) => set({ 
    selectedBody: body,
    currentState: body ? 'PLANET_SELECTED' : 'SOLAR_SYSTEM',
    selectedMoon: null 
  }),
  setSelectedMoon: (moon) => set({ selectedMoon: moon }),
  setSelectedGalacticTarget: (targetId) => set({ selectedGalacticTarget: targetId }),
  setTimeScale: (timeScale) => set({ timeScale }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPaused: (isPaused) => set({ isPaused }),
  setActiveLOD: (activeLOD) => set({ activeLOD }),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleMoons: () => set((state) => ({ showMoons: !state.showMoons })),
  toggleAsteroids: () => set((state) => ({ showAsteroids: !state.showAsteroids })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleHabitableZone: () => set((state) => ({ showHabitableZone: !state.showHabitableZone })),
  toggleScientificDebug: () => set((state) => ({ showScientificDebug: !state.showScientificDebug })),
  setShowDisclosureModal: (showDisclosureModal) => set({ showDisclosureModal }),
  toggleGravityGrid: () => set((state) => ({ showGravityGrid: !state.showGravityGrid })),
  toggleLagrangePoints: () => set((state) => ({ showLagrangePoints: !state.showLagrangePoints })),
  toggleMagnetosphere: () => set((state) => ({ showMagnetosphere: !state.showMagnetosphere })),

  setTransitionProgress: (progress) => {
    if (progress === null) {
      set({ transitionProgress: null });
      return;
    }
    const phase = getTransitionPhase(progress);
    const currentScaleLabel = getTransitionScaleLabel(progress);
    set({
      transitionProgress: {
        progress,
        phase,
        stageLabel: `Transition: ${phase}`,
        currentScaleLabel
      }
    });
  },

  resetToGalacticView: () => set({
    currentState: 'GALAXY',
    cameraProfile: 'GALACTIC',
    selectedBody: null,
    selectedMoon: null,
    selectedGalacticTarget: null
  }),

  focusSolarSystem: () => set({
    currentState: 'SOLAR_SYSTEM',
    cameraProfile: 'SOLAR_SYSTEM',
    selectedBody: null,
    selectedMoon: null
  })
}));
