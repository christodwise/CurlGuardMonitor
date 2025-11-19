export enum MonitorStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN',
  PAUSED = 'PAUSED',
}

export interface HistoryPoint {
  timestamp: number;
  latency: number;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
  latency: number;
  lastChecked: number | null;
  history: HistoryPoint[];
  method: 'GET' | 'HEAD';
  interval: number; // in seconds
}

export interface LogEntry {
  id: string;
  timestamp: number;
  monitorName: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'info';
}