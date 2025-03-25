/**
 * SamsungHealthService handles integration with Samsung Health SDK
 * to access health data from Samsung devices. This service provides
 * methods to initialize the SDK, request permissions, and fetch various
 * types of health data including sleep, heart rate, and motion data.
 */

import { SleepData, SleepPhase } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

// Declare global interface for Samsung Health Bridge
declare global {
  interface Window {
    SamsungHealthBridge: {
      initialize(): Promise<boolean>;
      requestPermissions(permissions: string[]): Promise<Record<string, string>>;
      getSleepData(startTime: number, endTime: number): Promise<any>;
      getHeartRateData(startTime: number, endTime: number): Promise<any>;
      getMotionData(startTime: number, endTime: number): Promise<any>;
    };
  }
}

/**
 * Service class for interacting with Samsung Health SDK
 */
export class SamsungHealthService {
  private isInitialized = false;
  private isAuthorized = false;

  constructor() {
    console.log('SamsungHealthService: Constructor called');
  }

  /**
   * Initializes the Samsung Health SDK and establishes connection
   * @returns Promise<boolean> indicating whether initialization was successful
   */
  async initialize(): Promise<boolean> {
    console.log('SamsungHealthService: Starting initialization');
    await this.initializeSDK();
    return this.isInitialized;
  }

  /**
   * Requests necessary permissions from Samsung Health
   * @returns Promise<boolean> indicating whether permissions were granted
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('SamsungHealthService: Not initialized, cannot request permissions');
      return false;
    }

    try {
      const permissions = [
        'com.samsung.shealth.sleep',
        'com.samsung.shealth.heart_rate',
        'com.samsung.shealth.motion'
      ];

      const result = await window.SamsungHealthBridge.requestPermissions(permissions);
      this.isAuthorized = Object.values(result).every(
        (status: string) => status === 'permission_granted'
      );
      return this.isAuthorized;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Checks current permission status for required health data access
   * @returns Promise<boolean> indicating whether all required permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const permissions = [
        'com.samsung.shealth.sleep',
        'com.samsung.shealth.heart_rate',
        'com.samsung.shealth.motion'
      ];

      const result = await window.SamsungHealthBridge.requestPermissions(permissions);
      this.isAuthorized = Object.values(result).every(
        (status: string) => status === 'permission_granted'
      );
      return this.isAuthorized;
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  }

  /**
   * Initializes the Samsung Health SDK and establishes connection
   * Sets up the bridge interface for communication with native code
   */
  private async initializeSDK() {
    console.log('SamsungHealthService: Starting SDK initialization');
    try {
      // Check if we're in the native wrapper with bridge
      if (!window.SamsungHealthBridge) {
        console.log('SamsungHealthService: Bridge not available, SDK will not be initialized');
        return;
      }

      const initialized = await window.SamsungHealthBridge.initialize();
      
      if (initialized) {
        console.log('SamsungHealthService: Bridge initialized successfully');
        this.isInitialized = true;
      } else {
        console.log('SamsungHealthService: Bridge initialization failed');
      }
    } catch (error) {
      console.error('SamsungHealthService: Error initializing bridge:', error);
    }
  }

