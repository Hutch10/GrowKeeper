import * as turf from '@turf/turf';

// Mock Geofencing Data (In a real app, this would be fetched from a GeoJSON API or local cache)
export const BOUNDARIES = {
  PRIVATE_LAND: turf.polygon([[
    [-115.0, 36.0],
    [-115.1, 36.0],
    [-115.1, 36.1],
    [-115.0, 36.1],
    [-115.0, 36.0]
  ]], { name: 'Restricted Private Property', type: 'private' }),
  
  BLM_LAND: turf.polygon([[
    [-115.1, 36.1],
    [-115.2, 36.1],
    [-115.2, 36.2],
    [-115.1, 36.2],
    [-115.1, 36.1]
  ]], { name: 'Bureau of Land Management (Permit Required)', type: 'blm' }),

  EPZ_SENSITIVE: turf.polygon([[
    [-115.05, 36.05],
    [-115.08, 36.05],
    [-115.08, 36.08],
    [-115.05, 36.08],
    [-115.05, 36.05]
  ]], { name: 'Ecological Protection Zone (EPZ)', type: 'restricted' })
};

export type LandStatus = 'safe' | 'warning' | 'danger';

export interface GeofenceResult {
  status: LandStatus;
  message: string;
}

/**
 * Checks a coordinate against known legal boundaries.
 */
export function checkLegalStatus(lng: number, lat: number): GeofenceResult {
  const point = turf.point([lng, lat]);
  
  if (turf.booleanPointInPolygon(point, BOUNDARIES.PRIVATE_LAND)) {
    return {
      status: 'danger',
      message: 'NO TRESPASSING: Private Property detected. Please exit the area immediately.'
    };
  }
  
  if (turf.booleanPointInPolygon(point, BOUNDARIES.BLM_LAND)) {
    return {
      status: 'warning',
      message: 'BLM LAND: Collection permits may be required. Check local regulations.'
    };
  }
  
  if (turf.booleanPointInPolygon(point, BOUNDARIES.EPZ_SENSITIVE)) {
    return {
      status: 'danger',
      message: 'EPZ DETECTED: Critical ecological area. Bio-sampling and unauthorized collection are strictly prohibited.'
    };
  }
  
  return {
    status: 'safe',
    message: 'PUBLIC ACCESS: No restricted boundaries detected.'
  };
}
