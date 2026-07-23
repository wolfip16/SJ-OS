/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useRef, useEffect } from 'react';
import { CalendarItem, CalendarItemType } from '../types';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Plus,
  RotateCw,
  Sparkles,
  Zap,
  Coffee,
  Mail,
  User,
  AlertTriangle,
  BrainCircuit,
  FileCheck2,
  ListFilter,
  Check,
  Video,
  ExternalLink,
  Grid,
  List,
} from 'lucide-react';

interface CalendarViewProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  calendarItems: CalendarItem[];
  onToggleComplete: (id: string) => void;
  onRebalanceDay: (date: string) => void;
  onSelectContact: (contactId: string) => void;
  onPostponeTask?: (id: string) => void;
}

export function CalendarView({
  selectedDate,
  onSelectDate,
  calendarItems,
  onToggleComplete,
  onRebalanceDay,
  onSelectContact,
  onPostponeTask,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'tasks' | 'month'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  // Ref to scroll grid to business hours (08:00) automatically
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode === 'grid' && gridContainerRef.current) {
      // 08:00 is slot 32 (32 * 36px row height = 1152px approx)
      gridContainerRef.current.scrollTop = 32 * 34;
    }
  }, [viewMode]);

  // Current month for Month View
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = selectedDate.split('-');
    return { year: parseInt(parts[0]) || 2026, month: parseInt(parts[1]) || 7 };
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateMonthGrid = () => {
    const year = currentMonth.year;
    const month = currentMonth.month; // 1-indexed
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }
    return days;
  };
  
  // Local form for custom events
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarItemType>('call');
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState(30);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newRepeatRule, setNewRepeatRule] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Filter and sort items for selected date
  const itemsForDate = calendarItems
    .filter((item) => item.date === selectedDate)
    .filter((item) => filterType === 'all' || item.type === filterType)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Count metrics
  const completedCount = itemsForDate.filter((i) => i.completed).length;
  const totalCount = itemsForDate.length;

  const handleCreateCustomEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: CalendarItem = {
      id: `custom_event_${Date.now()}`,
      title: newTitle,
      type: newType,
      date: selectedDate,
      time: newTime,
      durationMinutes: Number(newDuration),
      priority: newPriority,
      repeatRule: newRepeatRule,
      completed: false,
    };

    const customEvent = new CustomEvent('sj_os_add_calendar_item', { detail: newItem });
    window.dispatchEvent(customEvent);

    setNewTitle('');
    setIsAddingEvent(false);
  };

  // Icon selector based on Calendar Type
  const getTypeIcon = (type: CalendarItemType) => {
    switch (type) {
      case 'call':
        return <Zap className="w-3.5 h-3.5 text-orange-500" />;
      case 'meeting':
        return <User className="w-3.5 h-3.5 text-blue-500" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-emerald-500" />;
      case 'drawing':
        return <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />;
      case 'quote':
        return <FileCheck2 className="w-3.5 h-3.5 text-pink-500" />;
      case 'break':
        return <Coffee className="w-3.5 h-3.5 text-amber-500" />;
      case 'deep_work':
        return <Sparkles className="w-3.5 h-3.5 text-violet-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const formattedFullDate = (() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  })();

  // Generate 15-Minute Quarter-Hour Time Slots (00:00-00:15 to 23:45-24:00)
  const timeSlots = (() => {
    const slots: { label: string; timeKey: string; startMin: number }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const startH = String(h).padStart(2, '0');
        const startM = String(m).padStart(2, '0');
        let nextH = h;
        let nextM = m + 15;
        if (nextM >= 60) {
          nextM = 0;
          nextH = h + 1;
        }
        const endHStr = nextH === 24 ? '24' : String(nextH).padStart(2, '0');
        const endMStr = String(nextM).padStart(2, '0');
        const timeKey = `${startH}:${startM}`;
        const label = `${startH}:${startM}-${endHStr}:${endMStr}`;
        slots.push({ label, timeKey, startMin: h * 60 + m });
      }
    }
    return slots;
  })();

  // Generate 7 Columns for Week Dates
  const weekDays = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dayOfWeek = dt.getDay(); // 0 = Sun
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monDate = new Date(dt);
    monDate.setDate(dt.getDate() + diffToMon);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monDate);
      cur.setDate(monDate.getDate() + i);
      const year = cur.getFullYear();
      const monthStr = String(cur.getMonth() + 1).padStart(2, '0');
      const dayStr = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({
        dateStr,
        dayName: dayNames[i],
        dayNumber: cur.getDate(),
        monthShort: cur.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateStr === '2026-07-21',
        isSelected: dateStr === selectedDate,
      });
    }
    return days;
  })();

  // Helper to convert time string (HH:MM) to total minutes
  const parseTimeToMin = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-2xl shadow-xs p-4 flex flex-col h-full overflow-hidden">
      {/* Prominent Header Banner */}
      <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 p-3 rounded-xl mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#007AFF] shrink-0" />
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {formattedFullDate}
            </h2>
            <p className="text-[10px] font-bold text-[#007AFF] uppercase tracking-wider">
              Living Calendar & Workload Schedule
            </p>
          </div>
        </div>

        {/* View Mode Switcher: Grid Calendar, Task Checklist, Month View */}
        <div className="flex items-center bg-white dark:bg-[#2C2C2E] p-0.5 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-2xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'grid'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <Grid className="w-3 h-3" />
            15-Min Grid
          </button>
          <button
            onClick={() => setViewMode('tasks')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'tasks'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <List className="w-3 h-3" />
            Task Reminders
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Control Actions Header */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[#F2F2F7] dark:border-[#2C2C2E] shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingEvent(!isAddingEvent)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Event
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsJoinModalOpen(!isJoinModalOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#34C759] hover:bg-emerald-600 text-white text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Join or launch a Google Meet session"
            >
              <Video className="w-3.5 h-3.5" />
              Join Meeting
            </button>
            <button
              onClick={() => onRebalanceDay(selectedDate)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-xs font-bold text-gray-900 dark:text-white transition-all active:scale-95 cursor-pointer border border-gray-200 dark:border-neutral-700"
              title="Alternates mental heavy items with breaks to balance energy"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#007AFF]" />
              Rebalance
            </button>
          </div>
        </div>

        {/* Join Google Meet Drawer Banner */}
        {isJoinModalOpen && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#34C759] uppercase tracking-wider flex items-center gap-1">
                <Video className="w-3.5 h-3.5" /> Join Google Meet Session
              </span>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Paste Meet URL or Code (e.g. abc-defg-hij)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    let url = joinCodeInput.trim();
                    if (!url) {
                      url = 'https://meet.google.com/new';
                    } else if (!url.startsWith('http')) {
                      url = `https://meet.google.com/${url}`;
                    }
                    window.open(url, '_blank');
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-mono text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#34C759]"
              />
              <button
                onClick={() => {
                  let url = joinCodeInput.trim();
                  if (!url) {
                    url = 'https://meet.google.com/new';
                  } else if (!url.startsWith('http')) {
                    url = `https://meet.google.com/${url}`;
                  }
                  window.open(url, '_blank');
                }}
                className="px-3 py-1.5 bg-[#34C759] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
              >
                <ExternalLink className="w-3 h-3" /> Join Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Event Form */}
      {isAddingEvent && (
        <form
          onSubmit={handleCreateCustomEvent}
          className="bg-blue-50/80 dark:bg-neutral-850 p-3.5 rounded-xl border border-blue-200 dark:border-neutral-800 space-y-2.5 my-2 animate-fadeIn shrink-0"
        >
          <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-[#007AFF]">
            Schedule Event / Task Block ({selectedDate})
          </h4>
          
          <input
            type="text"
            placeholder="Event Title (e.g. Client Design Alignment)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs focus:ring-1 focus:ring-[#007AFF] focus:outline-hidden text-gray-900 dark:text-white"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-gray-500 font-bold uppercase mb-0.5">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as CalendarItemType)}
                className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs dark:text-white"
              >
                <option value="call">Call Block</option>
                <option value="meeting">Meeting Block</option>
                <option value="email">Email Task</option>
                <option value="drawing">Drawing (CAD)</option>
                <option value="quote">Quotation formulation</option>
                <option value="deep_work">Deep Work Block</option>
                <option value="break">Mental Break</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] text-gray-500 font-bold uppercase mb-0.5">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs dark:text-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-gray-500 font-bold uppercase mb-0.5">Start Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] text-gray-500 font-bold uppercase mb-0.5">Duration (mins)</label>
              <input
                type="number"
                min="5"
                max="180"
                step="5"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-[#007AFF] text-white font-extrabold text-[11px] rounded-lg shadow-xs hover:bg-blue-600 cursor-pointer"
            >
              Save Schedule Block
            </button>
          </div>
        </form>
      )}

      {/* VIEW MODE 1: 15-Minute Quarter-Hour Scrollable Grid Calendar */}
      {viewMode === 'grid' && (
        <div className="flex-1 flex flex-col min-h-0 mt-2">
          {/* Grid Sub-Header bar */}
          <div className="flex items-center justify-between pb-2 text-[11px] font-extrabold text-gray-600 dark:text-gray-300 shrink-0">
            <span className="uppercase tracking-wider font-extrabold text-[#007AFF] flex items-center gap-1">
              <Grid className="w-3.5 h-3.5" />
              15-Minute Quarter-Hour Grid Schedule
            </span>
            <span className="text-[10px] font-bold text-gray-500">
              Scrollable 00:00-00:15 to 23:45-24:00 (Click slot to schedule)
            </span>
          </div>

          {/* Scrollable Grid Table */}
          <div
            ref={gridContainerRef}
            className="flex-1 overflow-auto border border-gray-200 dark:border-neutral-800 rounded-xl relative scrollbar-thin bg-gray-50/50 dark:bg-neutral-900"
          >
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-neutral-800 shadow-xs">
                <tr>
                  <th className="sticky left-0 z-30 bg-gray-200 dark:bg-neutral-800 p-2 text-[10px] font-extrabold text-gray-800 dark:text-gray-100 uppercase w-28 border-b border-r border-gray-200 dark:border-neutral-700 text-center">
                    Time Slot
                  </th>
                  {weekDays.map((col) => (
                    <th
                      key={col.dateStr}
                      onClick={() => onSelectDate(col.dateStr)}
                      className={`p-2 text-center text-[10px] font-extrabold border-b border-r border-gray-200 dark:border-neutral-700 cursor-pointer transition ${
                        col.isSelected
                          ? 'bg-blue-100 dark:bg-blue-950 text-[#007AFF] dark:text-blue-300 font-black'
                          : col.isToday
                          ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                          : 'text-gray-800 dark:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <div className="uppercase leading-none">{col.dayName}</div>
                      <div className="text-xs mt-0.5 font-black">{col.dayNumber} {col.monthShort}</div>
                      {col.isToday && <span className="text-[8px] bg-amber-500 text-white font-extrabold px-1 rounded inline-block mt-0.5">Today</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {timeSlots.map((slot) => (
                  <tr key={slot.timeKey} className="hover:bg-blue-50/30 dark:hover:bg-neutral-800/30 transition">
                    {/* Time Heading Row Label */}
                    <td className="sticky left-0 z-10 bg-gray-100 dark:bg-neutral-800 p-1.5 text-[9px] font-mono font-extrabold text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-neutral-700 text-center select-none">
                      {slot.label}
                    </td>

                    {/* 7 Columns for each Day */}
                    {weekDays.map((col) => {
                      // Find items matching this date and time slot
                      const cellItems = calendarItems.filter((item) => {
                        if (item.date !== col.dateStr) return false;
                        const itemMin = parseTimeToMin(item.time);
                        return itemMin >= slot.startMin && itemMin < slot.startMin + 15;
                      });

                      return (
                        <td
                          key={`${col.dateStr}_${slot.timeKey}`}
                          onClick={(e) => {
                            // Don't trigger slot click if clicking an event button inside
                            if ((e.target as HTMLElement).closest('.event-pill')) return;
                            onSelectDate(col.dateStr);
                            setNewTime(slot.timeKey);
                            setIsAddingEvent(true);
                          }}
                          className={`p-1 border-r border-gray-200/70 dark:border-neutral-800 h-9 transition cursor-pointer relative ${
                            col.isSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                          }`}
                        >
                          {cellItems.length > 0 && (
                            <div className="space-y-1">
                              {cellItems.map((item) => (
                                <div
                                  key={item.id}
                                  className={`event-pill p-1 rounded-md text-[9px] font-bold border transition shadow-2xs flex items-center justify-between gap-1 ${
                                    item.completed
                                      ? 'bg-gray-200 dark:bg-neutral-800 text-gray-400 line-through border-gray-300'
                                      : item.priority === 'high'
                                      ? 'bg-red-500 text-white border-red-600'
                                      : item.priority === 'medium'
                                      ? 'bg-[#007AFF] text-white border-blue-600'
                                      : 'bg-emerald-500 text-white border-emerald-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-1 min-w-0 truncate">
                                    <button
                                      onClick={() => onToggleComplete(item.id)}
                                      className="p-0.5 rounded bg-white/20 hover:bg-white/40 cursor-pointer"
                                    >
                                      {item.completed ? <Check className="w-2.5 h-2.5 stroke-[3px]" /> : <span className="block w-2.5 h-2.5 border border-white rounded-full" />}
                                    </button>
                                    <span className="truncate">{item.title}</span>
                                  </div>
                                  <span className="font-mono text-[8px] opacity-80 shrink-0">{item.time}</span>
                                </div>
                              ))}
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
        </div>
      )}

      {/* VIEW MODE 2: Task Reminders Checklist */}
      {viewMode === 'tasks' && (
        <div className="flex-1 flex flex-col min-h-0 mt-2 space-y-2">
          {/* Clean Task App Reminder Quick Add Bar & List Header */}
          <div className="bg-blue-50/50 dark:bg-neutral-900 p-3 rounded-xl border border-blue-100 dark:border-neutral-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#007AFF]" />
                Today's Task Reminders Checklist ({selectedDate})
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {completedCount} / {totalCount} Done ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)
              </span>
            </div>

            {/* Quick Add Pointer Input */}
            <form onSubmit={handleCreateCustomEvent} className="flex gap-2">
              <input
                type="text"
                placeholder="➕ Quick add a new reminder task to tick off..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-extrabold rounded-lg transition cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Pointer
              </button>
            </form>

            {/* Quick progress bar */}
            <div className="w-full bg-gray-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#007AFF] h-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between py-1 text-[11px] font-bold shrink-0">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400">
              <ListFilter className="w-3 h-3" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold text-gray-700 dark:text-neutral-300 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Reminders</option>
                <option value="call">Calls Only</option>
                <option value="meeting">Meetings</option>
                <option value="email">Emails</option>
                <option value="drawing">CAD Drawings</option>
                <option value="quote">Quotations</option>
                <option value="deep_work">Deep Work</option>
                <option value="break">Breaks</option>
              </select>
            </div>
            <span className="text-gray-500 dark:text-neutral-400">
              Done: <span className="text-emerald-500 font-extrabold">{completedCount}</span>/{totalCount}
            </span>
          </div>

          {/* Task Checklist Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
            {itemsForDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-neutral-500">
                <CheckCircle className="w-8 h-8 text-gray-200 dark:text-neutral-800 mb-2" />
                <p className="text-xs font-bold">No task reminders scheduled for {selectedDate}</p>
              </div>
            ) : (
              itemsForDate.map((item) => {
                const priorityColors = {
                  high: 'border-l-4 border-l-red-500',
                  medium: 'border-l-4 border-l-amber-500',
                  low: 'border-l-4 border-l-gray-300 dark:border-l-neutral-700',
                };

                return (
                  <div
                    key={item.id}
                    className={`p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 transition flex items-center justify-between gap-3 ${
                      priorityColors[item.priority]
                    } ${item.completed ? 'opacity-60 bg-white dark:bg-neutral-900' : ''}`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleComplete(item.id)}
                        className={`mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border transition shrink-0 ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-neutral-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 font-mono">
                            {item.time}
                          </span>
                          {getTypeIcon(item.type)}
                        </div>
                        
                        <h4
                          className={`text-xs font-bold text-gray-900 dark:text-white mt-0.5 leading-snug truncate ${
                            item.completed ? 'line-through text-gray-400 dark:text-neutral-500' : ''
                          }`}
                        >
                          {item.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.contactId && (
                            <button
                              onClick={() => onSelectContact(item.contactId!)}
                              className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 transition"
                            >
                              <User className="w-3.5 h-3.5" /> Partner
                            </button>
                          )}
                          {!item.completed && onPostponeTask && (
                            <button
                              onClick={() => onPostponeTask(item.id)}
                              className="text-[10px] text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold flex items-center gap-0.5 transition"
                            >
                              <Clock className="w-3.5 h-3.5" /> Postpone
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono font-bold text-gray-400 dark:text-neutral-500 shrink-0 select-none">
                      {item.durationMinutes}m
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: Month View */}
      {viewMode === 'month' && (
        <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-2 mt-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {monthNames[currentMonth.month - 1]} {currentMonth.year}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(prev => ({ ...prev, month: prev.month === 1 ? 12 : prev.month - 1, year: prev.month === 1 ? prev.year - 1 : prev.year }))}
                className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-xs font-bold hover:bg-gray-100 cursor-pointer text-gray-700 dark:text-gray-200"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentMonth(prev => ({ ...prev, month: prev.month === 12 ? 1 : prev.month + 1, year: prev.month === 12 ? prev.year + 1 : prev.year }))}
                className="px-2 py-0.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-xs font-bold hover:bg-gray-100 cursor-pointer text-gray-700 dark:text-gray-200"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-gray-400 dark:text-neutral-500 uppercase">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {generateMonthGrid().map((item, idx) => {
              if (!item) {
                return <div key={`empty_${idx}`} className="h-10" />;
              }
              const isSelected = selectedDate === item.dateStr;
              const dateItems = calendarItems.filter((i) => i.date === item.dateStr);
              const hasEvents = dateItems.length > 0;
              const isToday = item.dateStr === '2026-07-21';

              return (
                <button
                  key={item.dateStr}
                  onClick={() => {
                    onSelectDate(item.dateStr);
                  }}
                  className={`h-10 rounded-lg p-1 flex flex-col items-center justify-between transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#007AFF] text-white font-extrabold shadow-sm'
                      : isToday
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-[#007AFF] border border-blue-300 font-bold'
                      : 'bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <span className="text-[10px] leading-none">{item.day}</span>
                  {hasEvents && (
                    <span className={`text-[8px] font-mono px-1 rounded-xs font-bold ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}>
                      {dateItems.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
