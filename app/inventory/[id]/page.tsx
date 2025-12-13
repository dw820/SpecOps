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
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/inventory')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete Component'}
        </Button>
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

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-mono">{component.partNumber}</CardTitle>
              <p className="text-muted-foreground">{component.manufacturer}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {component.category}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p>{component.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Specifications</h3>
            <div className="flex flex-wrap gap-2">
              {component.specs.map((spec, idx) => (
                <span
                  key={`${spec.name}-${idx}`}
                  className="inline-flex items-center rounded-md bg-muted px-3 py-1.5 text-sm"
                >
                  <span className="text-muted-foreground">{spec.name}:</span>
                  <span className="ml-1 font-medium">{spec.value}</span>
                </span>
              ))}
            </div>
          </div>

          {component.sourceFile && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Source</h3>
              <p className="text-sm">{component.sourceFile}</p>
            </div>
          )}

          {component.extractedAt && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Extracted At</h3>
              <p className="text-sm">{new Date(component.extractedAt).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for future detail content */}
      <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
        <p className="text-muted-foreground">Additional details coming soon...</p>
      </div>
    </div>
  );
}
