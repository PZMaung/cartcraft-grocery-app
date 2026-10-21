import { GroceryItem, GroceryList, KEYWORD_CATEGORY_MAP, CategoryId } from '../types/grocery';

const ITEMS_STORAGE_KEY = 'cartcraft_items_v1';
const LISTS_STORAGE_KEY = 'cartcraft_lists_v1';
const ACTIVE_LIST_STORAGE_KEY = 'cartcraft_active_list_id_v1';

export const DEFAULT_LISTS: GroceryList[] = [
  { id: 'weekly', name: 'Weekly Groceries', icon: 'ShoppingCart', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'costco', name: 'Costco & Bulk', icon: 'Package', createdAt: new Date().toISOString() },
  { id: 'quick', name: 'Quick Run', icon: 'Zap', createdAt: new Date().toISOString() },
];

export const INITIAL_ITEMS: GroceryItem[] = [
  {
    id: 'init-1',
    name: 'Oat Milk Barista',
    note: 'Oatly brand preferably, or Califia. 2 cartons.',
    category: 'dairy',
    quantity: 2,
    unit: 'carton',
    completed: false,
    isUrgent: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    listId: 'weekly',
  },
  {
    id: 'init-2',
    name: 'Fresh Farm Eggs',
    note: 'Large brown eggs, check inside for cracked shells before taking',
    category: 'dairy',
    quantity: 1,
    unit: 'pack',
    completed: false,
    isUrgent: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    listId: 'weekly',
  },
  {
    id: 'init-3',
    name: 'Avocados',
    note: '2 ripe for tonight, 2 firm for later in the week',
    category: 'produce',
    quantity: 4,
    unit: 'pcs',
    completed: false,
    isUrgent: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    listId: 'weekly',
  },
  {
    id: 'init-4',
    name: 'Sourdough Boule',
    note: 'From the fresh bakery shelf, unsliced',
    category: 'bakery',
    quantity: 1,
    unit: 'pack',
    completed: false,
    isUrgent: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    listId: 'weekly',
  },
  {
    id: 'init-5',
    name: 'Extra Virgin Olive Oil',
    note: 'Only if on discount / under $18',
    category: 'pantry',
    quantity: 1,
    unit: 'bottle',
    completed: true,
    completedAt: new Date().toISOString(),
    isUrgent: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    listId: 'weekly',
  },
];

export function loadStoredItems(): GroceryItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!raw) return INITIAL_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ITEMS;
  } catch (e) {
    console.error('Failed to parse stored items', e);
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: GroceryItem[]): void {
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to persist items', e);
  }
}

export function loadStoredLists(): GroceryList[] {
  try {
    const raw = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!raw) return DEFAULT_LISTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LISTS;
  } catch (e) {
    console.error('Failed to parse lists', e);
    return DEFAULT_LISTS;
  }
}

export function saveStoredLists(lists: GroceryList[]): void {
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to persist lists', e);
  }
}

export function loadActiveListId(): string {
  try {
    return localStorage.getItem(ACTIVE_LIST_STORAGE_KEY) || 'weekly';
  } catch {
    return 'weekly';
  }
}

export function saveActiveListId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_LIST_STORAGE_KEY, id);
  } catch (e) {
    console.error('Failed to persist active list id', e);
  }
}

/**
 * Automatically predicts category based on name keywords
 */
export function predictCategory(name: string): CategoryId {
  const clean = name.toLowerCase().trim();
  for (const [kw, cat] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (clean.includes(kw)) {
      return cat;
    }
  }
  return 'other';
}

/**
 * Formats a shopping list as clean plain text suitable for SMS, Notes, or WhatsApp
 */
export function formatListForSharing(listName: string, items: GroceryItem[]): string {
  const needed = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  let text = `🛒 ${listName.toUpperCase()} (${needed.length} items to get)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (needed.length === 0) {
    text += `Everything is picked! All clear.\n\n`;
  } else {
    needed.forEach((item, idx) => {
      const qtyStr = item.quantity > 1 || item.unit ? ` (${item.quantity} ${item.unit || ''})`.trim() : '';
      const urgentStr = item.isUrgent ? ' ⭐️ [URGENT]' : '';
      text += `${idx + 1}. [ ] ${item.name}${qtyStr}${urgentStr}\n`;
      if (item.note && item.note.trim()) {
        text += `   ↳ Note: "${item.note.trim()}"\n`;
      }
    });
    text += `\n`;
  }

  if (done.length > 0) {
    text += `✓ In Cart (${done.length}):\n`;
    done.forEach((item) => {
      text += `  • [x] ${item.name}\n`;
    });
  }

  text += `\n— Shared via CartCraft Grocery App`;
  return text;
}

/**
 * Screen Wake Lock Manager (prevents mobile phone screen from going dark in the grocery store)
 */
let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if ('wakeLock' in navigator) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock request error:', err);
      return false;
    }
  }
  return false;
}

export async function releaseScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore
    }
    wakeLockSentinel = null;
  }
}

/**
 * Light tactile feedback (haptic vibration on supported mobile devices)
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(30);
      else if (type === 'success') navigator.vibrate([20, 40, 30]);
    } catch {
      // ignore vibration errors
    }
  }
}
