import { z } from 'zod';

// Schema for a single spec (key-value pair)
export const SpecSchema = z.object({
  name: z.string().describe('The specification name (e.g., "impedance", "size", "currentRating")'),
  value: z.string().describe('The specification value (e.g., "60Ω", "0603", "2A")'),
});

export type Spec = z.infer<typeof SpecSchema>;

// Zod schema for a single component (stored in inventory)
export const ComponentSchema = z.object({
  id: z.string(),
  partNumber: z.string(),
  manufacturer: z.string(),
  category: z.string(),
  description: z.string(),
  specs: z.array(SpecSchema),
  threeJsCode: z.string().optional(),
  sourceFile: z.string().optional(),
  extractedAt: z.string().optional(),
});

export type ComponentData = z.infer<typeof ComponentSchema>;

// Schema for Gemini extraction response (without id, sourceFile, extractedAt - we add those)
export const ExtractedComponentSchema = z.object({
  partNumber: z.string().describe('The full part number/model number'),
  manufacturer: z.string().describe('The manufacturer name'),
  category: z.string().describe('Component category (e.g., "Ferrite Bead", "Capacitor", "Resistor")'),
  description: z.string().describe('Brief description of the component'),
  specs: z.array(SpecSchema).describe('Key specifications as name-value pairs'),
  threeJsCode: z.string().optional().describe('Generated Three.js code to visualize the component in 3D'),
});

export type ExtractedComponent = z.infer<typeof ExtractedComponentSchema>;

// Schema for the full extraction result from Gemini
export const ExtractionResultSchema = z.object({
  components: z.array(ExtractedComponentSchema).describe('All components found in the datasheet'),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// Schema for the inventory file
export const InventoryFileSchema = z.object({
  components: z.array(ComponentSchema),
  lastUpdated: z.string(),
});

export type InventoryFile = z.infer<typeof InventoryFileSchema>;
