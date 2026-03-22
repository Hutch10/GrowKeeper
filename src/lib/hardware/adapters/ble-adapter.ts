import { IHardwareAdapter, SensorData, ConnectionStatus } from '../hal';
import { logger } from '@/lib/observability/logger';

export class WebBluetoothAdapter implements IHardwareAdapter {
  id = 'web-ble';
  name = 'Tactical BLE Node';
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private status: ConnectionStatus = 'disconnected';

  async connect(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported.');
    }

    this.status = 'connecting';
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['environmental_sensing'] }],
        optionalServices: ['battery_service', 'location']
      });

      this.server = await this.device.gatt?.connect() || null;
      this.status = 'connected';
    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.status = 'disconnected';
  }

  async startStreaming(onData: (data: SensorData) => void): Promise<void> {
    if (!this.server) return;
    
    try {
      const envService = await this.server.getPrimaryService('environmental_sensing');
      
      const uvChar = await envService.getCharacteristic('uv_index').catch(() => null);
      if (uvChar) {
        await uvChar.startNotifications();
        uvChar.addEventListener('characteristicvaluechanged', (e: Event) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value?.getUint8(0) || 0;
          onData({ type: 'uv', value: val, timestamp: new Date().toISOString() });
        });
      }

      const moistureChar = await envService.getCharacteristic('humidity').catch(() => null);
      if (moistureChar) {
        await moistureChar.startNotifications();
        moistureChar.addEventListener('characteristicvaluechanged', (e: Event) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value?.getUint8(0) || 0;
          onData({ type: 'moisture', value: val, timestamp: new Date().toISOString() });
        });
      }
    } catch (err) {
      logger.warn('HAL:BLE', 'Partial notification initialization failure', err as Error);
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }
}
