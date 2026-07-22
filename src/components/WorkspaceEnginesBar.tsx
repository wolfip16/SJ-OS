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
  onOpenTasks: () => void;
  onOpenFirebaseInfo: () => void;
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
      googleEquivalent: 'Google Drive / Picker',
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
      googleEquivalent: 'Google Calendar',
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-500/20',
      action: onOpenCalendar,
    },
    {
      id: 'contacts',
      name: 'Directory',
      googleEquivalent: 'Google Contacts',
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white border-indigo-500/20',
      action: onOpenContacts,
    },
    {
      id: 'docs',
      name: 'Business Memory',
      googleEquivalent: 'Google Docs',
      icon: FileText,
      color: 'bg-sky-500/10 text-sky-600 hover:bg-sky-600 hover:text-white border-sky-500/20',
      action: onOpenDocs,
    },
    {
      id: 'tasks',
      name: 'Today\'s Work',
      googleEquivalent: 'Google Tasks',
      icon: CheckSquare,
      color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white border-amber-500/20',
      action: onOpenTasks,
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
    <div className="bg-white rounded-2xl border border-gray-150 p-3 shadow-xs space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
            Google Workspace Infrastructure Engines
          </h2>
        </div>
        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-mono">
          SJ OS UNIFIED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-11 gap-1.5">
        {engines.map((eng) => {
          const Icon = eng.icon;
          return (
            <button
              key={eng.id}
              onClick={eng.action}
              title={`${eng.name} — ${eng.googleEquivalent}`}
              className={`p-2 rounded-xl border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer group ${eng.color}`}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-[10px] tracking-tight leading-tight block truncate w-full font-bold">
                {eng.name}
              </span>
              <span className="text-[8px] opacity-75 font-mono tracking-tighter truncate w-full">
                ({eng.googleEquivalent.replace('Google ', '')})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
