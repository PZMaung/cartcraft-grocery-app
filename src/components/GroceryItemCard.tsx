import React, { useState } from 'react';
import {
  Check,
  StickyNote,
  Trash2,
  Star,
  Edit2,
  X,
  CheckCircle2,
  CornerDownRight,
} from 'lucide-react';
import { GroceryItem, CATEGORIES } from '../types/grocery';
import { triggerHaptic } from '../utils/storage';

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateNote: (id: string, note?: string) => void;
  onToggleUrgent: (id: string) => void;
  onEditDetails: (item: GroceryItem) => void;
}

export const GroceryItemCard: React.FC<GroceryItemCardProps> = ({
  item,
  onToggleComplete,
  onDeleteItem,
  onUpdateNote,
  onToggleUrgent,
  onEditDetails,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState(item.note || '');

  const category = CATEGORIES[item.category] || CATEGORIES.other;

  const handleCheck = () => {
    triggerHaptic('light');
    onToggleComplete(item.id);
  };

  const handleSaveNote = () => {
    onUpdateNote(item.id, tempNote.trim() ? tempNote.trim() : undefined);
    setIsEditingNote(false);
  };

  const handleCancelNote = () => {
    setTempNote(item.note || '');
    setIsEditingNote(false);
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 ${
        item.completed
          ? 'bg-stone-50/70 border-stone-200/80 opacity-75'
          : item.isUrgent
          ? 'bg-white border-rose-200 shadow-xs'
          : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
      }`}
    >
      <div className="p-3 sm:p-4 flex items-start gap-3">
        {/* Large Hitbox Accessible Checkbox (min 44px) */}
        <button
          type="button"
          onClick={handleCheck}
          aria-label={item.completed ? `Mark ${item.name} as needed` : `Check ${item.name} off as picked`}
          className="min-h-[44px] min-w-[44px] -ml-2 -mt-1.5 flex items-center justify-center shrink-0 rounded-lg hover:bg-stone-100/70 active:scale-95 transition-transform"
        >
          <div
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
              item.completed
                ? 'bg-emerald-700 border-emerald-700 text-white'
                : 'border-stone-300 hover:border-emerald-600 bg-white'
            }`}
          >
            {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
        </button>

        {/* Center Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm sm:text-base font-semibold leading-snug break-words ${
                    item.completed ? 'line-through text-stone-400' : 'text-stone-900'
                  }`}
                >
                  {item.name}
                </span>

                {/* Quantity and Unit badge */}
                {(item.quantity > 1 || item.unit) && (
                  <span
                    className={`inline-flex items-center text-xs font-mono tabular-nums px-2 py-0.5 rounded-md ${
                      item.completed
                        ? 'bg-stone-200/60 text-stone-500'
                        : 'bg-stone-100 text-stone-700 font-semibold'
                    }`}
                  >
                    {item.quantity} {item.unit || ''}
                  </span>
                )}

                {/* Urgent indicator */}
                {item.isUrgent && !item.completed && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                    <Star className="w-3 h-3 fill-rose-600 text-rose-600" />
                    <span>Must Have</span>
                  </span>
                )}
              </div>

              {/* Aisle & Category Metadata */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5 flex-wrap">
                <span className="font-medium text-stone-600">{category.aisleName}</span>
                {item.userName && (
                  <>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                      Added by {item.userName}
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-[11px] text-stone-400">
                  {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Quick Actions (Always visible or easy touch on mobile) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onToggleUrgent(item.id)}
                className={`p-1.5 rounded-md hover:bg-stone-100 transition-colors ${
                  item.isUrgent ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'
                }`}
                title={item.isUrgent ? 'Remove priority' : 'Mark as must have'}
              >
                <Star className={`w-4 h-4 ${item.isUrgent ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => onEditDetails(item)}
                className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                title="Edit details"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Note Section */}
          <div className="mt-2.5">
            {isEditingNote ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-100">
                <input
                  type="text"
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNote();
                    if (e.key === 'Escape') handleCancelNote();
                  }}
                  autoFocus
                  placeholder="Optional note: brand, size, flavor, substitute..."
                  className="flex-1 text-xs px-2.5 py-1.5 rounded border border-amber-300 bg-amber-50/60 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="p-1.5 bg-emerald-800 text-white rounded hover:bg-emerald-900 transition-colors"
                  title="Save note"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelNote}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : item.note ? (
              <div
                onClick={() => setIsEditingNote(true)}
                className="group/note cursor-pointer inline-flex items-start gap-1.5 py-1 px-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 hover:bg-amber-100/70 transition-colors max-w-full"
                title="Click to edit note"
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-xs text-amber-900 font-medium leading-relaxed break-words">
                  {item.note}
                </span>
                <span className="text-[10px] text-amber-600/70 opacity-0 group-hover/note:opacity-100 transition-opacity ml-1 shrink-0">
                  Edit
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingNote(true)}
                className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors py-0.5"
              >
                <CornerDownRight className="w-3 h-3 text-stone-300" />
                <span>+ Add note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
