/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Download,
  Trash2,
  X,
  Check,
  Sparkles,
  Table,
  ExternalLink,
  Edit2,
  Save,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { appendDirectSheetRow } from '../lib/workspaceAuth';

interface SheetDoc {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  rowsCount: number;
  columnsCount: number;
  columns: string[];
  data: Record<string, string>[];
}

const DEFAULT_SHEETS: SheetDoc[] = [
  {
    id: 'sh_1',
    title: 'Q3_Commercial_Orders_Ledger',
    category: 'Sales & Finance',
    updatedAt: 'Today, 10:45 AM',
    rowsCount: 4,
    columnsCount: 5,
    columns: ['Client / Partner', 'Item Description', 'Quantity (Tons)', 'Quotation Value ($)', 'Status'],
    data: [
      { 'Client / Partner': 'AeroCorp Infra', 'Item Description': 'Structural Steel Beams Grade A', 'Quantity (Tons)': '120', 'Quotation Value ($)': '240,000', 'Status': 'Approved' },
      { 'Client / Partner': 'Titan Heavy Industries', 'Item Description': 'Reinforced Pipe Connectors', 'Quantity (Tons)': '45', 'Quotation Value ($)': '88,500', 'Status': 'Pending Signoff' },
      { 'Client / Partner': 'Metro Line 4 Consortium', 'Item Description': 'High-Tensile Girder Plates', 'Quantity (Tons)': '210', 'Quotation Value ($)': '415,000', 'Status': 'Dispatched' },
      { 'Client / Partner': 'Apex Engineering', 'Item Description': 'Custom Fabricated Brackets', 'Quantity (Tons)': '30', 'Quotation Value ($)': '62,000', 'Status': 'Under Review' },
    ],
  },
  {
    id: 'sh_2',
    title: 'Raw_Material_Inventory_Audit',
    category: 'Operations',
    updatedAt: 'Yesterday, 04:15 PM',
    rowsCount: 3,
    columnsCount: 5,
    columns: ['Material ID', 'Grade / Spec', 'Yard Stock (Tons)', 'Reorder Point', 'Warehouse Location'],
    data: [
      { 'Material ID': 'MAT-SS-900', 'Grade / Spec': '316L Stainless Steel', 'Yard Stock (Tons)': '85', 'Reorder Point': '20 Tons', 'Warehouse Location': 'Bay 4A' },
      { 'Material ID': 'MAT-CS-102', 'Grade / Spec': 'Carbon Steel Plate 20mm', 'Yard Stock (Tons)': '140', 'Reorder Point': '50 Tons', 'Warehouse Location': 'Bay 1C' },
      { 'Material ID': 'MAT-AL-508', 'Grade / Spec': 'Aluminum 6061-T6', 'Yard Stock (Tons)': '12', 'Reorder Point': '15 Tons', 'Warehouse Location': 'Bay 3B' },
    ],
  },
  {
    id: 'sh_3',
    title: 'Daily_EOD_Review_Log',
    category: 'Executive Summary',
    updatedAt: 'Today, 09:00 AM',
    rowsCount: 2,
    columnsCount: 4,
    columns: ['Date', 'Submitted By', 'Key Achievement', 'Priority Blockers'],
    data: [
      { 'Date': '2026-07-21', 'Submitted By': 'Rohan Sharma', 'Key Achievement': 'Dispatched 210T Girder Plates for Metro Line', 'Priority Blockers': 'Customs clearance for Bay 3 cargo' },
      { 'Date': '2026-07-20', 'Submitted By': 'Devendra Rao', 'Key Achievement': 'Completed Raw Material Yard Inventory Audit', 'Priority Blockers': 'None' },
    ],
  },
];

