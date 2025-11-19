import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface TerminalLogProps {
  logs: LogEntry[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[300px]">
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2 flex items-center space-x-2">
        <Terminal className="w-4 h-4 text-zinc-400" />
        <span className="text-xs font-mono text-zinc-400">System Output</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2"
      >
        {logs.length === 0 && (
          <div className="text-zinc-600 italic">Waiting for checks...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2 text-zinc-500">
              <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-blue-400">$ {log.command}</span>
            </div>
            <div className={`${
              log.status === 'error' ? 'text-red-400' : 
              log.status === 'success' ? 'text-emerald-400' : 'text-zinc-300'
            } pl-4 whitespace-pre-wrap`}>
              {log.output}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};