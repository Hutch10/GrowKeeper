/**
 * GrowKeeper Hardware Abstraction Layer (HAL)
 * Decouples the application from specific Browser APIs (HID/BLE).
 */

import { logger } from '@/lib/observability/logger';
import { metrics } from '@/lib/observability/metrics';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface SensorData {
  type: 'moisture' | 'uv' | 'temp' | 'gps' | 'humidity';
  value: number | { lat: number; lng: number };
  timestamp: string;
}

export interface IHardwareAdapter {
  id: string;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startStreaming(onData: (data: SensorData) => void): Promise<void>;
  getStatus(): ConnectionStatus;
}

class HALManager {
  private static instance: HALManager;
  private adapters: Map<string, IHardwareAdapter> = new Map();
  private activeAdapter: IHardwareAdapter | null = null;

  private constructor() {}

  static getInstance(): HALManager {
    if (!HALManager.instance) {
      HALManager.instance = new HALManager();
    }
    return HALManager.instance;
  }

  registerAdapter(adapter: IHardwareAdapter) {
    this.adapters.set(adapter.id, adapter);
    logger.debug('HAL', `Registered adapter: ${adapter.name}`);
  }

  async setActiveAdapter(id: string): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
    }

    const adapter = this.adapters.get(id);
    if (!adapter) throw new Error(`Adapter ${id} not found.`);

    this.activeAdapter = adapter;
    logger.info('HAL', `Switching to active adapter: ${adapter.name}`);
  }

  async connect(): Promise<void> {
    if (!this.activeAdapter) throw new Error('No active hardware adapter.');
    
    try {
      await this.activeAdapter.connect();
      metrics.track('hardware_connection_success', 1, { adapter: this.activeAdapter.id });
      logger.info('HAL', `Connected to ${this.activeAdapter.name}`);
    } catch (err) {
      metrics.track('hardware_connection_failure', 1, { adapter: this.activeAdapter.id });
      logger.error('HAL', `Connection failure for ${this.activeAdapter.name}`, err as Error);
      throw err;
    }
  }

  async startStreaming(onData: (data: SensorData) => void) {
    if (!this.activeAdapter) return;
    await this.activeAdapter.startStreaming(onData);
  }

  disconnect() {
    this.activeAdapter?.disconnect();
  }

  getStatus(): ConnectionStatus {
    return this.activeAdapter?.getStatus() || 'disconnected';
  }
}

import { SimulatorAdapter } from './simulator';
import { WebHIDAdapter } from './adapters/web-hid-adapter';
import { WebBluetoothAdapter } from './adapters/ble-adapter';

export const hal = HALManager.getInstance();

// Auto-register standard tactical adapters
hal.registerAdapter(new WebHIDAdapter());
hal.registerAdapter(new WebBluetoothAdapter());
hal.registerAdapter(new SimulatorAdapter());
