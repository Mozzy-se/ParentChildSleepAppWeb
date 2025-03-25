import { SleepData, SleepPhase } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * WearableService handles communication with Bluetooth-enabled wearable devices
 * that support sleep tracking, heart rate monitoring, and motion detection.
 * This service implements the Web Bluetooth API to connect and interact with
 * compatible devices.
 */

// Declare global interfaces for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    };
  }

  interface RequestDeviceOptions {
    filters: Array<{
      services?: string[];
      name?: string;
      namePrefix?: string;
    }>;
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    value: DataView;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: string, listener: (event: Event) => void): void;
    removeEventListener(type: string, listener: (event: Event) => void): void;
  }
}

// Device-specific service UUIDs for different health metrics
const SERVICE_UUIDS = {
  SLEEP: '0000180d-0000-1000-8000-00805f9b34fb',
  HEART_RATE: '0000180f-0000-1000-8000-00805f9b34fb',
  MOTION: '0000180a-0000-1000-8000-00805f9b34fb',
  BATTERY: '0000180f-0000-1000-8000-00805f9b34fb',
  DEVICE_INFO: '0000180a-0000-1000-8000-00805f9b34fb',
};

// Device-specific characteristic UUIDs for data access
const CHARACTERISTIC_UUIDS = {
  SLEEP_DATA: '00002a37-0000-1000-8000-00805f9b34fb',
  HEART_RATE_DATA: '00002a37-0000-1000-8000-00805f9b34fb',
  MOTION_DATA: '00002a37-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
  DEVICE_NAME: '00002a00-0000-1000-8000-00805f9b34fb',
  FIRMWARE_VERSION: '00002a26-0000-1000-8000-00805f9b34fb',
};

/**
 * Interface defining the device information structure
 */
export interface DeviceInfo {
  name: string;
  firmwareVersion: string;
  batteryLevel: number;
  manufacturer: string;
}

/**
 * Main service class for handling wearable device interactions
 */
export class WearableService {
  // Device connection state
  private device: BluetoothDevice | null = null;
  private sleepCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private motionCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private deviceInfoCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private deviceInfo: DeviceInfo | null = null;

  // Data storage
  private sleepData: SleepData[] = [];
  private heartRateData: number[] = [];
  private motionData: number[] = [];

