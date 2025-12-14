import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { promises as fs } from 'fs';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// System prompt for component matching
const SYSTEM_PROMPT = `You are an expert electronics component specialist assistant. Your primary role is to help users find the most compatible replacement components from the available inventory.

## Your Capabilities:
1. **Analyze Datasheets**: When a user uploads a datasheet or describes a component they're seeking to replace, carefully extract key specifications such as:
   - Part number and manufacturer
   - Category (e.g., Ferrite Bead, Capacitor, Resistor, Inductor)
   - Electrical specifications (impedance, capacitance, resistance, voltage rating, current rating)
   - Physical specifications (package size, dimensions)
   - Operating conditions (temperature range, frequency)

2. **Match with Inventory**: Compare the uploaded component specifications against the available inventory to find the best matches. Consider:
   - Direct replacements (same or very similar specifications)
   - Compatible alternatives (slightly different but functionally equivalent)
   - Potential trade-offs (what specifications differ and their implications)

3. **Provide Recommendations**: For each recommended component, explain:
   - Why it's a good match
   - Any differences from the original component
   - Potential compatibility concerns
   - Ranking from best to acceptable matches

## Available Inventory:
The inventory data is provided below. Use this as your source of truth for available components.

## Response Format:
- Be concise but thorough
- Use tables when comparing multiple components
- Highlight critical specification matches and mismatches
- Always explain the reasoning behind your recommendations
`;

// Load inventory data at startup
async function loadInventoryData(): Promise<string> {
  try {
    const inventoryPath = path.join(process.cwd(), 'data', 'inventory-main.json');
    const data = await fs.readFile(inventoryPath, 'utf-8');
    return data;
  } catch (error) {
    console.error('Failed to load inventory data:', error);
    return '{"components": [], "error": "Failed to load inventory data"}';
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Load the inventory data
  const inventoryData = await loadInventoryData();

  // Build the full system prompt with inventory data
  const fullSystemPrompt = `${SYSTEM_PROMPT}

## Inventory Data:
\`\`\`json
${inventoryData}
\`\`\`

Remember: Always refer to this inventory when recommending components. Do not suggest components that are not in the inventory.`;

  const result = streamText({
    model: 'google/gemini-3-pro-preview',
    system: fullSystemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}