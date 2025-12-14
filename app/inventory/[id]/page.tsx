'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ComponentData } from '@/lib/inventory';
import { ComponentQA } from '@/components/inventory/component-qa';
import { ComponentViewer3D } from '@/components/inventory/component-viewer-3d';

export default function ComponentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [component, setComponent] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComponent() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/inventory/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Component not found');
          } else {
            throw new Error('Failed to fetch component');
          }
          return;
        }
        const data = await response.json();
        setComponent(data.component);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load component');
      } finally {
        setIsLoading(false);
      }
    }

    fetchComponent();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete component');
      }

      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete component');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading component...</p>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <p className="text-destructive">{error || 'Component not found'}</p>
        <Button variant="outline" onClick={() => router.push('/inventory')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/inventory')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{component.partNumber}</h1>
            <p className="text-muted-foreground">{component.manufacturer}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {component.specs.map((spec, idx) => (
                  <div key={`${spec.name}-${idx}`} className="flex flex-col space-y-1 p-3 rounded-md border bg-muted/5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {spec.name}
                    </span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{component.description}</p>
            </CardContent>
          </Card>

          {/* 3D Model and Metadata side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3D Model Viewer */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>3D Visualization</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {component.category}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <ComponentViewer3D code={component.threeJsCode} className="h-[250px] w-full border-none rounded-none" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{component.category}</span>
                </div>
                {component.sourceFile && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Source File</span>
                    <span className="font-medium truncate max-w-[150px]" title={component.sourceFile}>
                      {component.sourceFile}
                    </span>
                  </div>
                )}
                {component.extractedAt && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Extracted</span>
                    <span className="font-medium">
                      {new Date(component.extractedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - Right Column: Chat Q&A */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ComponentQA component={component} className="h-[calc(100vh-8rem)]" />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Component</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-mono font-medium">{component.partNumber}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
