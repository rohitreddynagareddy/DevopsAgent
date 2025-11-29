export enum AgentTool {
  AZURE_CLI = 'AZURE_CLI',
  BROWSER = 'BROWSER',
  EMAIL = 'EMAIL',
  MULESOFT_API = 'MULESOFT_API'
}

export enum StepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  WAITING_APPROVAL = 'WAITING_APPROVAL'
}

export interface PlanStep {
  id: string;
  tool: AgentTool;
  description: string;
  command?: string; // For CLI
  targetUrl?: string; // For Browser
  requiresApproval?: boolean;
  status: StepStatus;
  logs: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentState {
  isThinking: boolean;
  isExecuting: boolean;
  plan: PlanStep[];
  currentStepIndex: number;
}
