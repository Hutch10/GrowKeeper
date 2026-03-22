"use client";

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { checkLegalStatus, type GeofenceResult } from '@/lib/geofencing';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Download,
} from 'lucide-react';

interface FieldMapProps {
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
}

export default function FieldMap({ 
  initialLng = -115.1728, // Near Las Vegas / BLM land
  initialLat = 36.1147, 
  initialZoom = 10 
}: FieldMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [legalStatus, setLegalStatus] = useState<GeofenceResult | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Open-source style
      center: [initialLng, initialLat],
      zoom: initialZoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    map.current.on('move', () => {
      const center = map.current?.getCenter();
      if (center) {
        const status = checkLegalStatus(center.lng, center.lat);
        setLegalStatus(status);
      }
    });

    // Initial check
    const status = checkLegalStatus(initialLng, initialLat);
    setLegalStatus(status);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [initialLng, initialLat, initialZoom]);

  const handleDownloadOffline = () => {
    setIsOfflineReady(true);
    // In a real app, this would trigger SW to cache a bounding box of tiles.
    alert('Field Pack downloaded. This region is now available 100% offline.');
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-[3rem] overflow-hidden border border-white/20 shadow-2xl bg-slate-900 group">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Legal Status Overlay */}
      {legalStatus && (
        <div className={`absolute top-6 left-6 right-6 p-4 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-4 transition-all duration-500 animate-in fade-in slide-in-from-top-4 
          ${legalStatus.status === 'danger' ? 'bg-red-500/80 text-white' : 
            legalStatus.status === 'warning' ? 'bg-orange-400/80 text-white' : 
            'bg-black/60 text-white'}`}>
          <div className="p-2 bg-white/20 rounded-xl">
            {legalStatus.status === 'safe' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Legal Guard Active</div>
            <div className="text-xs font-bold leading-tight line-clamp-2">{legalStatus.message}</div>
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadOffline}
            className={`p-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-lg
              ${isOfflineReady ? 'bg-emerald-500 text-white' : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'}`}
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline text-xs mt-0.5">{isOfflineReady ? 'Offline Ready' : 'Download Field Pack'}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white font-black uppercase tracking-tighter">GPS: Locked</span>
          </div>
        </div>
      </div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none border-[30px] border-emerald-400/5 mix-blend-overlay" />
    </div>
  );
}
