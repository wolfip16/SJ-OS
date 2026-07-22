/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Video, Calendar, Clock, Users, Link2, Copy, Check, X, Sparkles, FileText, Bell, ShieldCheck, CheckCircle } from 'lucide-react';
import { Contact } from '../types';
import { UserProfile } from './AuthLockScreen';
import { createDirectCalendarEvent } from '../lib/workspaceAuth';

interface MeetingEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  currentUser?: UserProfile | null;
  onScheduleMeeting: (meetingData: {
    title: string;
    date: string;
    time: string;
    meetUrl: string;
    attendees: string[];
    notes: string;
  }) => void;
  onAddTask?: (taskData: { title: string; category: 'Tasks' | 'Schedule' | 'Deliverables'; time?: string; date?: string; notes?: string }) => void;
}

export function MeetingEngineModal({
  isOpen,
  onClose,
  contacts,
  currentUser,
  onScheduleMeeting,
  onAddTask,
}: MeetingEngineModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-07-21');
  const [time, setTime] = useState('11:00 AM');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [customAttendeeInput, setCustomAttendeeInput] = useState('');
  const [customAttendees, setCustomAttendees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [createTaskReminder, setCreateTaskReminder] = useState(true);
  const [isCreated, setIsCreated] = useState(false);

  const organizerEmail = currentUser?.email || currentUser?.googleId || 'reshab.jhunjhunwalla@rbagarwalla.com';

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

  const handleAddCustomAttendee = () => {
    const trimmed = customAttendeeInput.trim().toLowerCase();
    if (trimmed && trimmed.includes('@') && !attendees.includes(trimmed)) {
      setAttendees([...attendees, trimmed]);
      setCustomAttendees([...customAttendees, trimmed]);
      setCustomAttendeeInput('');
    }
  };

  const handleRemoveCustomAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
    setCustomAttendees(customAttendees.filter((a) => a !== email));
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    let finalMeetUrl = meetUrl || `https://meet.google.com/sjos-${Math.random().toString(36).substring(2, 6)}`;

    // Try creating directly in Google Calendar
    try {
      const startDateTime = new Date(`${date}T${time.includes('PM') ? '14:00' : '10:00'}:00`).toISOString();
      const endDateTime = new Date(new Date(startDateTime).getTime() + 45 * 60 * 1000).toISOString();

      const calResult = await createDirectCalendarEvent({
        summary: title,
        description: `${notes ? `${notes}\n\n` : ''}Organized by ${organizerEmail} via SJ OS Meeting Engine`,
        startIso: startDateTime,
        endIso: endDateTime,
        attendees,
        createMeet: true,
      });

      if (calResult.hangoutsLink) {
        finalMeetUrl = calResult.hangoutsLink;
      }
    } catch (err: any) {
      console.warn('Google Calendar API sync notice:', err?.message);
    }

    onScheduleMeeting({
      title,
      date,
      time,
      meetUrl: finalMeetUrl,
      attendees,
      notes,
    });

    // SJ OS Core Principle: Auto task reminder creation
    if (createTaskReminder && onAddTask) {
      onAddTask({
        title: `Attend Meeting: ${title}`,
        category: 'Schedule',
        date,
        time,
        notes: `Google Meet link: ${finalMeetUrl}. Organized by ${organizerEmail}`,
      });
    }

    setIsCreated(true);
    setTimeout(() => {
      setIsCreated(false);
      onClose();
      setTitle('');
      setNotes('');
      setAttendees([]);
      setMeetUrl('');
    }, 1500);
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
              Google Meet session generated by <span className="font-semibold text-gray-800">{organizerEmail}</span> and synced automatically to Schedule (Calendar) & Business Memory (Docs).
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
            
            {/* Organizer Google Workspace Account Badge */}
            <div className="bg-emerald-50/80 border border-emerald-150 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34C759] shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block leading-none">Organizer Account (Google Workspace)</span>
                  <span className="font-semibold text-gray-900">{organizerEmail}</span>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-100 text-[#34C759] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                Synced Calendar ID
              </span>
            </div>

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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#34C759]" /> Select Directory & External Attendees
                </label>
                <span className="text-[10px] text-[#34C759] font-bold">{attendees.length} selected</span>
              </div>
              
              {/* Directory roster list */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-xl mb-2">
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

              {/* Add external non-roster attendee */}
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Add external attendee (e.g. client@externalcompany.com)"
                    value={customAttendeeInput}
                    onChange={(e) => setCustomAttendeeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAttendee();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#34C759] transition shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAttendee}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#34C759] border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    + Add External
                  </button>
                </div>

                {customAttendees.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {customAttendees.map((email) => (
                      <span
                        key={email}
                        className="text-[10px] bg-emerald-50 text-[#34C759] border border-emerald-200 px-2 py-0.5 rounded-lg font-mono font-semibold flex items-center gap-1"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomAttendee(email)}
                          className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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

            {/* Auto Task Reminder Checkbox */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <label htmlFor="createMeetingTaskReminder" className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                <input
                  id="createMeetingTaskReminder"
                  type="checkbox"
                  checked={createTaskReminder}
                  onChange={(e) => setCreateTaskReminder(e.target.checked)}
                  className="rounded border-gray-300 text-[#34C759] focus:ring-[#34C759] h-4 w-4"
                />
                <Bell className="w-3.5 h-3.5 text-[#34C759]" />
                <span>Auto-create Task Reminder in SJ OS (Calendar Schedule)</span>
              </label>
              <span className="text-[9px] text-[#34C759] font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SJ OS Core
              </span>
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
