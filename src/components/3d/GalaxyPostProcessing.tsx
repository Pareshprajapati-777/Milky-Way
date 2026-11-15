import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ViewMode } from './CameraController';
import { useSimulationStore } from '../../state/useSimulationStore';
import { GRAPHICS_PRESETS } from '../../utils/deviceCapabilities';

interface GalaxyPostProcessingProps {
  viewMode: ViewMode;
}

export const GalaxyPostProcessing: React.FC<GalaxyPostProcessingProps> = ({ viewMode }) => {
  const { gl, scene, camera, size } = useThree();
  const activeLOD = useSimulationStore((state) => state.activeLOD);
  const preset = GRAPHICS_PRESETS[activeLOD || 'HIGH'] || GRAPHICS_PRESETS.HIGH;

  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  useEffect(() => {
    if (!preset.enableBloom) {
      composerRef.current = null;
      bloomPassRef.current = null;
      return;
    }

    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Resolution scaled by preset (half resolution on Medium for 4x fill-rate acceleration)
    const bloomRes = activeLOD === 'MEDIUM'
      ? new THREE.Vector2(Math.floor(size.width * 0.5), Math.floor(size.height * 0.5))
      : new THREE.Vector2(size.width, size.height);

    // EXACT bloom parameters from REYAL look/milky_way.html
    const bloomPass = new UnrealBloomPass(
      bloomRes,
      1.15, // bloomStrength: 1.15
      0.72, // bloomRadius: 0.72
      0.035 // bloomThreshold: 0.035
    );
    composer.addPass(bloomPass);

    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    return () => {
      composer.dispose();
      renderPass.dispose();
      bloomPass.dispose();
    };
  }, [gl, scene, camera, preset.enableBloom, activeLOD]);

  useEffect(() => {
    if (composerRef.current && bloomPassRef.current && preset.enableBloom) {
      composerRef.current.setSize(size.width, size.height);
      const resWidth = activeLOD === 'MEDIUM' ? Math.floor(size.width * 0.5) : size.width;
      const resHeight = activeLOD === 'MEDIUM' ? Math.floor(size.height * 0.5) : size.height;
      bloomPassRef.current.resolution.set(resWidth, resHeight);
    }
  }, [size, preset.enableBloom, activeLOD]);

  useFrame(() => {
    if (!preset.enableBloom) return;
    const composer = composerRef.current;
    const bloom = bloomPassRef.current;
    if (!composer || !bloom) return;

    if (viewMode === 'galaxy' || viewMode === 'warp_to_galaxy' || viewMode === 'warp_to_solar') {
      bloom.strength = 1.15;
      bloom.radius = 0.72;
      bloom.threshold = 0.035;
    } else {
      // In solar / planet modes: gentle glow for the radiant Sun only, preventing planet blowout
      bloom.strength = 0.28;
      bloom.radius = 0.40;
      bloom.threshold = 0.65;
    }

    composer.render();
  }, preset.enableBloom ? 1 : 0);

  return null;
};
