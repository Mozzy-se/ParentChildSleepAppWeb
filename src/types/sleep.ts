export interface SleepPhase {
  type: 'Deep' | 'REM' | 'Light';
  startTime: Date;
  duration: number; // in minutes
}

export interface SleepData {
  date: Date;
  duration: number; // in minutes
  quality: number; // percentage
  timeInBed?: number; // minutes, total time in bed
  awakenings?: number;   // ✅ times woken up during the night
  phases: SleepPhase[];
  heartRate: number[];
  movement: number[];
} 