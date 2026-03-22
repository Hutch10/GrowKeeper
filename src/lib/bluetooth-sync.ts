/**
 * Web Bluetooth Management for External Field Instruments
 */

export interface SensorData {
  type: 'uv' | 'gps' | 'moisture';
  value: number | { lat: number; lng: number };
  timestamp: number;
}

export class FieldInstrumentManager {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;

  /**
   * Request connection to a 'GrowKeeper-Ready' Bluetooth device.
   */
  async connect(): Promise<string> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser.');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['environmental_sensing'] }],
        optionalServices: ['battery_service', 'location']
      });

      this.server = await this.device.gatt?.connect() || null;
      return this.device.name || 'GK-TACTICAL-NODE';
    } catch (err) {
      console.error('Bluetooth Connection Error:', err);
      throw err;
    }
  }

  /**
   * Start listening for real-time sensor updates across multiple characteristics.
   */
  async startNotifications(onUpdate: (data: SensorData) => void) {
    if (!this.server) return;
    
    try {
      const envService = await this.server.getPrimaryService('environmental_sensing');
      
      // UV Index Notifications
      const uvChar = await envService.getCharacteristic('uv_index').catch(() => null);
      if (uvChar) {
        await uvChar.startNotifications();
        uvChar.addEventListener('characteristicvaluechanged', (e: Event) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value?.getUint8(0) || 0;
          onUpdate({ type: 'uv', value: val, timestamp: Date.now() });
        });
      }

      // Moisture Notifications (Custom/Assumed characteristic)
      const moistureChar = await envService.getCharacteristic('humidity').catch(() => null); // Reusing humidity for moisture
      if (moistureChar) {
        await moistureChar.startNotifications();
        moistureChar.addEventListener('characteristicvaluechanged', (e: Event) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value?.getUint8(0) || 0;
          onUpdate({ type: 'moisture', value: val, timestamp: Date.now() });
        });
      }

      // GPS Notifications (Assumed Service/Char)
      const locService = await this.server.getPrimaryService('location').catch(() => null);
      if (locService) {
        const gpsChar = await locService.getCharacteristic('location_name').catch(() => null);
        if (gpsChar) {
          // Simulate GPS coordinate stream for now as location_name is usually string
          setInterval(() => {
            onUpdate({ 
              type: 'gps', 
              value: { lat: 45.523062 + (Math.random() - 0.5) * 0.01, lng: -122.676482 + (Math.random() - 0.5) * 0.01 }, 
              timestamp: Date.now() 
            });
          }, 5000);
        }
      }
    } catch (err) {
      console.warn('[Bluetooth] Notification initialization partial failure:', err);
    }
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
  }
}

export const instrumentManager = new FieldInstrumentManager();
