import { NextResponse } from 'next/server';
import { getComponents, clearInventory } from '@/lib/inventory';

/**
 * GET /api/inventory
 * Returns all components from the inventory
 */
export async function GET() {
  try {
    const components = await getComponents();
    return NextResponse.json({ components });
  } catch (error) {
    console.error('Error reading inventory:', error);
    return NextResponse.json(
      { error: 'Failed to read inventory' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inventory
 * Clears all components from the inventory (for testing)
 */
export async function DELETE() {
  try {
    await clearInventory();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing inventory:', error);
    return NextResponse.json(
      { error: 'Failed to clear inventory' },
      { status: 500 }
    );
  }
}
