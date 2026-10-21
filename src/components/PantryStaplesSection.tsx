import React, { useState } from 'react';
import { Plus, Check, Sparkles, Search } from 'lucide-react';
import { FREQUENT_STAPLES, StapleItem, CATEGORIES, CategoryId } from '../types/grocery';

interface PantryStaplesSectionProps {
  currentItems: { name: string; completed: boolean }[];
  onAddStaple: (staple: StapleItem) => void;
  onBackToList: () => void;
}

export const PantryStaplesSection: React.FC<PantryStaplesSectionProps> = ({
  currentItems,
  onAddStaple,
  onBackToList,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  const isAlreadyOnList = (name: string) => {
    return currentItems.some(
      (item) => item.name.toLowerCase().trim() === name.toLowerCase().trim() && !item.completed
    );
  };

  const filteredStaples = FREQUENT_STAPLES.filter((staple) => {
    const matchesSearch = staple.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || staple.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              Pantry & Kitchen Staples
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Running low on common kitchen essentials? Tap once to append directly to your shopping list with recommended notes.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToList}
          className="text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
        >
          Back to List
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter staples (e.g. coffee, eggs, garlic)..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-200 bg-stone-50/50 focus:outline-none focus:border-emerald-700"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
          className="text-xs px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50/50 text-stone-700 focus:outline-none"
        >
          <option value="all">All Aisles</option>
          {Object.values(CATEGORIES).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Staples Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredStaples.map((staple) => {
          const onList = isAlreadyOnList(staple.name);
          const cat = CATEGORIES[staple.category];

          return (
            <div
              key={staple.name}
              className={`p-3.5 rounded-xl border transition-all ${
                onList
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-stone-900 truncate">
                    {staple.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {cat.aisleName}
                  </p>
                  {staple.defaultNote && (
                    <p className="text-[11px] text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded mt-1.5 line-clamp-1 border border-amber-200/50">
                      Note: {staple.defaultNote}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onAddStaple(staple)}
                  disabled={onList}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center shrink-0 transition-colors ${
                    onList
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                  title={onList ? 'Already on list' : 'Add to list'}
                >
                  {onList ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
