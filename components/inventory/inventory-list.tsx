'use client';

import { Package, Upload, Search, Cpu, Zap, CircuitBoard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data - will be populated later with actual components
const components: {
  id: string;
  partNumber: string;
  manufacturer: string;
  category: string;
  description: string;
  specs: Record<string, string>;
}[] = [];

export function InventoryList() {
  if (components.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
            <CircuitBoard className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h2 className="mb-2 text-2xl font-bold tracking-tight">No Components Yet</h2>
        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Upload datasheets to build your component inventory. SpecOps AI will automatically 
          extract and index electronic components from PDFs.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Datasheet
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Search className="h-4 w-4" />
            Learn More
          </Button>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 max-w-3xl">
          <FeatureCard
            icon={Cpu}
            title="Auto-Indexing"
            description="AI extracts component specs from datasheets automatically"
          />
          <FeatureCard
            icon={Zap}
            title="Smart Matching"
            description="Find compatible replacements across manufacturers"
          />
          <FeatureCard
            icon={Package}
            title="Virtual Inventory"
            description="No database needed - documents are the source of truth"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Component Inventory</h1>
          <p className="text-muted-foreground">
            {components.length} component{components.length !== 1 ? 's' : ''} indexed
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Datasheet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <Card key={component.id} className="transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-mono">{component.partNumber}</CardTitle>
                  <CardDescription>{component.manufacturer}</CardDescription>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {component.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(component.specs).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
                  >
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="ml-1 font-medium">{value}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Cpu;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl border bg-card/50">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
