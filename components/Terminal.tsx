import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
  title?: string;
  isExecuting?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ logs, title = "Agent Terminal", isExecuting = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-300 overflow-hidden shadow-md font-mono text-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
          <span className="ml-2 text-slate-400 text-xs font-semibold">{title}</span>
        </div>
        {isExecuting && (
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-500">LIVE</span>
          </div>
        )}
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 text-slate-300"
      >
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Waiting for input stream...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="break-all whitespace-pre-wrap">
            <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
            {log.startsWith('>') ? (
              <span className="text-emerald-400 font-bold">{log}</span>
            ) : log.includes('ERROR') ? (
              <span className="text-red-400">{log}</span>
            ) : log.includes('WARNING') ? (
              <span className="text-amber-400">{log}</span>
            ) : (
              <span>{log}</span>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className="animate-pulse text-emerald-500">_</div>
        )}
      </div>
    </div>
  );
};

export default Terminal;