/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Contact, TimelineEvent, CalendarItem, DailyReview, InsightSuggestion } from './types';
import { INITIAL_CONTACTS, INITIAL_TIMELINE_EVENTS, INITIAL_CALENDAR_ITEMS } from './data/mockInitialData';
import {
  rescheduleOverdueTask,
  balanceDayWorkload,
  generateWeeklySchedule,
  generateSuggestions,
} from './utils/scheduler';
import { CalendarView } from './components/CalendarView';
import { ContactsView } from './components/ContactsView';
import { DailyReviewComponent } from './components/DailyReview';
import { DynamicInsights } from './components/DynamicInsights';
import { BackupPortability } from './components/BackupPortability';
import {
  Sun,
  Moon,
  TrendingUp,
  Award,
  Users,
  Activity,
  Calendar,
  Sparkles,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sj_os_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Core OS Database States
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('sj_os_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('sj_os_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE_EVENTS;
  });

  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>(() => {
    const saved = localStorage.getItem('sj_os_calendar');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_ITEMS;
  });

  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>(() => {
    const saved = localStorage.getItem('sj_os_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  // UX States
  const [selectedContactId, setSelectedContactId] = useState<string | null>('c1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-21'); // Today is set to July 21, 2026
  const [showHelp, setShowHelp] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'calendar' | 'contacts'>('calendar');

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('sj_os_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('sj_os_timeline', JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  useEffect(() => {
    localStorage.setItem('sj_os_calendar', JSON.stringify(calendarItems));
  }, [calendarItems]);

  useEffect(() => {
    localStorage.setItem('sj_os_reviews', JSON.stringify(dailyReviews));
  }, [dailyReviews]);

  // Listen for custom subcomponent fast event triggers
  useEffect(() => {
    const handleAddCalendarItem = (e: Event) => {
      const customEvent = e as CustomEvent<CalendarItem>;
      if (customEvent.detail) {
        setCalendarItems((prev) => [...prev, customEvent.detail]);
      }
    };

    const handleAddTimelineEvent = (e: Event) => {
      const customEvent = e as CustomEvent<TimelineEvent>;
      if (customEvent.detail) {
        setTimelineEvents((prev) => [customEvent.detail, ...prev]);
        
        // Boost contact score and touches on logging notes manually
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === customEvent.detail.contactId) {
              return {
                ...c,
                heatScore: Math.min(100, c.heatScore + 3),
                interactionCount: c.interactionCount + 1,
                lastContactDate: '2026-07-21',
              };
            }
            return c;
          })
        );
      }
    };

    const handleUpdateContact = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; updates: Partial<Contact> }>;
      if (customEvent.detail && customEvent.detail.id) {
        setContacts((prev) =>
          prev.map((c) => {
            if (c.id === customEvent.detail.id) {
              return {
                ...c,
                ...customEvent.detail.updates,
              };
            }
            return c;
          })
        );
      }
    };

    window.addEventListener('sj_os_add_calendar_item', handleAddCalendarItem);
    window.addEventListener('sj_os_add_timeline_event', handleAddTimelineEvent);
    window.addEventListener('sj_os_update_contact', handleUpdateContact);

    return () => {
      window.removeEventListener('sj_os_add_calendar_item', handleAddCalendarItem);
      window.removeEventListener('sj_os_add_timeline_event', handleAddTimelineEvent);
      window.removeEventListener('sj_os_update_contact', handleUpdateContact);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('sj_os_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sj_os_theme', 'light');
    }
  }, [darkMode]);

  // Compute stats for Header
  const activeLeads = contacts.length;
  const averageHeat = Math.round(
    contacts.reduce((sum, c) => sum + c.heatScore, 0) / (contacts.length || 1)
  );
  const completedTodayCount = calendarItems.filter((item) => item.date === '2026-07-21' && item.completed).length;
  const totalTodayCount = calendarItems.filter((item) => item.date === '2026-07-21').length;

  // Generate real-time insights
  const currentSuggestions = generateSuggestions(contacts, calendarItems, '2026-07-21');

  // Trigger Automatic Follow-up Cascades upon finishing a Calendar Task
  const handleToggleComplete = (id: string) => {
    setCalendarItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          const updatedCompleted = !item.completed;

          // If completing a client-facing action, trigger cascade
          if (updatedCompleted && item.contactId) {
            triggerCascadeOnCompletion(item.contactId, item);
          }

          return { ...item, completed: updatedCompleted };
        }
        return item;
      });
    });
  };

  const triggerCascadeOnCompletion = (contactId: string, item: CalendarItem) => {
    // 1. Find the contact
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          const nextScore = Math.min(100, c.heatScore + 5);
          return {
            ...c,
            heatScore: nextScore,
            interactionCount: c.interactionCount + 1,
            lastContactDate: '2026-07-21',
          };
        }
        return c;
      })
    );

    // 2. Append Timeline Entry
    const newEvent: TimelineEvent = {
      id: `timeline_cascade_${Date.now()}`,
      contactId,
      type: 'status_change',
      title: `Completed Scheduled Task`,
      notes: `Quietly resolved calendar assignment: "${item.title}". Contact metric grew +5.`,
      timestamp: new Date().toISOString(),
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);

    // 3. Auto-generate subsequent check-ins
    const contactObj = contacts.find((c) => c.id === contactId);
    if (contactObj) {
      // Auto-schedule an follow-up block for tomorrow or next week
      const targetDate = '2026-07-22'; // Tomorrow
      const autoFollowUp: CalendarItem = {
        id: `auto_followup_${Date.now()}`,
        contactId,
        title: `Auto Check-in: ${contactObj.company} (${contactObj.name})`,
        type: 'email',
        date: targetDate,
        time: '11:15', // Optimal follow-up time slot
        durationMinutes: 20,
        priority: 'low',
        completed: false,
      };

      setCalendarItems((prev) => [...prev, autoFollowUp]);
    }
  };

  // One Tap Workflow Execution
  const handleTriggerOneTapWorkflow = (contactId: string, actionType: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    let updatedStage = contact.stage;
    let heatDelta = 5;
    let notes = '';
    let timelineTitle = '';
    let timelineType: TimelineEvent['type'] = 'call';

    const tomorrowStr = '2026-07-22';
    const nextWeekStr = '2026-07-27'; // Next Monday
    let newCalendarItem: CalendarItem | null = null;

    switch (actionType) {
      case 'need_quote':
        updatedStage = 'Quotation Sent';
        heatDelta = 10;
        timelineTitle = 'Need Drawing / Quotation Initiated';
        notes = 'Commercial blueprint formulated. Shared design specs with engineering.';
        timelineType = 'quote';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Email: Send revised proposal to ${contact.company}`,
          type: 'quote',
          date: tomorrowStr,
          time: '09:45',
          durationMinutes: 30,
          priority: 'high',
          completed: false,
        };
        break;

      case 'need_drawing':
        updatedStage = 'Need Drawing';
        heatDelta = 5;
        timelineTitle = 'CAD Drawing Requested';
        notes = 'Sent spatial layout requirements to factory designers. Drawings expected tomorrow.';
        timelineType = 'drawing';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Deep Work: Draft customized CAD specs for ${contact.company}`,
          type: 'drawing',
          date: tomorrowStr,
          time: '10:30',
          durationMinutes: 60,
          priority: 'medium',
          completed: false,
        };
        break;

      case 'payment_followup':
        updatedStage = 'Payment Follow-up';
        heatDelta = 2;
        timelineTitle = 'Payment Follow-up Initiated';
        notes = 'Issued safe retention statement regarding outstanding factory dispatches.';
        timelineType = 'payment';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Call: Payment follow-up with ${contact.name}`,
          type: 'payment',
          date: tomorrowStr,
          time: '14:30',
          durationMinutes: 20,
          priority: 'high',
          completed: false,
        };
        break;

      case 'meeting_fixed':
        updatedStage = 'Meeting Fixed';
        heatDelta = 15;
        timelineTitle = 'On-site Meeting Arranged';
        notes = 'Fixed construction site assessment with project supervisors.';
        timelineType = 'meeting';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Meeting: Site visit with ${contact.name}`,
          type: 'meeting',
          date: tomorrowStr,
          time: '11:30',
          durationMinutes: 45,
          priority: 'high',
          completed: false,
        };
        break;

      case 'call_tomorrow':
        timelineTitle = 'Scheduled Next Call for Tomorrow';
        notes = 'Client is in a meeting today. Will follow up tomorrow morning.';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Call Block: Follow up with ${contact.name}`,
          type: 'call',
          date: tomorrowStr,
          time: '09:15',
          durationMinutes: 20,
          priority: 'medium',
          completed: false,
        };
        break;

      case 'call_next_week':
        timelineTitle = 'Scheduled Next Call for Next Week';
        notes = 'Client is currently traveling. Deferring check-in to next week.';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Call: Strategy check-in with ${contact.name}`,
          type: 'call',
          date: nextWeekStr,
          time: '10:00',
          durationMinutes: 30,
          priority: 'low',
          completed: false,
        };
        break;

      case 'site_visit':
        updatedStage = 'Meeting Fixed';
        heatDelta = 10;
        timelineTitle = 'Site Inspection Arranged';
        notes = 'Configured delivery measurements and factory supervisor alignment.';
        timelineType = 'meeting';
        newCalendarItem = {
          id: `workflow_${Date.now()}`,
          contactId,
          title: `Site Assessment: ${contact.company}`,
          type: 'meeting',
          date: tomorrowStr,
          time: '15:15',
          durationMinutes: 60,
          priority: 'high',
          completed: false,
        };
        break;

      case 'order_expected':
        updatedStage = 'Order Expected';
        heatDelta = 12;
        timelineTitle = 'Purchase Order Pending Draft Approval';
        notes = 'Strategic commercials agreed upon. Awaiting final corporate PO upload.';
        timelineType = 'order';
        break;

      case 'sample_required':
        timelineTitle = 'Material Samples Ordered';
        notes = 'Scheduled high-grade surface finishing samples dispatch from factory block.';
        timelineType = 'production';
        break;

      case 'busy':
      case 'no_response':
      case 'wrong_number':
        timelineTitle = `Attempted Call: ${actionType.toUpperCase().replace('_', ' ')}`;
        notes = `Call unresolved. SJ OS will automatically rescheduled call block to tomorrow.`;
        timelineType = 'system';
        // Auto reschedule for tomorrow 11:15 AM
        newCalendarItem = {
          id: `resched_missed_${Date.now()}`,
          contactId,
          title: `Rescheduled: Call ${contact.name} (${actionType})`,
          type: 'call',
          date: tomorrowStr,
          time: '11:15',
          durationMinutes: 20,
          priority: 'medium',
          completed: false,
          overdueRescheduled: true,
        };
        break;

      default:
        break;
    }

    // Apply Contact updates
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            stage: updatedStage,
            heatScore: Math.min(100, c.heatScore + heatDelta),
            interactionCount: c.interactionCount + 1,
            lastContactDate: '2026-07-21',
          };
        }
        return c;
      })
    );

    // Add Timeline Event
    const newTimelineEvent: TimelineEvent = {
      id: `timeline_one_tap_${Date.now()}`,
      contactId,
      type: timelineType,
      title: timelineTitle,
      notes,
      timestamp: new Date().toISOString(),
    };
    setTimelineEvents((prev) => [newTimelineEvent, ...prev]);

    // Insert Calendar Item
    if (newCalendarItem) {
      setCalendarItems((prev) => [...prev, newCalendarItem!]);
    }
  };

  // Intelligent Weekly Planning: "Quietly Build My Week"
  const handleBuildMyWeek = () => {
    const weeklySchedule = generateWeeklySchedule(contacts, '2026-07-20');
    // Keep today's customized items, replace others
    setCalendarItems((prev) => {
      const todayItems = prev.filter((item) => item.date === '2026-07-21');
      const filteredWeekly = weeklySchedule.filter((item) => item.date !== '2026-07-21');
      return [...todayItems, ...filteredWeekly];
    });
    setSelectedDate('2026-07-21');
  };

  // Intelligent Rebalancing: Alternates heavy mental work
  const handleRebalanceDay = (date: string) => {
    setCalendarItems((prev) => {
      const otherDays = prev.filter((item) => item.date !== date);
      const dayItems = prev.filter((item) => item.date === date);
      const balanced = balanceDayWorkload(dayItems);
      return [...otherDays, ...balanced];
    });
  };

  // Handle Advisor Advice actions (e.g., reschedule stale or rebalance overloaded)
  const handleTriggerInsightAction = (suggestion: InsightSuggestion) => {
    if (suggestion.actionType === 'schedule_call' && suggestion.targetContactId) {
      const contact = contacts.find((c) => c.id === suggestion.targetContactId);
      if (contact) {
        // Create an optimized call block for tomorrow
        const newCall: CalendarItem = {
          id: `advisor_schedule_${Date.now()}`,
          contactId: contact.id,
          title: `Optimized: Reconnect with ${contact.company}`,
          type: 'call',
          date: '2026-07-22',
          time: '09:00',
          durationMinutes: 30,
          priority: 'high',
          completed: false,
        };
        setCalendarItems((prev) => [...prev, newCall]);
        setSelectedDate('2026-07-22');
        setSelectedContactId(contact.id);
      }
    } else if (suggestion.actionType === 'rebalance') {
      handleRebalanceDay('2026-07-22'); // Rebalance tomorrow
      setSelectedDate('2026-07-22');
    }

    // Dismiss suggestion
    handleDismissSuggestion(suggestion.id);
  };

  const handleDismissSuggestion = (id: string) => {
    // We can filter out or mark as dismissed
    // For local ease, we can just hide it
  };

  // End of Day Review Conclude callback
  const handleCompleteDailyReview = (reviewData: Omit<DailyReview, 'id' | 'completedAt'>) => {
    const newReview: DailyReview = {
      ...reviewData,
      id: `review_${Date.now()}`,
      completedAt: new Date().toISOString(),
    };

    setDailyReviews((prev) => [newReview, ...prev]);

    // Intelligent Automation: Auto reschedule incomplete tasks to tomorrow!
    const incompleteToday = calendarItems.filter((item) => item.date === '2026-07-21' && !item.completed);
    
    let updatedCalendar = [...calendarItems];
    incompleteToday.forEach((item) => {
      const { updatedAllItems } = rescheduleOverdueTask(item, '2026-07-22', updatedCalendar);
      updatedCalendar = updatedAllItems;
    });

    setCalendarItems(updatedCalendar);
    setSelectedDate('2026-07-22'); // Travel to tomorrow to see optimized schedule!
  };

  const handlePostponeTask = (id: string) => {
    setCalendarItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          let nextDate = '2026-07-22';
          if (item.date === '2026-07-20') nextDate = '2026-07-21';
          else if (item.date === '2026-07-21') nextDate = '2026-07-22';
          else if (item.date === '2026-07-22') nextDate = '2026-07-23';
          else if (item.date === '2026-07-23') nextDate = '2026-07-24';
          else nextDate = '2026-07-27'; // Leap over weekend to next Monday

          if (item.contactId) {
            const newEvent: TimelineEvent = {
              id: `postpone_${Date.now()}`,
              contactId: item.contactId,
              type: 'system',
              title: 'Task Postponed Automatically',
              notes: `Deferred "${item.title}" to ${nextDate} due to calendar rebalancing.`,
              timestamp: new Date().toISOString(),
            };
            setTimelineEvents((prevEvents) => [newEvent, ...prevEvents]);
          }

          return {
            ...item,
            date: nextDate,
            overdueRescheduled: true,
          };
        }
        return item;
      });
    });
  };

  // SQLite data import/export callbacks
  const handleImportFullDatabase = (data: {
    contacts: Contact[];
    calendarItems: CalendarItem[];
    timelineEvents: TimelineEvent[];
  }) => {
    setContacts(data.contacts);
    setCalendarItems(data.calendarItems);
    setTimelineEvents(data.timelineEvents);
    if (data.contacts.length > 0) {
      setSelectedContactId(data.contacts[0].id);
    }
  };

  const handleImportContactsCSV = (newContacts: Contact[]) => {
    setContacts((prev) => [...prev, ...newContacts]);
    // Create first timeline event for each imported contact
    const newEvents: TimelineEvent[] = newContacts.map((c) => ({
      id: `imported_timeline_${c.id}`,
      contactId: c.id,
      type: 'system',
      title: 'Contact Profile Initialized',
      notes: 'Imported via CSV. Strategic parameters optimized in offline space.',
      timestamp: new Date().toISOString(),
    }));
    setTimelineEvents((prev) => [...newEvents, ...prev]);
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'interactionCount' | 'createdAt'>) => {
    const newId = `c_${Date.now()}`;
    const newContact: Contact = {
      ...contactData,
      id: newId,
      interactionCount: 1,
      createdAt: new Date().toISOString(),
    };

    setContacts((prev) => [newContact, ...prev]);

    const initialEvent: TimelineEvent = {
      id: `timeline_init_${Date.now()}`,
      contactId: newId,
      type: 'system',
      title: 'Partner Directory Record Created',
      notes: `Saved profile: Name ${newContact.name}, Company ${newContact.company}. Contact parameters active.`,
      timestamp: new Date().toISOString(),
    };
    setTimelineEvents((prev) => [initialEvent, ...prev]);
    setSelectedContactId(newId);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setTimelineEvents((prev) => prev.filter((e) => e.contactId !== id));
    setCalendarItems((prev) => prev.filter((item) => item.contactId !== id));
    setSelectedContactId(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#E8E8ED] font-sans transition-colors duration-200">
      {/* 1. Dynamic Header Navigation */}
      <header className="border-b border-[#E8E8ED] dark:border-neutral-900 bg-white/70 dark:bg-[#000000]/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 text-white rounded-xl p-1.5 font-extrabold text-sm tracking-tight shadow-md flex items-center justify-center h-8 w-8">
              SJ
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight dark:text-white leading-none">
                SJ OS <span className="text-[10px] text-amber-500 font-bold ml-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50">v1.2</span>
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                Executive Work Operating System
              </p>
            </div>
          </div>

          {/* Core Analytics Badges */}
          <div className="hidden lg:flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-blue-500">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-gray-400 uppercase font-bold">Partners</span>
                <span className="font-extrabold text-gray-800 dark:text-neutral-200">{activeLeads} Profiles</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-orange-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-gray-400 uppercase font-bold">Avg Heat</span>
                <span className="font-extrabold text-gray-800 dark:text-neutral-200">{averageHeat}% score</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-500">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-gray-400 uppercase font-bold">Today's Focus</span>
                <span className="font-extrabold text-gray-800 dark:text-neutral-200">{completedTodayCount}/{totalTodayCount} done</span>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5">
            {/* Intelligent build week button */}
            <button
              onClick={handleBuildMyWeek}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#F5F5F7] dark:bg-neutral-800 text-[#1D1D1F] dark:text-white border border-gray-200 dark:border-neutral-700/60 transition active:scale-95 hover:bg-gray-100"
              title="Quietly analyzes pipeline and auto-creates optimized 5-day workload calendar"
              id="btn_build_week"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Build My Week
            </button>

            <BackupPortability
              contacts={contacts}
              calendarItems={calendarItems}
              timelineEvents={timelineEvents}
              onImportData={handleImportFullDatabase}
              onImportContactsCSV={handleImportContactsCSV}
            />

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400 transition"
              id="btn_theme_toggle"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-600 transition"
              id="btn_help_info"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Interactive Quick Guide Header */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50 dark:bg-neutral-850 border-b border-gray-100 dark:border-neutral-800 overflow-hidden"
            id="help_guide_banner"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4.5 text-xs">
              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-black/5">
                <span className="font-extrabold text-amber-500 block mb-1">Living Calendar</span>
                <p className="text-gray-550 dark:text-neutral-400 leading-relaxed font-medium">
                  SJ OS is self-maintaining. When you complete items, the assistant automatically increments client relationships, registers logs, and updates pipelines without admin pages.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-black/5">
                <span className="font-extrabold text-amber-500 block mb-1">Progressive Depth Layers</span>
                <p className="text-gray-550 dark:text-neutral-400 leading-relaxed font-medium">
                  Say goodbye to forms. Access Layer 1 (Immediate Action Desk), Layer 2 (Surrounding Context Briefing), Layer 3 (Memory Archive), or Layer 4 (Business Analytics) instantly, keeping you productive without clutter.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-black/5">
                <span className="font-extrabold text-amber-500 block mb-1">Daily Realignment</span>
                <p className="text-gray-550 dark:text-neutral-400 leading-relaxed font-medium">
                  At end-of-day, answer 4 brief metrics. SJ OS will automatically sweep unfinished and rescheduled calls onto tomorrow's optimized schedule.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Operating System Shell Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Dynamic Insight Advisor Banner */}
        <DynamicInsights
          suggestions={currentSuggestions}
          onTriggerAction={handleTriggerInsightAction}
          onDismissSuggestion={handleDismissSuggestion}
        />

        {/* Mobile & Tablet Workspace Tabs Switcher */}
        <div className="lg:hidden bg-[#F2F2F7] dark:bg-neutral-900 p-1 rounded-2xl border border-gray-200/50 dark:border-neutral-800 grid grid-cols-2 gap-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveWorkspaceTab('calendar')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeWorkspaceTab === 'calendar'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            Living Calendar
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('contacts')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeWorkspaceTab === 'contacts'
                ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            Partners Directory
          </button>
        </div>

        {/* Master Balanced Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Block: Living Calendar (5 Cols) */}
          <section className={`lg:col-span-5 h-[620px] lg:h-[750px] ${
            activeWorkspaceTab === 'calendar' ? 'block' : 'hidden lg:block'
          }`}>
            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              calendarItems={calendarItems}
              onToggleComplete={handleToggleComplete}
              onRebalanceDay={handleRebalanceDay}
              onSelectContact={(contactId) => {
                setSelectedContactId(contactId);
                setActiveWorkspaceTab('contacts');
                // Switch focus context
                const section = document.getElementById('contacts_and_timeline_module');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
              onPostponeTask={handlePostponeTask}
            />
          </section>

          {/* Right Block: Directory, Chronological Messaging Timelines, and Briefings (7 Cols) */}
          <section className={`lg:col-span-7 h-[680px] lg:h-[750px] ${
            activeWorkspaceTab === 'contacts' ? 'block' : 'hidden lg:block'
          }`}>
            <ContactsView
              contacts={contacts}
              timelineEvents={timelineEvents}
              calendarItems={calendarItems}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
              onSelectContact={setSelectedContactId}
              selectedContactId={selectedContactId}
              onTriggerOneTapWorkflow={handleTriggerOneTapWorkflow}
            />
          </section>
        </div>

        {/* 4. Bottom Row: End of Day Realignment reviews history */}
        <footer className="border-t border-[#E8E8ED] dark:border-neutral-800 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-gray-400 dark:text-neutral-500 tracking-wider">
                SJ OS Alignment Desk
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-medium">
                Conclude the day to trigger automated schedule sweep and workload balancing.
              </p>
            </div>

            <DailyReviewComponent
              onCompleteReview={handleCompleteDailyReview}
              reviewsHistory={dailyReviews}
            />
          </div>
        </footer>
      </main>
    </div>
  );
}
