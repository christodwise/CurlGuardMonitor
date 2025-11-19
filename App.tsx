import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, MonitorStatus, LogEntry } from './types';
import { checkUptime } from './services/monitorService';
import { MonitorCard } from './components/MonitorCard';
import { TerminalLog } from './components/TerminalLog';
import { Plus, Activity, Server, LayoutDashboard } from 'lucide-react';

const DEFAULT_MONITORS: Monitor[] = [
  {
    id: '1',
    name: 'Google Public DNS',
    url: 'https://dns.google',
    status: MonitorStatus.UNKNOWN,
    latency: 0,
    lastChecked: null,
    history: [],
    method: 'GET',
    interval: 30
  },
  {
    id: '2',
    name: 'Cloudflare',
    url: 'https://www.cloudflare.com',
    status: MonitorStatus.UNKNOWN,
    latency: 0,
    lastChecked: null,
    history: [],
    method: 'GET',
    interval: 30
  },
  {
    id: '3',
    name: 'Localhost (Demo)',
    url: 'http://localhost:3000', // Likely to fail in production builds
    status: MonitorStatus.UNKNOWN,
    latency: 0,
    lastChecked: null,
    history: [],
    method: 'GET',
    interval: 30
  }
];

const App: React.FC = () => {
  const [monitors, setMonitors] = useState<Monitor[]>(DEFAULT_MONITORS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addLog = (monitorName: string, command: string, output: string, status: LogEntry['status']) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      monitorName,
      command,
      output,
      status
    };
    setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
  };

  const checkMonitor = useCallback(async (monitorId: string) => {
    const monitor = monitors.find(m => m.id === monitorId);
    if (!monitor) return;

    // Update status to pending for UI feedback? (Optional, keeping it snappy instead)
    
    const result = await checkUptime(monitor.url);
    
    addLog(
      monitor.name,
      `curl -I ${monitor.url}`,
      result.details,
      result.status === MonitorStatus.UP ? 'success' : 'error'
    );

    setMonitors(prev => prev.map(m => {
      if (m.id !== monitorId) return m;
      
      const newHistory = [...m.history, { timestamp: Date.now(), latency: result.latency }].slice(-20); // Keep last 20 points
      
      return {
        ...m,
        status: result.status,
        latency: result.latency,
        lastChecked: Date.now(),
        history: newHistory
      };
    }));
  }, [monitors]);

  // Initial check and Interval
  useEffect(() => {
    // Run check for all unknown monitors on mount
    monitors.forEach(m => {
      if (m.status === MonitorStatus.UNKNOWN) {
        checkMonitor(m.id);
      }
    });

    const interval = setInterval(() => {
      // Simple round-robin check or check all. For this demo, check all every 10s
      monitors.forEach(m => checkMonitor(m.id));
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [monitors.length]); // Re-bind if monitors list changes, but ideally we want a better ref system. 
  // NOTE: The dependency above 'monitors.length' is a simplification. 
  // In a real app, we'd use refs or individual intervals to avoid re-triggering all checks on add.

  const handleAddMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newName) return;

    const newMonitor: Monitor = {
      id: Math.random().toString(36).substring(7),
      name: newName,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      status: MonitorStatus.UNKNOWN,
      latency: 0,
      lastChecked: null,
      history: [],
      method: 'GET',
      interval: 30
    };

    setMonitors(prev => [...prev, newMonitor]);
    setNewUrl('');
    setNewName('');
    setIsAdding(false);
    
    // Trigger immediate check
    setTimeout(() => checkMonitor(newMonitor.id), 100);
  };

  const handleDelete = (id: string) => {
    setMonitors(prev => prev.filter(m => m.id !== id));
  };

  const stats = {
    up: monitors.filter(m => m.status === MonitorStatus.UP).length,
    down: monitors.filter(m => m.status === MonitorStatus.DOWN).length,
    avgLatency: Math.round(
      monitors.reduce((acc, m) => acc + m.latency, 0) / (monitors.filter(m => m.latency > 0).length || 1)
    )
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">CurlGuard <span className="text-zinc-500 font-light">Monitor</span></h1>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              Real-time server availability monitoring dashboard. 
              Simulates <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono text-xs">curl</code> checks via browser fetch.
            </p>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
                <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Monitors</div>
                <div className="text-xl font-mono text-white">{monitors.length}</div>
             </div>
             <div className="text-right hidden md:block">
                <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Avg Latency</div>
                <div className="text-xl font-mono text-emerald-400">{stats.avgLatency}ms</div>
             </div>
             <div className="text-right hidden md:block">
                <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Status</div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm font-bold">{stats.up} UP</span>
                  <span className="text-zinc-700">/</span>
                  <span className="text-red-400 text-sm font-bold">{stats.down} DOWN</span>
                </div>
             </div>
             <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
               <Plus className="w-4 h-4" />
               Add Monitor
             </button>
          </div>
        </header>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAddMonitor} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Service Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Production API"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
                autoFocus
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-xs font-medium text-zinc-500 mb-1">Endpoint URL</label>
              <div className="relative">
                <Server className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-white font-mono"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors w-full md:w-auto">
                Start Monitoring
              </button>
            </div>
          </form>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Monitors List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <LayoutDashboard className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Active Monitors</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monitors.map(monitor => (
                <MonitorCard 
                  key={monitor.id} 
                  monitor={monitor} 
                  onDelete={handleDelete}
                  onRefresh={checkMonitor}
                />
              ))}
              {monitors.length === 0 && (
                <div className="col-span-2 py-12 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                  No monitors active. Add one to start tracking.
                </div>
              )}
            </div>
          </div>

          {/* Terminal / Logs */}
          <div className="lg:col-span-1 space-y-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Server className="w-4 h-4" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider">Execution Log</h2>
                </div>
                <span className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-zinc-500 border border-zinc-800">
                  LIVE
                </span>
             </div>
             <TerminalLog logs={logs} />
             
             <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg text-xs text-blue-400/80 leading-relaxed">
               <strong>Note on CORS:</strong> Browsers block requests to external servers that don't explicitly allow it. 
               This dashboard uses <code className="bg-blue-950/30 px-1 rounded">mode: 'no-cors'</code> to detect 
               server presence (opaque responses) even if content is blocked. 
               Status "UP" means the server connection was established.
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;