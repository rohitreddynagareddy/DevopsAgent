import { GoogleGenAI, Type } from "@google/genai";
import { AgentTool, PlanStep, StepStatus } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Principal AI DevOps Architect Agent. 
Your goal is to parse natural language requests into a structured execution plan for a DevOps automation framework.

The framework has the following capabilities (Tools):
1. AZURE_CLI: Use for speed/reliability when APIs exist (e.g., rotating keys, listing resources).
2. BROWSER: Use 'browser-use' agent for legacy UIs (MuleSoft Anypoint Platform, Azure Portal complex flows).
3. EMAIL: Use for notifications.
4. MULESOFT_API: Use for direct API calls if simple.

SAFETY RULES:
- If a task implies modification or deletion (Rotate, Delete, Restart, Update), you MUST mark 'requiresApproval' as true.
- Prefer AZURE_CLI over BROWSER for Azure tasks unless it involves screenshots or visual verification.
- Always assume the user is authenticated.

Output a JSON object containing a 'steps' array.
`;

export const generateAgentPlan = async (userPrompt: string): Promise<PlanStep[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tool: {
                    type: Type.STRING,
                    enum: [
                      AgentTool.AZURE_CLI,
                      AgentTool.BROWSER,
                      AgentTool.EMAIL,
                      AgentTool.MULESOFT_API
                    ]
                  },
                  description: { type: Type.STRING },
                  command: { type: Type.STRING, description: "The specific CLI command or Browser goal" },
                  targetUrl: { type: Type.STRING, description: "URL for browser steps" },
                  requiresApproval: { type: Type.BOOLEAN }
                },
                required: ["tool", "description", "requiresApproval"]
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"steps": []}');
    
    // Enrich with client-side IDs and initial status
    return data.steps.map((step: any, index: number) => ({
      ...step,
      id: `step-${Date.now()}-${index}`,
      status: StepStatus.PENDING,
      logs: []
    }));

  } catch (error) {
    console.error("Gemini Planning Error:", error);
    // Fallback plan for demonstration if API fails or limit reached
    return [
      {
        id: 'fallback-1',
        tool: AgentTool.AZURE_CLI,
        description: "Analyze request (Fallback Mode)",
        command: "az account show",
        requiresApproval: false,
        status: StepStatus.PENDING,
        logs: []
      }
    ];
  }
};
