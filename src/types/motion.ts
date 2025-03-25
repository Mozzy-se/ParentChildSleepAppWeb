/**
 * Type definitions for motion data structures used throughout the application.
 * These interfaces define the shape of motion data collected from various
 * sources and standardized for use in the application.
 */

/**
 * Represents a single motion measurement with acceleration data
 */
export interface MotionData {
  /** Timestamp when the measurement was taken */
  timestamp: number;
  /** Acceleration in the X-axis (m/s²) */
  x: number;
  /** Acceleration in the Y-axis (m/s²) */
  y: number;
  /** Acceleration in the Z-axis (m/s²) */
  z: number;
  /** Calculated magnitude of acceleration (m/s²) */
  magnitude: number;
  /** Source of the motion data (device or app name) */
  source: string;
} 