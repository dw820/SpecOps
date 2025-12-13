import { promises as fs } from 'fs';
import path from 'path';
import type { ComponentData, InventoryFile } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

/**
 * Ensure the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Get the default empty inventory structure
 */
function getDefaultInventory(): InventoryFile {
  return {
    components: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Read the inventory from the JSON file
 */
export async function readInventory(): Promise<InventoryFile> {
  await ensureDataDir();
  
  try {
    const data = await fs.readFile(INVENTORY_FILE, 'utf-8');
    return JSON.parse(data) as InventoryFile;
  } catch {
    // File doesn't exist or is invalid, return default
    return getDefaultInventory();
  }
}

/**
 * Write the inventory to the JSON file
 */
export async function writeInventory(inventory: InventoryFile): Promise<void> {
  await ensureDataDir();
  
  inventory.lastUpdated = new Date().toISOString();
  await fs.writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf-8');
}

/**
 * Append new components to the inventory
 */
export async function appendComponents(newComponents: ComponentData[]): Promise<ComponentData[]> {
  const inventory = await readInventory();
  inventory.components.push(...newComponents);
  await writeInventory(inventory);
  return inventory.components;
}

/**
 * Clear all components from the inventory
 */
export async function clearInventory(): Promise<void> {
  await writeInventory(getDefaultInventory());
}

/**
 * Get all components from the inventory
 */
export async function getComponents(): Promise<ComponentData[]> {
  const inventory = await readInventory();
  return inventory.components;
}

/**
 * Get a single component by ID
 */
export async function getComponentById(id: string): Promise<ComponentData | null> {
  const inventory = await readInventory();
  return inventory.components.find((c) => c.id === id) || null;
}

/**
 * Delete a component by ID
 */
export async function deleteComponent(id: string): Promise<boolean> {
  const inventory = await readInventory();
  const initialLength = inventory.components.length;
  inventory.components = inventory.components.filter((c) => c.id !== id);
  
  if (inventory.components.length === initialLength) {
    return false; // Component not found
  }
  
  await writeInventory(inventory);
  return true;
}
