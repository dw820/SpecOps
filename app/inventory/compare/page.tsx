'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonView } from '@/components/inventory/comparison-view';
import type { ComponentData } from '@/lib/inventory';

function ComparePageContent() {
  const searchParams = useSearchParams();
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    
    if (ids.length === 0) {
      setError('No components selected for comparison');
      setIsLoading(false);
      return;
    }

    const fetchComponents = async () => {
      try {
        setIsLoading(true);
        // Fetch all components in parallel
        // Note: In a real app we might want a bulk fetch endpoint, 
        // but for now we'll fetch individually as per existing API
        const promises = ids.map(id => 
          fetch(`/api/inventory/${id}`).then(async res => {
            if (!res.ok) throw new Error(`Failed to fetch component ${id}`);
            const data = await res.json();
            return data.component as ComponentData;
          })
        );

        const results = await Promise.all(promises);
        setComponents(results);
      } catch (err) {
        console.error('Error fetching components:', err);
        setError('Failed to load components for comparison');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComponents();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error || components.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Comparison Failed</h2>
        <p className="text-muted-foreground mb-6">{error || 'No start components found'}</p>
        <Button asChild>
          <Link href="/inventory">Return to Inventory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <Button variant="ghost" size="sm" asChild className="mr-4 gap-2">
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Compare Components</h1>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <ComparisonView components={components} />
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
