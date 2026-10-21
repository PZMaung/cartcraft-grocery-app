import React, { useState } from 'react';
import { X, Check, Star } from 'lucide-react';
import { GroceryItem, CategoryId, CATEGORIES, COMMON_UNITS } from '../types/grocery';

interface EditItemModalProps {
  item: GroceryItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: GroceryItem) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(item.name);
  const [note, setNote] = useState(item.note || '');
  const [category, setCategory] = useState<CategoryId>(item.category);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit || '');
  const [isUrgent, setIsUrgent] = useState(!!item.isUrgent);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...item,
      name: name.trim(),
      note: note.trim() ? note.trim() : undefined,
      category,
      quantity: Math.max(1, quantity),
      unit: unit || undefined,
      isUrgent,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900">
            Edit Grocery Item
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              placeholder="e.g. Oat Milk"
            />
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Optional Note
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Barista edition, get 2 if on sale, aisle 3 top shelf..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-amber-50/30"
            />
            <p className="text-[11px] text-stone-400 mt-0.5">
              Helps you remember exact brand, discount thresholds, or store aisle notes.
            </p>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-sm font-mono tabular-nums px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Unit (optional)
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-white"
              >
                <option value="">No unit (count)</option>
                {COMMON_UNITS.filter(Boolean).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category / Aisle */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Supermarket Aisle / Department
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-emerald-700 bg-white"
            >
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.aisleName} ({cat.name})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsUrgent((v) => !v)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-colors ${
                isUrgent
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Star className={`w-4 h-4 ${isUrgent ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isUrgent ? 'Marked as Must-Have / Priority' : 'Normal Priority'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
