'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, Upload, Search, Cpu, Zap, CircuitBoard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadDialog } from './upload-dialog';
import type { ComponentData } from '@/lib/inventory';

export function InventoryList() {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch components from API on mount
  const fetchComponents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setComponents(data.components || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const handleUploadComplete = useCallback((newComponents: ComponentData[]) => {
    // Add new components to state
    setComponents((prev) => [...prev, ...newComponents]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={fetchComponents} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-linear-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-purple-500/10 border border-primary/20">
            <CircuitBoard className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h2 className="mb-2 text-2xl font-bold tracking-tight">No Components Yet</h2>
        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Upload datasheets to build your component inventory. SpecOps AI will automatically 
          extract and index electronic components from PDFs.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <UploadDialog onUploadComplete={handleUploadComplete}>
            <Button size="lg" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Datasheet
            </Button>
          </UploadDialog>
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchComponents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <UploadDialog onUploadComplete={handleUploadComplete}>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Datasheet
            </Button>
          </UploadDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <Link key={component.id} href={`/inventory/${component.id}`} className="block">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
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
                  {component.specs.map((spec, idx) => (
                    <span
                      key={`${spec.name}-${idx}`}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
                    >
                      <span className="text-muted-foreground">{spec.name}:</span>
                      <span className="ml-1 font-medium">{spec.value}</span>
                    </span>
                  ))}
                </div>
                {component.sourceFile && (
                  <p className="mt-3 text-xs text-muted-foreground truncate">
                    Source: {component.sourceFile}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
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
