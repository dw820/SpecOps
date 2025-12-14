import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, component } = await req.json();

  const systemMessage = {
    role: 'system',
    content: `You are a helpful assistant answering questions about a specific inventory component.
    
    Component Details:
    Name: ${component.partNumber}
    Manufacturer: ${component.manufacturer}
    Category: ${component.category}
    Description: ${component.description || 'N/A'}
    
    Specifications:
    ${component.specs.map((s: any) => `- ${s.name}: ${s.value}`).join('\n')}
    
    3D Model Code (for context only, do not output unless asked):
    ${component.threeJsCode || 'N/A'}
    
    Answer the user's questions based on this information. Be concise and helpful.`,
  };

  const modelMessages = convertToModelMessages(messages);
  // Prepend system message
  const fullMessages = [systemMessage, ...modelMessages];

  const result = streamText({
    model: google('gemini-1.5-pro-latest'),
    messages: fullMessages as any, // Cast to any to avoid strict type checks on system message format if needed, though usually standard
  });

  return result.toDataStreamResponse();
}