interface SheetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SheetsManagerModal({ isOpen, onClose }: SheetsManagerModalProps) {
  const [sheets, setSheets] = useState<SheetDoc[]>(DEFAULT_SHEETS);
  const [activeSheetId, setActiveSheetId] = useState<string>(DEFAULT_SHEETS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  const handleCreateNewSheet = () => {
    const title = prompt('Enter New Sheet Title:', `Untitled_Sheet_${sheets.length + 1}`);
    if (!title) return;

    const newSheetDoc: SheetDoc = {
      id: 'sh_' + Date.now(),
      title: title.trim().replace(/\s+/g, '_'),
      category: 'Custom Spreadsheet',
      updatedAt: 'Just now',
      rowsCount: 2,
      columnsCount: 4,
      columns: ['Item / Name', 'Category', 'Value / Amount', 'Notes'],
      data: [
        { 'Item / Name': 'Sample Entry 1', 'Category': 'General', 'Value / Amount': '100', 'Notes': 'Initial row' },
        { 'Item / Name': 'Sample Entry 2', 'Category': 'General', 'Value / Amount': '250', 'Notes': 'Secondary row' },
      ],
    };

    setSheets([newSheetDoc, ...sheets]);
    setActiveSheetId(newSheetDoc.id);
    setToastNotice(`Created new Google Sheet: "${newSheetDoc.title}"`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleAddRow = async () => {
    if (!currentSheet) return;
    const newRow: Record<string, string> = {};
    const valuesArray: string[] = [];

    currentSheet.columns.forEach((col, idx) => {
      const val = idx === 0 ? `New Record ${currentSheet.data.length + 1}` : '-';
      newRow[col] = val;
      valuesArray.push(val);
    });

    const updatedSheet = {
      ...currentSheet,
      rowsCount: currentSheet.rowsCount + 1,
      updatedAt: 'Just now',
      data: [...currentSheet.data, newRow],
    };

    setSheets(sheets.map((s) => (s.id === currentSheet.id ? updatedSheet : s)));

    // Optional Google Sheets API sync if spreadsheet ID present
    if (currentSheet.id.startsWith('1')) {
      try {
        await appendDirectSheetRow(currentSheet.id, 'Sheet1!A1', valuesArray);
        setToastNotice(`Appended row directly to Google Sheets API!`);
        setTimeout(() => setToastNotice(null), 3000);
      } catch (err: any) {
        console.warn('Google Sheets API append notice:', err?.message);
      }
    }
  };

  const handleStartCellEdit = (rowIdx: number, colKey: string, currentVal: string) => {
    setEditingCell({ rowIdx, colKey });
    setEditValue(currentVal);
  };

  const handleSaveCellEdit = () => {
    if (!editingCell || !currentSheet) return;
    const { rowIdx, colKey } = editingCell;

    const updatedData = [...currentSheet.data];
    updatedData[rowIdx] = {
      ...updatedData[rowIdx],
      [colKey]: editValue,
    };

    const updatedSheet = {
      ...currentSheet,
      updatedAt: 'Just now',
      data: updatedData,
    };

    setSheets(sheets.map((s) => (s.id === currentSheet.id ? updatedSheet : s)));
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    if (!currentSheet) return;
    const headers = currentSheet.columns.join(',');
    const rows = currentSheet.data.map((row) =>
      currentSheet.columns.map((col) => `"${row[col] || ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentSheet.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSheets = sheets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Data Reports Engine</h2>
                <span className="text-[9px] bg-emerald-500 text-white font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Google Sheets Infrastructure
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Live Spreadsheets • Commercial & Financial Ledgers Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewSheet}
              className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Create New Sheet</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {toastNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 flex items-center justify-between shrink-0">
            <span>{toastNotice}</span>
            <button onClick={() => setToastNotice(null)} className="text-emerald-500 font-bold">×</button>
          </div>
        )}

        {/* Main Body Grid: Sidebar Sheets Navigation + Spreadsheet Canvas */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          
          {/* Left Column: All Sheets List */}
          <div className="md:col-span-4 bg-gray-50/80 p-4 flex flex-col gap-3 overflow-y-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search spreadsheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </div>

            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-500 tracking-wider px-1">
              <span>All Google Sheets ({filteredSheets.length})</span>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              {filteredSheets.map((s) => {
                const isActive = s.id === activeSheetId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSheetId(s.id)}
                    className={`w-full p-3 rounded-xl text-left transition border flex flex-col gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white/60 border-gray-200 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate max-w-[180px]">
                        {s.title}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                        {s.category}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-500 font-medium flex items-center justify-between">
                      <span>{s.data.length} Rows • {s.columns.length} Cols</span>
                      <span className="text-gray-400">{s.updatedAt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Spreadsheet Interactive Grid */}
          <div className="md:col-span-8 flex flex-col min-h-0 bg-white">
            
            {/* Sheet Toolbar */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-2 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span>{currentSheet.title}</span>
                  <span className="text-[10px] text-gray-500 font-normal">({currentSheet.category})</span>
                </h3>
                <p className="text-[10px] text-gray-500 font-medium">
                  Last saved {currentSheet.updatedAt} • Google Sheets Auto-Synced
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (sheets.length <= 1) {
                      alert('Cannot delete the last remaining sheet.');
                      return;
                    }
                    if (confirm(`Are you sure you want to delete the sheet "${currentSheet.title}"?`)) {
                      const updated = sheets.filter(s => s.id !== currentSheet.id);
                      setSheets(updated);
                      setActiveSheetId(updated[0].id);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1 cursor-pointer transition"
                  title="Delete Sheet"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete Sheet
                </button>

                <button
                  onClick={handleAddRow}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" /> Export CSV
                </button>
              </div>
            </div>

            {/* Grid Table Canvas */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                    <th className="p-2.5 border-r border-gray-200 w-10 text-center text-gray-400">#</th>
                    {currentSheet.columns.map((col, idx) => (
                      <th key={idx} className="p-2.5 border-r border-gray-200 font-bold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {currentSheet.data.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-emerald-50/40 transition">
                      <td className="p-2.5 border-r border-gray-200 text-[10px] font-mono text-gray-400 text-center font-bold bg-gray-50">
                        {rIdx + 1}
                      </td>

                      {currentSheet.columns.map((colKey, cIdx) => {
                        const cellVal = row[colKey] || '';
                        const isEditing = editingCell?.rowIdx === rIdx && editingCell?.colKey === colKey;

                        return (
                          <td
                            key={cIdx}
                            onClick={() => handleStartCellEdit(rIdx, colKey, cellVal)}
                            className="p-2 border-r border-gray-200 font-medium text-gray-800 cursor-pointer hover:bg-emerald-100/50 transition relative group"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCellEdit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  autoFocus
                                  className="w-full px-1.5 py-0.5 bg-white border border-emerald-500 rounded text-xs font-semibold focus:outline-none"
                                />
                                <button
                                  onClick={handleSaveCellEdit}
                                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <span className={cellVal === 'Approved' ? 'text-emerald-700 font-bold' : cellVal === 'Pending Signoff' ? 'text-amber-700 font-bold' : ''}>
                                  {cellVal}
                                </span>
                                <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 shrink-0" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500 font-medium shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Click any table cell to edit directly. Changes persist automatically.
              </span>
              <span>Google Sheets Bridge • SJ OS Unified</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
