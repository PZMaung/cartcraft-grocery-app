import React, { useState } from 'react';
import { X, Copy, Check, Printer, Download, Upload } from 'lucide-react';
import { GroceryItem } from '../types/grocery';
import { formatListForSharing } from '../utils/storage';

interface ShareListModalProps {
  listName: string;
  items: GroceryItem[];
  isOpen: boolean;
  onClose: () => void;
  onImportItems: (items: GroceryItem[]) => void;
}

export const ShareListModal: React.FC<ShareListModalProps> = ({
  listName,
  items,
  isOpen,
  onClose,
  onImportItems,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [showImport, setShowImport] = useState(false);

  if (!isOpen) return null;

  const formattedShareText = formatListForSharing(listName, items);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cartcraft_${listName.toLowerCase().replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        onImportItems(parsed);
        setShowImport(false);
        setImportText('');
        onClose();
      } else {
        setImportError('Invalid JSON format: expected an array of items.');
      }
    } catch {
      setImportError('Failed to parse JSON. Please check syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900">
            Share or Export Grocery List
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Copy for WhatsApp / SMS / Notes
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={7}
                value={formattedShareText}
                className="w-full text-xs font-mono p-3 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Quick utility triggers */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print List</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImport((s) => !s)}
              className="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Import JSON</span>
            </button>
          </div>

          {showImport && (
            <div className="pt-2 border-t border-stone-100 space-y-2 animate-in fade-in">
              <label className="block text-xs font-semibold text-stone-700">
                Paste JSON Array of Items
              </label>
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"id":"1", "name":"Milk", "category":"dairy", "completed":false, ...}]'
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-200 bg-stone-50"
              />
              {importError && (
                <p className="text-xs text-rose-600 font-medium">{importError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-3 py-1.5 text-xs text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-md text-xs font-medium"
                >
                  Confirm Import
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
