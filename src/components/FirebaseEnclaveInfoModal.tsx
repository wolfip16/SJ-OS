/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, ShieldCheck, RefreshCw, X, CheckCircle, Lock, Server } from 'lucide-react';

interface FirebaseEnclaveInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSyncedAt?: string;
}

export function FirebaseEnclaveInfoModal({ isOpen, onClose, lastSyncedAt }: FirebaseEnclaveInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#FF9500] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Firebase Enclave & Sync Hub</h2>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                Cloud Firestore Database • Auth Audit Ledger
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

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="block text-xs font-bold text-emerald-900">Firebase Firestore Online & Connected</span>
              <span className="block text-[10px] text-emerald-700 font-medium">
                Project ID: <strong className="font-mono">gen-lang-client-0471622172</strong> (Region: asia-southeast1)
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-wider">How Firebase is Actively Used in SJ OS</h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-800">1. Passcode & Security Access Audit Logs</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium mt-0.5">
                    Every PIN attempt on the home screen triggers a security audit log stored directly in Firebase collection <code className="bg-gray-200 px-1 py-0.5 rounded text-[10px]">security_logs</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-800">2. Real-Time Persistent Workspace Syncing</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium mt-0.5">
                    Contacts, calendar items, daily EOD reviews, master notes, and timeline events sync continuously to Firestore collection <code className="bg-gray-200 px-1 py-0.5 rounded text-[10px]">workspace_data</code>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5">
                <Server className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-gray-800">3. Multi-Session & Offline Protection</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium mt-0.5">
                    If internet connectivity drops, local cache preserves edits. Upon reconnection, Firebase automatically reconciles and syncs data to cloud servers without manual effort.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>Last Firebase Sync: {lastSyncedAt || 'Just now'}</span>
            <span className="text-[#FF9500] font-bold">AES-256 Cloud Enclave</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-150 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
