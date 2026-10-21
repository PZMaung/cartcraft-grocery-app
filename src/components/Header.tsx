import React from 'react';
import { ShoppingBag, Sparkles, CheckCheck, Users, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: 'list' | 'shopping' | 'staples' | 'forget-check';
  setActiveTab: (tab: 'list' | 'shopping' | 'staples' | 'forget-check') => void;
  uncompletedCount: number;
  totalCount: number;
  isShoppingMode: boolean;
  onToggleShoppingMode: () => void;
  currentUser: any;
  onOpenAuthModal: () => void;
  onOpenSetupModal: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  uncompletedCount,
  totalCount,
  isShoppingMode,
  onToggleShoppingMode,
  currentUser,
  onOpenAuthModal,
  onOpenSetupModal,
  isSyncing,
}) => {
  const userDisplayName =
    currentUser?.user_metadata?.display_name ||
    currentUser?.email?.split('@')[0] ||
    null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900">
            CartCraft
          </span>
          <span className="hidden md:inline text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 font-semibold px-2 py-0.5 rounded-full">
            Family Sync
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'list' && !isShoppingMode
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            My Grocery List
            {uncompletedCount > 0 && (
              <span className="ml-1.5 text-xs text-stone-500 font-mono tabular-nums">
                ({uncompletedCount})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staples')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'staples'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pantry Staples</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('forget-check')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'forget-check'
                ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                : 'hover:text-stone-900'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pre-Trip Checklist</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Family Account + Start Shopping) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Supabase Setup guide shortcut */}
          <button
            type="button"
            onClick={onOpenSetupModal}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors"
            title="Supabase Database Setup Instructions"
          >
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>Supabase Setup</span>
          </button>

          {/* Family Account Button */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              userDisplayName
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
            }`}
            title="Family Account Login / Switch"
          >
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span className="max-w-[90px] truncate">
              {userDisplayName ? userDisplayName : 'Family Sign In'}
            </span>
          </button>

          {/* Start Shopping CTA */}
          <button
            type="button"
            onClick={onToggleShoppingMode}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isShoppingMode
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {isShoppingMode ? 'Exit Shopping' : 'Start Shopping'}
            </span>
            {totalCount > 0 && !isShoppingMode && (
              <span className="text-[11px] bg-emerald-950/40 px-1.5 py-0.2 rounded font-mono tabular-nums">
                {uncompletedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
