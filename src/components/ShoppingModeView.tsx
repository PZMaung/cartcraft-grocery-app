import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  CheckCircle2,
  StickyNote,
  Sun,
  SunMedium,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import { GroceryItem, CATEGORIES, CategoryId } from '../types/grocery';
import { requestScreenWakeLock, releaseScreenWakeLock, triggerHaptic } from '../utils/storage';

interface ShoppingModeViewProps {
  items: GroceryItem[];
  onToggleComplete: (id: string) => void;
  onExitShoppingMode: () => void;
  onClearCompleted: () => void;
}

export const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  items,
  onToggleComplete,
  onExitShoppingMode,
  onClearCompleted,
}) => {
  const [filter, setFilter] = useState<'needed' | 'cart' | 'all'>('needed');
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const remainingCount = totalCount - completedCount;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Screen wake lock
  useEffect(() => {
    let active = true;
    requestScreenWakeLock().then((success) => {
      if (active) setWakeLockActive(success);
    });
    return () => {
      active = false;
      releaseScreenWakeLock();
    };
  }, []);

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      await releaseScreenWakeLock();
      setWakeLockActive(false);
    } else {
      const ok = await requestScreenWakeLock();
      setWakeLockActive(ok);
    }
  };

  // Trigger celebration when 100% done
  useEffect(() => {
    if (totalCount > 0 && remainingCount === 0 && !hasCelebrated) {
      setHasCelebrated(true);
      triggerHaptic('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#047857', '#059669', '#10b981', '#34d399', '#f59e0b'],
      });
    } else if (remainingCount > 0) {
      setHasCelebrated(false);
    }
  }, [totalCount, remainingCount, hasCelebrated]);

  // Group items by category / aisle order
  const filteredItems = items.filter((item) => {
    if (filter === 'needed') return !item.completed;
    if (filter === 'cart') return item.completed;
    return true;
  });

  // Sort by aisle number first, then completion state
  const sortedCategories = Object.keys(CATEGORIES)
    .map((k) => CATEGORIES[k as CategoryId])
    .sort((a, b) => a.aisleNumber - b.aisleNumber);

  const aisleGroups = sortedCategories
    .map((cat) => {
      const catItems = filteredItems.filter((i) => i.category === cat.id);
      return {
        category: cat,
        items: catItems,
      };
    })
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Top Shopping HUD (Sticky on mobile for instant visibility) */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExitShoppingMode}
              className="p-1.5 -ml-1 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Exit In-Store Mode"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                In-Store Shopping Walk
              </h2>
              <p className="text-xs text-stone-400">
                Sorted by supermarket aisle order
              </p>
            </div>
          </div>

          {/* Screen Wake Lock Button */}
          <button
            type="button"
            onClick={toggleWakeLock}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              wakeLockActive
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
            }`}
            title="Keeps your phone screen awake while shopping"
          >
            {wakeLockActive ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <SunMedium className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {wakeLockActive ? 'Screen Awake' : 'Keep Screen On'}
            </span>
          </button>
        </div>

        {/* Progress Bar & Numeric Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-300">
              <span className="text-white font-bold tabular-nums text-sm">{completedCount}</span> of{' '}
              <span className="text-stone-300 tabular-nums">{totalCount}</span> items in cart
            </span>
            <span className="text-emerald-400 font-bold tabular-nums text-sm">{percentage}%</span>
          </div>

          <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-stone-800">
          <button
            type="button"
            onClick={() => setFilter('needed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'needed'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            To Pick ({remainingCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('cart')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'cart'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            In Cart ({completedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === 'all'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            All Items ({totalCount})
          </button>
        </div>
      </div>

      {/* Completion Banner if all items picked */}
      {totalCount > 0 && remainingCount === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">
              You picked everything on your list!
            </h3>
            <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
              Nothing was forgotten today. Head to the checkout with confidence!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClearCompleted}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Clear Checked Items
            </button>
            <button
              type="button"
              onClick={onExitShoppingMode}
              className="px-4 py-2 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 text-xs font-medium rounded-lg transition-colors"
            >
              Exit Shopping Mode
            </button>
          </div>
        </div>
      )}

      {/* Aisle by Aisle Grocery Rows */}
      {aisleGroups.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-2">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700">No items in this view</p>
          <p className="text-xs text-stone-500">
            {filter === 'needed' ? 'All needed items have been placed in your cart!' : 'No items match your filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {aisleGroups.map(({ category, items: groupItems }) => (
            <div
              key={category.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Aisle Header */}
              <div className="px-4 py-2.5 bg-stone-50/80 border-b border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">
                    {category.aisleName}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    ({category.name})
                  </span>
                </div>
                <span className="text-xs font-mono text-stone-500 tabular-nums">
                  {groupItems.filter((i) => i.completed).length}/{groupItems.length} picked
                </span>
              </div>

              {/* Items in this Aisle */}
              <div className="divide-y divide-stone-100">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      triggerHaptic('light');
                      onToggleComplete(item.id);
                    }}
                    className={`px-4 py-3.5 flex items-start gap-3 cursor-pointer select-none transition-colors ${
                      item.completed
                        ? 'bg-stone-50/70 hover:bg-stone-100/60'
                        : 'hover:bg-emerald-50/30'
                    }`}
                  >
                    {/* Big Touch Hitbox Checkbox (min 48px) */}
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                          item.completed
                            ? 'bg-emerald-700 border-emerald-700 text-white'
                            : 'border-stone-300 bg-white hover:border-emerald-600'
                        }`}
                      >
                        {item.completed && <Check className="w-5 h-5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Item Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-base font-semibold leading-snug break-words ${
                            item.completed ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}
                        >
                          {item.name}
                        </span>

                        {(item.quantity > 1 || item.unit) && (
                          <span
                            className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded-md font-semibold ${
                              item.completed
                                ? 'bg-stone-200/60 text-stone-500'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {item.quantity} {item.unit || ''}
                          </span>
                        )}

                        {item.isUrgent && !item.completed && (
                          <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Must-Have
                          </span>
                        )}

                        {item.userName && !item.completed && (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            For {item.userName}
                          </span>
                        )}
                      </div>

                      {/* Display Note Prominently */}
                      {item.note && (
                        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/90 border border-amber-200/70 rounded-md px-2 py-1 max-w-xl">
                          <StickyNote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{item.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
