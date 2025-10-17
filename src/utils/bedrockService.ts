const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const generateWithBedrock = async (prompt: string, model?: string): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/bedrock/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Bedrock service error:', error);
    throw error;
  }
};
