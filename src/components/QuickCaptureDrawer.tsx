/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, Check, X, Sparkles, Pin } from 'lucide-react';

interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  timestamp: string;
}

interface QuickCaptureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncMasterNotes?: (text: string) => void;
}

const INITIAL_NOTES: QuickNote[] = [
  {
    id: 'qn1',
    title: 'Client Specification Check',
    content: 'Verify structural drawing tolerances for the upcoming commercial quotation before dispatch.',
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    pinned: true,
    timestamp: 'Today, 10:30 AM',
  },
  {
    id: 'qn2',
    title: 'Vendor Dispatch Follow-up',
    content: 'Confirm raw material delivery timeline with Logistics Head Devendra Rao.',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    pinned: false,
    timestamp: 'Today, 09:15 AM',
  },
];

export function QuickCaptureDrawer({ isOpen, onClose, onSyncMasterNotes }: QuickCaptureDrawerProps) {
  const [notes, setNotes] = useState<QuickNote[]>(INITIAL_NOTES);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-amber-50 border-amber-200 text-amber-900');

  if (!isOpen) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle && !newContent) return;

    const newNote: QuickNote = {
      id: 'qn_' + Date.now(),
      title: newTitle || 'Quick Capture',
      content: newContent,
      color: selectedColor,
      pinned: false,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setNewTitle('');
    setNewContent('');

    if (onSyncMasterNotes) {
      const summaryText = updated.map((n) => `• [${n.title}] ${n.content}`).join('\n');
      onSyncMasterNotes(summaryText);
    }
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-150 shadow-2xl z-50 flex flex-col font-sans animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="bg-[#FF9500] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Quick Capture Engine</h2>
            <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
              Google Keep Infrastructure • Executive Pad
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Input Note Form */}
      <form onSubmit={handleAddNote} className="p-4 bg-gray-50 border-b border-gray-150 space-y-3">
        <input
          type="text"
          placeholder="Note Title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF9500] transition shadow-xs"
        />
        <textarea
          rows={2}
          placeholder="Capture quick thought or reminder..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF9500] transition shadow-xs"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {[
              { label: 'Amber', class: 'bg-amber-50 border-amber-200 text-amber-900', bg: 'bg-amber-300' },
              { label: 'Blue', class: 'bg-blue-50 border-blue-200 text-blue-900', bg: 'bg-blue-300' },
              { label: 'Emerald', class: 'bg-emerald-50 border-emerald-200 text-emerald-900', bg: 'bg-emerald-300' },
              { label: 'Rose', class: 'bg-rose-50 border-rose-200 text-rose-900', bg: 'bg-rose-300' },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setSelectedColor(c.class)}
                className={`w-5 h-5 rounded-full ${c.bg} cursor-pointer transition ${
                  selectedColor === c.class ? 'ring-2 ring-offset-1 ring-[#FF9500]' : ''
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-[#FF9500] hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Save Note
          </button>
        </div>
      </form>

      {/* Note Cards List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-medium">
            No quick capture notes. Type a note above to instantly record ideas.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`p-3.5 rounded-2xl border ${note.color} space-y-1.5 shadow-xs relative group transition`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold leading-none">{note.title}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePin(note.id)}
                    className={`p-1 rounded cursor-pointer ${note.pinned ? 'text-[#FF9500]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs leading-relaxed font-medium opacity-90">{note.content}</p>

              <div className="text-[9px] font-mono text-gray-400 font-semibold pt-1">
                {note.timestamp}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-150 text-[10px] text-gray-500 font-medium text-center">
        💡 Keep notes sync automatically with Executive Pad in Business Memory
      </div>

    </div>
  );
}
