Instead of relying on a "pre-baked" JSON database (which judges might think is faked), you are now showing off Gemini 3's ability to read complex engineering PDFs and "decode" industry part numbers in real-time.

Here is the Updated PRD for the SpecMatch: "Datasheet-First" Edition.

Project Name: SpecMatch (Datasheet Edition)
Core Pivot: "No Database. Just Documents." Data Source: The actual PDF you uploaded (AGZ series...). Input: A raw competitor part number string (e.g., MPZ1608S600AT000).

1. The New Architecture: "Read & Decode"
We replace the static JSON files with a 2-step Generative Pipeline.

Side A: The "Inventory" (Your PDF)
Instead of a CSV/JSON, the AI reads the AGZ Series PDF directly.

Task: The LLM must look at the "Electrical Characteristics" table in the PDF.

Extraction: It builds a "Virtual Inventory" in memory by reading rows like AGZ1608W600-1A0 -> 60Ω, 1A.

Side B: The "Target" (The Competitor Code)
We assume we don't have the competitor's datasheet. We only have their Part Number.

Task: Use Gemini 3's "World Knowledge" to decode the smart numbering scheme.

Example: MPZ1608S600AT000

1608 = Size 0603.

600 = 60 Ohms.

A = Material Code / Current Rating characteristic.

2. User Journey (The Updated Demo Flow)
User: "Alex," looking for a TDK replacement. Context: He has no database, just a PDF from a vendor (Sunlord) he wants to use.

Step 1: Ingest (The Setup)

Action: Alex uploads AGZ_series.pdf into the "Reference" slot.

SpecMatch UI: "Scanning Datasheet... Indexed 45 Components."

Visual: Show a snippet of the table being highlighted.

Step 2: The Query

Action: Alex types: "Find a replacement for TDK MPZ1608S600AT000"

SpecMatch (Internal Thought Process):

Decoding TDK: "MPZ1608... means Size 0603 (1.6x0.8mm), Impedance 60Ω, High Current type."

Scanning PDF: "Looking for Size 1608 + 60Ω in the AGZ table..."

Found: AGZ1608W600-2A0.

Step 3: The Result & "Diff"

SpecMatch Output:

Best Match: Sunlord AGZ1608W600-2A0

Match Logic: "Both are 0603 Size and 60Ω."

The Upgrade (The Hook): "✅ Upgrade Found: The TDK part is rated for ~1A (Standard), but this Sunlord part found in the PDF is rated for 2A."