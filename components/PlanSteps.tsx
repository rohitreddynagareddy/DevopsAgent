import React from 'react';
import { PlanStep, StepStatus, AgentTool } from '../types';
import { CheckCircle2, Circle, Clock, Terminal as TerminalIcon, Globe, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PlanStepsProps {
  steps: PlanStep[];
  currentStepIndex: number;
}

const PlanSteps: React.FC<PlanStepsProps> = ({ steps, currentStepIndex }) => {
  const getIcon = (tool: AgentTool) => {
    switch (tool) {
      case AgentTool.AZURE_CLI: return <TerminalIcon className="w-4 h-4" />;
      case AgentTool.BROWSER: return <Globe className="w-4 h-4" />;
      case AgentTool.EMAIL: return <Mail className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case StepStatus.COMPLETED: return 'text-emerald-600 border-emerald-200 bg-emerald-50';
      case StepStatus.RUNNING: return 'text-sky-600 border-sky-200 bg-sky-50';
      case StepStatus.WAITING_APPROVAL: return 'text-amber-600 border-amber-200 bg-amber-50';
      case StepStatus.FAILED: return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-slate-500 border-slate-200 bg-white';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Execution Plan</h3>
      {steps.map((step, idx) => {
        const isActive = idx === currentStepIndex;
        const isPast = idx < currentStepIndex;
        
        return (
          <div 
            key={step.id}
            className={`relative flex items-center p-3 rounded-lg border transition-all duration-300 ${getStatusColor(step.status)} ${isActive ? 'ring-2 ring-sky-100 shadow-md scale-[1.02]' : 'shadow-sm'}`}
          >
            {/* Status Icon */}
            <div className="mr-3">
              {step.status === StepStatus.COMPLETED ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : step.status === StepStatus.WAITING_APPROVAL ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : isActive ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Circle className="w-5 h-5 opacity-30" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${isActive ? 'bg-white/50 border-current/20' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                  {getIcon(step.tool)}
                  {step.tool}
                </span>
                {step.requiresApproval && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                    APPROVAL REQ
                  </span>
                )}
              </div>
              <p className="text-sm font-medium truncate">{step.description}</p>
              {step.command && isActive && (
                <p className="text-xs font-mono opacity-80 mt-1 truncate bg-black/5 p-1 rounded">{step.command}</p>
              )}
            </div>
            
            {/* Connector Line */}
            {idx < steps.length - 1 && (
               <div className={`absolute left-[21px] top-10 bottom-[-14px] w-px ${isPast ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlanSteps;