import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateIncidentReport = async (monitorName: string, url: string, errorDetails: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not found. Cannot generate report.";

  const prompt = `
    You are a Senior Site Reliability Engineer.
    The server monitor for "${monitorName}" (${url}) just detected a downtime event.
    
    Error Details (simulated curl output):
    "${errorDetails}"
    
    Please generate a concise, professional Incident Report.
    Include:
    1. Incident Summary
    2. Technical Analysis (Hypothetical based on the error)
    3. Recommended Next Steps for the engineering team.
    
    Format using Markdown. Keep it under 200 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate incident report due to an API error.";
  }
};