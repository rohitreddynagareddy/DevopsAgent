import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Play, StopCircle, Terminal as TerminalIcon, LayoutDashboard, Settings, Activity } from 'lucide-react';
import Terminal from './components/Terminal';
import BrowserView from './components/BrowserView';
import PlanSteps from './components/PlanSteps';
import { generateAgentPlan } from './services/geminiService';
import { AgentState, AgentTool, ChatMessage, PlanStep, StepStatus } from './types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: "OpsAgent Online. Connected to Azure (Sub: Prod-01) and MuleSoft Anypoint. Ready for instructions.",
  timestamp: new Date()
};

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [agentState, setAgentState] = useState<AgentState>({
    isThinking: false,
    isExecuting: false,
    plan: [],
    currentStepIndex: -1
  });
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['> System initialized.', '> Waiting for user command...']);
  
  // Refs for auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Handlers
  const handleSendMessage = async () => {
    if (!input.trim() || agentState.isThinking || agentState.isExecuting) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAgentState(prev => ({ ...prev, isThinking: true }));
    addLog(`> Received input: "${userMsg.content}"`);

    // Call Gemini to get plan
    const plan = await generateAgentPlan(userMsg.content);
    
    setAgentState({
      isThinking: false,
      isExecuting: true,
      plan: plan,
      currentStepIndex: 0
    });
    
    addLog(`> Plan generated: ${plan.length} steps identified.`);
    
    // Trigger execution loop
    executePlan(plan);
  };

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-99), msg]);
  };

  // Execution Simulation Loop
  const executePlan = async (plan: PlanStep[]) => {
    // This function is kept for structural reference but the effect hook below drives execution
    // to allow for better state management in React.
  };

  // Re-write execution engine using useEffect to handle pauses/approvals correctly
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const runStep = async () => {
        const { isExecuting, currentStepIndex, plan } = agentState;
        if (!isExecuting || currentStepIndex === -1 || currentStepIndex >= plan.length) return;

        const step = plan[currentStepIndex];

        // Check if we are already waiting or finished
        if (step.status === StepStatus.WAITING_APPROVAL || step.status === StepStatus.COMPLETED) return;
        
        // If pending, mark running
        if (step.status === StepStatus.PENDING) {
             setAgentState(prev => ({
                ...prev,
                plan: prev.plan.map((s, idx) => idx === currentStepIndex ? { ...s, status: StepStatus.RUNNING } : s)
            }));
            
            // Allow state to update before processing logic
            return;
        }

        // Logic when RUNNING
        if (step.status === StepStatus.RUNNING) {
             // Check Approval Needed first
             if (step.requiresApproval) {
                 setAgentState(prev => ({
                    ...prev,
                    plan: prev.plan.map((s, idx) => idx === currentStepIndex ? { ...s, status: StepStatus.WAITING_APPROVAL } : s)
                }));
                addLog(`> ⚠️ PAUSED: Step requires approval.`);
                return;
             }

             // Simulate work
             timeoutId = setTimeout(() => {
                 // Finish step
                 const logs = [`Finished ${step.tool} action.`];
                 if(step.tool === AgentTool.BROWSER) logs.push(`> Screenshot captured.`);
                 
                 logs.forEach(l => addLog(l));

                 setAgentState(prev => {
                     const nextIndex = prev.currentStepIndex + 1;
                     const isFinished = nextIndex >= prev.plan.length;
                     
                     if (isFinished) {
                         setMessages(m => [...m, { id: 'done', role: 'assistant', content: '✅ All tasks completed.', timestamp: new Date() }]);
                         addLog('> WORKFLOW COMPLETE');
                     }

                     return {
                         ...prev,
                         plan: prev.plan.map((s, idx) => idx === currentStepIndex ? { ...s, status: StepStatus.COMPLETED } : s),
                         currentStepIndex: isFinished ? -1 : nextIndex,
                         isExecuting: !isFinished
                     };
                 });
             }, 3500); // 3.5s per step
        }
    };

    runStep();

    return () => clearTimeout(timeoutId);
  }, [agentState]);

  const handleApprove = () => {
      const { currentStepIndex } = agentState;
      if (currentStepIndex === -1) return;
      
      addLog(`> ✅ USER APPROVED STEP ${currentStepIndex + 1}`);
      setAgentState(prev => ({
          ...prev,
          plan: prev.plan.map((s, idx) => idx === currentStepIndex ? { ...s, status: StepStatus.RUNNING, requiresApproval: false } : s)
      }));
  };

  const handleReject = () => {
      addLog(`> ❌ USER REJECTED STEP. ABORTING.`);
      setAgentState(prev => ({
          ...prev,
          isExecuting: false,
          currentStepIndex: -1,
          plan: prev.plan.map((s, idx) => idx === prev.currentStepIndex ? { ...s, status: StepStatus.FAILED } : s)
      }));
  };


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeStep = agentState.currentStepIndex >= 0 ? agentState.plan[agentState.currentStepIndex] : null;
  const isWaitingApproval = activeStep?.status === StepStatus.WAITING_APPROVAL;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar / Status */}
      <div className="w-16 md:w-20 border-r border-slate-200 bg-white flex flex-col items-center py-6 space-y-8 z-20 shadow-sm">
        <div className="p-2 bg-sky-600 rounded-lg shadow-lg shadow-sky-500/30">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col space-y-6 w-full items-center">
            <button className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"><LayoutDashboard className="w-5 h-5"/></button>
            <button className="p-3 rounded-xl bg-sky-50 text-sky-600 shadow-inner ring-1 ring-sky-100"><TerminalIcon className="w-5 h-5"/></button>
            <button className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"><Activity className="w-5 h-5"/></button>
            <button className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-sky-600 transition-colors"><Settings className="w-5 h-5"/></button>
        </div>
        <div className="mt-auto">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Chat & Plan */}
        <div className="w-1/3 min-w-[350px] flex flex-col border-r border-slate-200 bg-white">
          {/* Chat Header */}
          <div className="h-16 border-b border-slate-200 flex items-center px-6 bg-white">
            <h1 className="font-bold text-slate-800 tracking-tight flex items-center">
              OpsAgent 
              <span className="text-sky-600 text-xs font-bold uppercase ml-2 bg-sky-50 px-2 py-1 rounded border border-sky-100">V1.4.0</span>
            </h1>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-sky-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {agentState.isThinking && (
              <div className="flex justify-start">
                 <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 rounded-bl-none flex space-x-1 items-center shadow-sm">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Plan Visualization Area (If active) */}
          {agentState.plan.length > 0 && (
             <div className="border-t border-slate-200 bg-white p-4 max-h-[40%] overflow-y-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <PlanSteps steps={agentState.plan} currentStepIndex={agentState.currentStepIndex} />
             </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={agentState.isExecuting ? "Agent busy..." : "Describe task (e.g., 'Rotate secret for AppX')..."}
                disabled={agentState.isExecuting || agentState.isThinking}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:bg-white disabled:opacity-50 transition-all placeholder:text-slate-400"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || agentState.isExecuting}
                className="absolute right-2 top-2 p-1.5 bg-sky-600 rounded-lg hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: The "Work" Surface */}
        <div className="flex-1 bg-slate-100 p-6 flex flex-col gap-6 relative">
            
            {/* Top: Browser View (Agent Eyes) */}
            <div className="flex-1 min-h-0 relative">
               <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Browser Agent View</span>
                  {activeStep?.tool === AgentTool.BROWSER && <span className="text-red-500 animate-pulse text-[10px] border border-red-500/50 bg-red-50 px-2 rounded font-bold">● RECORDING</span>}
               </h2>
               <BrowserView 
                  isActive={activeStep?.tool === AgentTool.BROWSER && activeStep.status === StepStatus.RUNNING} 
                  url={activeStep?.targetUrl} 
                  status={activeStep?.description || "Standby"}
               />
               
               {/* APPROVAL MODAL OVERLAY */}
               {isWaitingApproval && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-amber-200 rounded-xl shadow-2xl max-w-lg w-full p-6 ring-1 ring-amber-500/10">
                       <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-50 rounded-full border border-amber-100">
                             <Activity className="w-8 h-8 text-amber-500" />
                          </div>
                          <div className="flex-1">
                             <h3 className="text-xl font-bold text-slate-900 mb-2">Human Approval Required</h3>
                             <p className="text-slate-500 text-sm mb-4">
                               The agent is about to execute a restricted action:
                             </p>
                             <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-sm text-amber-700 mb-6">
                                {activeStep?.description}
                                {activeStep?.command && <div className="mt-1 text-slate-400 text-xs">$ {activeStep.command}</div>}
                             </div>
                             <div className="flex gap-3">
                                <button 
                                  onClick={handleReject}
                                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200"
                                >
                                   <StopCircle className="w-4 h-4" /> Abort
                                </button>
                                <button 
                                  onClick={handleApprove}
                                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                   <Play className="w-4 h-4" /> Approve Execution
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Bottom: Terminal (Agent Brain/Logs) */}
            <div className="h-1/3 min-h-[200px]">
               <Terminal 
                  logs={terminalLogs} 
                  isExecuting={agentState.isExecuting}
               />
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;