import * as THREE from 'three';

export type SimulationScale = 'GALACTIC' | 'BLACK_HOLE' | 'SOLAR_SYSTEM' | 'PLANETARY';

export interface ScaleConfig {
  mode: SimulationScale;
  unitLabel: string;
  unitInKm: number;
  minDistance: number;
  maxDistance: number;
  galaxyOpacity: number;
  solarSystemOpacity: number;
  blackHoleOpacity: number;
}

// Solar System position inside Milky Way (26,000 LY from Sgr A* in Orion Spur)
export const SOLAR_SYSTEM_GALACTIC_POS = new THREE.Vector3(26.0, 0.05, 8.5); // In kly units
export const SGR_A_GALACTIC_POS = new THREE.Vector3(0, 0, 0);

export const SCALE_CONSTANTS = {
  KM_PER_AU: 149597870.7,
  AU_PER_LY: 63241.077,
  LY_PER_PARSEC: 3.26156,
  AU_PER_PARSEC: 206265.0,
  SPEED_OF_LIGHT_KMS: 299792.458,
  SOLAR_SYSTEM_BASE_SCALE: 25.0, // AU to Three.js units in solar system view
  GALAXY_BASE_SCALE: 0.005,      // LY to Three.js units in galactic view
};

export type CosmicScaleLevel = 'PLANETARY' | 'SOLAR_SYSTEM' | 'OORT_CLOUD' | 'ORION_ARM' | 'MILKY_WAY' | 'LOCAL_GROUP';

export class ScaleManager {
  /**
   * Calculates continuous cross-fade opacities and coordinate scaling
   * based on camera distance and active target.
   */
  static computeScaleState(
    cameraDistance: number,
    activeTargetType: 'GALAXY' | 'SGR_A' | 'STAR' | 'PLANET' | 'MOON'
  ): ScaleConfig {
    // Zooming into Sagittarius A* at Galactic Center
    if (activeTargetType === 'SGR_A' && cameraDistance < 5.0) {
      const t = THREE.MathUtils.smoothstep(cameraDistance, 0.5, 5.0);
      return {
        mode: 'BLACK_HOLE',
        unitLabel: 'AU (Schwarzschild Scale)',
        unitInKm: 149597870.7,
        minDistance: 0.05,
        maxDistance: 1000,
        galaxyOpacity: t * 0.35,
        solarSystemOpacity: 0,
        blackHoleOpacity: 1.0 - t * 0.8,
      };
    }

    // Zooming into Solar System from Milky Way
    if (activeTargetType !== 'GALAXY' && cameraDistance < 12.0) {
      const fade = THREE.MathUtils.smoothstep(cameraDistance, 2.0, 12.0);
      return {
        mode: cameraDistance < 0.8 ? 'PLANETARY' : 'SOLAR_SYSTEM',
        unitLabel: cameraDistance < 0.8 ? 'km' : 'AU',
        unitInKm: cameraDistance < 0.8 ? 1 : 149597870.7,
        minDistance: 0.002,
        maxDistance: 2500,
        galaxyOpacity: Math.max(0.08, fade), // Keep faint Milky Way skybox band in background!
        solarSystemOpacity: 1.0 - fade,
        blackHoleOpacity: 0,
      };
    }

    // Macro Galactic View
    return {
      mode: 'GALACTIC',
      unitLabel: 'Light Years (kly)',
      unitInKm: 9.461e12,
      minDistance: 0.1,
      maxDistance: 350,
      galaxyOpacity: 1.0,
      solarSystemOpacity: 0,
      blackHoleOpacity: 0.2,
    };
  }

  /** Convert KM to AU */
  static kmToAU(km: number): number {
    return km / SCALE_CONSTANTS.KM_PER_AU;
  }

  /** Convert AU to KM */
  static auToKM(au: number): number {
    return au * SCALE_CONSTANTS.KM_PER_AU;
  }

  /** Convert AU to Light Years */
  static auToLY(au: number): number {
    return au / SCALE_CONSTANTS.AU_PER_LY;
  }

  /** Convert Light Years to AU */
  static lyToAU(ly: number): number {
    return ly * SCALE_CONSTANTS.AU_PER_LY;
  }

  /** Convert Light Years to Parsecs */
  static lyToParsec(ly: number): number {
    return ly / SCALE_CONSTANTS.LY_PER_PARSEC;
  }

  /** Convert Parsecs to Light Years */
  static parsecToLY(pc: number): number {
    return pc * SCALE_CONSTANTS.LY_PER_PARSEC;
  }

  /**
   * Determine cosmic scale tier based on camera distance from focus target
   */
  static getScaleLevel(cameraDistance: number, isGalacticMode: boolean): CosmicScaleLevel {
    if (isGalacticMode) {
      if (cameraDistance > 800) return 'LOCAL_GROUP';
      if (cameraDistance > 200) return 'MILKY_WAY';
      return 'ORION_ARM';
    } else {
      if (cameraDistance > 1200) return 'OORT_CLOUD';
      if (cameraDistance > 60) return 'SOLAR_SYSTEM';
      return 'PLANETARY';
    }
  }

  /**
   * Format arbitrary distance into human readable scientific unit
   */
  static formatDynamicDistance(distanceKm: number): { value: number; unit: string; label: string } {
    if (distanceKm < 1e6) {
      return { value: distanceKm, unit: 'km', label: `${Math.round(distanceKm).toLocaleString()} km` };
    }
    const au = this.kmToAU(distanceKm);
    if (au < 1000) {
      return { value: au, unit: 'AU', label: `${au.toFixed(3)} AU` };
    }
    const ly = this.auToLY(au);
    if (ly < 1000) {
      return { value: ly, unit: 'LY', label: `${ly.toFixed(2)} Light Years` };
    }
    const pc = this.lyToParsec(ly);
    return { value: pc, unit: 'pc', label: `${(pc / 1000).toFixed(2)} kpc` };
  }
}
