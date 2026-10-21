import React from 'react';
import { AlertCircle, Plus, Check, ArrowRight } from 'lucide-react';
import { FORGOTTEN_CHECKLIST, CATEGORIES } from '../types/grocery';

interface DidYouForgetSectionProps {
  currentItems: { name: string; completed: boolean }[];
  onQuickAdd: (item: { name: string; note: string; category: any }) => void;
  onProceedToShopping: () => void;
}

export const DidYouForgetSection: React.FC<DidYouForgetSectionProps> = ({
  currentItems,
  onQuickAdd,
  onProceedToShopping,
}) => {
  const isItemPresent = (term: string) => {
    return currentItems.some((i) =>
      i.name.toLowerCase().includes(term.toLowerCase().split('/')[0].trim())
    );
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              Pre-Trip Checklist: "Did I Forget Anything?"
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            These are the most commonly forgotten items people realize they need only after coming back from the supermarket. Take 30 seconds to double check!
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToShopping}
          className="text-xs font-semibold px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <span>Ready to Shop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {FORGOTTEN_CHECKLIST.map((entry) => {
          const present = isItemPresent(entry.item);
          const cat = CATEGORIES[entry.category];

          return (
            <div
              key={entry.item}
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                present
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-stone-50/60 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-stone-900">
                    {entry.item}
                  </h4>
                  {present && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-medium">
                      Already on list
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {entry.reason}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Location: {cat?.aisleName || 'General'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!present) {
                    onQuickAdd({
                      name: entry.item.split('/')[0].trim(),
                      note: `Quick check: ${entry.reason}`,
                      category: entry.category,
                    });
                  }
                }}
                disabled={present}
                className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center shrink-0 transition-colors ${
                  present
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                }`}
                title={present ? 'Already on list' : 'Add to list'}
              >
                {present ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Need it</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
