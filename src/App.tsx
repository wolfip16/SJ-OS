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
import { AuthLockScreen, ORG_USERS, UserProfile } from './components/AuthLockScreen';
import { AdminTerminal } from './components/AdminTerminal';
import { WorkspaceEnginesBar } from './components/WorkspaceEnginesBar';
import { CommunicationEngineModal } from './components/CommunicationEngineModal';
import { MeetingEngineModal } from './components/MeetingEngineModal';
import { DrivePickerModal } from './components/DrivePickerModal';
import { QuickCaptureDrawer } from './components/QuickCaptureDrawer';
import { TeamChatDrawer } from './components/TeamChatDrawer';
import { FirebaseEnclaveInfoModal } from './components/FirebaseEnclaveInfoModal';
import { SheetsManagerModal } from './components/SheetsManagerModal';
import { ProfileEditorModal } from './components/ProfileEditorModal';
import { CalculatorModal } from './components/CalculatorModal';
import { syncUserDataToFirestore } from './lib/firebaseSync';
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
  Shield,
  LogOut,
  Crown,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryReviewCardProps {
  key?: string | number;
  review: DailyReview;
  onDelete: (id: string) => void;
  onSave: (id: string, updated: Partial<DailyReview>) => void;
}

function HistoryReviewCard({ review, onDelete, onSave }: HistoryReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [wins, setWins] = useState(review.wins);
  const [blockers, setBlockers] = useState(review.blockers);
  const [unfinishedNotes, setUnfinishedNotes] = useState(review.unfinishedNotes);
  const [tomorrowPriorities, setTomorrowPriorities] = useState(review.tomorrowPriorities);

  const handleSave = () => {
    onSave(review.id, { wins, blockers, unfinishedNotes, tomorrowPriorities });
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-[#E5E5EA] space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <span className="text-xs font-bold text-[#007AFF] font-mono">Daily Realignment Log • {review.date}</span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex gap-1.5">
              <button onClick={handleSave} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 cursor-pointer">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-gray-600 hover:text-[#007AFF] cursor-pointer">
                ✏️ Edit
              </button>
              <button onClick={() => onDelete(review.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Wins & Breakthroughs</label>
            <input type="text" value={wins} onChange={(e) => setWins(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Blockers & Roadblocks</label>
            <input type="text" value={blockers} onChange={(e) => setBlockers(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Unfinished Rescheduled Items</label>
            <input type="text" value={unfinishedNotes} onChange={(e) => setUnfinishedNotes(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Tomorrow's High Priorities</label>
            <input type="text" value={tomorrowPriorities} onChange={(e) => setTomorrowPriorities(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
          <div className="bg-emerald-50/35 p-2 rounded-lg border border-emerald-100">
            <span className="block text-[8px] uppercase tracking-wider text-emerald-600 font-bold mb-0.5">🏆 Wins & Breakthroughs</span>
            <p className="text-gray-700 font-medium">{review.wins || 'No wins logged.'}</p>
          </div>
          <div className="bg-rose-50/35 p-2 rounded-lg border border-rose-100">
            <span className="block text-[8px] uppercase tracking-wider text-rose-500 font-bold mb-0.5">🛑 Blockers & Roadblocks</span>
            <p className="text-gray-700 font-medium">{review.blockers || 'No blockers logged.'}</p>
          </div>
          <div className="bg-amber-50/35 p-2 rounded-lg border border-amber-100">
            <span className="block text-[8px] uppercase tracking-wider text-amber-600 font-bold mb-0.5">⏳ Unfinished Rescheduled Items</span>
            <p className="text-gray-700 font-medium">{review.unfinishedNotes || 'None.'}</p>
          </div>
          <div className="bg-blue-50/35 p-2 rounded-lg border border-blue-100">
            <span className="block text-[8px] uppercase tracking-wider text-blue-600 font-bold mb-0.5">🎯 Tomorrow's Priorities</span>
            <p className="text-gray-700 font-medium">{review.tomorrowPriorities || 'None.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Theme State - Locked to Light Mode (No dark/light theme toggle)
  const darkMode = false;

  // Authenticated and Current Scoped Profile States
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sj_os_authenticated_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sj_os_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // UX States
  const [selectedContactId, setSelectedContactId] = useState<string | null>('c1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-21'); // Today is set to July 21, 2026
  const [showHelp, setShowHelp] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'calendar' | 'contacts'>('calendar');
  const [activePage, setActivePage] = useState<'master' | 'calendar' | 'contacts' | 'history' | 'admin-deck'>('master');
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Theme Engine States (2 Themes: Light / Dark, with multiple accents)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sj_os_theme') as 'light' | 'dark') || 'light';
  });
  const [themeAccent, setThemeAccent] = useState<'blue' | 'emerald' | 'amber' | 'purple'>(() => {
    return (localStorage.getItem('sj_os_accent') as any) || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('sj_os_theme', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('sj_os_accent', themeAccent);
    document.documentElement.setAttribute('data-accent', themeAccent);
  }, [themeAccent]);

  // Workspace Engine Modals & Drawers States
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isKeepDrawerOpen, setIsKeepDrawerOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConcludeDayModalOpen, setIsConcludeDayModalOpen] = useState(false);
  const [isNotepadModalOpen, setIsNotepadModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Core OS Database States (scoped to currentUser)
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const [masterNotes, setMasterNotes] = useState<string>('');

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Event listener for adding new calendar items / task reminders
  useEffect(() => {
    const handleAddCalendarItem = (e: Event) => {
      const customEvent = e as CustomEvent<CalendarItem>;
      if (customEvent.detail) {
        setCalendarItems((prev) => [...prev, customEvent.detail]);
        showToast(`Added task reminder: "${customEvent.detail.title}"`);
      }
    };
    window.addEventListener('sj_os_add_calendar_item', handleAddCalendarItem);
    return () => window.removeEventListener('sj_os_add_calendar_item', handleAddCalendarItem);
  }, []);

  // Keep authenticatedUser and currentUser synced to local storage
  useEffect(() => {
    if (authenticatedUser) {
      localStorage.setItem('sj_os_authenticated_user', JSON.stringify(authenticatedUser));
    } else {
      localStorage.removeItem('sj_os_authenticated_user');
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sj_os_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sj_os_current_user');
    }
  }, [currentUser]);

  // Load user-specific data dynamically when current scoped profile changes
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.id;

    const savedContacts = localStorage.getItem(`sj_os_${uid}_contacts`);
    setContacts(savedContacts ? JSON.parse(savedContacts) : JSON.parse(JSON.stringify(INITIAL_CONTACTS)));

    const savedTimeline = localStorage.getItem(`sj_os_${uid}_timeline`);
    setTimelineEvents(savedTimeline ? JSON.parse(savedTimeline) : JSON.parse(JSON.stringify(INITIAL_TIMELINE_EVENTS)));

    const savedCalendar = localStorage.getItem(`sj_os_${uid}_calendar`);
    setCalendarItems(savedCalendar ? JSON.parse(savedCalendar) : JSON.parse(JSON.stringify(INITIAL_CALENDAR_ITEMS)));

    const savedReviews = localStorage.getItem(`sj_os_${uid}_reviews`);
    setDailyReviews(savedReviews ? JSON.parse(savedReviews) : []);

    const savedNotes = localStorage.getItem(`sj_os_${uid}_master_notes`);
    setMasterNotes(savedNotes || `✍️ ${currentUser.name} Executive Yellow Pad\n- Scribble client requests, layout specifications, or shipping reference numbers here.\n- Syncs automatically in real-time.\n\n💡 Pipeline Priorities:\n- Complete planned follow-ups.\n- Standardize Material drawings.`);
    
    // Reset dismissed suggestions on user change
    setDismissedSuggestionIds([]);
    
    // Select default contact safely
    const contactsList = savedContacts ? JSON.parse(savedContacts) : INITIAL_CONTACTS;
    if (contactsList.length > 0) {
      setSelectedContactId(contactsList[0].id);
    } else {
      setSelectedContactId(null);
    }
  }, [currentUser]);

  // Save changes dynamically to LocalStorage and Firebase Firestore for current scoped profile
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`sj_os_${currentUser.id}_contacts`, JSON.stringify(contacts));
  }, [contacts, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`sj_os_${currentUser.id}_timeline`, JSON.stringify(timelineEvents));
  }, [timelineEvents, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`sj_os_${currentUser.id}_calendar`, JSON.stringify(calendarItems));
  }, [calendarItems, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`sj_os_${currentUser.id}_reviews`, JSON.stringify(dailyReviews));
  }, [dailyReviews, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`sj_os_${currentUser.id}_master_notes`, masterNotes);
  }, [masterNotes, currentUser]);

  // Automatic Firebase Cloud Sync
  useEffect(() => {
    if (!currentUser) return;
    syncUserDataToFirestore(currentUser.id, {
      contacts,
      timelineEvents,
      calendarItems,
      dailyReviews,
      masterNotes,
    });
    setLastSyncedTime(new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));
  }, [contacts, timelineEvents, calendarItems, dailyReviews, masterNotes, currentUser]);

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

    const handleUpdateTimelineEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; title: string; notes: string }>;
      if (customEvent.detail && customEvent.detail.id) {
        setTimelineEvents((prev) =>
          prev.map((ev) => {
            if (ev.id === customEvent.detail.id) {
              return {
                ...ev,
                title: customEvent.detail.title,
                notes: customEvent.detail.notes,
              };
            }
            return ev;
          })
        );
      }
    };

    const handleDeleteTimelineEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setTimelineEvents((prev) => prev.filter((ev) => ev.id !== customEvent.detail));
      }
    };

    window.addEventListener('sj_os_add_calendar_item', handleAddCalendarItem);
    window.addEventListener('sj_os_add_timeline_event', handleAddTimelineEvent);
    window.addEventListener('sj_os_update_contact', handleUpdateContact);
    window.addEventListener('sj_os_update_timeline_event', handleUpdateTimelineEvent);
    window.addEventListener('sj_os_delete_timeline_event', handleDeleteTimelineEvent);

    return () => {
      window.removeEventListener('sj_os_add_calendar_item', handleAddCalendarItem);
      window.removeEventListener('sj_os_add_timeline_event', handleAddTimelineEvent);
      window.removeEventListener('sj_os_update_contact', handleUpdateContact);
      window.removeEventListener('sj_os_update_timeline_event', handleUpdateTimelineEvent);
      window.removeEventListener('sj_os_delete_timeline_event', handleDeleteTimelineEvent);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('sj_os_theme', 'light');
  }, []);

  // Compute stats for Header
  const activeLeads = contacts.length;
  const averageHeat = Math.round(
    contacts.reduce((sum, c) => sum + c.heatScore, 0) / (contacts.length || 1)
  );
  const completedTodayCount = calendarItems.filter((item) => item.date === '2026-07-21' && item.completed).length;
  const totalTodayCount = calendarItems.filter((item) => item.date === '2026-07-21').length;

  // Generate real-time insights
  const currentSuggestions = generateSuggestions(contacts, calendarItems, '2026-07-21')
    .filter((s) => !dismissedSuggestionIds.includes(s.id));

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
    setDismissedSuggestionIds((prev) => [...prev, id]);
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

  const handleUpdateContact = (updated: Contact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  if (!authenticatedUser) {
    return (
      <AuthLockScreen
        onAuthenticate={(user) => {
          setAuthenticatedUser(user);
          setCurrentUser(user);
          if (user.id === 'admin') {
            setActivePage('admin-deck');
          } else {
            setActivePage('master');
          }
        }}
      />
    );
  }

  const isImpersonating = authenticatedUser.id === 'admin' && currentUser?.id !== 'admin';

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans antialiased transition-colors duration-250 selection:bg-[#007AFF]/10">
      {/* 0. Impersonation Banner for Admins */}
      {isImpersonating && (
        <div className="bg-[#FF9500] text-white px-5 py-2.5 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md relative z-50">
          <div className="flex items-center gap-2">
            <Crown className="w-4.5 h-4.5 text-white animate-bounce" />
            <span>
              👑 Authorized administrative oversight: Viewing <strong className="underline">{currentUser?.name}</strong>'s workspace. All edits auto-save directly to their profile.
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentUser(authenticatedUser);
              setActivePage('admin-deck');
              showToast('Returned safely to Command Deck.');
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-[#1D1D1F] font-extrabold text-[10px] rounded-lg cursor-pointer transition shadow-xs uppercase tracking-wider"
          >
            ← Exit View & Return to Admin Deck
          </button>
        </div>
      )}

      {/* 1. Dynamic Header Navigation (Apple-style Translucent Navigation Bar) */}
      <header className="border-b border-gray-200 dark:border-[#2C2C2E] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl sticky top-0 z-40 shadow-2xs">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 2xl:px-16 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Native squircle app icon layout */}
            <div className="bg-[#007AFF] text-white rounded-xl h-9 w-9 font-extrabold text-sm tracking-tight shadow-sm flex items-center justify-center relative overflow-hidden">
              <span className="relative z-10 text-base font-bold">SJ</span>
              <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white leading-none flex items-center gap-1.5">
                SJ OS 
                <span className="text-[10px] text-[#007AFF] font-bold px-1.5 py-0.5 rounded-md bg-[#007AFF]/10 border border-[#007AFF]/20">ORGANIZATION v1.3</span>
              </h1>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider mt-0.5">
                Executive Work Operating System
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Intelligent build week button */}
            <button
              onClick={handleBuildMyWeek}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] dark:bg-neutral-800 hover:bg-[#E5E5EA] dark:hover:bg-neutral-700 text-[#1D1D1F] dark:text-white transition-all active:scale-95 cursor-pointer border border-[#E5E5EA] dark:border-neutral-700"
              title="Quietly analyzes pipeline and auto-creates optimized 5-day workload calendar"
              id="btn_build_week"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9500]" />
              Build My Week
            </button>

            {/* Conclude the Day button */}
            <button
              onClick={() => setIsConcludeDayModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#007AFF] hover:bg-blue-600 text-white transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Conclude the day to trigger automated schedule sweep and workload balancing"
              id="btn_conclude_day"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Conclude the Day
            </button>
 
            <BackupPortability
              contacts={contacts}
              calendarItems={calendarItems}
              timelineEvents={timelineEvents}
              onImportData={handleImportFullDatabase}
              onImportContactsCSV={handleImportContactsCSV}
            />

            {/* Theme Mode & Multiple Accent Options Selector */}
            <div className="flex items-center gap-1 bg-[#E5E5EA]/60 dark:bg-[#1C1C1E] p-1 rounded-full border border-[#E5E5EA] dark:border-[#2C2C2E]">
              <button
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  themeMode === 'dark' ? 'bg-[#007AFF] text-white shadow-xs' : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
                title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Theme`}
              >
                {themeMode === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              
              <div className="h-3 w-px bg-gray-300 dark:bg-neutral-700 mx-0.5" />

              <div className="flex items-center gap-1 px-1">
                {(['blue', 'emerald', 'amber', 'purple'] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => setThemeAccent(acc)}
                    className={`w-3.5 h-3.5 rounded-full transition cursor-pointer border ${
                      acc === 'blue' ? 'bg-blue-500' : acc === 'emerald' ? 'bg-emerald-500' : acc === 'amber' ? 'bg-amber-500' : 'bg-purple-500'
                    } ${
                      themeAccent === acc ? 'ring-2 ring-offset-1 ring-gray-600 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={`${acc.toUpperCase()} Accent Option`}
                  />
                ))}
              </div>
            </div>

            {/* User Profile Indicator & Logout */}
            <div className="flex items-center gap-2 border-l border-[#E5E5EA] dark:border-neutral-800 pl-3.5 ml-1">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 group cursor-pointer p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                title="Click to edit profile, password, and Google ID"
              >
                <div className={`h-8.5 w-8.5 rounded-xl bg-linear-to-br ${currentUser?.color} text-white font-bold text-xs flex items-center justify-center relative overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                  {currentUser?.avatar || currentUser?.initials}
                  <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                </div>
                <div className="hidden lg:block text-left">
                  <span className="block text-[10px] font-extrabold text-[#1D1D1F] dark:text-white leading-tight truncate max-w-[120px]">
                    {currentUser?.name}
                  </span>
                  <span className="block text-[8px] text-[#007AFF] dark:text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>{currentUser?.role?.toLowerCase().includes('admin') || currentUser?.id === 'admin' ? 'Master Admin' : 'Edit Profile'}</span>
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setAuthenticatedUser(null);
                  setCurrentUser(null);
                }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 cursor-pointer transition active:scale-90"
                title="Lock Session / Sign Out"
                id="btn_logout_lock"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
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
              <div className="p-3 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-xl shadow-xs border border-[#E5E5EA] dark:border-[#2C2C2E]">
                <span className="font-semibold text-[#007AFF] block mb-1">Living Calendar</span>
                <p className="text-[#8E8E93] leading-relaxed font-medium">
                  SJ OS is self-maintaining. When you complete items, the assistant automatically increments client relationships, registers logs, and updates pipelines without admin pages.
                </p>
              </div>

              <div className="p-3 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-xl shadow-xs border border-[#E5E5EA] dark:border-[#2C2C2E]">
                <span className="font-semibold text-[#007AFF] block mb-1">Progressive Depth Layers</span>
                <p className="text-[#8E8E93] leading-relaxed font-medium">
                  Say goodbye to forms. Access Layer 1 (Immediate Action Desk), Layer 2 (Surrounding Context Briefing), Layer 3 (Memory Archive), or Layer 4 (Business Analytics) instantly, keeping you productive without clutter.
                </p>
              </div>

              <div className="p-3 bg-[#FFFFFF] dark:bg-[#1C1C1E] rounded-xl shadow-xs border border-[#E5E5EA] dark:border-[#2C2C2E]">
                <span className="font-semibold text-[#007AFF] block mb-1">Daily Realignment</span>
                <p className="text-[#8E8E93] leading-relaxed font-medium">
                  At end-of-day, answer 4 brief metrics. SJ OS will automatically sweep unfinished and rescheduled calls onto tomorrow's optimized schedule.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Operating System Shell Workspace */}
      <main className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-10 2xl:px-16 py-6 space-y-6">
        {/* Workspace Google Infrastructure Engines Bar */}
        <WorkspaceEnginesBar
          onOpenMail={() => setIsMailModalOpen(true)}
          onOpenMeet={() => setIsMeetModalOpen(true)}
          onOpenDrive={() => setIsDriveModalOpen(true)}
          onOpenKeep={() => setIsKeepDrawerOpen(true)}
          onOpenChat={() => setIsChatDrawerOpen(true)}
          onOpenSheets={() => setIsSheetsModalOpen(true)}
          onOpenCalendar={() => {
            setActivePage('calendar');
            showToast('Opened Live Calendar Schedule');
          }}
          onOpenContacts={() => {
            setActivePage('contacts');
            showToast('Opened Partners Directory');
          }}
          onOpenDocs={() => {
            setActivePage('history');
            showToast('Opened Business Memory (Notepad & EOD Logs)');
          }}
          onOpenTasks={() => {
            setActivePage('calendar');
            showToast('Focused Today\'s Scheduled Work');
          }}
          onOpenFirebaseInfo={() => setIsFirebaseModalOpen(true)}
          onOpenNotepad={() => setIsNotepadModalOpen(true)}
          onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          activePage={activePage}
          onSelectPage={setActivePage}
          isAdmin={!!(authenticatedUser.id === 'admin' || authenticatedUser.role?.toLowerCase().includes('admin') || authenticatedUser.role?.toLowerCase().includes('director'))}
        />

        {/* Dynamic Insight Advisor Banner */}
        <DynamicInsights
          suggestions={currentSuggestions}
          onTriggerAction={handleTriggerInsightAction}
          onDismissSuggestion={handleDismissSuggestion}
        />

        {/* PAGE RENDERING SYSTEM */}
        {activePage === 'master' && (
          <div className="space-y-6">
            {/* Mobile & Tablet Workspace Tabs Switcher (iOS Native Segmented Control Style) */}
            <div className="lg:hidden bg-[#E3E3E9] p-0.5 rounded-xl grid grid-cols-2 max-w-sm mx-auto shadow-xs border border-transparent">
              <button
                onClick={() => setActiveWorkspaceTab('calendar')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeWorkspaceTab === 'calendar'
                    ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                Living Calendar
              </button>
              <button
                onClick={() => setActiveWorkspaceTab('contacts')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeWorkspaceTab === 'contacts'
                    ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#007AFF]" />
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
          </div>
        )}

        {activePage === 'contacts' && (
          <div className="w-full h-[800px] bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden p-1">
            <ContactsView
              contacts={contacts}
              timelineEvents={timelineEvents}
              calendarItems={calendarItems}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
              onSelectContact={setSelectedContactId}
              selectedContactId={selectedContactId}
              onTriggerOneTapWorkflow={handleTriggerOneTapWorkflow}
            />
          </div>
        )}

        {activePage === 'calendar' && (
          <div className="w-full h-[800px] bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden p-1">
            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              calendarItems={calendarItems}
              onToggleComplete={handleToggleComplete}
              onRebalanceDay={handleRebalanceDay}
              onSelectContact={(contactId) => {
                setSelectedContactId(contactId);
                setActivePage('contacts');
              }}
              onPostponeTask={handlePostponeTask}
            />
          </div>
        )}

        {activePage === 'history' && (
          <div className="w-full min-h-[700px] bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200 dark:border-[#2C2C2E] p-6 space-y-6 animate-fadeIn text-gray-900 dark:text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-150 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🧠</span> Business Memory Vault (Notepad & EOD Logs)
                </h2>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-bold mt-0.5">
                  Executive scratchpad notepad and complete history of all EOD realignment logs and partner activity audit logs.
                </p>
              </div>
            </div>

            {/* Embedded Executive Scratchpad / Notepad */}
            <div className="bg-[#FFFDEB]/90 dark:bg-[#2C2B1E] p-5 rounded-2xl border border-[#EBE3C5] dark:border-[#4A472E] shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EBE3C5]/60 dark:border-[#4A472E] mb-2">
                <h3 className="text-xs font-bold uppercase text-[#857342] dark:text-amber-300 tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">✍️</span> Executive Yellow Pad (Business Memory Notepad)
                </h3>
                <span className="text-[9px] text-[#A69460] dark:text-amber-400 font-bold font-mono">AUTOSAVED</span>
              </div>
              <textarea
                value={masterNotes}
                onChange={(e) => setMasterNotes(e.target.value)}
                placeholder="Scribble quick notes, client phone numbers, agendas, or design dimensions here..."
                className="w-full min-h-[140px] bg-transparent text-xs text-[#423D2B] dark:text-amber-100 leading-relaxed focus:outline-hidden font-semibold placeholder-[#B8AD8A] dark:placeholder-amber-400/60 resize-none"
              />
            </div>

            {/* EOD Realignment Logs & History Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Daily Reviews list (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-gray-800 dark:text-gray-200 tracking-wider flex items-center gap-1">
                  📅 EOD Alignment Logs History ({dailyReviews.length})
                </h3>
                {dailyReviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-700 dark:text-gray-300 border border-dashed border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold">
                    No end-of-day reviews logged yet. Submit a review via the Alignment Desk to populate this history.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyReviews.map((rev) => (
                      <HistoryReviewCard
                        key={rev.id}
                        review={rev}
                        onDelete={(id) => {
                          if (confirm('Are you sure you want to delete this Daily Review?')) {
                            setDailyReviews((prev) => prev.filter((r) => r.id !== id));
                          }
                        }}
                        onSave={(id, updated) => {
                          setDailyReviews((prev) =>
                            prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Global Timeline Event Stream (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 bg-gray-50 dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                <h3 className="text-xs font-extrabold uppercase text-gray-800 dark:text-gray-200 tracking-wider">
                  📜 Global Activities Audit Feed
                </h3>
                <div className="max-h-[550px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {timelineEvents.map((ev) => {
                    const contactName = contacts.find((c) => c.id === ev.contactId)?.name || 'Unknown Partner';
                    const getEmoji = (t: string) => {
                      switch (t) {
                        case 'call': return '📞';
                        case 'meeting': return '🤝';
                        case 'drawing': return '📐';
                        case 'quote': return '💼';
                        case 'order': return '📦';
                        case 'production': return '🏭';
                        case 'dispatch': return '🚛';
                        case 'payment': return '💰';
                        case 'status_change': return '🔄';
                        default: return '📝';
                      }
                    };
                    return (
                      <div key={ev.id} className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="font-bold uppercase text-[#007AFF]">
                            {getEmoji(ev.type)} {ev.type}
                          </span>
                          <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">{ev.title}</div>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 font-bold italic">Partner: {contactName}</p>
                        {ev.notes && (
                          <p className="text-[10px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-900 p-1.5 rounded mt-1 border border-gray-200 dark:border-neutral-700 whitespace-pre-wrap leading-relaxed">
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {timelineEvents.length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-12">No registered activities in history.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === 'admin-deck' && (
          <AdminTerminal
            onImpersonate={(user) => {
              setCurrentUser(user);
              showToast(`Switched workspace sandbox view to ${user.name}.`);
            }}
            onToast={(msg) => {
              showToast(msg);
            }}
          />
        )}

        {/* End of Main Content */}
      </main>

      {/* Dynamic Toast notification for app-wide feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1E]/95 dark:bg-[#F5F5F7]/95 text-white dark:text-[#1D1D1F] backdrop-blur-md px-4.5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-[#2C2C2E]/50 dark:border-white/20 text-xs font-bold transition-all max-w-sm">
          <div className="bg-[#007AFF] text-white p-1 rounded-md">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Google Workspace Engine Modals & Drawers */}
      <CommunicationEngineModal
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
        contacts={contacts}
        currentUser={currentUser}
        onSendEmail={({ to, subject, body, attachments }) => {
          showToast(`Dispatched Communication to ${to}`);
          // Add activity event to timeline
          const newEvt: TimelineEvent = {
            id: 'evt_' + Date.now(),
            contactId: selectedContactId || contacts[0]?.id || 'c1',
            type: 'email',
            title: `Sent Email: ${subject}`,
            notes: body,
            timestamp: new Date().toISOString(),
          };
          setTimelineEvents((prev) => [newEvt, ...prev]);
        }}
        onAddTask={({ title, notes }) => {
          const newCal: CalendarItem = {
            id: 'cal_' + Date.now(),
            title: `✉️ ${title}`,
            time: '12:00',
            type: 'call',
            durationMinutes: 15,
            priority: 'medium',
            completed: false,
            date: new Date().toISOString().split('T')[0],
          };
          setCalendarItems((prev) => [...prev, newCal]);
          showToast(`Auto-created SJ OS task reminder: ${title}`);
        }}
      />

      <MeetingEngineModal
        isOpen={isMeetModalOpen}
        onClose={() => setIsMeetModalOpen(false)}
        contacts={contacts}
        currentUser={currentUser}
        onScheduleMeeting={({ title, date, time, meetUrl, attendees, notes }) => {
          showToast(`Scheduled Meeting: ${title}`);
          // Add to living calendar items
          const newItem: CalendarItem = {
            id: 'cal_' + Date.now(),
            title: `📹 ${title}`,
            time,
            type: 'meeting',
            durationMinutes: 30,
            priority: 'high',
            completed: false,
            date,
            meetUrl,
            attendees,
          };
          setCalendarItems((prev) => [...prev, newItem]);

          if (notes) {
            setMasterNotes((prev) => `📅 [Meeting Notes: ${title} (${date})]\nURL: ${meetUrl}\n${notes}\n\n` + prev);
          }
        }}
        onAddTask={({ title, date, time, notes }) => {
          const newItem: CalendarItem = {
            id: 'cal_' + Date.now(),
            title: `📌 ${title}`,
            time: time || '10:00',
            type: 'task',
            durationMinutes: 30,
            priority: 'high',
            completed: false,
            date: date || new Date().toISOString().split('T')[0],
          };
          setCalendarItems((prev) => [...prev, newItem]);
          showToast(`SJ OS Calendar & Task Reminder synced for meeting`);
        }}
      />

      <DrivePickerModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSelectFile={(file) => {
          showToast(`Attached ${file.name} from Files Engine`);
          setMasterNotes((prev) => `📎 Attached File: ${file.name} (${file.size})\n` + prev);
        }}
      />

      <QuickCaptureDrawer
        isOpen={isKeepDrawerOpen}
        onClose={() => setIsKeepDrawerOpen(false)}
        onSyncMasterNotes={(text) => {
          setMasterNotes((prev) => text + '\n\n' + prev);
        }}
      />

      {currentUser && (
        <TeamChatDrawer
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          currentUser={currentUser}
        />
      )}

      <FirebaseEnclaveInfoModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        lastSyncedAt={lastSyncedTime}
      />

      <SheetsManagerModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />

      {currentUser && (
        <ProfileEditorModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            if (authenticatedUser?.id === updated.id) {
              setAuthenticatedUser(updated);
            }
            showToast('Profile updated & synced to Firebase!');
          }}
        />
      )}

      {/* Conclude the Day / Alignment Desk Modal */}
      <AnimatePresence>
        {isConcludeDayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#007AFF]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      SJ OS Alignment Desk — Conclude Today
                    </h3>
                    <p className="text-xs text-gray-500 font-bold">
                      Review today's achievements, sweep unfinished tasks, and balance upcoming workload.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConcludeDayModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <DailyReviewComponent
                onCompleteReview={(review) => {
                  handleCompleteDailyReview(review);
                  setIsConcludeDayModalOpen(false);
                }}
                reviewsHistory={dailyReviews}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Executive Notepad Modal */}
      <AnimatePresence>
        {isNotepadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 max-w-3xl w-full shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Executive Notepad (Yellow Pad)
                    </h3>
                    <p className="text-xs text-gray-500 font-bold">
                      Persistent scratchpad for client phone numbers, agendas, quick ideas, and design notes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotepadModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#FFFDEB] dark:bg-[#252319] p-5 rounded-2xl border border-[#EBE3C5] dark:border-[#4A452E] shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#EBE3C5]/60 dark:border-[#4A452E]">
                  <span className="text-xs font-extrabold uppercase text-[#857342] dark:text-amber-300 tracking-wider flex items-center gap-1.5">
                    <span>✍️</span> Quick Notes Pad
                  </span>
                  <span className="text-[9px] text-[#A69460] dark:text-amber-400 font-mono font-extrabold">AUTOSAVED TO MEMORY</span>
                </div>
                <textarea
                  value={masterNotes}
                  onChange={(e) => setMasterNotes(e.target.value)}
                  placeholder="Scribble quick notes, client phone numbers, agendas, or design dimensions here..."
                  className="w-full h-72 bg-transparent text-xs text-[#423D2B] dark:text-amber-200 leading-relaxed focus:outline-hidden font-semibold placeholder-[#B8AD8A] dark:placeholder-amber-400/60 resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsNotepadModalOpen(false)}
                  className="px-4 py-2 bg-[#007AFF] text-white text-xs font-extrabold rounded-xl hover:bg-blue-600 transition cursor-pointer shadow-xs"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        onToast={showToast}
      />
    </div>
  );
}
