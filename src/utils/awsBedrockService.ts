export class AWSBedrockService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'http://localhost:3001/api/bedrock';
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
      generateContent: async ({ contents }: { contents: string }) => {
        const text = await this.generateContent(contents);
        return { text };
      },
    };
  }
}
