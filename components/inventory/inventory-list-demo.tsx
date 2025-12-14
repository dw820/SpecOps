'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, Search, Cpu, Zap, CircuitBoard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComponentData } from '@/lib/inventory';

export function InventoryListDemo() {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch components from demo API on mount
  const fetchComponents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/inventory-demo');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory demo');
      }
      const data = await response.json();
      setComponents(data.components || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory demo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading demo inventory...</p>
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
        
        <h2 className="mb-2 text-2xl font-bold tracking-tight">No Demo Components</h2>
        <p className="mb-8 max-w-md text-center text-muted-foreground">
          The demo inventory file is empty. Please add components to inventory-main.json.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row">
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
    <div className="flex flex-1 flex-col p-6 relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demo Component Inventory</h1>
          <p className="text-muted-foreground">
            {components.length} component{components.length !== 1 ? 's' : ''} indexed (Demo)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchComponents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-20">
        {components.map((component) => (
          <div key={component.id} className="relative group">
            <Link href={`/inventory/${component.id}`} className="block">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                  selectedIds.includes(component.id) ? 'ring-2 ring-primary border-primary' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between pr-8">
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
            
            <div 
              className="absolute top-3 right-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                checked={selectedIds.includes(component.id)}
                onChange={() => toggleSelection(component.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md bg-popover/95 backdrop-blur-sm border shadow-2xl rounded-2xl p-4 flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-4">
            <span className="font-medium text-sm">
              {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearSelection}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={selectedIds.length < 2 || selectedIds.length > 3}
              asChild={selectedIds.length >= 2 && selectedIds.length <= 3}
            >
              {selectedIds.length >= 2 && selectedIds.length <= 3 ? (
                <Link href={`/inventory/compare?ids=${selectedIds.join(',')}`}>
                  Compare
                </Link>
              ) : (
                <span>{selectedIds.length < 2 ? 'Select at least 2' : 'Maximum 3 items'}</span>
              )}
            </Button>
          </div>
        </div>
      )}
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
