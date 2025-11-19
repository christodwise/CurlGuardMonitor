import React, { useState } from 'react';
import { Monitor, MonitorStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Activity, Globe, Clock, Trash2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { generateIncidentReport } from '../services/geminiService';

interface MonitorCardProps {
  monitor: Monitor;
  onDelete: (id: string) => void;
  onRefresh: (id: string) => void;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({ monitor, onDelete, onRefresh }) => {
  const [generatingReport, setGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleGenerateReport = async () => {
    if (monitor.status !== MonitorStatus.DOWN) return;
    setGeneratingReport(true);
    setReport(null);
    setShowReport(true);
    
    // Simulate getting the last error from a "store" or just pass generic context
    const result = await generateIncidentReport(
      monitor.name, 
      monitor.url, 
      "Connection timed out after 5000ms. Host unreachable."
    );
    
    setReport(result);
    setGeneratingReport(false);
  };

  // Format chart data
  const chartData = monitor.history.map(h => ({
    latency: h.latency,
    time: h.timestamp
  }));

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex flex-col space-y-4 hover:border-zinc-700 transition-colors group">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${monitor.status === MonitorStatus.UP ? 'bg-emerald-500/10 text-emerald-500' : monitor.status === MonitorStatus.DOWN ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">{monitor.name}</h3>
            <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-[150px] block">
              {monitor.url}
            </a>
          </div>
        </div>
        <StatusBadge status={monitor.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
          <div className="flex items-center space-x-2 text-zinc-500 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider font-medium">Latency</span>
          </div>
          <div className="text-lg font-mono font-semibold text-zinc-200">
            {monitor.latency > 0 ? `${monitor.latency}ms` : '--'}
          </div>
        </div>
        <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
          <div className="flex items-center space-x-2 text-zinc-500 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider font-medium">Uptime (24h)</span>
          </div>
          <div className="text-lg font-mono font-semibold text-zinc-200">
            {monitor.status === MonitorStatus.DOWN ? '98.2%' : '100%'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`colorLatency-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={monitor.status === MonitorStatus.DOWN ? "#ef4444" : "#10b981"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={monitor.status === MonitorStatus.DOWN ? "#ef4444" : "#10b981"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 'auto']} />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke={monitor.status === MonitorStatus.DOWN ? "#ef4444" : "#10b981"} 
              fillOpacity={1} 
              fill={`url(#colorLatency-${monitor.id})`} 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
        <div className="flex items-center space-x-2">
           {monitor.status === MonitorStatus.DOWN && (
             <button 
              onClick={handleGenerateReport}
              className="text-xs flex items-center space-x-1 text-amber-500 hover:text-amber-400 transition-colors"
             >
               <FileText className="w-3.5 h-3.5" />
               <span>AI Report</span>
             </button>
           )}
        </div>
        <div className="flex items-center space-x-2">
           <button 
            onClick={() => onRefresh(monitor.id)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
            title="Check Now"
           >
             <RefreshCw className="w-4 h-4" />
           </button>
           <button 
            onClick={() => onDelete(monitor.id)}
            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
            title="Delete Monitor"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* AI Report Modal Overlay (Simple inline implementation for brevity) */}
      {showReport && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full h-full overflow-y-auto p-4 shadow-2xl relative">
            <button 
              onClick={() => setShowReport(false)}
              className="absolute top-2 right-2 text-zinc-400 hover:text-white"
            >
              <Trash2 className="w-4 h-4 rotate-45" /> {/* Using trash icon rotated as close for visual simplicity or use X */}
            </button>
            <h4 className="text-emerald-400 font-mono font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Incident Report
            </h4>
            {generatingReport ? (
              <div className="flex items-center justify-center h-32 space-x-2 text-zinc-400 animate-pulse">
                <Activity className="w-5 h-5 animate-spin" />
                <span>Analysing with Gemini...</span>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none">
                 {/* Simple markdown rendering by splitting lines */}
                 {report?.split('\n').map((line, i) => (
                   <p key={i} className={`mb-1 ${line.startsWith('#') ? 'font-bold text-zinc-200' : 'text-zinc-400'}`}>
                     {line.replace(/^#+\s/, '')}
                   </p>
                 ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};