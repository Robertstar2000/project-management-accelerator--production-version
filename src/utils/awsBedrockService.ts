export class AWSBedrockService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/bedrock`;
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 4096 })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Backend request failed');
      }

      const data = await response.json();
      return data.text;
    } catch (error: any) {
      console.error('AWS Bedrock Error:', error);
      throw new Error(`AWS Bedrock failed: ${error.message}`);
    }
  }

  // Gemini-compatible interface
  get models() {
    return {
      generateContent: async ({ contents, config }: { contents: string; config?: any }) => {
        let prompt = contents;
        
        // If JSON output is requested, add explicit JSON formatting instruction
        if (config?.responseMimeType === 'application/json') {
          prompt = `${contents}\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Output raw JSON only.`;
        }
        
        const text = await this.generateContent(prompt);
        
        // Clean up response if JSON was requested
        if (config?.responseMimeType === 'application/json') {
          // Remove markdown code blocks if present
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
