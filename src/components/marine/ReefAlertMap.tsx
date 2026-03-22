import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Droplets, Thermometer } from 'lucide-react';

interface BuoyStatus {
  id: string;
  name: string;
  temp: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export const ReefAlertMap: React.FC = () => {
  const buoys: BuoyStatus[] = [
    { id: 'NDBC-41001', name: 'Cape Hatteras East', temp: 28.5, status: 'OPTIMAL' },
    { id: 'NDBC-41002', name: 'South Hatteras', temp: 31.2, status: 'CRITICAL' },
    { id: 'NDBC-41004', name: 'Edisto Buoy', temp: 29.8, status: 'WARNING' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
      {buoys.map((buoy) => (
        <Card key={buoy.id} className="bg-slate-950 border-slate-800 hover:border-blue-500 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-400">
              {buoy.name}
            </CardTitle>
            <Badge 
              variant={buoy.status === 'CRITICAL' ? 'outline' : buoy.status === 'WARNING' ? 'outline' : 'default'}
              className={buoy.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
            >
              {buoy.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-2xl font-bold text-slate-100">{buoy.temp}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">35.2psu</span>
              </div>
            </div>
            {buoy.status !== 'OPTIMAL' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-rose-400 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Stress Threshold Exceeded</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
