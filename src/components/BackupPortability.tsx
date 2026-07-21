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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#FFFFFF] border border-transparent transition-all active:scale-95 cursor-pointer"
        id="btn_portability_menu"
      >
        <Database className="w-3.5 h-3.5 text-[#007AFF]" />
        Data Portability
      </button>

      {/* Popover Settings */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-2xl shadow-xl p-4.5 z-50 text-xs animate-scaleUp"
            id="portability_dropdown"
          >
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#F2F2F7] dark:border-[#2C2C2E]">
              <span className="font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                SJ Security Desk
              </span>
              <span className="text-[9px] bg-[#34C759]/10 text-[#34C759] font-semibold px-2 py-0.5 rounded-md">
                OFFLINE ONLY
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Informative Security Callout */}
              <div className="bg-[#007AFF]/5 dark:bg-[#007AFF]/10 p-3 rounded-xl border border-transparent text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                <p className="font-semibold text-[#007AFF] mb-0.5 flex items-center gap-1">
                  On-Device Storage Active
                </p>
                <span className="text-[11px] text-[#8E8E93] dark:text-[#8E8E93]">
                  100% of your data is compiled directly in your browser's hardware storage sandbox. No external tracking, no login, entirely private and free forever.
                </span>
              </div>

              {/* Data Operations */}
              <div className="space-y-2">
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] rounded-lg transition-all font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] border border-transparent cursor-pointer active:scale-98"
                  id="btn_export_json"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#007AFF]" />
                    Download JSON Database Backup
                  </span>
                </button>

                <label className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] rounded-lg transition-all cursor-pointer font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] border border-transparent active:scale-98">
                  <span className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-[#FF9500]" />
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

                <label className="w-full flex items-center justify-between px-3 py-2.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] rounded-lg transition-all cursor-pointer font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] border border-transparent active:scale-98">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#34C759]" />
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
              <div className="text-[10px] text-[#8E8E93] dark:text-[#8E8E93] font-medium leading-relaxed bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/30 p-2.5 rounded-lg border border-[#F2F2F7] dark:border-[#2C2C2E]">
                <span className="font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] uppercase tracking-wider block mb-0.5">CSV Schema Standard:</span>
                First row must contain columns like: <code className="text-[#007AFF] dark:text-[#007AFF] font-mono">name</code>, <code className="text-[#007AFF] dark:text-[#007AFF] font-mono">company</code>, <code className="text-[#007AFF] dark:text-[#007AFF] font-mono">phone</code>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Elegant HUD Notifications */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1E]/95 dark:bg-[#000000]/90 text-white rounded-xl shadow-xl px-4.5 py-3.5 flex items-center gap-3 animate-bounce text-xs font-semibold max-w-sm border border-[#2C2C2E] backdrop-blur-xl">
          {showNotification === 'export' && (
            <>
              <Check className="w-4 h-4 text-[#34C759]" />
              <span>Database downloaded successfully. Backup secure on disk!</span>
            </>
          )}
          {showNotification === 'import' && (
            <>
              <Sparkles className="w-4 h-4 text-[#FF9500]" />
              <span>Full database restoration complete. App synchronized!</span>
            </>
          )}
          {showNotification === 'csv' && (
            <>
              <Check className="w-4 h-4 text-[#34C759]" />
              <span>Contacts CSV successfully parsed and appended to directory.</span>
            </>
          )}
          {showNotification === 'error' && (
            <>
              <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
              <span className="text-[#FF453A]">{errorMessage}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
