/**
 * Type definitions for heart rate data structures used throughout the application.
 * These interfaces define the shape of heart rate data collected from various
 * sources and standardized for use in the application.
 */

/**
 * Represents a single heart rate measurement with associated metadata
 */
export interface HeartRateData {
  /** Timestamp when the measurement was taken */
  timestamp: number;
  /** Heart rate value in beats per minute */
  value: number;
  /** Confidence level of the measurement (0-1) */
  confidence: number;
  /** Source of the heart rate data (device or app name) */
  source: string;
} 