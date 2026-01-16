
import { GoogleGenAI } from "@google/genai";
import { SimulationMode } from "../types";

const SYSTEM_INSTRUCTION = `
You are a senior physicist and expert in "Relational Quantum Network Theory" (R-QNT). 
Your task is to help the user, Edward Pérez López, and his colleagues understand the mechanics of the A-B-C Triada.
Focus on:
1. Cartan Torsion as the basis of gravity.
2. Borromean stability in topological knots.
3. Variable 'c' (light speed) as string tension in Via B.
4. Matter as the 'consumption' of network length.

Use a professional, visionary, yet rigorous tone. Use LaTeX for equations where possible.
Always reference the "Via B" mechanics when explaining anomalies in Einstein's "Via A".
`;

const RESEARCHER_INSTRUCTION = `
You are the R-QNT Autonomous Researcher Agent. 
You analyze simulation data from the A-B-C network.
When given metrics (Coherence, Torsion, Mode), you must provide a "Scientific Verdict" on the stability of the topological knots.
Identify if the configuration is a "Borromean Triple Link" and if it constitutes stable matter or mere laminar flow.
Format your response as a formal laboratory report conclusion.
`;

// Global loading state tracking
let activeRequests = 0;
const loadingListeners: Set<(loading: boolean) => void> = new Set();

const notifyLoading = () => {
  const isLoading = activeRequests > 0;
  loadingListeners.forEach(l => l(isLoading));
};

export const onGlobalLoadingChange = (callback: (loading: boolean) => void) => {
  loadingListeners.add(callback);
  callback(activeRequests > 0);
  return () => loadingListeners.delete(callback);
};

/**
 * Helper to handle retries with exponential backoff for 429 errors
 */
async function callWithRetry(fn: (isFallback?: boolean) => Promise<any>, maxRetries = 3): Promise<any> {
  activeRequests++;
  notifyLoading();
  
  try {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn(i > 0);
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || JSON.stringify(error);
        
        // Detection for Rate Limiting
        const isQuotaError = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
        
        // Detection for the specific Proxy 500 / Code 6 error
        const isRpcError = errorMessage.includes("ProxyUnaryCall") || errorMessage.includes("code: 6") || errorMessage.includes("500");

        if (isQuotaError && i < maxRetries - 1) {
          const delay = Math.pow(2, i + 2) * 1000 + Math.random() * 1000;
          console.warn(`Quota exceeded. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (isRpcError) {
           console.error("Critical RPC/Proxy error detected. This often requires a private API Key.");
           throw new Error("RPC_FAILURE_NEED_KEY");
        }
        
        throw error;
      }
    }
    throw lastError;
  } finally {
    activeRequests--;
    notifyLoading();
  }
}

/**
 * General Q&A Assistant
 */
export async function askGemini(prompt: string) {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  }).catch(error => {
    console.error("Gemini API Error:", error);
    if (error.message === "RPC_FAILURE_NEED_KEY") {
      return "CRITICAL: The R-QNT network connection failed (RPC 500). This usually means the shared quota is exhausted or the model requires a paid project key. Please click 'API Connection' in the header to select your own API Key.";
    }
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      return "CRITICAL: Quota exhausted (429). The A-B-C network is saturated. Please use your own API key via the 'API Connection' button.";
    }
    return "The R-QNT network is currently experiencing high torsion. Error communicating with the Oracle.";
  });
}

/**
 * Complex Validation - Tries Pro first, falls back to Flash
 */
export async function validateSimulation(metrics: { coherence: number, mode: SimulationMode }) {
  const promptText = `Simulation Mode: ${metrics.mode}. Measured Coherence Index: ${metrics.coherence}%. 
  Analyze this data and provide a verdict on the stability of the Cartan Torsion field and the formation of Borromean knots.`;

  return callWithRetry(async (isFallback) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelToUse = isFallback ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
    
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        systemInstruction: RESEARCHER_INSTRUCTION,
        thinkingConfig: { thinkingBudget: isFallback ? 0 : 4000 }
      },
    });
    return response.text;
  }).catch(error => {
    console.error("Validation Error:", error);
    if (error.message === "RPC_FAILURE_NEED_KEY") {
        return "VERDICT SUSPENDED: Connection Error (RPC 500). Accessing Gemini 3 Pro typically requires a private API Key. Switch to 'API Connection' to resolve.";
    }
    return "Unable to provide an automated verdict. Please check manual torsion readings.";
  });
}
