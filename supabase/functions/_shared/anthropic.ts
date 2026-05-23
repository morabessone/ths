export async function callClaude(params: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string | unknown[] }[];
  maxTokens?: number;
}): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no configurada en Edge Functions');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens ?? 2000,
      system: params.system,
      messages: params.messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${data.error?.message ?? response.statusText}`);
  }

  return data.content
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('');
}
