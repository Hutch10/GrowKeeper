import { IHardwareAdapter, SensorData, ConnectionStatus } from '../hal';
import { logger } from '@/lib/observability/logger';

export class WebHIDAdapter implements IHardwareAdapter {
  id = 'web-hid';
  name = 'Tactical HID Instrument';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private device: any | null = null; // HID API is complex, 'any' used sparingly for device handle
  private status: ConnectionStatus = 'disconnected';
  private moistureValue = 0;

  async connect(): Promise<void> {
    if (typeof window === 'undefined' || !('hid' in navigator)) {
      throw new Error('Web HID not supported in this environment.');
    }

    this.status = 'connecting';
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const devices = await (navigator as any).hid.requestDevice({ 
        filters: [{ vendorId: 0x1234, productId: 0x5678 }] 
      });
      
      if (devices && devices.length > 0) {
        this.device = devices[0];
        await this.device.open();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.device.oninputreport = (event: any) => {
          if (event.reportId === 0x01) {
            this.moistureValue = event.data.getUint8(0);
          }
        };

        this.status = 'connected';
      } else {
        this.status = 'disconnected';
        throw new Error('No device selected');
      }
    } catch (err) {
      this.status = 'error';
      logger.error('HAL:HID', 'Connection failed', err as Error);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.close();
      this.device = null;
    }
    this.status = 'disconnected';
  }

  async startStreaming(onData: (data: SensorData) => void): Promise<void> {
    setInterval(() => {
      if (this.status === 'connected') {
        onData({
          type: 'moisture',
          value: this.moistureValue,
          timestamp: new Date().toISOString()
        });
      }
    }, 2000);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  async calibrate(offset: number): Promise<void> {
    if (!this.device) throw new Error('No HID device connected');
    const reportData = new Uint8Array([offset]);
    await this.device.sendReport(0x02, reportData);
    logger.info('HAL:HID', `Calibration offset of ${offset} sent to instrument.`);
  }
}
