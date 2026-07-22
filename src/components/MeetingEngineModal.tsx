/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Video, Calendar, Clock, Users, Link2, Copy, Check, X, Sparkles, FileText } from 'lucide-react';
import { Contact } from '../types';

interface MeetingEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onScheduleMeeting: (meetingData: {
    title: string;
    date: string;
    time: string;
    meetUrl: string;
    attendees: string[];
    notes: string;
  }) => void;
}

export function MeetingEngineModal({
  isOpen,
  onClose,
  contacts,
  onScheduleMeeting,
}: MeetingEngineModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-07-21');
  const [time, setTime] = useState('11:00 AM');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  if (!isOpen) return null;

  const handleGenerateMeetLink = () => {
    const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    const generated = `https://meet.google.com/${code}`;
    setMeetUrl(generated);
  };

  const handleCopyLink = () => {
    if (!meetUrl) return;
    navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAttendee = (email: string) => {
    if (attendees.includes(email)) {
      setAttendees(attendees.filter((a) => a !== email));
    } else {
      setAttendees([...attendees, email]);
    }
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const finalMeetUrl = meetUrl || `https://meet.google.com/sjos-${Math.random().toString(36).substring(2, 6)}`;
    onScheduleMeeting({
      title,
      date,
      time,
      meetUrl: finalMeetUrl,
      attendees,
      notes,
    });

    setIsCreated(true);
    setTimeout(() => {
      setIsCreated(false);
      onClose();
      setTitle('');
      setNotes('');
      setAttendees([]);
      setMeetUrl('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#34C759] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Meetings Engine</h2>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                Google Meet Infrastructure • SJ OS Instant Session
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
        {isCreated ? (
          <div className="p-12 text-center space-y-3">
            <Check className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-gray-900">Meeting Session Linked</h3>
            <p className="text-xs text-gray-500">
              Google Meet session generated and synced automatically to Schedule (Calendar) & Business Memory (Docs).
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Client Executive Project Review & Milestone Handover"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#34C759] transition shadow-xs"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#34C759]" /> Meeting Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#34C759] transition shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#34C759]" /> Start Time (12-hr)
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#34C759] transition shadow-xs"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            {/* Meet Link Generator */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 flex items-center justify-between">
                <span>Google Meet Link</span>
                {!meetUrl && (
                  <button
                    type="button"
                    onClick={handleGenerateMeetLink}
                    className="text-[10px] font-bold text-[#34C759] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate Meet URL
                  </button>
                )}
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  readOnly
                  placeholder="Click auto-generate or paste Meet URL"
                  value={meetUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-medium text-gray-700"
                />
                {meetUrl && (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#34C759] border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            {/* Attendees selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#34C759]" /> Select Directory Attendees
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl">
                {contacts.map((c) => {
                  const selected = attendees.includes(c.email);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggleAttendee(c.email)}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                        selected
                          ? 'bg-[#34C759] text-white border-[#34C759]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / Agenda */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#34C759]" /> Meeting Agenda & Notes (Docs)
              </label>
              <textarea
                rows={3}
                placeholder="Key talking points, deliverables, or specifications..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#34C759] focus:bg-white transition"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 font-medium">
                ⚡ Linked seamlessly to Schedule & Business Memory
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
                  className="px-5 py-2 bg-[#34C759] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" /> Schedule & Launch Meet
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
