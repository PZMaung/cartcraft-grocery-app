import { createClient } from '@supabase/supabase-js';
import { GroceryItem, CategoryId } from '../types/grocery';

// User provided credentials with env var override
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jzrwgumssbkjygahoabd.supabase.co';
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AjLNqIAAJFFhrr4GszoHsA__sjE0B2G';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseGroceryItemRow {
  id: string;
  name: string;
  note: string | null;
  category: string;
  quantity: number;
  unit: string | null;
  completed: boolean;
  completed_at: string | null;
  is_urgent: boolean;
  list_id: string;
  user_id: string | null;
  user_name: string | null;
  created_at: string;
}

export function rowToItem(row: SupabaseGroceryItemRow): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    note: row.note || undefined,
    category: (row.category as CategoryId) || 'produce',
    quantity: row.quantity ?? 1,
    unit: row.unit || undefined,
    completed: !!row.completed,
    completedAt: row.completed_at || undefined,
    isUrgent: !!row.is_urgent,
    listId: row.list_id || 'weekly',
    userId: row.user_id || undefined,
    userName: row.user_name || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function itemToRow(item: GroceryItem): Partial<SupabaseGroceryItemRow> {
  return {
    id: item.id,
    name: item.name,
    note: item.note || null,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit || null,
    completed: item.completed,
    completed_at: item.completedAt || null,
    is_urgent: item.isUrgent ?? false,
    list_id: item.listId,
    user_id: item.userId || null,
    user_name: item.userName || null,
  };
}

/**
 * Fetch all items from Supabase
 */
export async function fetchRemoteGroceryItems(): Promise<{ items: GroceryItem[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { items: [], error };
    }

    const items = (data as SupabaseGroceryItemRow[]).map(rowToItem);
    return { items, error: null };
  } catch (err) {
    return { items: [], error: err };
  }
}

/**
 * Insert or upsert item in Supabase
 */
export async function insertRemoteGroceryItem(item: GroceryItem): Promise<{ error: any }> {
  try {
    const row = itemToRow(item);
    const { error } = await supabase.from('grocery_items').upsert(row);
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Update existing item in Supabase
 */
export async function updateRemoteGroceryItem(item: GroceryItem): Promise<{ error: any }> {
  try {
    const row = itemToRow(item);
    const { error } = await supabase.from('grocery_items').update(row).eq('id', item.id);
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Delete item from Supabase
 */
export async function deleteRemoteGroceryItem(id: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase.from('grocery_items').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Delete all completed items from Supabase for a given list
 */
export async function clearRemoteCompletedItems(listId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('list_id', listId)
      .eq('completed', true);
    return { error };
  } catch (err) {
    return { error: err };
  }
}

export const SUPABASE_SQL_SETUP = `-- 1. CREATE GROCERY ITEMS TABLE
create table if not exists public.grocery_items (
  id text primary key,
  name text not null,
  note text,
  category text not null default 'produce',
  quantity integer not null default 1,
  unit text,
  completed boolean not null default false,
  completed_at timestamptz,
  is_urgent boolean not null default false,
  list_id text not null default 'weekly',
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  created_at timestamptz default now()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.grocery_items enable row level security;

-- 3. PERMISSIONS FOR AUTHENTICATED FAMILY MEMBERS
create policy "Family members can view all grocery items"
  on public.grocery_items for select
  to authenticated
  using (true);

create policy "Family members can insert grocery items"
  on public.grocery_items for insert
  to authenticated
  with check (true);

create policy "Family members can update grocery items"
  on public.grocery_items for update
  to authenticated
  using (true);

create policy "Family members can delete grocery items"
  on public.grocery_items for delete
  to authenticated
  using (true);

-- 4. ENABLE REALTIME SYNC (Optional, for instant live updates across devices)
alter publication supabase_realtime add table public.grocery_items;
`;
