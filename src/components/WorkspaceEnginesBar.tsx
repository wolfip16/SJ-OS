/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Mail,
  Video,
  HardDrive,
  StickyNote,
  MessageSquare,
  FileSpreadsheet,
  Calendar,
  Users,
  FileText,
  CheckSquare,
  Database,
  Sparkles,
  Crown,
  Calculator,
} from 'lucide-react';

interface WorkspaceEnginesBarProps {
  onOpenMail: () => void;
  onOpenMeet: () => void;
  onOpenDrive: () => void;
  onOpenKeep: () => void;
  onOpenChat: () => void;
  onOpenSheets: () => void;
  onOpenCalendar: () => void;
  onOpenContacts: () => void;
  onOpenDocs: () => void;
  onOpenTasks?: () => void;
  onOpenFirebaseInfo: () => void;
  onOpenNotepad?: () => void;
  onOpenCalculator?: () => void;
  activePage?: string;
  onSelectPage?: (page: 'master' | 'contacts' | 'calendar' | 'history' | 'admin-deck') => void;
  isAdmin?: boolean;
}

export function WorkspaceEnginesBar({
  onOpenMail,
  onOpenMeet,
  onOpenDrive,
  onOpenKeep,
  onOpenChat,
  onOpenSheets,
  onOpenCalendar,
  onOpenContacts,
  onOpenDocs,
  onOpenTasks,
  onOpenFirebaseInfo,
  onOpenNotepad,
  onOpenCalculator,
  activePage = 'master',
  onSelectPage,
  isAdmin = false,
}: WorkspaceEnginesBarProps) {
  const engines = [
    {
      id: 'mail',
      name: 'Communication',
      googleEquivalent: 'Gmail',
      icon: Mail,
      color: 'bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white border-[#007AFF]/20',
      action: onOpenMail,
    },
    {
      id: 'meet',
      name: 'Meetings',
      googleEquivalent: 'Google Meet',
      icon: Video,
      color: 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759] hover:text-white border-[#34C759]/20',
      action: onOpenMeet,
    },
    {
      id: 'drive',
      name: 'Files',
      googleEquivalent: 'Drive / Picker',
      icon: HardDrive,
      color: 'bg-[#5856D6]/10 text-[#5856D6] hover:bg-[#5856D6] hover:text-white border-[#5856D6]/20',
      action: onOpenDrive,
    },
    {
      id: 'keep',
      name: 'Quick Capture',
      googleEquivalent: 'Google Keep',
      icon: StickyNote,
      color: 'bg-[#FF9500]/10 text-[#FF9500] hover:bg-[#FF9500] hover:text-white border-[#FF9500]/20',
      action: onOpenKeep,
    },
    {
      id: 'chat',
      name: 'Team Hub',
      googleEquivalent: 'Google Chat',
      icon: MessageSquare,
      color: 'bg-[#AF52DE]/10 text-[#AF52DE] hover:bg-[#AF52DE] hover:text-white border-[#AF52DE]/20',
      action: onOpenChat,
    },
    {
      id: 'sheets',
      name: 'Data Reports',
      googleEquivalent: 'Google Sheets',
      icon: FileSpreadsheet,
      color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-500/20',
      action: onOpenSheets,
    },
    {
      id: 'calendar',
      name: 'Schedule',
      googleEquivalent: 'Calendar',
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-500/20',
      action: onOpenCalendar,
    },
    {
      id: 'contacts',
      name: 'Directory',
      googleEquivalent: 'Contacts',
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white border-indigo-500/20',
      action: onOpenContacts,
    },
    {
      id: 'docs',
      name: 'Business Memory',
      googleEquivalent: 'Docs & Logs',
      icon: FileText,
      color: 'bg-sky-500/10 text-sky-600 hover:bg-sky-600 hover:text-white border-sky-500/20',
      action: onOpenDocs,
    },
    {
      id: 'firebase',
      name: 'Firebase Enclave',
      googleEquivalent: 'Firestore & Auth',
      icon: Database,
      color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-600 hover:text-white border-orange-500/20',
      action: onOpenFirebaseInfo,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-[#2C2C2E] p-2.5 sm:p-3 shadow-xs space-y-2.5">
      {/* Top Header Row of Unified Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-2 border-b border-gray-150 dark:border-[#2C2C2E]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#007AFF] shrink-0" />
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100 leading-none">
              Workspace Unified Toolbar
            </h2>
            <p className="text-[10px] text-gray-500 font-bold mt-0.5">
              Integrated Engines & Navigation Deck
            </p>
          </div>
        </div>

        {/* Integrated Navigation Tabs: Merged Workspace, Notepad, & Admin Control */}
        {onSelectPage && (
          <div className="flex flex-wrap items-center bg-gray-100 dark:bg-neutral-900 p-0.5 rounded-xl border border-gray-200 dark:border-neutral-800 gap-1">
            <button
              onClick={() => onSelectPage('master')}
              className={`px-3.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activePage === 'master'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
              }`}
            >
              Workspace
            </button>

            <button
              onClick={() => onOpenNotepad ? onOpenNotepad() : onOpenDocs()}
              className="px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
              title="Open Executive Notepad / Scratchpad"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Notepad
            </button>

            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 bg-blue-500/10 text-blue-800 dark:text-blue-300 hover:bg-blue-500/20 border border-blue-500/30"
                title="Open Executive Calculator & History"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Calculator
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onSelectPage('admin-deck')}
                className={`px-3.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  activePage === 'admin-deck'
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                }`}
                title="Admin Control Center"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Admin Control
              </button>
            )}
          </div>
        )}
      </div>

      {/* Engines Grid - 10 Equal Columns on Large Screens */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
        {engines.map((eng) => {
          const Icon = eng.icon;
          return (
            <button
              key={eng.id}
              onClick={eng.action}
              title={`${eng.name} — ${eng.googleEquivalent}`}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer group ${eng.color}`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-[10px] tracking-tight leading-tight block truncate w-full font-extrabold text-gray-900 dark:text-white">
                {eng.name}
              </span>
              <span className="text-[8px] font-mono tracking-tighter truncate w-full font-bold text-gray-600 dark:text-gray-400">
                ({eng.googleEquivalent.replace('Google ', '')})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
