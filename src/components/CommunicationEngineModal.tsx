/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Send, Paperclip, CheckCircle, X, Sparkles, User, FileText, Bell, ShieldCheck } from 'lucide-react';
import { Contact } from '../types';
import { UserProfile } from './AuthLockScreen';

interface CommunicationEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  initialRecipient?: Contact | null;
  currentUser?: UserProfile | null;
  onSendEmail: (emailData: { to: string; subject: string; body: string; attachments: string[] }) => void;
  onAddTask?: (taskData: { title: string; category: 'Tasks' | 'Schedule' | 'Deliverables'; time?: string; date?: string; notes?: string }) => void;
}

export function CommunicationEngineModal({
  isOpen,
  onClose,
  contacts,
  initialRecipient,
  currentUser,
  onSendEmail,
  onAddTask,
}: CommunicationEngineModalProps) {
  const [to, setTo] = useState(initialRecipient ? initialRecipient.email : '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [createTaskReminder, setCreateTaskReminder] = useState(true);
  const [isSent, setIsSent] = useState(false);

  const senderEmail = currentUser?.email || currentUser?.googleId || 'reshab.jhunjhunwalla@rbagarwalla.com';

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject) return;

    onSendEmail({ to, subject, body, attachments });

    // SJ OS Core Principle: Task & Reminder Auto-Creation
    if (createTaskReminder && onAddTask) {
      onAddTask({
        title: `Follow up: ${subject} (${to})`,
        category: 'Tasks',
        notes: `Sent from ${senderEmail} via Gmail Engine to ${to}. Subject: ${subject}`,
      });
    }

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
      setTo('');
      setSubject('');
      setBody('');
      setAttachments([]);
    }, 1200);
  };

  const handleAttachDriveFile = () => {
    const mockFile = `SJ_OS_Quotation_Doc_${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFile]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#007AFF] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Communication Engine</h2>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                Gmail Infrastructure • SJ OS Dispatcher
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

        {/* Content Body */}
        {isSent ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-gray-900">Message Dispatched</h3>
            <p className="text-xs text-gray-500">
              Your email was dispatched using <span className="font-semibold text-gray-800">{senderEmail}</span> via Gmail Engine & recorded in SJ OS.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-6 space-y-4">
            
            {/* Sender Google Workspace Account Badge */}
            <div className="bg-blue-50/80 border border-blue-150 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#007AFF] shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block leading-none">Sender Account (Google Workspace)</span>
                  <span className="font-semibold text-gray-900">{senderEmail}</span>
                </div>
              </div>
              <span className="text-[9px] bg-blue-100 text-[#007AFF] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                Synced ID
              </span>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                Recipient Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g., client@partnercompany.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#007AFF] transition shadow-xs"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {contacts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[9px] text-gray-400 font-bold uppercase self-center">Directory Quick Contacts:</span>
                  {contacts.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTo(c.email)}
                      className="text-[10px] bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-[#007AFF] px-2 py-0.5 rounded-md transition font-medium cursor-pointer"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Commercial Quotation & Drawing Approval"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#007AFF] transition shadow-xs"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                  Message Body
                </label>
                <button
                  type="button"
                  onClick={() => setBody((prev) => prev + "\n\nAttached please find our commercial specification and pipeline dossier.")}
                  className="text-[10px] text-[#007AFF] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#007AFF]" /> Insert AI Standard Greeting
                </button>
              </div>
              <textarea
                rows={5}
                placeholder="Write your email details here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#007AFF] transition leading-relaxed shadow-xs"
              />
            </div>

            {/* Drive Attachments */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Files & Drive Attachments
                </label>
                <button
                  type="button"
                  onClick={handleAttachDriveFile}
                  className="text-[10px] font-bold text-[#007AFF] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <Paperclip className="w-3 h-3" /> Attach File from Files Engine
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="bg-gray-100 text-gray-700 text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-gray-200">
                      <FileText className="w-3 h-3 text-blue-500" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto Task Reminder Checkbox */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <label htmlFor="createTaskReminder" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                <input
                  id="createTaskReminder"
                  type="checkbox"
                  checked={createTaskReminder}
                  onChange={(e) => setCreateTaskReminder(e.target.checked)}
                  className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] h-4 w-4"
                />
                <Bell className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Auto-create Task Reminder in SJ OS (Follow-up email)</span>
              </label>
              <span className="text-[9px] text-[#007AFF] font-bold uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                SJ OS Core
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium">
                🔒 Communication logged quietly to Business Memory
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#007AFF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Message
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
