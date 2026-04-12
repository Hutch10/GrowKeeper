export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown> | Error | string | number;
  userId?: string;
  version: string;
}

export interface LogPouchDoc extends LogEntry {
  _id: string;
  _rev?: string;
}
