import { IHardwareAdapter, SensorData, ConnectionStatus } from './hal';
import { logger } from '@/lib/observability/logger';

export class SimulatorAdapter implements IHardwareAdapter {
  id = 'simulator';
  name = 'Tactical Sensor Simulator';
  private status: ConnectionStatus = 'disconnected';
  private streamInterval: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    this.status = 'connecting';
    logger.debug('HAL:Simulator', 'Simulating hardware handshake...');
    await new Promise(r => setTimeout(r, 800));
    this.status = 'connected';
  }

  async disconnect(): Promise<void> {
    if (this.streamInterval) clearInterval(this.streamInterval);
    this.status = 'disconnected';
  }

  async startStreaming(onData: (data: SensorData) => void): Promise<void> {
    if (this.status !== 'connected') throw new Error('Simulator not connected');

    this.streamInterval = setInterval(() => {
      // Logic for random but realistic botanical oscillations
      const moisture = 60 + Math.sin(Date.now() / 10000) * 5 + (Math.random() - 0.5) * 2;
      
      onData({
        type: 'moisture',
        value: Math.round(moisture * 10) / 10,
        timestamp: new Date().toISOString()
      });

      // Occasional UV spike
      if (Math.random() > 0.95) {
        onData({
          type: 'uv',
          value: Math.random() * 11,
          timestamp: new Date().toISOString()
        });
      }
    }, 2000);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }
}
