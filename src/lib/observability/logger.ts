/**
 * GrowKeeper Structured Logger
 * Provides valuation-grade observability for field operations and sync events.
 */

import { LogLevel, LogEntry, LogPouchDoc } from '@/types/observability';

class Logger {
  private static instance: Logger;
  private version = '1.0.0';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatEntry(level: LogLevel, context: string, message: string, data?: LogEntry['data']): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
      version: this.version
    };
  }

  log(level: LogLevel, context: string, message: string, data?: LogEntry['data']) {
    const entry = this.formatEntry(level, context, message, data);
    
    // In dev, log to console with colors
    if (process.env.NODE_ENV === 'development') {
      const color = this.getColor(level);
      console.log(`%c[${entry.timestamp}] [${level.toUpperCase()}] [${context}] ${message}`, color, data || '');
    }

    // Persist to local PouchDB log if critical or error
    if (level === 'error' || level === 'critical') {
      this.persistToLocal(entry);
    }

    // Future: Push to Supabase/Sentry/OTEL
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'critical': return 'color: #ff0000; font-weight: bold; background: #000;';
      case 'error': return 'color: #ff4444;';
      case 'warn': return 'color: #ffaa00;';
      case 'info': return 'color: #00aaff;';
      case 'debug': return 'color: #888888;';
      default: return 'color: #fff;';
    }
  }

  private async persistToLocal(entry: LogEntry) {
    // This will be connected to the 'growkeeper_logs' PouchDB instance
    try {
      // Lazy import/init to avoid circular refs
      // Assuming createSafeDB<T> is defined in ../pouchdb and takes a type argument
      const { logsDB } = await import('../pouchdb'); // logsDB should be typed as PouchDB.Database<LogPouchDoc>
      if (logsDB) {
        const docToPersist: LogPouchDoc = {
          _id: `log_${entry.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          ...entry
        };
        await logsDB.put(docToPersist);
      }
    } catch (err) {
      console.warn('[Logger] Persistence Failure:', err);
    }
  }

  info(context: string, message: string, data?: LogEntry['data']) { this.log('info', context, message, data); }
  warn(context: string, message: string, data?: LogEntry['data']) { this.log('warn', context, message, data); }
  error(context: string, message: string, data?: LogEntry['data']) { this.log('error', context, message, data); }
  debug(context: string, message: string, data?: LogEntry['data']) { this.log('debug', context, message, data); }
  critical(context: string, message: string, data?: LogEntry['data']) { this.log('critical', context, message, data); }
}

export const logger = Logger.getInstance();
