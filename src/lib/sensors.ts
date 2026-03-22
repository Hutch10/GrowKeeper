/**
 * Web HID Sensor Integration
 * Enables direct data acquisition from tactical environmental hardware.
 */

class HIDSensorManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private device: any | null = null;
  private moistureValue = 0;

  async requestConnection(): Promise<string> {
    if (!('hid' in navigator)) {
      throw new Error('Web HID not supported in this environment.');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const devices = await (navigator as any).hid.requestDevice({ 
        filters: [{ vendorId: 0x1234, productId: 0x5678 }] // Mock Tactical IDs
      });
      
      if (devices && devices.length > 0) {
        const selectedDevice = devices[0];
        await selectedDevice.open();
        this.device = selectedDevice;
        
        // Listen for data reports
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.device.oninputreport = (event: any) => {
          const { data } = event;
          // Assume Report ID 1 is Moisture (1 byte)
          if (event.reportId === 0x01) {
            this.moistureValue = data.getUint8(0);
          }
        };

        return selectedDevice.productName || 'GK-SENSOR-NODE';
      }
      throw new Error('No sensor device selected.');
    } catch (err) {
      console.error('[HID] Connection Error:', err);
      throw err;
    }
  }

  /**
   * Sends a calibration offset to the hardware via an HID Output Report (Report ID 2).
   */
  async calibrate(offset: number): Promise<void> {
    if (!this.device) throw new Error('No HID device connected');
    
    const reportData = new Uint8Array([offset]);
    await this.device.sendReport(0x02, reportData);
    console.log(`[HID] Calibration offset of ${offset} sent to instrument.`);
  }

  async readMoisture(): Promise<number> {
    return this.moistureValue;
  }

  disconnect() {
    if (this.device) {
      this.device.close();
      this.device = null;
    }
  }
}

export const sensorManager = new HIDSensorManager();
