import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ViewMode } from './CameraController';

interface GalaxyPostProcessingProps {
  viewMode: ViewMode;
}

export const GalaxyPostProcessing: React.FC<GalaxyPostProcessingProps> = ({ viewMode }) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // EXACT bloom parameters from REYAL look/milky_way.html
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
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
  }, [gl, scene, camera]);

  useEffect(() => {
    if (composerRef.current && bloomPassRef.current) {
      composerRef.current.setSize(size.width, size.height);
      bloomPassRef.current.resolution.set(size.width, size.height);
    }
  }, [size]);

  useFrame(() => {
    const composer = composerRef.current;
    const bloom = bloomPassRef.current;
    if (!composer || !bloom) return;

    if (viewMode === 'galaxy' || viewMode === 'warp_to_galaxy' || viewMode === 'warp_to_solar') {
      bloom.strength = 1.15;
      bloom.radius = 0.72;
      bloom.threshold = 0.035;
    } else {
      // In solar / planet modes: gentle glow for the Sun
      bloom.strength = 0.35;
      bloom.radius = 0.45;
      bloom.threshold = 0.25;
    }

    composer.render();
  }, 1);

  return null;
};
