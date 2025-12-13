import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { nanoid } from 'nanoid';
import { 
  ExtractionResultSchema, 
  type ComponentData,
  appendComponents 
} from '@/lib/inventory';

// Allow longer processing time for PDF analysis
export const maxDuration = 60;

const EXTRACTION_PROMPT = `Role: You are a Senior Electronics Component Engineer and Data Architect.

Objective: Extract all technical data from the provided datasheet PDF and structure it into a comprehensive, machine-readable JSON object.

Instructions:

Analyze the Structure: Determine if this datasheet covers a single specific component or a series of components with a variation table.

Extract Common Data: Identify specifications that apply to the entire file (e.g., Manufacturer, Operating Temperature, Compliance Standards, General Features).

Decode Part Numbering: If a "Part Number Identification" or "Ordering Code" breakdown exists (e.g., explaining what '100', 'S', 'H' mean), extract this into a specific part_number_logic dictionary.

Extract Physical Dimensions: specific dimensions (L x W x T) and package sizes (e.g., 0402, 0603).

Extract Electrical Specifications:

Crucial: Extract the table of variants if present. For each row, capture the Part Number, Impedance (Z), Rated Current, DC Resistance (DCR), and Test Frequency.

Standardize units where possible (e.g., convert all DCR to Ohms or keep as listed but specify unit).

Capture Unique/Dynamic Info: Since datasheets differ, capture any non-standard columns (e.g., "Q Factor", "Self Resonant Frequency", "Thickness") in an additional_specs key.

JSON Output Schema: Please output ONLY valid JSON using this structure:

JSON

{
  "datasheet_metadata": {
    "manufacturer": "String",
    "series_name": "String",
    "description": "String",
    "date_revised": "String (if available)",
    "file_type": "Single Component" OR "Series Family"
  },
  "general_specifications": {
    "operating_temperature_min": "String",
    "operating_temperature_max": "String",
    "applications": ["String", "String"],
    "features": ["String", "String"],
    "compliance": ["RoHS", "AEC-Q200", etc.]
  },
  "part_number_logic": {
    "description": "Explanation of how the part number is constructed",
    "breakdown": [
      {"code_position": "String", "meaning": "String"}
    ]
  },
  "physical_dimensions": [
    {
      "package_code_imperial": "String (e.g., 0402)",
      "package_code_metric": "String (e.g., 1005)",
      "length": "String",
      "width": "String",
      "thickness": "String",
      "tolerance": "String"
    }
  ],
  "products": [
    {
      "part_number": "String (Primary Key)",
      "impedance_ohms": "Number or String",
      "impedance_tolerance": "String",
      "test_frequency_mhz": "Number or String",
      "dc_resistance_max": "String",
      "rated_current_ma": "String",
      "additional_specs": {
        "key": "value"
      }
    }
  ]
}`;

/**
 * POST /api/inventory/process
 * Process a PDF datasheet and extract component information using Gemini 3
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are accepted' },
        { status: 400 }
      );
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Call Gemini 3 to extract component data
    const { object } = await generateObject({
      model: 'google/gemini-3-pro-preview',
      schema: ExtractionResultSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            { 
              type: 'file', 
              data: base64, 
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
    });

    // Add metadata to each component
    const componentsWithMetadata: ComponentData[] = object.components.map((comp) => ({
      ...comp,
      id: nanoid(),
      sourceFile: file.name,
      extractedAt: new Date().toISOString(),
    }));

    // Save to inventory
    await appendComponents(componentsWithMetadata);

    return NextResponse.json({ 
      success: true,
      components: componentsWithMetadata,
      count: componentsWithMetadata.length,
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF', details: String(error) },
      { status: 500 }
    );
  }
}
