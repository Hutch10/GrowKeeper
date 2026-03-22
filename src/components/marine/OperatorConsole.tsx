import React from 'react';
import type { MarineAlert } from '@/types/marine';

const OperatorConsole: React.FC<{ pendingAlerts: MarineAlert[], onApprove: (id: string) => void }> = ({ pendingAlerts, onApprove }) => {
  return (
    <div className="bg-[#0B1F2A] border-t border-[#00C896]/30 p-4 h-[300px] overflow-hidden flex gap-4">
      {/* Gated Action Queue */}
      <div className="w-1/2 flex flex-col">
        <h3 className="text-xs font-bold text-[#FF4D6D] mb-2 tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FF4D6D] rounded-full animate-pulse" />
          Gated_Action_Queue
        </h3>
        <div className="space-y-2 overflow-y-auto pr-2">
          {pendingAlerts.map(alert => (
            <div key={alert.id} className="bg-[#1A3A4A]/40 border border-[#FF4D6D]/30 p-3 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-white mb-1">{alert.id} {"//"} {alert.region}</div>
                <div className="text-[10px] opacity-60">CRITICAL_FLEET_DISPATCH // TEE_GATED</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onApprove(alert.id)}
                  className="bg-[#00C896] text-black px-4 py-1 text-xs font-black uppercase hover:bg-white transition-colors"
                >
                  Approve
                </button>
                <button className="border border-white/20 text-white px-4 py-1 text-xs uppercase hover:bg-red-900/40">
                  Reject
                </button>
              </div>
            </div>
          ))}
          {pendingAlerts.length === 0 && (
            <div className="flex-1 border border-dashed border-[#00C896]/20 flex items-center justify-center opacity-30 text-xs">
              Waiting for critical events...
            </div>
          )}
        </div>
      </div>

      {/* Audit Feed (Mini) */}
      <div className="w-1/2 flex flex-col border-l border-white/10 pl-4">
        <h3 className="text-xs font-bold text-[#00C896] mb-2 tracking-widest uppercase">System_Audit_Feed</h3>
        <div className="space-y-1 overflow-y-auto pr-2 text-[10px] font-light">
           <div className="text-[#00C896]/60">[12:50:04] STRESS_DETECTED // WTMP: 29.4C // CONF: 0.94</div>
           <div className="text-[#FF4D6D]/60">[12:50:04] ACTION_GATED // NODE_41002 // REASON: CRITICAL</div>
           <div className="text-white/60">[12:49:50] HEARTBEAT_SYNC // 14 NODES // SUCCESS</div>
           <div className="text-[#00C896]/60">[12:48:33] NOAA_FETCH // STATION_41002 // 200 OK</div>
        </div>
      </div>
    </div>
  );
};

export default OperatorConsole;
