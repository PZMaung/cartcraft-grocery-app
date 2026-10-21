import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Share2,
  Trash2,
  Search,
  CheckCircle2,
  Plus,
  RotateCcw,
  Users,
  Database,
  Cloud,
  Check,
  AlertCircle,
} from 'lucide-react';
import { GroceryItem, GroceryList, CategoryId, CATEGORIES, StapleItem } from './types/grocery';
import {
  loadStoredItems,
  saveStoredItems,
  loadStoredLists,
  saveStoredLists,
  loadActiveListId,
  saveActiveListId,
  triggerHaptic,
} from './utils/storage';
import {
  supabase,
  fetchRemoteGroceryItems,
  insertRemoteGroceryItem,
  updateRemoteGroceryItem,
  deleteRemoteGroceryItem,
  clearRemoteCompletedItems,
  rowToItem,
  SupabaseGroceryItemRow,
} from './utils/supabase';
import { Header } from './components/Header';
import { AddItemBar } from './components/AddItemBar';
import { GroceryItemCard } from './components/GroceryItemCard';
import { ShoppingModeView } from './components/ShoppingModeView';
import { PantryStaplesSection } from './components/PantryStaplesSection';
import { DidYouForgetSection } from './components/DidYouForgetSection';
import { EditItemModal } from './components/EditItemModal';
import { ShareListModal } from './components/ShareListModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

