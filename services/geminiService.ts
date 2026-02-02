import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateArticleContent = async (title: string, excerpt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return `# Missing API Key\n\nPlease configure your API_KEY to generate content for: ${title}`;
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Escreva um artigo técnico completo de blog para programadores sobre o tema: "${title}".
      Contexto: ${excerpt}
      
      Diretrizes:
      - Use formato Markdown.
      - Tom: Educativo, profissional mas levemente informal ("de dev para dev").
      - Inclua exemplos de código (snippets) onde apropriado (use blocos de código com linguagem especificada).
      - Use subtítulos (H2, H3) para estruturar.
      - Termine com uma conclusão inspiradora.
      - Não adicione intro genérica como "Neste artigo...", vá direto ao ponto técnico.
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
   if (!process.env.API_KEY) return "API Key missing.";
   
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `User search query on a dev blog: "${query}". Provide a 1-sentence technical insight or "did you know" related to this query. Keep it geeky.`,
     });
     return response.text || "";
   } catch (e) {
     return "";
   }
}
