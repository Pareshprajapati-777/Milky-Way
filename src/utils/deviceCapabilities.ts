export type GraphicsQuality = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DeviceProfile {
  isMobile: boolean;
  hardwareConcurrency: number;
  deviceMemoryGB?: number;
  gpuRenderer?: string;
  recommendedQuality: GraphicsQuality;
}

export interface GraphicsPresetConfig {
  quality: GraphicsQuality;
  particleMultiplier: number;
  maxDpr: number;
  enableBloom: boolean;
  sphereSegments: number;
  ringSegments: number;
  asteroidCountMultiplier: number;
}

export const GRAPHICS_PRESETS: Record<GraphicsQuality, GraphicsPresetConfig> = {
  HIGH: {
    quality: 'HIGH',
    particleMultiplier: 1.0,
    maxDpr: 2.0,
    enableBloom: true,
    sphereSegments: 128,
    ringSegments: 192,
    asteroidCountMultiplier: 1.0
  },
  MEDIUM: {
    quality: 'MEDIUM',
    particleMultiplier: 0.5,
    maxDpr: 1.5,
    enableBloom: true,
    sphereSegments: 64,
    ringSegments: 96,
    asteroidCountMultiplier: 0.5
  },
  LOW: {
    quality: 'LOW',
    particleMultiplier: 0.25,
    maxDpr: 1.0,
    enableBloom: false,
    sphereSegments: 32,
    ringSegments: 48,
    asteroidCountMultiplier: 0.25
  }
};

/**
 * Detects device hardware profile and suggests appropriate graphics quality preset.
 */
export function detectDeviceCapabilities(): DeviceProfile {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      hardwareConcurrency: 8,
      recommendedQuality: 'HIGH'
    };
  }

  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemoryGB = (navigator as unknown as { deviceMemory?: number }).deviceMemory;

  let gpuRenderer: string | undefined;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch {
    // WebGL info query blocked or unavailable
  }

  // Automatic Quality Heuristic:
  // - Low: Mobile with <= 4 cores or deviceMemory <= 4GB
  // - Medium: Mobile with > 4 cores, or desktop with <= 4 cores
  // - High: Modern desktop with >= 6 cores and dedicated GPU
  let recommendedQuality: GraphicsQuality = 'HIGH';

  if (isMobile) {
    if (hardwareConcurrency <= 4 || (deviceMemoryGB && deviceMemoryGB <= 4)) {
      recommendedQuality = 'LOW';
    } else {
      recommendedQuality = 'MEDIUM';
    }
  } else {
    if (hardwareConcurrency <= 4 || (deviceMemoryGB && deviceMemoryGB <= 4)) {
      recommendedQuality = 'MEDIUM';
    } else {
      recommendedQuality = 'HIGH';
    }
  }

  return {
    isMobile,
    hardwareConcurrency,
    deviceMemoryGB,
    gpuRenderer,
    recommendedQuality
  };
}
