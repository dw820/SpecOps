# SpecOps

**AI-Powered Component Datasheet Intelligence**

SpecOps uses Google Gemini 3 to read PDF datasheets and instantly extract, compare, and match electronic components—no pre-built database required.

## Features

- 📄 **PDF Processing** — Upload datasheets and extract all components with Gemini 3
- 🔍 **Smart Comparison** — Side-by-side spec comparison with diff highlighting
- 🧊 **3D Visualization** — Auto-generated Three.js models from physical dimensions
- 💬 **Component Q&A** — Chat with AI about any component's specifications

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 15** (App Router)
- **shadcn/ui** + Tailwind CSS
- **Vercel AI SDK** + Google Gemini 3
- **Three.js** for 3D rendering

## Project Structure

```
app/
├── api/inventory/     # API routes for processing & chat
├── inventory/         # Inventory pages & component details
└── page.tsx           # Main entry point

components/
├── chat/              # Chat UI components
├── inventory/         # Inventory-specific components
├── layout/            # Layout components
├── sidebar/           # Navigation sidebar
└── ui/                # shadcn/ui components
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google AI API key |

## License

MIT
