import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini safely inside functions to prevent crash on load if key is missing

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not configured");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateArticleContent = async (title: string, excerpt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return `# Missing API Key\n\nPlease configure your API_KEY to generate content for: ${title}`;
  }

  try {
    const ai = getAiClient();
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Escreva um artigo técnico completo de blog para programadores sobre o tema: "${title}".
      Contexto: ${excerpt}
      
      Diretrizes:
      - IDIOMA: PORTUGUÊS (BRASIL).
      - Use formato Markdown válido e bem estruturado.
      - Tom: Educativo, profissional mas levemente informal ("de dev para dev").
      - Use subtítulos (H2, H3) frequentes para quebrar o texto.
      - Evite parágrafos muito longos ou blocos densos de texto. O texto deve ser arejado e coeso.
      - Inclua exemplos de código (snippets) onde apropriado (use blocos de código com linguagem especificada).
      - Termine com uma conclusão inspiradora.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Erro ao gerar conteúdo.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error generating content: ${(error as Error).message}. \n\n Please try again later.`;
  }
};

export const generateSearchInsights = async (query: string): Promise<string> => {
   if (!process.env.API_KEY) return "";
   
   try {
     const ai = getAiClient();
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `User search query on a dev blog: "${query}". Provide a 1-sentence technical insight or "did you know" related to this query. Keep it geeky. Language: Portuguese (Brazil).`,
     });
     return response.text || "";
   } catch (e) {
     return "";
   }
}

export const generateFullPost = async (topic: string): Promise<any> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const prompt = `
    You are a Senior Staff Engineer writing for a technical blog.
    Generate a complete blog post metadata and content about: "${topic}".
    
    Content Guidelines:
    - LANGUAGE: PORTUGUESE (BRAZIL).
    - The content MUST be deep, technical, and include code snippets.
    - Format in VALID Markdown.
    - Structure the content cohesively: Use clear Headings, short paragraphs, and bullet points to avoid large walls of text.
    - Ensure code blocks are properly fenced.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slug: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            read_time: { type: Type.STRING }
          },
          required: ["title", "slug", "excerpt", "content", "category", "tags", "read_time"]
        }
      }
    });

    let text = response.text || "{}";
    
    // Sanitize: remove any potential markdown code blocks wrapping the JSON if they exist
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '');
    } else if (text.startsWith('```')) {
       text = text.replace(/^```/, '').replace(/```$/, '');
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Gen Error:", error);
    throw error;
  }
}