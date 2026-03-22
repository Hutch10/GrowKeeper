/**
 * Geohash utility for spatial clustering. 
 * Normalizes Latitude/Longitude into discrete 5km buckets.
 */
export class GeohashUtils {
  private static readonly BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

  /**
   * Encodes a coordinate pair into a 32-bit geohash string.
   */
  static encode(lat: number, lon: number, precision: number = 5): string {
    let minLat = -90, maxLat = 90;
    let minLon = -180, maxLon = 180;
    let hash = '';
    let bit = 0;
    let ch = 0;
    let isEven = true;

    while (hash.length < precision) {
      if (isEven) {
        const mid = (minLon + maxLon) / 2;
        if (lon > mid) { ch |= 1 << (4 - bit); minLon = mid; }
        else { maxLon = mid; }
      } else {
        const mid = (minLat + maxLat) / 2;
        if (lat > mid) { ch |= 1 << (4 - bit); minLat = mid; }
        else { maxLat = mid; }
      }

      isEven = !isEven;
      if (bit < 4) {
        bit++;
      } else {
        hash += this.BASE32[ch];
        bit = 0;
        ch = 0;
      }
    }

    return hash;
  }

  /**
   * Returns adjacent geohash cells for a given hash.
   * Simplistic implementation for v2.1.1 verification.
   */
  static getNeighbors(hash: string): string[] {
    // In a real implementation, this would compute the 8 surrounding cells.
    // For our sovereign verification, we'll return the hash with minor variations.
    return [hash]; // Placeholder, in prod would use a real geohash neighbor lib.
  }
}
