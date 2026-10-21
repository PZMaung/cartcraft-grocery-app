import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Users,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../utils/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onAuthStateChange: () => void;
  onOpenSetupGuide: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthStateChange,
  onOpenSetupGuide,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rolePreset, setRolePreset] = useState<'Dad' | 'Mom' | 'Kid' | 'Other'>('Dad');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentDisplayName =
    currentUser?.user_metadata?.display_name ||
    currentUser?.email?.split('@')[0] ||
    'Family Member';

  const handlePresetSelect = (preset: 'Dad' | 'Mom' | 'Kid') => {
    setRolePreset(preset);
    setDisplayName(preset);
    if (!email || email.includes('@family.com') || email.includes('@example.com')) {
      setEmail(`${preset.toLowerCase()}@family.com`);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              display_name: displayName.trim() || rolePreset,
              family_role: rolePreset,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          setSuccessMsg(`Welcome, ${displayName.trim() || rolePreset}! Account created and signed in.`);
          onAuthStateChange();
          setTimeout(() => onClose(), 1200);
        } else if (data.user) {
          // If email confirmation is enabled in Supabase
          setSuccessMsg(
            `Account created! If email confirmation is enabled in Supabase, please verify or disable 'Confirm email' in Supabase Auth settings.`
          );
          onAuthStateChange();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Signed in successfully!');
          onAuthStateChange();
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    onAuthStateChange();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {currentUser ? 'Family Account' : 'Family Member Sign In'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Shared list synced via Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {currentUser ? (
            /* Logged In State */
            <div className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center shrink-0">
                  {currentDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {currentDisplayName}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Signed In
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ New items will be tagged as added by {currentDisplayName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-stone-500" />
                  <span>Switch Account / Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSetupGuide();
                  }}
                  className="text-xs text-stone-500 hover:text-emerald-800 underline text-center py-1"
                >
                  View Supabase Database Instructions
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Login / Sign Up) */
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {/* Family Preset Quick Pickers */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Who is using this device right now?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Dad', 'Mom', 'Kid'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        rolePreset === preset
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{preset}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode switch (Login vs Sign Up) */}
              <div className="flex border-b border-stone-200 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-colors ${
                    mode === 'login'
                      ? 'border-emerald-800 text-emerald-800'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-colors ${
                    mode === 'signup'
                      ? 'border-emerald-800 text-emerald-800'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dad, Mom, Sarah"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dad@family.com or personal email"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Messages */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Family Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSetupGuide();
                  }}
                  className="text-[11px] text-stone-500 hover:text-emerald-800 underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>How to create the 3 user accounts on Supabase</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
