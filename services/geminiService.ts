
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable is not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const recommendProbability = async (goalTitle: string): Promise<number> => {
  if (!API_KEY || !goalTitle) {
    // Return a default small probability if API is not available or title is empty
    return 0.05;
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the long-term difficulty of the goal: "${goalTitle}". Suggest a realistic initial daily success probability as a percentage, between 0.01 and 0.5. Respond with ONLY the numeric value (e.g., 0.05 or 0.1). Do not include the '%' sign or any other text.`,
        config: {
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    probability: {
                        type: Type.NUMBER,
                        description: "The recommended probability percentage."
                    },
                },
                // FIX: `required` is not a valid property for responseSchema. Replaced with `propertyOrdering` to guide model output.
                propertyOrdering: ["probability"]
            },
        }
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    const recommendedQ = result.probability;

    if (typeof recommendedQ === 'number' && recommendedQ > 0) {
      // Clamp the value to be safe
      return Math.max(0.01, Math.min(recommendedQ, 0.5));
    }
    return 0.05; // Fallback
  } catch (error) {
    console.error("Error recommending probability:", error);
    return 0.05; // Return a default value on error
  }
};


export const generateInsightfulQuote = async (goalTitle: string): Promise<{korean: string; english: string}> => {
  if (!API_KEY) {
    return Promise.resolve({
        korean: "오늘의 작은 한 걸음이 내일의 위대한 도약을 만듭니다.",
        english: "Today's small step creates tomorrow's great leap."
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a wise and encouraging mentor. A user is working towards the goal: "${goalTitle}". Generate a very short, powerful, and insightful quote or message (one or two sentences) to inspire them. Provide the response as a JSON object with two keys: "korean" for the Korean version and "english" for the English version.`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                korean: {
                    type: Type.STRING,
                    description: "The motivational quote in Korean."
                },
                english: {
                    type: Type.STRING,
                    description: "The motivational quote in English."
                },
            },
            // FIX: `required` is not a valid property for responseSchema. Replaced with `propertyOrdering` to guide model output.
            propertyOrdering: ["korean", "english"]
        },
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating insightful quote:", error);
    return {
        korean: "오늘도 수고했어요. 당신의 노력은 결코 헛되지 않습니다.",
        english: "You did a great job today. Your efforts are never in vain."
    };
  }
};

export const getAICoachResponse = async (
    userMessage: string,
    context: string,
    history: ChatMessage[]
): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("AI 코치 기능을 사용하려면 API 키가 필요합니다.");
    }

    try {
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            })),
            config: {
                systemInstruction: "You are 'BuildUp Mind Coach', a supportive, wise, and insightful AI assistant. Your goal is to help the user stay motivated and achieve their long-term goals. You analyze their progress data (stats, projects, goals) to provide personalized, actionable advice. Keep your responses concise, encouraging, and focused. You communicate in Korean.",
            },
        });

        const fullMessage = `Here is my current status for context (you don't need to repeat it back to me):\n${context}\n\nMy question or thought is: ${userMessage}`;
        
        const response = await chat.sendMessage({ message: fullMessage });
        
        return response.text;
    } catch (error) {
        console.error("Error getting AI coach response:", error);
        return "죄송합니다. AI 코치와 대화하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
};
