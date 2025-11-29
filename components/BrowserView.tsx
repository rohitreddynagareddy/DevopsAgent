import React, { useEffect } from 'react';
import { Globe, Lock, RefreshCw } from 'lucide-react';

interface BrowserViewProps {
  url?: string;
  isActive: boolean;
  status: string;
}

const BrowserView: React.FC<BrowserViewProps> = ({ url = "about:blank", isActive, status }) => {
  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border ${isActive ? 'border-sky-500/50 ring-2 ring-sky-500/20' : 'border-slate-300'} overflow-hidden shadow-md transition-all duration-300`}>
      {/* Browser Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex space-x-1">
          <RefreshCw className={`w-4 h-4 text-slate-400 ${isActive ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 flex items-center text-xs text-slate-500 font-mono border border-slate-200 shadow-sm">
          <Lock className="w-3 h-3 mr-2 text-green-500" />
          <span className="truncate">{url}</span>
        </div>
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 relative bg-slate-100 flex flex-col items-center justify-center overflow-hidden">
        {isActive ? (
          <>
             {/* Simulated Web Content */}
            <div className="absolute inset-0 opacity-100">
                {/* We use picsum to simulate a 'screenshot' of the page being worked on */}
                <img 
                    src={`https://picsum.photos/800/600?random=${Date.now()}`} 
                    alt="Agent View" 
                    className="w-full h-full object-cover transition-all duration-700"
                />
            </div>
            
            {/* Overlay Status */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-sky-200 p-3 rounded-lg flex items-center gap-3 shadow-lg">
              <Globe className="w-5 h-5 text-sky-500 animate-pulse" />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Browser Agent Active</span>
                 <span className="text-sm text-slate-800 font-mono">{status}</span>
              </div>
            </div>
            
            {/* Mouse Cursor Simulation */}
            <div className="absolute top-1/3 left-1/2 w-4 h-4 border-2 border-red-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-white/20"></div>
          </>
        ) : (
          <div className="text-center p-8">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-400 font-medium">Browser Agent Standby</h3>
            <p className="text-slate-400 text-sm mt-2">Waiting for navigation commands...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserView;