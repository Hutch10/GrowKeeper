'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { payoutService, TelemetryMetrics, SafetyMode } from '@/lib/services/payout-service';
import { Activity, ShieldAlert, Zap, Globe, Lock, Info } from 'lucide-react';

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<(TelemetryMetrics & { currentMode: SafetyMode, velocity: number }) | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(payoutService.getMetrics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const contentionRate = ((metrics.contentionFailures / (metrics.totalAttempts || 1)) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 font-mono">
      {/* REAL-TIME STATUS BAR */}
      <Card className="md:col-span-4 bg-emerald-950/20 border-emerald-500/20">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="text-emerald-500 animate-pulse" />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">SOVEREIGN_MONITOR_V1</h2>
          </div>
          <Badge variant={metrics.currentMode === SafetyMode.FULL_SOVEREIGN ? 'default' : 'outline'} className="h-8 px-6 text-sm">
            MODE: {metrics.currentMode}
          </Badge>
        </CardContent>
      </Card>

      {/* ECONOMIC VELOCITY */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Zap size={14} className="text-emerald-500" /> VELOCITY (H)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">${metrics.velocity.toLocaleString()}</div>
          <div className={`text-[10px] mt-1 ${metrics.acceleration >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            ACCEL: {metrics.acceleration > 0 ? '+' : ''}{metrics.acceleration.toFixed(2)}/s
          </div>
        </CardContent>
      </Card>

      {/* CONTENTION INTEGRITY */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Globe size={14} className="text-emerald-500" /> LATCH_CONTENTION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">{contentionRate}%</div>
          <div className="text-[10px] mt-1 text-emerald-500/50">FAILURES: {metrics.contentionFailures}</div>
        </CardContent>
      </Card>

      {/* LATENCY DELTA */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Lock size={14} className="text-emerald-500" /> p99_LATENCY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">{metrics.p99Latency.toFixed(0)}ms</div>
          <div className="text-[10px] mt-1 text-emerald-500/50">MAX: {metrics.maxLatency}ms</div>
        </CardContent>
      </Card>

      {/* DENSITY ALERT */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <ShieldAlert size={14} className="text-emerald-500" /> CELL_DENSITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">{metrics.incidentDensity.size}</div>
          <div className="text-[10px] mt-1 text-emerald-500/50">ACTIVE_CELLS_W15</div>
        </CardContent>
      </Card>

      {/* DECISION TRACE LOG */}
      <Card className="md:col-span-4 bg-black/40 border-emerald-900/10">
        <CardHeader>
          <CardTitle className="text-xs flex items-center gap-2">
            <Info size={14} className="text-emerald-500" /> LIVE_DECISION_TRACE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 h-[300px] overflow-y-auto">
            {metrics.decisionLog.map((log: { id: string, rule: string, status: string }, i: number) => (
              <div key={i} className="flex items-center justify-between text-[10px] border-b border-emerald-900/10 pb-2">
                <span className="text-emerald-500/50">ID: {log.id}</span>
                <span className="font-bold text-white uppercase">{log.rule}</span>
                <Badge variant={log.status === 'REJECTED' ? 'outline' : 'default'} className="scale-75 origin-right">
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
