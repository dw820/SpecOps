import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { ComponentData } from '@/lib/inventory';

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_MAIN_FILE = path.join(DATA_DIR, 'inventory-main.json');

/**
 * GET /api/inventory-demo
 * Returns all components from inventory-main.json
 */
export async function GET() {
  try {
    const data = await fs.readFile(INVENTORY_MAIN_FILE, 'utf-8');
    const inventory = JSON.parse(data);
    const components: ComponentData[] = inventory.components || [];
    return NextResponse.json({ components });
  } catch (error) {
    console.error('Error reading inventory-main.json:', error);
    return NextResponse.json(
      { error: 'Failed to read inventory demo data' },
      { status: 500 }
    );
  }
}
