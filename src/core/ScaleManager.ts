/**
 * Multi-Scale Astronomical Distance and Coordinate Transition Engine
 * Supports smooth mathematical scaling between:
 * - KM (Kilometers)
 * - AU (Astronomical Units)
 * - LY (Light Years)
 * - Parsec (pc)
 */

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

