export interface SleepPhase {
  type: 'Deep' | 'REM' | 'Light';
  startTime: Date;
  duration: number; // in minutes
}

export interface SleepData {
  date: Date;
  duration: number; // in minutes
  quality: number; // percentage
  phases: SleepPhase[];
  heartRate: number[];
  movement: number[];
} 