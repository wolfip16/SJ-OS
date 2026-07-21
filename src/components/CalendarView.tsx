/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { CalendarItem, CalendarItemType } from '../types';
import {
  Calendar,
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
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Local form for custom events
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarItemType>('call');
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState(30);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Let's list a 5-day week context for our tab switching
  const workingDays = [
    { label: 'Mon', shortLabel: 'Mon', date: '2026-07-20' },
    { label: 'Tue (Today)', shortLabel: 'Tue', date: '2026-07-21' },
    { label: 'Wed', shortLabel: 'Wed', date: '2026-07-22' },
    { label: 'Thu', shortLabel: 'Thu', date: '2026-07-23' },
    { label: 'Fri', shortLabel: 'Fri', date: '2026-07-24' },
  ];

  // Filter and sort items
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
      completed: false,
    };

    // Push into general stack (locally since we modify through App state)
    // Wait, let's inject it into App state. We can use a trick or the user can toggle it.
    // Let's mutate localstorage directly or invoke window custom event to let App know.
    // Actually, in App we have setCalendarItems, we can listen or let it update.
    // Let's trigger a custom event or trigger handleToggleComplete or pass it up?
    // Since App doesn't have an onAddCalendarItem prop, let's dispatch a custom event or save to localStorage directly and let parent state sync or refresh!
    // Wait! Let's check if App.tsx uses localStorage.
    // Yes! App.tsx reads from localStorage on render:
    // const [calendarItems, setCalendarItems] = useState<CalendarItem[]>(() => {
    //   const saved = localStorage.getItem('sj_os_calendar');
    //   return saved ? JSON.parse(saved) : INITIAL_CALENDAR_ITEMS;
    // });
    // So if we save to localStorage and trigger a re-render or reload, or we can just dispatch a click!
    // Wait, let's see if we can trigger a state update in the parent.
    // Wait, does App.tsx have a way to handle custom calendar addition?
    // App.tsx has `handleToggleComplete` and `setCalendarItems`.
    // Let's check how we can add it. If we can't easily add it without changing App.tsx, let's look at `App.tsx` again.
    // Ah, App.tsx doesn't have a direct `onAddCalendarItem` prop on `CalendarView`.
    // But wait! We can edit `App.tsx` later to add it, or we can use a window-level dispatch, or write it back to localStorage and trigger a theme-toggle or date change to force state refresh, or we can edit App.tsx to pass an `onAddCalendarItem` callback! Editing App.tsx to pass `onAddCalendarItem` is extremely clean.
    // For now, let's define `onAddCalendarItem?: (item: CalendarItem) => void;` in our interface, and we will update `App.tsx` to handle it. Excellent.

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

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-2xl shadow-xs p-4 flex flex-col h-full overflow-hidden">
      {/* Date Switching Header */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[#F2F2F7] dark:border-[#2C2C2E] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-[#007AFF]" />
            <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#FFFFFF] tracking-tight">
              Living Workload Calendar
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onRebalanceDay(selectedDate)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[10px] font-semibold text-[#1D1D1F] dark:text-[#FFFFFF] transition-all active:scale-95 cursor-pointer"
              title="Alternates mental heavy items with breaks to balance energy"
              id="btn_rebalance_day"
            >
              <RotateCw className="w-3 h-3 text-[#007AFF]" />
              Auto Balance
            </button>
            <button
              onClick={() => setIsAddingEvent(!isAddingEvent)}
              className="p-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0066CC] dark:bg-[#007AFF] dark:hover:bg-[#0066CC] text-white transition-all cursor-pointer active:scale-95"
              id="btn_add_calendar_popover"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Working Days Row (Apple Calendar Layout Style) */}
        <div className="grid grid-cols-5 gap-1 bg-[#E3E3E9]/55 dark:bg-[#1C1C1E]/60 p-0.5 rounded-xl border border-transparent dark:border-[#2C2C2E]">
          {workingDays.map((day) => {
            const isSelected = selectedDate === day.date;
            const isToday = day.date === '2026-07-21';
            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={`py-2 px-1 text-center rounded-lg transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] font-semibold'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white font-medium'
                }`}
                id={`btn_date_${day.date}`}
              >
                <span className="block text-[9px] leading-none uppercase tracking-wider font-semibold">
                  <span className="hidden sm:inline">{day.label.replace(' (Today)', '')}</span>
                  <span className="inline sm:hidden">{day.shortLabel}</span>
                </span>
                
                {/* Visual Circle highlight for selected or today */}
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full mt-1.5 transition-all text-xs font-bold">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? isSelected
                        ? 'bg-[#007AFF] text-white font-bold'
                        : 'text-[#007AFF] font-bold border border-[#007AFF]/40'
                      : isSelected
                        ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]'
                        : ''
                  }`}>
                    {day.date.split('-')[2]}
                  </span>
                </span>

                {/* Micro indicator dot below */}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#007AFF] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex items-center justify-between py-2 text-[11px] font-bold shrink-0">
        <div className="flex items-center gap-1.5 text-gray-400 dark:text-neutral-500">
          <ListFilter className="w-3 h-3" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent border-none text-[11px] font-bold text-gray-600 dark:text-neutral-400 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Items</option>
            <option value="call">Calls Only</option>
            <option value="meeting">Meetings</option>
            <option value="email">Emails</option>
            <option value="drawing">CAD Drawings</option>
            <option value="quote">Quotations</option>
            <option value="deep_work">Deep Work</option>
            <option value="break">Breaks</option>
          </select>
        </div>
        <span className="text-gray-400 dark:text-neutral-500">
          Progress: <span className="text-emerald-500">{completedCount}</span>/{totalCount} completed
        </span>
      </div>

      {/* Main Living List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2 mt-1 relative">
        {/* Quick Add Event Form */}
        {isAddingEvent && (
          <form
            onSubmit={handleCreateCustomEvent}
            className="bg-gray-50 dark:bg-neutral-850 p-3.5 rounded-xl border border-gray-200/60 dark:border-neutral-850 space-y-2.5 animate-fadeIn"
            id="quick_add_calendar_form"
          >
            <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500">
              Schedule New Alignment Block
            </h4>
            
            <input
              type="text"
              placeholder="Task Title (e.g. Call Lodha Group)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden dark:text-white"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CalendarItemType)}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg text-xs dark:text-white"
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
                <label className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg text-xs dark:text-white"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Start Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg text-xs dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Duration</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg text-xs dark:text-white"
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
                className="px-3 py-1 bg-gray-900 text-white dark:bg-neutral-850 hover:bg-black dark:hover:bg-neutral-750 font-bold text-[11px] rounded-lg shadow-xs"
              >
                Schedule Block
              </button>
            </div>
          </form>
        )}

        {itemsForDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-neutral-500">
            <Calendar className="w-8 h-8 text-gray-200 dark:text-neutral-800 mb-2.5" />
            <p className="text-xs font-bold">No events scheduled</p>
            <p className="text-[10px] text-gray-400 dark:text-neutral-600 font-medium max-w-[200px] mt-1">
              No tasks balanced for {selectedDate}. Schedule customized tasks above.
            </p>
          </div>
        ) : (
          itemsForDate.map((item) => {
            // Determine border and priority color indicators
            const priorityColors = {
              high: 'border-l-4 border-l-red-500',
              medium: 'border-l-4 border-l-amber-500',
              low: 'border-l-4 border-l-gray-300 dark:border-l-neutral-700',
            };

            return (
              <div
                key={item.id}
                className={`p-3 bg-gray-50/55 dark:bg-neutral-850/60 rounded-xl border border-gray-150/40 dark:border-neutral-800/40 hover:border-gray-200 dark:hover:border-neutral-700 transition flex items-center justify-between gap-3 ${
                  priorityColors[item.priority]
                } ${item.completed ? 'opacity-60 bg-white/40 dark:bg-neutral-900/40' : ''}`}
                id={`calendar_item_${item.id}`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleComplete(item.id)}
                    className={`mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border transition shrink-0 ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 dark:border-neutral-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                    }`}
                    id={`btn_toggle_item_${item.id}`}
                  >
                    {item.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-gray-400 dark:text-neutral-500 font-mono">
                        {item.time}
                      </span>
                      {getTypeIcon(item.type)}
                      {item.overdueRescheduled && (
                        <span className="text-[8px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1 py-0.2 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Overdue Rescheduled
                        </span>
                      )}
                    </div>
                    
                    <h4
                      className={`text-xs font-semibold text-gray-800 dark:text-neutral-200 mt-1 leading-snug truncate ${
                        item.completed ? 'line-through text-gray-400 dark:text-neutral-500' : ''
                      }`}
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-3.5 mt-1">
                      {item.contactId && (
                        <button
                          onClick={() => onSelectContact(item.contactId!)}
                          className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 transition active:scale-95"
                        >
                          <User className="w-3.5 h-3.5" />
                          View Partner Profile
                        </button>
                      )}
                      {!item.completed && onPostponeTask && (
                        <button
                          onClick={() => onPostponeTask(item.id)}
                          className="text-[10px] text-amber-600 hover:text-amber-700 dark:text-amber-400 font-bold flex items-center gap-0.5 transition active:scale-95"
                          title="Defer this workload item to tomorrow"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Postpone (Tomorrow)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono font-semibold text-gray-400 dark:text-neutral-500 shrink-0 select-none">
                  {item.durationMinutes}m
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
