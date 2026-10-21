import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Database,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { SUPABASE_SQL_SETUP, supabase } from '../utils/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess?: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onConnectionSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'success' | 'table-missing' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    setStatusMessage('');

    try {
      const { data, error } = await supabase.from('grocery_items').select('id').limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('relation "public.grocery_items" does not exist')) {
          setConnectionStatus('table-missing');
          setStatusMessage(
            'Connected to Supabase, but the "grocery_items" table does not exist yet. Please copy the SQL below and run it in your Supabase SQL Editor.'
          );
        } else {
          setConnectionStatus('error');
          setStatusMessage(error.message);
        }
      } else {
        setConnectionStatus('success');
        setStatusMessage(
          'Successfully connected to Supabase! The "grocery_items" table is active and ready for your family.'
        );
        if (onConnectionSuccess) onConnectionSuccess();
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(err.message || 'Connection failed.');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Supabase Setup Guide for Your Family App
              </h3>
              <p className="text-xs text-stone-500">
                3 simple steps to connect and enable 3 family accounts
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Connection Test Banner */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Supabase Project Status
                </span>
                {connectionStatus === 'success' && (
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready & Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5 font-mono">
                URL: https://jzrwgumssbkjygahoabd.supabase.co
              </p>
              {statusMessage && (
                <p
                  className={`text-xs mt-1.5 font-medium ${
                    connectionStatus === 'success'
                      ? 'text-emerald-700'
                      : 'text-amber-800'
                  }`}
                >
                  {statusMessage}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`}
              />
              <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Step 1 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Run the Database SQL Script
                </h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Open your{' '}
                  <a
                    href="https://supabase.com/dashboard/project/jzrwgumssbkjygahoabd/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 font-semibold underline inline-flex items-center gap-0.5"
                  >
                    Supabase SQL Editor <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  , paste the SQL script below, and click <strong>"Run"</strong>. This creates the shared grocery table and security policies so your family can read and add items.
                </p>
              </div>
            </div>

            {/* SQL Snippet box */}
            <div className="relative rounded-xl border border-stone-200 bg-stone-900 text-stone-100 p-3.5 font-mono text-[11px] overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400 text-[10px]">
                <span>grocery_items_schema.sql</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-sans text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre text-stone-300 leading-relaxed">
                {SUPABASE_SQL_SETUP}
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-900">
                Turn Off "Confirm email" in Supabase Auth
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                In your Supabase project dashboard, navigate to{' '}
                <a
                  href="https://supabase.com/dashboard/project/jzrwgumssbkjygahoabd/auth/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-800 font-semibold underline inline-flex items-center gap-0.5"
                >
                  Authentication &gt; Providers &gt; Email{' '}
                  <ExternalLink className="w-3 h-3 inline" />
                </a>{' '}
                and toggle off <strong>"Confirm email"</strong>. This allows family members to sign in immediately without needing external email verification.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-stone-900">
                Create the 3 Family Accounts
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                You have two super easy ways to create the 3 family accounts:
              </p>
              <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                <li>
                  <strong>Option A (Directly in this app):</strong> Click <em>"Family Account"</em> in the top header, pick <em>"Dad"</em>, <em>"Mom"</em>, or <em>"Kid"</em> (or type any email and password), and click <strong>Create Family Account</strong>.
                </li>
                <li>
                  <strong>Option B (In Supabase Dashboard):</strong> Go to{' '}
                  <a
                    href="https://supabase.com/dashboard/project/jzrwgumssbkjygahoabd/auth/users"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 font-semibold underline inline-flex items-center gap-0.5"
                  >
                    Authentication &gt; Users{' '}
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  and click <strong>"Add user"</strong> to create the 3 email/password accounts.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            All family members see live additions and updates
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
