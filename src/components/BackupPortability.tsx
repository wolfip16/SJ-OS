/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Contact, CalendarItem, TimelineEvent } from '../types';
import { Download, Upload, ShieldCheck, Database, FileSpreadsheet, Sparkles, Check, AlertTriangle } from 'lucide-react';

interface BackupPortabilityProps {
  contacts: Contact[];
  calendarItems: CalendarItem[];
  timelineEvents: TimelineEvent[];
  onImportData: (data: {
    contacts: Contact[];
    calendarItems: CalendarItem[];
    timelineEvents: TimelineEvent[];
  }) => void;
  onImportContactsCSV: (newContacts: Contact[]) => void;
}

export function BackupPortability({
  contacts,
  calendarItems,
  timelineEvents,
  onImportData,
  onImportContactsCSV,
}: BackupPortabilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState<'export' | 'import' | 'csv' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  const triggerNotification = (type: 'export' | 'import' | 'csv' | 'error', msg = '') => {
    setErrorMessage(msg);
    setShowNotification(type);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Export full backup as JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify({
        version: '1.2',
        exportedAt: new Date().toISOString(),
        contacts,
        calendarItems,
        timelineEvents,
      }, null, 2);
      
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sj_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerNotification('export');
    } catch (e: any) {
      triggerNotification('error', `Failed to export: ${e.message}`);
    }
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        if (!parsed.contacts || !parsed.calendarItems || !parsed.timelineEvents) {
          throw new Error('Invalid backup file. Required structures missing.');
        }

        onImportData({
          contacts: parsed.contacts,
          calendarItems: parsed.calendarItems,
          timelineEvents: parsed.timelineEvents,
        });

        triggerNotification('import');
        setIsOpen(false);
      } catch (err: any) {
        triggerNotification('error', `Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick parser for CSV (Simple name, company, phone, email, city)
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          throw new Error('CSV is empty or missing content rows.');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const importedContacts: Contact[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          if (!row.trim()) continue;

          // Simple CSV splitter that respects basic quotes if any
          const cols = row.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          if (cols.length === 0) continue;

          // Map headers to properties
          const nameIdx = headers.indexOf('name');
          const companyIdx = headers.indexOf('company');
          const phoneIdx = headers.indexOf('phone');
          const emailIdx = headers.indexOf('email');
          const cityIdx = headers.indexOf('city');
          const stageIdx = headers.indexOf('stage');
          const heatIdx = headers.indexOf('heatscore');

          const name = cols[nameIdx !== -1 ? nameIdx : 0] || 'Unknown Import';
          const company = cols[companyIdx !== -1 ? companyIdx : 1] || 'Unknown Company';
          const phone = cols[phoneIdx !== -1 ? phoneIdx : 2] || '+91 00000 00000';
          const email = emailIdx !== -1 ? cols[emailIdx] : undefined;
          const city = cityIdx !== -1 ? cols[cityIdx] : undefined;
          const stage = (stageIdx !== -1 ? cols[stageIdx] : 'Lead') as any;
          const heatScore = heatIdx !== -1 ? parseInt(cols[heatIdx]) || 50 : 50;

          importedContacts.push({
            id: `csv_${Date.now()}_${i}`,
            name,
            company,
            phone,
            email,
            city,
            stage,
            heatScore,
            lastContactDate: new Date().toISOString().split('T')[0],
            nextFollowUpDate: new Date().toISOString().split('T')[0],
            interactionCount: 1,
            notes: 'Imported via CSV file.',
            createdAt: new Date().toISOString(),
          });
        }

        if (importedContacts.length === 0) {
          throw new Error('No contacts found in CSV columns.');
        }

        onImportContactsCSV(importedContacts);
        triggerNotification('csv');
        setIsOpen(false);
      } catch (err: any) {
        triggerNotification('error', `CSV parsing failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F5F5F7] dark:bg-neutral-800 text-[#1D1D1F] dark:text-white border border-gray-200 dark:border-neutral-700/60 transition active:scale-95 hover:bg-gray-100"
        id="btn_portability_menu"
      >
        <Database className="w-3.5 h-3.5 text-blue-500" />
        Data Portability
      </button>

      {/* Popover Settings */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl p-4 z-50 text-xs"
            id="portability_dropdown"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-150 dark:border-neutral-800">
              <span className="font-extrabold tracking-tight dark:text-white flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                SJ Security Desk
              </span>
              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                OFFLINE ONLY
              </span>
            </div>

            <div className="space-y-3">
              {/* Informative Security Callout */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100/50 dark:border-blue-900/30 text-gray-600 dark:text-neutral-450 leading-normal">
                <p className="font-semibold text-gray-800 dark:text-neutral-300 mb-0.5 flex items-center gap-1">
                  On-Device Storage Active
                </p>
                100% of your data is compiled directly in your browser's hardware storage sandbox. No external tracking, no login, entirely private and free forever.
              </div>

              {/* Data Operations */}
              <div className="space-y-2">
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 rounded-xl transition font-semibold text-gray-700 dark:text-neutral-250 border border-transparent dark:border-neutral-800"
                  id="btn_export_json"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    Download JSON Database Backup
                  </span>
                </button>

                <label className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer font-semibold text-gray-700 dark:text-neutral-250 border border-transparent dark:border-neutral-800">
                  <span className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    Upload JSON Database Backup
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportJSON}
                    accept=".json"
                    className="hidden"
                  />
                </label>

                <label className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer font-semibold text-gray-700 dark:text-neutral-250 border border-transparent dark:border-neutral-800">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    Import Contacts from CSV File
                  </span>
                  <input
                    type="file"
                    ref={csvInputRef}
                    onChange={handleImportCSV}
                    accept=".csv"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Formatting CSV Info */}
              <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium leading-relaxed bg-gray-50/20 p-2 rounded-lg border border-black/5">
                <span className="font-bold uppercase tracking-wider block mb-0.5">CSV Schema Standard:</span>
                First row must contain columns like: <code className="text-gray-600 dark:text-gray-300 font-mono">name</code>, <code className="text-gray-600 dark:text-gray-300 font-mono">company</code>, <code className="text-gray-600 dark:text-gray-300 font-mono">phone</code>, <code className="text-gray-600 dark:text-gray-300 font-mono">email</code>, <code className="text-gray-600 dark:text-gray-300 font-mono">city</code>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Elegant HUD Notifications */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 animate-bounce text-xs font-semibold max-w-sm border border-neutral-800/80">
          {showNotification === 'export' && (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Database downloaded successfully. Backup secure on disk!</span>
            </>
          )}
          {showNotification === 'import' && (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Full database restoration complete. App synchronized!</span>
            </>
          )}
          {showNotification === 'csv' && (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Contacts CSV successfully parsed and appended to directory.</span>
            </>
          )}
          {showNotification === 'error' && (
            <>
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300">{errorMessage}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