  /**
   * Fetches sleep data for a specified date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise<SleepData[]> Array of sleep data records
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<SleepData[]> {
    if (!this.isAuthorized) {
      throw new Error('Not authorized to access sleep data');
    }

    try {
      const data = await window.SamsungHealthBridge.getSleepData(
        startDate.getTime(),
        endDate.getTime()
      );

      return this.mapSleepData(data);
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      return [];
    }
  }

  /**
   * Fetches heart rate data for a specified date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise<HeartRateData[]> Array of heart rate records
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HeartRateData[]> {
    if (!this.isAuthorized) {
      throw new Error('Not authorized to access heart rate data');
    }

    try {
      const data = await window.SamsungHealthBridge.getHeartRateData(
        startDate.getTime(),
        endDate.getTime()
      );

      const mappedData = data.map((item: any) => ({
        timestamp: item.startDate,
        value: item.value,
        confidence: item.confidence || 0.95,
        source: 'Samsung Health',
      }));

      console.log('Mapped heart rate data:', mappedData);
      return mappedData;
    } catch (error) {
      console.error('Failed to fetch heart rate data:', error);
      return [];
    }
  }

  /**
   * Fetches motion data for a specified date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise<MotionData[]> Array of motion records
   */
  async getMotionData(startDate: Date, endDate: Date): Promise<MotionData[]> {
    if (!this.isAuthorized) {
      throw new Error('Not authorized to access motion data');
    }

    try {
      const data = await window.SamsungHealthBridge.getMotionData(
        startDate.getTime(),
        endDate.getTime()
      );

      const mappedData = data.map((item: any) => ({
        timestamp: item.startDate,
        steps: item.steps,
        distance: item.distance,
        source: 'Samsung Health',
        x: item.acceleration?.x || 0,
        y: item.acceleration?.y || 0,
        z: item.acceleration?.z || 0,
        magnitude: Math.sqrt(
          Math.pow(item.acceleration?.x || 0, 2) +
          Math.pow(item.acceleration?.y || 0, 2) +
          Math.pow(item.acceleration?.z || 0, 2)
        ),
      }));

      console.log('Mapped motion data:', mappedData);
      return mappedData;
    } catch (error) {
      console.error('Failed to fetch motion data:', error);
      return [];
    }
  }

  /**
   * Maps raw sleep data from Samsung Health to our standardized format
   * @param data Raw sleep data from Samsung Health
   * @returns SleepData[] Array of processed sleep records
   */
  private mapSleepData(data: any): SleepData[] {
    const mappedData = data.map((item: any) => ({
      date: new Date(item.startDate),
      startTime: item.startDate,
      duration: new Date(item.endDate).getTime() - new Date(item.startDate).getTime(),
      quality: this.calculateSleepQuality(item),
      phases: item.phases.map((phase: any) => ({
        type: this.mapPhaseType(phase.type),
        startTime: new Date(phase.startTime),
        duration: phase.duration,
      })),
      heartRate: item.heartRate || [],
      movement: item.movement || [],
    }));

    console.log('Mapped sleep data:', mappedData);
    return mappedData;
  }

  /**
   * Maps Samsung Health sleep phase types to our standardized types
   * @param type String phase type from Samsung Health
   * @returns Standardized sleep phase type
   */
  private mapPhaseType(type: string): SleepPhase['type'] {
    switch (type.toLowerCase()) {
      case 'deep':
        return 'Deep';
      case 'rem':
        return 'REM';
      case 'light':
      case 'awake':
        return 'Light';
      default:
        return 'Light';
    }
  }

  /**
   * Calculates sleep quality score based on phase distribution
   * @param sleepData Raw sleep data from Samsung Health
   * @returns number Quality score (0-100)
   */
  private calculateSleepQuality(sleepData: any): number {
    const phases = sleepData.phases || {};
    const totalDuration = new Date(sleepData.endDate).getTime() - new Date(sleepData.startDate).getTime();
    
    if (totalDuration === 0) return 0;

    const deepSleepRatio = (phases.deep || 0) / totalDuration;
    const remSleepRatio = (phases.rem || 0) / totalDuration;
    const lightSleepRatio = (phases.light || 0) / totalDuration;
    const awakeRatio = (phases.awake || 0) / totalDuration;

    const quality = (
      deepSleepRatio * 0.4 +  // Deep sleep is most important
      remSleepRatio * 0.3 +   // REM sleep is second most important
      lightSleepRatio * 0.2 + // Light sleep is less important
      (1 - awakeRatio) * 0.1  // Less awake time is better
    ) * 100;

    return Math.round(quality);
  }
} 