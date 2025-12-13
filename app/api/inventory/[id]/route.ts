import { NextResponse } from 'next/server';
import { getComponentById, deleteComponent } from '@/lib/inventory';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/inventory/[id]
 * Returns a single component by ID
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const component = await getComponentById(id);

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    return NextResponse.json({ component });
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json({ error: 'Failed to fetch component' }, { status: 500 });
  }
}

/**
 * DELETE /api/inventory/[id]
 * Deletes a component by ID
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteComponent(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting component:', error);
    return NextResponse.json({ error: 'Failed to delete component' }, { status: 500 });
  }
}