export default function App() {
  const [items, setItems] = useState<GroceryItem[]>(() => loadStoredItems());
  const [lists, setLists] = useState<GroceryList[]>(() => loadStoredLists());
  const [activeListId, setActiveListId] = useState<string>(() => loadActiveListId());

  // Supabase Auth & Sync State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseTableMissing, setSupabaseTableMissing] = useState(false);

  // Navigation / Views
  const [activeTab, setActiveTab] = useState<'list' | 'shopping' | 'staples' | 'forget-check'>('list');
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [sortBy, setSortBy] = useState<'aisle' | 'recent' | 'urgent'>('aisle');

  // Modals
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch initial items from Supabase and merge
  const loadRemoteData = useCallback(async () => {
    setIsSyncing(true);
    const { items: remoteItems, error } = await fetchRemoteGroceryItems();
    if (error) {
      if (
        error.code === '42P01' ||
        (error.message && error.message.includes('grocery_items'))
      ) {
        setSupabaseTableMissing(true);
      }
    } else {
      setSupabaseTableMissing(false);
      if (remoteItems.length > 0) {
        setItems(remoteItems);
      }
    }
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    loadRemoteData();
  }, [loadRemoteData]);

  // Realtime subscription for Supabase
  useEffect(() => {
    const channel = supabase
      .channel('public:grocery_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grocery_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = rowToItem(payload.new as SupabaseGroceryItemRow);
            setItems((prev) => {
              if (prev.some((i) => i.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = rowToItem(payload.new as SupabaseGroceryItemRow);
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any)?.id;
            if (oldId) {
              setItems((prev) => prev.filter((i) => i.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persist locally as fallback
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredLists(lists);
  }, [lists]);

  useEffect(() => {
    saveActiveListId(activeListId);
  }, [activeListId]);

  // Current active list
  const currentList = lists.find((l) => l.id === activeListId) || lists[0];

  // Current user display name
  const currentUserName =
    currentUser?.user_metadata?.display_name ||
    currentUser?.email?.split('@')[0] ||
    undefined;

  // Items for the current active list
  const currentListItems = useMemo(() => {
    return items.filter((item) => item.listId === activeListId);
  }, [items, activeListId]);

  const uncompletedItems = useMemo(() => {
    return currentListItems.filter((item) => !item.completed);
  }, [currentListItems]);

  const completedItems = useMemo(() => {
    return currentListItems.filter((item) => item.completed);
  }, [currentListItems]);

  const urgentCount = useMemo(() => {
    return uncompletedItems.filter((item) => item.isUrgent).length;
  }, [uncompletedItems]);

  const notesCount = useMemo(() => {
    return currentListItems.filter((item) => item.note && item.note.trim().length > 0).length;
  }, [currentListItems]);

  // Filtered and sorted uncompleted items
  const displayUncompleted = useMemo(() => {
    let list = [...uncompletedItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || (i.note && i.note.toLowerCase().includes(q))
      );
    }

    if (selectedCategoryFilter !== 'all') {
      list = list.filter((i) => i.category === selectedCategoryFilter);
    }

    if (sortBy === 'aisle') {
      list.sort((a, b) => {
        const orderA = CATEGORIES[a.category]?.aisleNumber || 99;
        const orderB = CATEGORIES[b.category]?.aisleNumber || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'urgent') {
      list.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [uncompletedItems, searchQuery, selectedCategoryFilter, sortBy]);

  // Actions
  const handleAddItem = async (newItem: {
    name: string;
    note?: string;
    category: CategoryId;
    quantity: number;
    unit?: string;
    isUrgent: boolean;
  }) => {
    const item: GroceryItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: newItem.name,
      note: newItem.note,
      category: newItem.category,
      quantity: newItem.quantity,
      unit: newItem.unit,
      isUrgent: newItem.isUrgent,
      completed: false,
      createdAt: new Date().toISOString(),
      listId: activeListId,
      userId: currentUser?.id,
      userName: currentUserName,
    };

    setItems((prev) => [item, ...prev]);
    triggerHaptic('light');

    // Sync to Supabase
    await insertRemoteGroceryItem(item);
  };

  const handleToggleComplete = async (id: string) => {
    triggerHaptic('light');
    let targetItem: GroceryItem | undefined;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          targetItem = {
            ...item,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
          return targetItem;
        }
        return item;
      })
    );

    if (targetItem) {
      await updateRemoteGroceryItem(targetItem);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await deleteRemoteGroceryItem(id);
  };

  const handleUpdateNote = async (id: string, note?: string) => {
    let targetItem: GroceryItem | undefined;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetItem = { ...item, note };
          return targetItem;
        }
        return item;
      })
    );
    if (targetItem) {
      await updateRemoteGroceryItem(targetItem);
    }
  };

  const handleToggleUrgent = async (id: string) => {
    let targetItem: GroceryItem | undefined;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetItem = { ...item, isUrgent: !item.isUrgent };
          return targetItem;
        }
        return item;
      })
    );
    if (targetItem) {
      await updateRemoteGroceryItem(targetItem);
    }
  };

  const handleSaveEditedItem = async (updated: GroceryItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    await updateRemoteGroceryItem(updated);
  };

  const handleClearCompleted = async () => {
    if (completedItems.length === 0) return;
    setItems((prev) => prev.filter((item) => !(item.listId === activeListId && item.completed)));
    await clearRemoteCompletedItems(activeListId);
  };

  const handleRestoreCompleted = async () => {
    const updated = items.map((item) => {
      if (item.listId === activeListId && item.completed) {
        return { ...item, completed: false, completedAt: undefined };
      }
      return item;
    });
    setItems(updated);
    for (const item of updated.filter((i) => i.listId === activeListId && !i.completed)) {
      updateRemoteGroceryItem(item);
    }
  };

  const handleAddStaple = (staple: StapleItem) => {
    handleAddItem({
      name: staple.name,
      note: staple.defaultNote,
      category: staple.category,
      quantity: 1,
      unit: staple.defaultUnit,
      isUrgent: false,
    });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newList: GroceryList = {
      id: 'list_' + Date.now(),
      name: newListName.trim(),
      icon: 'ShoppingCart',
      createdAt: new Date().toISOString(),
    };
    setLists((prev) => [...prev, newList]);
    setActiveListId(newList.id);
    setNewListName('');
    setIsCreatingList(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 pb-20 sm:pb-12">
      {/* 3-Zone Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          if (t === 'shopping') setIsShoppingMode(true);
          else setIsShoppingMode(false);
        }}
        uncompletedCount={uncompletedItems.length}
        totalCount={currentListItems.length}
        isShoppingMode={isShoppingMode}
        onToggleShoppingMode={() => {
          setIsShoppingMode((m) => {
            const next = !m;
            if (next) setActiveTab('shopping');
            else setActiveTab('list');
            return next;
          });
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        isSyncing={isSyncing}
      />

      {/* Supabase Setup Alert Banner (shown only if table is not created yet) */}
      {supabaseTableMissing && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-medium border-b border-amber-600">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-stone-950" />
              <span>
                <strong>Action Needed on Supabase:</strong> The shared family database table has not been created yet in your Supabase project.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="px-3 py-1 bg-stone-950 text-white rounded font-semibold text-xs whitespace-nowrap hover:bg-stone-800 transition-colors self-start sm:self-auto"
            >
              View 1-Click Setup Instructions
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Shopping Mode Full View */}
        {isShoppingMode ? (
          <ShoppingModeView
            items={currentListItems}
            onToggleComplete={handleToggleComplete}
            onExitShoppingMode={() => {
              setIsShoppingMode(false);
              setActiveTab('list');
            }}
            onClearCompleted={handleClearCompleted}
          />
        ) : activeTab === 'staples' ? (
          <PantryStaplesSection
            currentItems={currentListItems}
            onAddStaple={handleAddStaple}
            onBackToList={() => setActiveTab('list')}
          />
        ) : activeTab === 'forget-check' ? (
          <DidYouForgetSection
            currentItems={currentListItems}
            onQuickAdd={(item) =>
              handleAddItem({
                name: item.name,
                note: item.note,
                category: item.category,
                quantity: 1,
                isUrgent: true,
              })
            }
            onProceedToShopping={() => {
              setIsShoppingMode(true);
              setActiveTab('shopping');
            }}
          />
        ) : (
          /* Standard List Management View */
          <div className="space-y-6">
            {/* Hero Visual Card with High-Res Grocery Image and List Switcher */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Left Narrative & Controls */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      <span>
                        {currentUser
                          ? `Family Member: ${currentUserName} is active`
                          : 'Shared Family Grocery List'}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
                      Never forget an item at the supermarket again.
                    </h1>

                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                      Anyone in the family can add items from home or work. On shopping day, items are neatly organized by supermarket aisle with your notes.
                    </p>
                  </div>

                  {/* Multi-List Selector Strip */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                        Current List
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingList((c) => !c)}
                        className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New List</span>
                      </button>
                    </div>

                    {isCreatingList ? (
                      <form onSubmit={handleCreateList} className="flex gap-2 mb-3 animate-in fade-in">
                        <input
                          type="text"
                          required
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder="e.g. Farmers Market, Trader Joe's..."
                          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingList(false)}
                          className="px-2 py-1.5 text-xs text-stone-500"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : null}

                    {/* Clean Segmented List Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {lists.map((list) => {
                        const count = items.filter((i) => i.listId === list.id && !i.completed).length;
                        const isActive = list.id === activeListId;

                        return (
                          <button
                            key={list.id}
                            type="button"
                            onClick={() => setActiveListId(list.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-stone-900 text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            }`}
                          >
                            <span>{list.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                                isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Image Canvas */}
                <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full bg-stone-100">
                  <img
                    src="/src/assets/images/grocery_fresh_market_1792598902321.jpg"
                    alt="Fresh organic grocery herbs, artisanal bread, and eggs"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute bottom-3 left-4 right-4 text-white lg:hidden">
                    <p className="text-xs font-medium">Shared Family Sync Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Work Area: 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Main Column: Add Item & Active Grocery List (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Frictionless Add Item Bar with Note and Auto-Category */}
                <AddItemBar onAddItem={handleAddItem} />

                {/* Search & Filter Toolbar */}
                <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items or notes..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50/60 focus:outline-none focus:border-emerald-700 placeholder:text-stone-400"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-2 text-[10px] text-stone-400 hover:text-stone-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Aisle Filter */}
                    <div className="relative">
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value as CategoryId | 'all')}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none font-medium"
                      >
                        <option value="all">All Aisles</option>
                        {Object.values(CATEGORIES).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.aisleName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none font-medium"
                      >
                        <option value="aisle">Sort: Aisle Order</option>
                        <option value="urgent">Sort: Must Haves First</option>
                        <option value="recent">Sort: Recently Added</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Active Items Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">
                        To Buy ({uncompletedItems.length})
                      </h3>
                      {urgentCount > 0 && (
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {urgentCount} must-have{urgentCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {notesCount > 0 && (
                      <span className="text-xs text-stone-500 font-mono">
                        {notesCount} item{notesCount > 1 ? 's have' : ' has'} notes
                      </span>
                    )}
                  </div>

                  {displayUncompleted.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-800">
                          {searchQuery || selectedCategoryFilter !== 'all'
                            ? 'No items match your filter'
                            : 'All caught up! No items to buy.'}
                        </h4>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                          {searchQuery || selectedCategoryFilter !== 'all'
                            ? 'Try clearing the search query or aisle filter.'
                            : 'Add items you need or tap "Pantry Staples" to stock up on essentials.'}
                        </p>
                      </div>
                      {!searchQuery && selectedCategoryFilter === 'all' && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('staples')}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Browse Staples</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {displayUncompleted.map((item) => (
                        <GroceryItemCard
                          key={item.id}
                          item={item}
                          onToggleComplete={handleToggleComplete}
                          onDeleteItem={handleDeleteItem}
                          onUpdateNote={handleUpdateNote}
                          onToggleUrgent={handleToggleUrgent}
                          onEditDetails={(it) => setEditingItem(it)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed / In Cart Section */}
                {completedItems.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        In Cart ({completedItems.length})
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRestoreCompleted}
                          className="text-xs text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1"
                          title="Uncheck all completed items"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Uncheck All</span>
                        </button>
                        <span className="text-stone-300">·</span>
                        <button
                          type="button"
                          onClick={handleClearCompleted}
                          className="text-xs text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear Completed</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {completedItems.map((item) => (
                        <GroceryItemCard
                          key={item.id}
                          item={item}
                          onToggleComplete={handleToggleComplete}
                          onDeleteItem={handleDeleteItem}
                          onUpdateNote={handleUpdateNote}
                          onToggleUrgent={handleToggleUrgent}
                          onEditDetails={(it) => setEditingItem(it)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Companion Column (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Family Accounts Status Card */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Users className="w-4 h-4 text-emerald-800" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Family Sync (Supabase)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSetupModalOpen(true)}
                      className="text-[11px] text-emerald-800 hover:underline font-semibold"
                    >
                      Setup Guide
                    </button>
                  </div>

                  {currentUser ? (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-950 truncate">
                          Signed in as {currentUserName}
                        </p>
                        <p className="text-[11px] text-emerald-800 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-xs px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 rounded font-medium hover:bg-emerald-100/50"
                      >
                        Switch
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Sign in as Dad, Mom, or Kid so the app knows who added each item and updates automatically for everyone.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Sign In / Create Account</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* In-Store Mode CTA Card */}
                <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      In-Store Helper
                    </span>
                    <ShoppingBag className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Heading to the store?
                    </h4>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      Launch In-Store Mode for giant checkboxes, supermarket aisle sequence, and screen wake lock so your phone won’t sleep in the cart.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsShoppingMode(true);
                      setActiveTab('shopping');
                    }}
                    disabled={currentListItems.length === 0}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Start Shopping Mode</span>
                  </button>
                </div>

                {/* Pre-Trip Checklist Callout */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Prevent Forgotten Essentials
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    Check commonly forgotten cooking basics (Garlic, Eggs, Butter, Spices, Paper towels) before you leave.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forget-check')}
                    className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>Run Pre-Trip Checklist</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Fast Staples Quick-Add Strip */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Frequent Staples
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('staples')}
                      className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <p className="text-xs text-stone-500">
                    Tap to quickly re-add items you regularly buy:
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {['Fresh Milk', 'Large Farm Eggs', 'Bananas', 'Garlic Bulbs', 'Sourdough Bread', 'Avocados'].map(
                      (name) => {
                        const exists = uncompletedItems.some(
                          (i) => i.name.toLowerCase().trim() === name.toLowerCase().trim()
                        );
                        return (
                          <button
                            key={name}
                            type="button"
                            disabled={exists}
                            onClick={() =>
                              handleAddItem({
                                name,
                                category: name.includes('Milk') || name.includes('Eggs') ? 'dairy' : name.includes('Bread') ? 'bakery' : 'produce',
                                quantity: 1,
                                isUrgent: false,
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                              exists
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            }`}
                          >
                            {exists ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Plus className="w-3 h-3" />}
                            <span>{name}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Share / Export Utility Card */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-stone-900">
                      Share or Print List
                    </h5>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Send to family via WhatsApp or print out.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors"
                    title="Share list"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Touch Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-1.5 grid grid-cols-4 items-center gap-1">
        <button
          type="button"
          onClick={() => {
            setIsShoppingMode(false);
            setActiveTab('list');
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors min-h-[44px] ${
            activeTab === 'list' && !isShoppingMode
              ? 'text-emerald-800 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">List</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsShoppingMode(true);
            setActiveTab('shopping');
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors min-h-[44px] ${
            isShoppingMode
              ? 'text-emerald-800 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Shop Mode</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsShoppingMode(false);
            setActiveTab('staples');
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors min-h-[44px] ${
            activeTab === 'staples'
              ? 'text-emerald-800 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Staples</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsAuthModalOpen(true);
          }}
          className="flex flex-col items-center justify-center py-1 rounded-lg transition-colors min-h-[44px] text-stone-500 hover:text-stone-900"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">
            {currentUserName ? currentUserName : 'Family'}
          </span>
        </button>
      </nav>

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEditedItem}
        />
      )}

      {/* Share / Export Modal */}
      <ShareListModal
        listName={currentList.name}
        items={currentListItems}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onImportItems={(imported) => {
          setItems((prev) => {
            const others = prev.filter((i) => i.listId !== activeListId);
            const tagged = imported.map((it) => ({
              ...it,
              id: it.id || 'imp_' + Math.random().toString(36).substring(2, 7),
              listId: activeListId,
            }));
            return [...others, ...tagged];
          });
        }}
      />

      {/* Family Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthStateChange={() => {
          supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
          loadRemoteData();
        }}
        onOpenSetupGuide={() => setIsSetupModalOpen(true)}
      />

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onConnectionSuccess={() => {
          setSupabaseTableMissing(false);
          loadRemoteData();
        }}
      />
    </div>
  );
}
