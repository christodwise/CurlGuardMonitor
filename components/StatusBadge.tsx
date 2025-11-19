import React from 'react';
import { MonitorStatus } from '../types';
import { CheckCircle2, XCircle, AlertCircle, PauseCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: MonitorStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case MonitorStatus.UP:
      return (
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>UP</span>
        </div>
      );
    case MonitorStatus.DOWN:
      return (
        <div className="flex items-center space-x-1.5 bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/20 text-xs font-medium">
          <XCircle className="w-3.5 h-3.5" />
          <span>DOWN</span>
        </div>
      );
    case MonitorStatus.PAUSED:
      return (
        <div className="flex items-center space-x-1.5 bg-zinc-500/10 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-500/20 text-xs font-medium">
          <PauseCircle className="w-3.5 h-3.5" />
          <span>PAUSED</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>PENDING</span>
        </div>
      );
  }
};