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

      isTransitioning.current = true;
      transitionDuration.current = 1.2;
    } else if (viewMode === 'warp_to_solar') {
      // 2. INTERSTELLAR FLIGHT PROFILE
      warpProgress.current = 0;
      if (onTransitionProgress) onTransitionProgress(0);

      perspCamera.near = 0.5;
      perspCamera.far = 10000;
      perspCamera.updateProjectionMatrix();

      targetCamPos.current.set(0, 480, 750);
      targetLookAt.current.set(0, 0, 0);
      controlsRef.current.minDistance = scaleMode === 'true_scale' ? 140 : 48;
      controlsRef.current.maxDistance = 6500;

      isTransitioning.current = false;
    } else if (viewMode === 'warp_to_galaxy') {
      warpProgress.current = 0;
      if (onTransitionProgress) onTransitionProgress(0);

      perspCamera.near = 0.2;
      perspCamera.far = 4000;
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
      perspCamera.updateProjectionMatrix();

      targetCamPos.current.set(0, 480, 750);
      targetLookAt.current.set(0, 0, 0);
      controlsRef.current.minDistance = scaleMode === 'true_scale' ? 140 : 48;
      controlsRef.current.maxDistance = 6500;
      controlsRef.current.rotateSpeed = 0.8;
      controlsRef.current.zoomSpeed = 1.2;

      isTransitioning.current = true;
      transitionDuration.current = 1.0;
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
      // 3.5-second cinematic flight timeline
      warpProgress.current += delta * 0.32;
      const t = Math.min(1.0, warpProgress.current);

      if (onTransitionProgress) {
        onTransitionProgress(t);
      }

      // Smooth Quintic easing (smoothstep with zero 1st & 2nd derivatives)
      // s(t) = 6t^5 - 15t^4 + 10t^3
      const ease = t * t * t * (t * (t * 6 - 15) + 10);

      // Continuous Exponential Scale Zoom (FOV + Scale Interpolation)
      const perspCamera = camera as THREE.PerspectiveCamera;
      const fovPulse = Math.sin(t * Math.PI);
      perspCamera.fov = THREE.MathUtils.lerp(46, 62, fovPulse);
      perspCamera.updateProjectionMatrix();

      const [sunX, sunY, sunZ] = MILKY_WAY_DATA.sunPosition.position3D;
      const solarSystemApproach = new THREE.Vector3(sunX, sunY + 2.5, sunZ);

      if (viewMode === 'warp_to_solar') {
        // 3D Hermite trajectory: starts at Galactic view, swoops in towards Orion Spur,
        // then gracefully transitions into Solar System overview
        const p0 = transitionStartCamPos.current;
        const pMid = new THREE.Vector3(sunX * 0.85, sunY + 12, sunZ * 0.85);
        const pFinal = targetCamPos.current;

        // Quadratic/Cubic Bezier curve
        const inv = 1 - ease;
        const currentPos = new THREE.Vector3(
          inv * inv * p0.x + 2 * inv * ease * pMid.x + ease * ease * pFinal.x,
          inv * inv * p0.y + 2 * inv * ease * pMid.y + ease * ease * pFinal.y,
          inv * inv * p0.z + 2 * inv * ease * pMid.z + ease * ease * pFinal.z
        );

        camera.position.copy(currentPos);

        // LookAt shifts from Galactic Center towards Solar System origin
        const currentLookAt = new THREE.Vector3().lerpVectors(
          solarSystemApproach,
          targetLookAt.current,
          Math.max(0, (ease - 0.5) * 2)
        );
        controlsRef.current.target.copy(currentLookAt);
      } else {
        // Return journey: zooms outward from Solar System back to Galactic panorama
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
      }

      if (t >= 1.0) {
        perspCamera.fov = 46;
        perspCamera.updateProjectionMatrix();
        setViewMode(viewMode === 'warp_to_solar' ? 'solar' : 'galaxy');
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