  /**
   * Scans for available Bluetooth devices that support health monitoring
   * @returns Promise<BluetoothDevice[]> Array of discovered devices
   */
  async scanDevices(): Promise<BluetoothDevice[]> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [SERVICE_UUIDS.SLEEP] },
          { services: [SERVICE_UUIDS.HEART_RATE] },
          { services: [SERVICE_UUIDS.MOTION] },
        ],
      });

      return [device];
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw new Error('Failed to scan for devices');
    }
  }

  /**
   * Establishes connection with a selected device and initializes all required services
   * @param device The Bluetooth device to connect to
   */
  async connectDevice(device: BluetoothDevice): Promise<void> {
    try {
      if (!device.gatt) {
        throw new Error('Device does not support GATT');
      }

      const server = await device.gatt.connect();
      this.device = device;

      // Get device info
      const deviceInfoService = await server.getPrimaryService(SERVICE_UUIDS.DEVICE_INFO);
      this.deviceInfoCharacteristic = await deviceInfoService.getCharacteristic(CHARACTERISTIC_UUIDS.DEVICE_NAME);
      await this.readDeviceInfo();

      // Get battery service
      const batteryService = await server.getPrimaryService(SERVICE_UUIDS.BATTERY);
      this.batteryCharacteristic = await batteryService.getCharacteristic(CHARACTERISTIC_UUIDS.BATTERY_LEVEL);
      await this.readBatteryLevel();

      // Get sleep service and characteristic
      const sleepService = await server.getPrimaryService(SERVICE_UUIDS.SLEEP);
      this.sleepCharacteristic = await sleepService.getCharacteristic(CHARACTERISTIC_UUIDS.SLEEP_DATA);

      // Get heart rate service and characteristic
      const heartRateService = await server.getPrimaryService(SERVICE_UUIDS.HEART_RATE);
      this.heartRateCharacteristic = await heartRateService.getCharacteristic(CHARACTERISTIC_UUIDS.HEART_RATE_DATA);

      // Get motion service and characteristic
      const motionService = await server.getPrimaryService(SERVICE_UUIDS.MOTION);
      this.motionCharacteristic = await motionService.getCharacteristic(CHARACTERISTIC_UUIDS.MOTION_DATA);

      // Start notifications
      await this.startNotifications();
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw new Error('Failed to connect to device');
    }
  }

  private async readDeviceInfo(): Promise<void> {
    if (!this.deviceInfoCharacteristic) return;

    try {
      const value = this.deviceInfoCharacteristic.value;
      const name = this.decodeString(value);
      this.deviceInfo = {
        name,
        firmwareVersion: '1.0.0', // This would come from FIRMWARE_VERSION characteristic
        batteryLevel: 0,
        manufacturer: 'Unknown', // This would come from manufacturer ID
      };
    } catch (error) {
      console.error('Error reading device info:', error);
    }
  }

  private async readBatteryLevel(): Promise<void> {
    if (!this.batteryCharacteristic) return;

    try {
      const value = this.batteryCharacteristic.value;
      const batteryLevel = value.getUint8(0);
      if (this.deviceInfo) {
        this.deviceInfo.batteryLevel = batteryLevel;
      }
    } catch (error) {
      console.error('Error reading battery level:', error);
    }
  }

  private async startNotifications(): Promise<void> {
    if (!this.sleepCharacteristic || !this.heartRateCharacteristic || !this.motionCharacteristic) {
      throw new Error('Characteristics not initialized');
    }

    try {
      await this.sleepCharacteristic.startNotifications();
      await this.heartRateCharacteristic.startNotifications();
      await this.motionCharacteristic.startNotifications();

      // Add event listeners
      this.sleepCharacteristic.addEventListener('characteristicvaluechanged', this.handleSleepData);
      this.heartRateCharacteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateData);
      this.motionCharacteristic.addEventListener('characteristicvaluechanged', this.handleMotionData);
    } catch (error) {
      console.error('Error starting notifications:', error);
      throw new Error('Failed to start notifications');
    }
  }

  /**
   * Event handler for sleep data updates from the device
   * Processes raw sleep data and stores it for later use
   */
  private handleSleepData = (event: Event): void => {
    const target = event.target;
    if (!target) return;
    const characteristic = target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    const sleepData = this.processSleepData(value);
    this.sleepData.push(sleepData);
    // Emit sleep data event or update state
  };

  /**
   * Event handler for heart rate data updates from the device
   * Processes raw heart rate data and stores it for later use
   */
  private handleHeartRateData = (event: Event): void => {
    const target = event.target;
    if (!target) return;
    const characteristic = target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    const heartRate = this.processHeartRateData(value);
    this.heartRateData.push(heartRate);
    // Emit heart rate data event or update state
  };

  /**
   * Event handler for motion data updates from the device
   * Processes raw motion data and stores it for later use
   */
  private handleMotionData = (event: Event): void => {
    const target = event.target;
    if (!target) return;
    const characteristic = target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    const motion = this.processMotionData(value);
    this.motionData.push(motion);
    // Emit motion data event or update state
  };

  /**
   * Processes raw sleep data from the device into a structured format
   * @param value Raw DataView containing sleep data
   * @returns Processed SleepData object
   */
  private processSleepData(value: DataView): SleepData {
    // Process raw sleep data into structured format
    const phases: SleepPhase[] = [];
    const heartRate: number[] = [];
    const movement: number[] = [];

    // Example data processing (this would be device-specific)
    let offset = 0;
    while (offset < value.byteLength) {
      const phaseType = value.getUint8(offset);
      const startTime = new Date(value.getUint32(offset + 1));
      const duration = value.getUint32(offset + 5);

      phases.push({
        type: this.mapPhaseType(phaseType),
        startTime,
        duration,
      });

      offset += 9;
    }

    return {
      date: new Date(),
      duration: phases.reduce((acc, phase) => acc + phase.duration, 0),
      quality: this.calculateSleepQuality(phases),
      phases,
      heartRate,
      movement,
    };
  }

  /**
   * Processes raw heart rate data from the device
   * @param value Raw DataView containing heart rate data
   * @returns Processed heart rate value
   */
  private processHeartRateData(value: DataView): number {
    // Process raw heart rate data
    // Example: First byte contains the heart rate value
    return value.getUint8(0);
  }

  /**
   * Processes raw motion data from the device
   * @param value Raw DataView containing motion data
   * @returns Processed motion value
   */
  private processMotionData(value: DataView): number {
    // Process raw motion data
    // Example: First byte contains the motion intensity
    return value.getUint8(0);
  }

  /**
   * Maps device-specific sleep phase types to standardized types
   * @param type Numeric phase type from the device
   * @returns Standardized sleep phase type
   */
  private mapPhaseType(type: number): SleepPhase['type'] {
    // Map device-specific phase types to our standardized types
    switch (type) {
      case 0:
        return 'Deep';
      case 1:
        return 'REM';
      case 2:
      case 3:
        return 'Light';
      default:
        return 'Light';
    }
  }

  /**
   * Calculates sleep quality based on phase distribution
   * @param phases Array of sleep phases
   * @returns Quality score (0-100)
   */
  private calculateSleepQuality(phases: SleepPhase[]): number {
    // Calculate sleep quality based on phase distribution
    const totalDuration = phases.reduce((acc, phase) => acc + phase.duration, 0);
    const deepSleepDuration = phases
      .filter(phase => phase.type === 'Deep')
      .reduce((acc, phase) => acc + phase.duration, 0);
    const remSleepDuration = phases
      .filter(phase => phase.type === 'REM')
      .reduce((acc, phase) => acc + phase.duration, 0);

    // Quality score based on deep sleep and REM sleep percentages
    const deepSleepPercentage = (deepSleepDuration / totalDuration) * 100;
    const remSleepPercentage = (remSleepDuration / totalDuration) * 100;

    // Ideal ranges: 20-25% deep sleep, 20-25% REM sleep
    const deepSleepScore = Math.max(0, Math.min(100, (deepSleepPercentage / 25) * 100));
    const remSleepScore = Math.max(0, Math.min(100, (remSleepPercentage / 25) * 100));

    return (deepSleepScore + remSleepScore) / 2;
  }

  /**
   * Decodes string data from a DataView
   * @param value DataView containing string data
   * @returns Decoded string
   */
  private decodeString(value: DataView): string {
    // Decode string from DataView
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(value.buffer));
  }

  /**
   * Retrieves current device information
   * @returns DeviceInfo object or null if not connected
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Retrieves all collected sleep data
   * @returns Array of SleepData objects
   */
  getSleepData(): SleepData[] {
    return this.sleepData;
  }

  /**
   * Retrieves all collected heart rate data
   * @returns Array of HeartRateData objects
   */
  getHeartRateData(): HeartRateData[] {
    return this.heartRateData.map((value, index) => ({
      timestamp: Date.now() - (this.heartRateData.length - index - 1) * 1000,
      value,
      confidence: 0.95,
      source: this.deviceInfo?.name || 'Unknown Device',
    }));
  }

  /**
   * Retrieves all collected motion data
   * @returns Array of MotionData objects
   */
  getMotionData(): MotionData[] {
    return this.motionData.map((value, index) => ({
      timestamp: Date.now() - (this.motionData.length - index - 1) * 1000,
      x: value,
      y: value,
      z: value,
      magnitude: Math.sqrt(value * value + value * value + value * value),
      source: this.deviceInfo?.name || 'Unknown Device',
    }));
  }

  /**
   * Disconnects from the current device and cleans up resources
   */
  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
      this.device = null;
      this.sleepCharacteristic = null;
      this.heartRateCharacteristic = null;
      this.motionCharacteristic = null;
      this.batteryCharacteristic = null;
      this.deviceInfoCharacteristic = null;
      this.deviceInfo = null;
      this.sleepData = [];
      this.heartRateData = [];
      this.motionData = [];
    }
  }
} 