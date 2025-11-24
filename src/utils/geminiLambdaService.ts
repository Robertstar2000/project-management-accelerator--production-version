export class GeminiLambdaService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/gemini`;
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        let errorMsg = 'Backend request failed';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error('Invalid response from backend');
      }
      return data.text;
    } catch (error: any) {
      console.error('Gemini Lambda Error:', error.message);
      throw error;
    }
  }

  // Gemini-compatible interface
  get models() {
    return {
      generateContent: async ({ contents, config }: { contents: string; config?: any }) => {
        let prompt = contents;
        
        if (config?.responseMimeType === 'application/json') {
          prompt = `${contents}\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Output raw JSON only.`;
        }
        
        const text = await this.generateContent(prompt);
        
        if (config?.responseMimeType === 'application/json') {
          let cleaned = text.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }
          return { text: cleaned.trim() };
        }
        
        return { text };
      },
    };
  }
}
