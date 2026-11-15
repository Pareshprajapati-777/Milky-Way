import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CelestialBodyData, MoonData, MILKY_WAY_DATA } from '../../data/astronomy';
import { getPlanet3DPosition, getMoonRelativePosition } from '../../utils/orbitalPhysics';
import { ScaleMode, ASTRO_CONSTANTS } from '../../utils/astronomicalUnits';

export type ViewMode =
  | 'galaxy'
  | 'warp_to_solar'
  | 'solar'
  | 'planet'
  | 'moon'
  | 'warp_to_galaxy';

interface CameraControllerProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedBody: CelestialBodyData | null;
  selectedMoon: MoonData | null;
  scaleMode?: ScaleMode;
  onWarpComplete: () => void;
  onTransitionProgress?: (progress: number) => void;
  isCinematicTour: boolean;
  timeScale: number;
  simTime?: number;
  simTimeRef?: React.MutableRefObject<number>;
  cameraResetToken?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  viewMode,
  setViewMode,
  selectedBody,
  selectedMoon,
  scaleMode = 'enhanced',
  onWarpComplete,
  onTransitionProgress,
  isCinematicTour,
  timeScale,
  simTime = 0,
  simTimeRef,
  cameraResetToken
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Programmatic Target Vectors
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 28, 86));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Transition Trackers
  const warpProgress = useRef<number>(0);
  const transitionStartCamPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const transitionStartLookAt = useRef<THREE.Vector3>(new THREE.Vector3());
  const prevViewModeRef = useRef<ViewMode>(viewMode);
  const lastReportedProgress = useRef<number>(-1);

  // Non-blocking smooth glide tracking
  const isTransitioning = useRef<boolean>(false);
  const transitionProgress = useRef<number>(0);
  const transitionDuration = useRef<number>(1.2);

  const getSimTime = () => (simTimeRef ? simTimeRef.current : simTime);

  // Multi-Scale Camera Configuration & Glide Initiation
  useEffect(() => {
    if (!controlsRef.current) return;
    const perspCamera = camera as THREE.PerspectiveCamera;

    const isWarping = viewMode === 'warp_to_solar' || viewMode === 'warp_to_galaxy';
    controlsRef.current.enabled = !isWarping;

    const cameFromWarpToSolar = prevViewModeRef.current === 'warp_to_solar';
    const cameFromWarpToGalaxy = prevViewModeRef.current === 'warp_to_galaxy';
    prevViewModeRef.current = viewMode;

    transitionStartCamPos.current.copy(camera.position);
    transitionStartLookAt.current.copy(controlsRef.current.target);
    transitionProgress.current = 0;
    const currentTime = getSimTime();

    if (viewMode === 'galaxy') {
      // 1. GALACTIC PROFILE
      perspCamera.near = 0.2;
      perspCamera.far = 3000;
      perspCamera.updateProjectionMatrix();

      targetCamPos.current.set(0, 28, 86);
      targetLookAt.current.set(0, 0, 0);
      controlsRef.current.minDistance = 20;
      controlsRef.current.maxDistance = 250;
      controlsRef.current.rotateSpeed = 0.65;
      controlsRef.current.zoomSpeed = 1.0;
      controlsRef.current.panSpeed = 0.7;

      if (!cameFromWarpToGalaxy) {
        isTransitioning.current = true;
        transitionDuration.current = 1.2;
      } else {
        isTransitioning.current = false;
      }
    } else if (viewMode === 'warp_to_solar') {
      // 2. INTERSTELLAR FLIGHT PROFILE
      warpProgress.current = 0;
      lastReportedProgress.current = -1;
      if (onTransitionProgress) onTransitionProgress(0);

      perspCamera.near = 0.5;
      perspCamera.far = 10000;
      perspCamera.fov = 46;
      perspCamera.updateProjectionMatrix();

      if (selectedBody) {
        const effectiveRadius =
          scaleMode === 'true_scale'
            ? Math.max(0.4, selectedBody.radiusKm / ASTRO_CONSTANTS.EARTH_RADIUS_KM)
            : selectedBody.visualRadius;
        const pPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
        const dist = effectiveRadius * 3.2 + 4.0;
        targetLookAt.current.copy(pPos);
        targetCamPos.current.set(
          pPos.x + dist * 0.72,
          pPos.y + dist * 0.32,
          pPos.z + dist * 0.72
        );
      } else {
        targetCamPos.current.set(0, 480, 750);
        targetLookAt.current.set(0, 0, 0);
      }

      controlsRef.current.minDistance = scaleMode === 'true_scale' ? 140 : 48;
      controlsRef.current.maxDistance = 6500;

      isTransitioning.current = false;
    } else if (viewMode === 'warp_to_galaxy') {
      warpProgress.current = 0;
      lastReportedProgress.current = -1;
      if (onTransitionProgress) onTransitionProgress(0);

      perspCamera.near = 0.2;
      perspCamera.far = 4000;
      perspCamera.fov = 46;
      perspCamera.updateProjectionMatrix();

      targetCamPos.current.set(0, 28, 86);
      targetLookAt.current.set(0, 0, 0);
      controlsRef.current.minDistance = 20;
      controlsRef.current.maxDistance = 250;

      isTransitioning.current = false;
    } else if (viewMode === 'solar') {
      // 3. SOLAR SYSTEM PROFILE
      perspCamera.near = 1.0;
      perspCamera.far = 10000;
      perspCamera.fov = 46;
      perspCamera.updateProjectionMatrix();

      targetCamPos.current.set(0, 480, 750);
      targetLookAt.current.set(0, 0, 0);
      controlsRef.current.minDistance = scaleMode === 'true_scale' ? 140 : 48;
      controlsRef.current.maxDistance = 6500;
      controlsRef.current.rotateSpeed = 0.8;
      controlsRef.current.zoomSpeed = 1.2;

      if (!cameFromWarpToSolar) {
        isTransitioning.current = true;
        transitionDuration.current = 1.0;
      } else {
        isTransitioning.current = false;
      }
    } else if (viewMode === 'planet' && selectedBody) {
      // 4. PLANETARY PROFILE
      perspCamera.near = 0.05;
      perspCamera.far = 10000;
      perspCamera.updateProjectionMatrix();

      const effectiveRadius =
        scaleMode === 'true_scale'
          ? Math.max(0.4, selectedBody.radiusKm / ASTRO_CONSTANTS.EARTH_RADIUS_KM)
          : selectedBody.visualRadius;

      controlsRef.current.minDistance = Math.max(effectiveRadius * 1.35, 1.2);
      controlsRef.current.maxDistance = Math.max(effectiveRadius * 35, 300);
      controlsRef.current.rotateSpeed = 0.9;
      controlsRef.current.zoomSpeed = 1.0;

      const pPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
      const dist = effectiveRadius * 3.2 + 4.0;

      targetLookAt.current.copy(pPos);
      targetCamPos.current.set(
        pPos.x + dist * 0.72,
        pPos.y + dist * 0.32,
        pPos.z + dist * 0.72
      );

      isTransitioning.current = true;
      transitionDuration.current = 1.1;
    } else if (viewMode === 'moon' && selectedMoon && selectedBody) {
      perspCamera.near = 0.02;
      perspCamera.far = 10000;
      perspCamera.updateProjectionMatrix();

      const pPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
      const mRel = getMoonRelativePosition(selectedMoon, currentTime, scaleMode);
      const mPos = pPos.clone().add(mRel);
      const dist = selectedMoon.visualRadius * 3.5 + 2.5;

      controlsRef.current.minDistance = Math.max(selectedMoon.visualRadius * 1.3, 1.8);
      controlsRef.current.maxDistance = 80;

      targetLookAt.current.copy(mPos);
      targetCamPos.current.set(
        mPos.x + dist * 0.7,
        mPos.y + dist * 0.35,
        mPos.z + dist * 0.7
      );

      isTransitioning.current = true;
      transitionDuration.current = 0.9;
    }
  }, [viewMode, selectedBody?.id, selectedMoon?.id, scaleMode, cameraResetToken]);

  // Cancel programmatic lerp if user starts interacting manually
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleUserInteractionStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', handleUserInteractionStart);
    return () => {
      controls.removeEventListener('start', handleUserInteractionStart);
    };
  }, []);

  // Frame Animation Loop
  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const currentTime = getSimTime();

    // 1. Cinematic Interstellar Space Flight Transition
    if (viewMode === 'warp_to_solar' || viewMode === 'warp_to_galaxy') {
      warpProgress.current += delta * 0.35;
      const t = Math.min(1.0, warpProgress.current);

      const pThrottled = Math.round(t * 100) / 100;
      if (onTransitionProgress && pThrottled !== lastReportedProgress.current) {
        lastReportedProgress.current = pThrottled;
        onTransitionProgress(pThrottled);
      }

      const [sunX, sunY, sunZ] = MILKY_WAY_DATA.sunPosition.position3D;
      const sunPosGalaxy = new THREE.Vector3(sunX, sunY, sunZ);
      const pSunArrival = new THREE.Vector3(sunX + 1.2, sunY + 0.6, sunZ + 2.0);

      if (viewMode === 'warp_to_solar') {
        if (t < 0.48) {
          // Phase 1: Galactic Dive — swooping smoothly from Galaxy view into the Sun in Orion Spur
          const s1 = t / 0.48;
          const ease1 = s1 * s1 * (3 - 2 * s1); // Smoothstep
          camera.position.lerpVectors(transitionStartCamPos.current, pSunArrival, ease1);
          controlsRef.current.target.lerpVectors(transitionStartLookAt.current, sunPosGalaxy, ease1);
        } else {
          // Phase 2: Solar System Arrival — emerging near the Sun and smoothly gliding into position
          const s2 = (t - 0.48) / 0.52;
          const ease2 = s2 * s2 * (3 - 2 * s2); // Smoothstep
          const pSolarStart = new THREE.Vector3(0, 42, 68);
          camera.position.lerpVectors(pSolarStart, targetCamPos.current, ease2);
          controlsRef.current.target.lerpVectors(new THREE.Vector3(0, 0, 0), targetLookAt.current, ease2);
        }
      } else {
        if (t < 0.48) {
          // Phase 1: Leaving Solar System — diving towards the Sun into the warp corridor
          const s1 = t / 0.48;
          const ease1 = s1 * s1 * (3 - 2 * s1);
          const pSolarExit = new THREE.Vector3(0, 35, 55);
          camera.position.lerpVectors(transitionStartCamPos.current, pSolarExit, ease1);
          controlsRef.current.target.lerpVectors(transitionStartLookAt.current, new THREE.Vector3(0, 0, 0), ease1);
        } else {
          // Phase 2: Emerging into Milky Way Galaxy — expanding outwards to panoramic galactic view
          const s2 = (t - 0.48) / 0.52;
          const ease2 = s2 * s2 * (3 - 2 * s2);
          camera.position.lerpVectors(pSunArrival, targetCamPos.current, ease2);
          controlsRef.current.target.lerpVectors(sunPosGalaxy, targetLookAt.current, ease2);
        }
      }

      if (t >= 1.0) {
        camera.position.copy(targetCamPos.current);
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
        isTransitioning.current = false;
        onWarpComplete();
      }
      controlsRef.current.update();
      return;
    }

    // 2. Smooth Programmatic Gliding (Between Planets / Moons)
    if (isTransitioning.current) {
      transitionProgress.current += delta / transitionDuration.current;
      const t = Math.min(1.0, transitionProgress.current);
      const ease = 1 - Math.pow(1 - t, 3); // Cubic out

      if (viewMode === 'planet' && selectedBody) {
        const effectiveRadius =
          scaleMode === 'true_scale'
            ? Math.max(0.4, selectedBody.radiusKm / ASTRO_CONSTANTS.EARTH_RADIUS_KM)
            : selectedBody.visualRadius;
        const pPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
        targetLookAt.current.copy(pPos);
        const dist = effectiveRadius * 3.2 + 4.0;
        targetCamPos.current.set(
          pPos.x + dist * 0.72,
          pPos.y + dist * 0.32,
          pPos.z + dist * 0.72
        );
      } else if (viewMode === 'moon' && selectedBody && selectedMoon) {
        const pPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
        const mRel = getMoonRelativePosition(selectedMoon, currentTime, scaleMode);
        const mPos = pPos.clone().add(mRel);
        targetLookAt.current.copy(mPos);
        const dist = selectedMoon.visualRadius * 3.5 + 2.5;
        targetCamPos.current.set(
          mPos.x + dist * 0.7,
          mPos.y + dist * 0.35,
          mPos.z + dist * 0.7
        );
      }

      camera.position.lerpVectors(
        transitionStartCamPos.current,
        targetCamPos.current,
        ease
      );
      controlsRef.current.target.lerpVectors(
        transitionStartLookAt.current,
        targetLookAt.current,
        ease
      );

      if (t >= 1.0) {
        isTransitioning.current = false;
      }
      controlsRef.current.update();
      return;
    }

    // 3. Planet Orbit Tracking
    // When locked on a planet, smoothly follow its orbital trajectory
    if (viewMode === 'planet' && selectedBody) {
      if (selectedBody.id === 'sun') {
        controlsRef.current.target.set(0, 0, 0);
      } else {
        const planetPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
        const prevTarget = controlsRef.current.target.clone();
        controlsRef.current.target.copy(planetPos);
        const shift = planetPos.clone().sub(prevTarget);
        if (shift.lengthSq() < 2500 && Number.isFinite(shift.x)) {
          camera.position.add(shift);
        }
      }
      controlsRef.current.update();
      return;
    }

    // 4. Moon Orbit Tracking
    if (viewMode === 'moon' && selectedBody && selectedMoon) {
      const pPos = getPlanet3DPosition(selectedBody, currentTime, scaleMode);
      const mRel = getMoonRelativePosition(selectedMoon, currentTime, scaleMode);
      const moonPos = pPos.clone().add(mRel);

      const prevTarget = controlsRef.current.target.clone();
      controlsRef.current.target.copy(moonPos);
      const shift = moonPos.clone().sub(prevTarget);
      if (shift.lengthSq() < 2500 && Number.isFinite(shift.x)) {
        camera.position.add(shift);
      }
      controlsRef.current.update();
      return;
    }

    // 5. Cinematic Grand Tour Auto-Orbit
    if (isCinematicTour && viewMode === 'solar') {
      const angle = delta * 0.08;
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    }

    controlsRef.current.update();
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      panSpeed={0.8}
      maxPolarAngle={Math.PI - 0.02}
      minPolarAngle={0.02}
    />
  );
};
