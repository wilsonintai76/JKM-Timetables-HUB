import React, { useState } from 'react';
import { SavedDraft } from '../types';
import { Bookmark, Trash2, Clock, Check, Plus, FolderDown, X, Layers } from 'lucide-react';

interface SavedSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDraft: {
    baseSection: string;
    repeatCourses: string[];
    selectedAddons: Record<string, string>;
  };
  onLoadDraft: (draft: SavedDraft) => void;
}

export const SavedSchedulesModal: React.FC<SavedSchedulesModalProps> = ({
  isOpen,
  onClose,
  currentDraft,
  onLoadDraft
}) => {
  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try {
      const saved = localStorage.getItem('jkm_saved_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState('');

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!newTitle.trim()) return;

    const newDraft: SavedDraft = {
      id: `draft_${Date.now()}`,
      title: newTitle.trim(),
      timestamp: new Date().toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' }),
      baseSection: currentDraft.baseSection,
      repeatCourses: currentDraft.repeatCourses,
      selectedAddons: currentDraft.selectedAddons
    };

    const updated = [newDraft, ...drafts];
    setDrafts(updated);
    localStorage.setItem('jkm_saved_drafts', JSON.stringify(updated));
    setNewTitle('');
  };

  const handleDelete = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('jkm_saved_drafts', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 no-print">
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-cyan-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Saved Schedule Drafts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-900 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SAVE CURRENT DRAFT FORM */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
          <label className="block text-[11px] font-extrabold text-slate-700">
            Save Current Timetable Combination
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. Plan A - Morning Drawing Slot"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
            />
            <button
              onClick={handleSaveCurrent}
              disabled={!newTitle.trim()}
              className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-black flex items-center space-x-1 shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* SAVED DRAFTS LIST */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {drafts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 font-medium">
              No saved drafts yet. Save your favorite section combinations above to compare later!
            </p>
          ) : (
            drafts.map(draft => (
              <div
                key={draft.id}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 flex items-center justify-between space-x-3 transition shadow-sm"
              >
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-slate-900">{draft.title}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-600 font-bold">
                    <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-mono">
                      Base: {draft.baseSection}
                    </span>
                    <span>•</span>
                    <span>{draft.repeatCourses.length} repeat courses</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{draft.timestamp}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onLoadDraft(draft);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 text-xs font-black transition shadow-sm active:scale-95"
                  >
                    Load Draft
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
