export interface GalacticObject {
  id: string;
  name: string;
  type: 'BLACK_HOLE' | 'SPIRAL_ARM' | 'NEBULA' | 'STAR_CLUSTER' | 'STELLAR_NEIGHBOR';
  galacticCoordinatesLY: { x: number; y: number; z: number };
  distanceFromSunLY: number;
  description: string;
  temperatureK?: number;
  massSolar?: number;
}

export const GALACTIC_CATALOG: GalacticObject[] = [
  {
    id: 'sgr-a-star',
    name: 'Sagittarius A*',
    type: 'BLACK_HOLE',
    galacticCoordinatesLY: { x: 0, y: 0, z: 0 },
    distanceFromSunLY: 26670,
    massSolar: 4.154e6,
    description: 'Supermassive black hole at the dynamical center of the Milky Way galaxy.'
  },
  {
    id: 'solar-system',
    name: 'Solar System (Sun)',
    type: 'STELLAR_NEIGHBOR',
    galacticCoordinatesLY: { x: 0, y: 50, z: 26670 },
    distanceFromSunLY: 0,
    massSolar: 1.0,
    temperatureK: 5778,
    description: 'Our home stellar system located within the local Orion-Cygnus Arm.'
  },
  {
    id: 'orion-nebula',
    name: 'Orion Nebula (M42)',
    type: 'NEBULA',
    galacticCoordinatesLY: { x: 450, y: -280, z: 27950 },
    distanceFromSunLY: 1344,
    description: 'Vast diffuse nebula situated in the Milky Way, south of Orion’s Belt.'
  },
  {
    id: 'crab-nebula',
    name: 'Crab Nebula (M1)',
    type: 'NEBULA',
    galacticCoordinatesLY: { x: -1200, y: -450, z: 33100 },
    distanceFromSunLY: 6500,
    description: 'Supernova remnant and pulsar wind nebula in the constellation of Taurus.'
  },
  {
    id: 'pleiades',
    name: 'Pleiades Cluster (M45)',
    type: 'STAR_CLUSTER',
    galacticCoordinatesLY: { x: -280, y: -160, z: 27000 },
    distanceFromSunLY: 444,
    description: 'Open star cluster containing middle-aged, hot B-type stars.'
  },
  {
    id: 'proxima-centauri',
    name: 'Proxima Centauri',
    type: 'STELLAR_NEIGHBOR',
    galacticCoordinatesLY: { x: -2.3, y: -0.2, z: 26673.5 },
    distanceFromSunLY: 4.2465,
    massSolar: 0.122,
    temperatureK: 3042,
    description: 'Red dwarf star, the closest known individual star to the Sun.'
  }
];

