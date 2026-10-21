import React, { useState, useRef, useEffect } from 'react';
import { Plus, StickyNote, Star, ChevronDown, Check } from 'lucide-react';
import { CategoryId, CATEGORIES, COMMON_UNITS, FREQUENT_STAPLES } from '../types/grocery';
import { predictCategory } from '../utils/storage';

interface AddItemBarProps {
  onAddItem: (item: {
    name: string;
    note?: string;
    category: CategoryId;
    quantity: number;
    unit?: string;
    isUrgent: boolean;
  }) => void;
}

export const AddItemBar: React.FC<AddItemBarProps> = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [category, setCategory] = useState<CategoryId>('produce');
  const [hasManuallySelectedCategory, setHasManuallySelectedCategory] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof FREQUENT_STAPLES>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-predict category as user types unless manually chosen
  const handleNameChange = (val: string) => {
    setName(val);
    if (!hasManuallySelectedCategory && val.trim().length > 1) {
      const predicted = predictCategory(val);
      setCategory(predicted);
    }

    if (val.trim().length >= 2) {
      const filtered = FREQUENT_STAPLES.filter((s) =>
        s.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 4);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (s: (typeof FREQUENT_STAPLES)[0]) => {
    setName(s.name);
    setCategory(s.category);
    if (s.defaultUnit) setUnit(s.defaultUnit);
    if (s.defaultNote) {
      setNote(s.defaultNote);
      setIsNoteOpen(true);
    }
    setHasManuallySelectedCategory(true);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      note: note.trim() ? note.trim() : undefined,
      category,
      quantity: Math.max(1, quantity),
      unit: unit || undefined,
      isUrgent,
    });

    // Reset form
    setName('');
    setNote('');
    setIsNoteOpen(false);
    setQuantity(1);
    setUnit('');
    setIsUrgent(false);
    setHasManuallySelectedCategory(false);
    setShowSuggestions(false);

    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="bg-white border border-stone-200 rounded-xl shadow-xs p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Main Item Name Input with Auto-Suggestions */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (name.trim().length >= 2 && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Add needed grocery item... (e.g. Oat Milk, Lemons, Pasta)"
              className="w-full text-base sm:text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 placeholder:text-stone-400 bg-stone-50/50"
            />

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg z-30 overflow-hidden divide-y divide-stone-100">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-50 flex items-center justify-between transition-colors text-xs"
                  >
                    <span className="font-medium text-stone-900">{s.name}</span>
                    <span className="text-stone-500 text-[11px] font-mono">
                      {CATEGORIES[s.category]?.aisleName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity and Unit Stepper */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-200/60 font-semibold text-sm transition-colors"
                title="Decrease quantity"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 text-center text-xs font-mono tabular-nums font-semibold focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-9 flex items-center justify-center text-stone-600 hover:bg-stone-200/60 font-semibold text-sm transition-colors"
                title="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="relative">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-9 px-2.5 pr-7 text-xs rounded-lg border border-stone-300 bg-stone-50/50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 appearance-none"
              >
                <option value="">Unit (opt)</option>
                {COMMON_UNITS.filter(Boolean).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-3 pointer-events-none" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-9 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 disabled:hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Secondary controls row: Category, Note trigger, and Urgent priority */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Selector */}
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Aisle:</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategoryId);
                  setHasManuallySelectedCategory(true);
                }}
                className="h-7 px-2 text-xs rounded-md border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:border-emerald-700 font-medium"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.aisleName}
                  </option>
                ))}
              </select>
            </div>

            {/* Note expansion toggle */}
            <button
              type="button"
              onClick={() => setIsNoteOpen((prev) => !prev)}
              className={`h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-colors ${
                isNoteOpen || note.trim()
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 font-medium'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>{note.trim() ? 'Note Attached' : '+ Add Note'}</span>
            </button>

            {/* Must-Have / Urgent toggle */}
            <button
              type="button"
              onClick={() => setIsUrgent((prev) => !prev)}
              className={`h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-colors ${
                isUrgent
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 font-medium'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
              title="Mark as must-have / high priority"
            >
              <Star className={`w-3.5 h-3.5 ${isUrgent ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isUrgent ? 'Must Have' : 'Normal'}</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-400 hidden md:inline">
            Press <kbd className="px-1 py-0.5 bg-stone-100 rounded text-[10px] font-mono border border-stone-200">Enter</kbd> to add
          </span>
        </div>

        {/* Expandable Note Field */}
        {isNoteOpen && (
          <div className="pt-2 animate-in fade-in duration-150">
            <div className="relative">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note: brand preference, aisle location, specific size, or 'only if under $5'..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/40 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              {note.trim() && (
                <button
                  type="button"
                  onClick={() => setNote('')}
                  className="absolute right-2.5 top-2 text-[10px] text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
