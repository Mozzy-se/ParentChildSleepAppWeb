/**
 * CloudSyncService handles synchronization of health and sleep data with a remote server.
 * It provides methods for sending and retrieving data, with proper error handling and
 * type safety through TypeScript interfaces.
 */

import { SleepData } from '../types/sleep';
import { HeartRateData } from '../types/heartRate';
import { MotionData } from '../types/motion';

/**
 * Interface defining the structure of API responses
 */
interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * CloudSyncService class manages all cloud synchronization operations
 */
export class CloudSyncService {
  private apiUrl: string;
  private apiKey: string;

  /**
   * Creates a new instance of CloudSyncService
   * @param apiUrl Base URL of the API server
   * @param apiKey Authentication key for API requests
   */
  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Generic method for making HTTP requests to the API
   * @param endpoint API endpoint path
   * @param method HTTP method (GET, POST, PUT, DELETE)
   * @param data Optional request body data
   * @returns Promise<T> Response data of type T
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloud sync error:', error);
      throw error;
    }
  }

  /**
   * Synchronizes sleep data with the cloud server
   * @param sleepData Array of sleep records to sync
   * @returns Promise<SyncResponse> Response indicating sync status
   */
  async syncSleepData(sleepData: SleepData[]): Promise<SyncResponse> {
    try {
      const response = await this.makeRequest<SyncResponse>(
        '/sleep',
        'POST',
        { sleepData }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync sleep data',
      };
    }
  }

  /**
   * Synchronizes heart rate data with the cloud server
   * @param heartRateData Array of heart rate records to sync
   * @returns Promise<SyncResponse> Response indicating sync status
   */
  async syncHeartRateData(heartRateData: HeartRateData[]): Promise<SyncResponse> {
    try {
      const response = await this.makeRequest<SyncResponse>(
        '/heart-rate',
        'POST',
        { heartRateData }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync heart rate data',
      };
    }
  }

  /**
   * Synchronizes motion data with the cloud server
   * @param motionData Array of motion records to sync
   * @returns Promise<SyncResponse> Response indicating sync status
   */
  async syncMotionData(motionData: MotionData[]): Promise<SyncResponse> {
    try {
      const response = await this.makeRequest<SyncResponse>(
        '/motion',
        'POST',
        { motionData }
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync motion data',
      };
    }
  }

  /**
   * Retrieves sleep data from the cloud server for a specific date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise<SleepData[]> Array of sleep records
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<SleepData[]> {
    try {
      const response = await this.makeRequest<{ data: SleepData[] }>(
        `/sleep?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        'GET'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sleep data:', error);
      return [];
    }
  }

  /**
   * Retrieves heart rate data from the cloud server for a specific date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise<HeartRateData[]> Array of heart rate records
   */
  async getHeartRateData(startDate: Date, endDate: Date): Promise<HeartRateData[]> {
    try {
      const response = await this.makeRequest<{ data: HeartRateData[] }>(
        `/heart-rate?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        'GET'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch heart rate data:', error);
      return [];
    }
  }

  /**
   * Retrieves motion data from the cloud server for a specific date range
   * @param startDate Start of the date range
   * @param endDate End of the date range
   * @returns Promise<MotionData[]> Array of motion records
   */
  async getMotionData(startDate: Date, endDate: Date): Promise<MotionData[]> {
    try {
      const response = await this.makeRequest<{ data: MotionData[] }>(
        `/motion?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        'GET'
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch motion data:', error);
      return [];
    }
  }
} 