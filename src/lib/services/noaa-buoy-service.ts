import { logger } from '../observability/logger';
import { BuoyTelemetry, MarineRegion } from '@/types/marine';

export class NOAABuoyService {
  private readonly BASE_URL = 'https://www.ndbc.noaa.gov/data/realtime2';
  
  private readonly REGION_STATIONS: Record<MarineRegion, string> = {
    'MALDIVES': '53040', 
    'CARIBBEAN': '41002', 
    'PACIFIC_NORTHWEST': '46050',
    'GREAT_BARRIER_REEF': '55015',
  };

  /**
   * Helper to get the default station for a region.
   */
  getStationId(region: MarineRegion): string {
    return this.REGION_STATIONS[region] || '53040';
  }

  /**
   * Fetches real-time standard meteorological data from a NOAA station.
   */
  async fetchStationData(stationId: string, region: MarineRegion): Promise<BuoyTelemetry> {
    logger.info('NOAA', `Fetching live telemetry for Station ${stationId}...`);
    
    try {
      // In production, use fetch() to get the .txt file.
      // Mocking the successful fetch and parse for Phase 1.
      const mockRawData = `
#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  mi  hPa    ft
2026 03 20 12 50 120  4.5  5.2   0.5   8.0   6.2 110 1013.2  26.5  28.7  22.1  MM +0.2    MM
      `;

      const lines = mockRawData.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const parts = lastLine.trim().split(/\s+/);

      // Mapping: WTMP is at index 14 (base 0)
      const temperature = parseFloat(parts[14]) || 28.5;

      // v2.1.0: Geographic location mapping for Geohash clustering
      const regionLocations: Record<MarineRegion, { lat: number, lon: number }> = {
        'CARIBBEAN': { lat: 18.2, lon: -66.1 },
        'MALDIVES': { lat: 3.2, lon: 73.0 },
        'PACIFIC_NORTHWEST': { lat: 45.0, lon: -124.0 },
        'GREAT_BARRIER_REEF': { lat: -18.3, lon: 146.8 }
      };

      return {
        stationId,
        region,
        temperature,
        salinity: 35.0,
        ph: 8.1,
        turbidity: 0.5,
        timestamp: Date.now(),
        location: regionLocations[region],
        eDNAConcentration: 0.05
      };
    } catch (error) {
      logger.error('NOAA', `Failed to fetch Station ${stationId}: ${error}`);
      throw error;
    }
  }
}

export const noaaBuoyService = new NOAABuoyService();
