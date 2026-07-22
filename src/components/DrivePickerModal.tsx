/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Folder, HardDrive, FileText, Upload, Search, Check, X, ExternalLink, Image, FileSpreadsheet, Plus } from 'lucide-react';

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile?: (file: { name: string; url: string; size: string; type: string }) => void;
}

const SAMPLE_DRIVE_FILES = [
  { id: 'f1', name: 'SJ_OS_Executive_Quotation_2026.pdf', size: '2.4 MB', type: 'pdf', folder: 'Commercial', modified: '2026-07-20' },
  { id: 'f2', name: 'Material_Structural_Layout_Drawings.dwg', size: '14.8 MB', type: 'cad', folder: 'Engineering', modified: '2026-07-19' },
  { id: 'f3', name: 'Q3_Financial_Pipeline_Ledger.xlsx', size: '890 KB', type: 'sheet', folder: 'Finance', modified: '2026-07-21' },
  { id: 'f4', name: 'Site_Inspection_Report_Photos.zip', size: '32.1 MB', type: 'archive', folder: 'Operations', modified: '2026-07-18' },
  { id: 'f5', name: 'Client_Contract_Signoff_Master.docx', size: '1.2 MB', type: 'doc', folder: 'Legal', modified: '2026-07-21' },
];

export function DrivePickerModal({ isOpen, onClose, onSelectFile }: DrivePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState(SAMPLE_DRIVE_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploaded = e.target.files[0];
      const newFile = {
        id: 'f_' + Date.now(),
        name: uploaded.name,
        size: (uploaded.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: 'doc',
        folder: 'Quick Uploads',
        modified: new Date().toISOString().split('T')[0],
      };
      setFiles([newFile, ...files]);
      setUploadNotice(`File "${uploaded.name}" synced quietly to Files Engine.`);
      setTimeout(() => setUploadNotice(null), 3000);
    }
  };

  const handleConfirmSelect = () => {
    const selected = files.find((f) => f.id === selectedFileId);
    if (selected && onSelectFile) {
      onSelectFile({
        name: selected.name,
        url: `https://drive.google.com/file/d/${selected.id}`,
        size: selected.size,
        type: selected.type,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col font-sans max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#5856D6] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Files Engine & Resource Picker</h2>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                Google Drive Storage • SJ OS Workspace
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

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-gray-150 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search files or folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#5856D6] transition shadow-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
          </div>

          <label className="px-3 py-1.5 bg-[#5856D6] hover:bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New File</span>
            <input type="file" onChange={handleSimulatedUpload} className="hidden" />
          </label>
        </div>

        {uploadNotice && (
          <div className="bg-indigo-50 border-b border-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 flex items-center justify-between">
            <span>{uploadNotice}</span>
            <button onClick={() => setUploadNotice(null)} className="text-indigo-400 hover:text-indigo-600 font-bold">×</button>
          </div>
        )}

        {/* File List */}
        <div className="p-4 flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredFiles.map((file) => {
            const isSelected = selectedFileId === file.id;
            return (
              <div
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                  isSelected ? 'bg-indigo-50/80 border border-indigo-200' : 'hover:bg-gray-50/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100/50 text-[#5856D6] rounded-xl">
                    {file.type === 'sheet' ? (
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    ) : file.type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-red-500" />
                    ) : (
                      <Folder className="w-5 h-5 text-[#5856D6]" />
                    )}
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-gray-800">{file.name}</span>
                    <span className="block text-[10px] text-gray-400 font-medium">
                      Folder: <strong className="text-gray-600">{file.folder}</strong> • {file.size} • Updated {file.modified}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#5856D6] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-bold">
                    {file.folder}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#5856D6] font-bold" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-medium">
            📂 Total 15 GB Workspace Cloud Capacity • Managed via Google Drive
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleConfirmSelect}
              disabled={!selectedFileId}
              className={`px-5 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedFileId
                  ? 'bg-[#5856D6] hover:bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> Attach Selected Resource
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
