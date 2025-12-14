'use client';

import { Check, X, Box, Layers, Code, FileText, Ruler } from 'lucide-react';
import type { ComponentData, Spec } from '@/lib/inventory';
import { MultiComponentViewer3D } from '@/components/inventory/multi-component-viewer-3d';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMemo, Fragment } from 'react';

interface ComparisonViewProps {
  components: ComponentData[];
}

export function ComparisonView({ components }: ComparisonViewProps) {
  // Helper to check if a value is the same across all components
  const isUniform = (key: keyof ComponentData) => {
    if (components.length <= 1) return true;
    const firstVal = components[0][key];
    return components.every(c => c[key] === firstVal);
  };

  // Helper to render diff-highlighted cell
  const renderCell = (content: React.ReactNode, isDifferent: boolean) => {
    return (
      <div className={`p-4 h-full flex items-center ${isDifferent ? 'bg-yellow-500/10 dark:bg-yellow-500/5' : ''}`}>
        {content}
      </div>
    );
  };

  // Collect all unique spec names
  const allSpecNames = useMemo(() => {
    const names = new Set<string>();
    components.forEach(comp => {
      comp.specs.forEach(spec => names.add(spec.name));
    });
    return Array.from(names).sort();
  }, [components]);

  // Helper to get spec value for a component
  const getSpecValue = (component: ComponentData, specName: string) => {
    const spec = component.specs.find(s => s.name === specName);
    return spec ? spec.value : null;
  };

  // Helper to check if a spec row is uniform
  const isSpecUniform = (specName: string) => {
    if (components.length <= 1) return true;
    const firstVal = getSpecValue(components[0], specName);
    return components.every(c => getSpecValue(c, specName) === firstVal);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto">
      {/* Grid Layout */}
      <div 
        className="grid border rounded-xl overflow-hidden shadow-sm bg-card"
        style={{ 
          gridTemplateColumns: `200px repeat(${components.length}, minmax(300px, 1fr))` 
        }}
      >
        {/* Header Row */}
        <div className="p-4 bg-muted/50 font-medium text-muted-foreground flex items-center">
          Component
        </div>
        {components.map(comp => (
          <div key={comp.id} className="p-4 bg-muted/30 border-l flex flex-col gap-2">
            <div className="font-mono text-lg font-bold text-primary break-all">
              {comp.partNumber}
            </div>
            {comp.sourceFile && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 p-1.5 rounded border max-w-fit">
                <FileText className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{comp.sourceFile}</span>
              </div>
            )}
          </div>
        ))}

        {/* Basic Info Section */}
        <div className="col-span-full border-t border-b bg-muted/20 p-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Box className="h-3.5 w-3.5" />
          General Information
        </div>

        {/* Manufacturer */}
        <div className="p-4 font-medium text-sm text-muted-foreground border-b border-r-0 flex items-center">
          Manufacturer
        </div>
        {components.map((comp, i) => (
          <div key={`${comp.id}-mfg`} className="border-l border-b text-sm">
            {renderCell(comp.manufacturer, !isUniform('manufacturer'))}
          </div>
        ))}

        {/* Category */}
        <div className="p-4 font-medium text-sm text-muted-foreground border-b border-r-0 flex items-center">
          Category
        </div>
        {components.map((comp, i) => (
          <div key={`${comp.id}-cat`} className="border-l border-b text-sm">
            {renderCell(
              <Badge variant="outline" className="bg-primary/5">
                {comp.category}
              </Badge>, 
              !isUniform('category')
            )}
          </div>
        ))}

        {/* Specs Section */}
        <div className="col-span-full border-b bg-muted/20 p-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Ruler className="h-3.5 w-3.5" />
          Technical Specifications
        </div>

        {/* Dynamic Spec Rows */}
        {allSpecNames.map((specName) => {
          const isDifferent = !isSpecUniform(specName);
          return (
            <Fragment key={specName}>
              <div className="p-4 font-medium text-sm text-muted-foreground border-b border-r-0 flex items-center">
                {specName}
              </div>
              {components.map((comp) => (
                <div key={`${comp.id}-${specName}`} className="border-l border-b text-sm font-mono">
                  {renderCell(
                    getSpecValue(comp, specName) || <span className="text-muted-foreground/30 text-xs italic">N/A</span>,
                    isDifferent
                  )}
                </div>
              ))}
            </Fragment>
          );
        })}
        
        {allSpecNames.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground italic">
            No specifications available for comparison
          </div>
        )}

        {/* Visual Comparison Section */}
        {components.some(c => c.threeJsCode) && (
          <div className="col-span-full border-t">
            <div className="bg-muted/20 p-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Box className="h-3.5 w-3.5" />
              Size Comparison
            </div>
            
            <div className="p-4 bg-muted/5 min-h-[400px]">
              <MultiComponentViewer3D 
                models={components
                  .filter(c => c.threeJsCode)
                  .map(c => ({
                    id: c.id,
                    code: c.threeJsCode || '',
                    label: c.partNumber
                  }))
                } 
                className="w-full h-[400px] bg-background shadow-xs border" 
              />
              <p className="text-center text-xs text-muted-foreground mt-2">
                Models are displayed side-by-side (Left to Right based on columns above)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
