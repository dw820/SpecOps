# SpecOps

## The Problem

Engineers and procurement teams constantly face the challenge of finding **component replacements**. When a part goes obsolete, has supply chain issues, or simply needs a cost-effective alternative, the typical process is:

1. Dig through physical or digital datasheet archives
2. Manually decode cryptic part numbers (e.g., `MPZ1608S600AT000`)
3. Painstakingly compare specifications across different manufacturers
4. Hope nothing gets missed in the translation

This is **slow, error-prone, and expertise-dependent**—a perfect use case for AI.

---

## Who We're Solving For

### The Hardware Engineer ("Alex")

- **Role**: Electrical/Hardware Engineer at a mid-size company
- **Pain Point**: Needs to find drop-in replacements quickly when parts are unavailable
- **Scenario**: Alex has a TDK part number from a legacy design and a PDF datasheet from a potential alternative supplier (e.g., Sunlord). He needs to know: *"Can this part replace the TDK one? Is it better or worse?"*
- **What Alex wants**: A fast answer without manually cross-referencing two datasheets

### The Procurement Engineer

- **Role**: Sourcing/Supply Chain Professional
- **Pain Point**: Supplier sends a datasheet—need to verify it meets original specs
- **Scenario**: Needs to validate that a proposed alternative component meets the same electrical and mechanical requirements

---

## Core Concept: "No Database. Just Documents."

Instead of relying on a pre-populated component database (which is expensive to maintain and hard to verify), **SpecOps reads datasheets directly using Gemini 3's multimodal capabilities**:

1. **Upload a PDF** → AI extracts all components and specifications in real-time
2. **Query with a part number** → AI decodes the smart numbering scheme using world knowledge
3. **Get instant matches** → AI compares specs and highlights differences/upgrades

---

## Features

### 📄 PDF Datasheet Processing
- **Drag-and-drop PDF upload** with real-time processing status
- **AI-powered extraction** using Gemini 3 to parse complex electrical specifications tables
- Automatically decodes part numbering schemes and extracts technical parameters
- Supports both single-component and series/family datasheets

### 📦 Component Inventory
- **Visual component cards** showing part number, manufacturer, category, and key specs
- Click to view **detailed component page** with full specifications
- Multi-select components for comparison
- Delete unwanted components from inventory

### 🔬 Side-by-Side Comparison
- Select multiple components to compare specifications in a **unified table view**
- **Diff highlighting** shows where specs differ between components
- Smart detection of matching and mismatched values

### 🧊 3D Visualization
- **Auto-generated Three.js 3D models** based on physical dimensions extracted from datasheets
- Interactive viewer with rotation, zoom, and pan controls
- **Multi-component 3D comparison** to visually compare physical sizes side-by-side

### 💬 AI Chat (Q&A per Component)
- Ask natural language questions about any component's specifications
- AI responds with context from the extracted datasheet data
- Useful for quick lookups without scanning the full spec sheet

### 🎨 Modern UI/UX
- Built with **Next.js 15** and **shadcn/ui** components
- Collapsible sidebar navigation
- Responsive design with dark mode support
- Clean, professional interface

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | shadcn/ui, Tailwind CSS |
| **AI** | Vercel AI SDK + Google Gemini 3 |
| **3D** | Three.js |
| **State** | React hooks, Local Storage |

---

## Demo Flow

1. **Upload**: Alex uploads `AGZ_series.pdf` into the app
2. **Extract**: AI scans the datasheet and indexes 45 components
3. **Query**: Alex asks: *"Find a replacement for TDK MPZ1608S600AT000"*
4. **Match**: AI decodes the TDK part (0603 size, 60Ω) and finds `AGZ1608W600-2A0`
5. **Diff**: Shows the match logic and highlights that the Sunlord part is rated for 2A vs TDK's 1A—an **upgrade**!