/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Contact, TimelineEvent, CalendarItem } from '../types';
import {
  X,
  Clock,
  Calendar,
  Send,
  FileText,
  CheckCircle,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Flame,
  Award,
  Sliders,
  History,
  FileCheck2,
  Sparkles,
  Layers,
  BarChart3,
  Check,
  Info,
  Hammer,
  Truck,
  CreditCard,
  FolderOpen,
  Save,
  PlusCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface DeepDossierProps {
  contact: Contact;
  timelineEvents: TimelineEvent[];
  calendarItems: CalendarItem[];
  activeTab:
    | 'timeline'
    | 'meetings'
    | 'calls'
    | 'projects'
    | 'quotes'
    | 'drawings'
    | 'production'
    | 'dispatch'
    | 'payments'
    | 'documents'
    | 'notes';
  onChangeTab: (
    tab:
      | 'timeline'
      | 'meetings'
      | 'calls'
      | 'projects'
      | 'quotes'
      | 'drawings'
      | 'production'
      | 'dispatch'
      | 'payments'
      | 'documents'
      | 'notes'
  ) => void;
  onClose: () => void;
}

// Simulated local storage collections for Projects and Documents
interface ProjectItem {
  id: string;
  name: string;
  value: number;
  status: 'Planning' | 'CAD' | 'Quoted' | 'Production' | 'Completed';
  startDate: string;
  endDate: string;
}

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
}

export function DeepDossier({
  contact,
  timelineEvents,
  calendarItems,
  activeTab,
  onChangeTab,
  onClose,
}: DeepDossierProps) {
  // Local project states (synced to LocalStorage)
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectValue, setNewProjectValue] = useState<number>(10);
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectItem['status']>('Planning');

  // Local documents states (synced to LocalStorage)
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('pdf');

  // Form states for Meetings
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingAttendees, setMeetingAttendees] = useState('');
  const [meetingMoM, setMeetingMoM] = useState('');
  const [meetingActionItems, setMeetingActionItems] = useState('');

  // Form states for Calls
  const [callOutcome, setCallOutcome] = useState('Completed check-in');
  const [callNotesText, setCallNotesText] = useState('');

  // Form states for Quotations Builder
  const [quoteItems, setQuoteItems] = useState<{ desc: string; qty: number; rate: number }[]>([
    { desc: 'Surface Cladding Premium-v1', qty: 12000, rate: 350 },
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRate, setNewItemRate] = useState(100);
  const [quoteDiscount, setQuoteDiscount] = useState(5);

  // Form states for Drawings CAD
  const [dwgTitle, setDwgTitle] = useState('');
  const [dwgDesigner, setDwgDesigner] = useState('CAD Team Alpha');
  const [dwgDimensions, setDwgDimensions] = useState('12,000 sq ft');

  // Form states for Dispatch
  const [dispatchRef, setDispatchRef] = useState('');
  const [dispatchCarrier, setDispatchCarrier] = useState('SafeTransit Express');
  const [dispatchVehicle, setDispatchVehicle] = useState('MH-04-EY-1234');
  const [dispatchItems, setDispatchItems] = useState('Premium Cladding - Batch A');

  // Form states for Payments
  const [payAmount, setPayAmount] = useState<number>(500000);
  const [payInstallment, setPayInstallment] = useState('Advance 50%');
  const [payRef, setPayRef] = useState('');

  // Form states for Notes Scratchpad
  const [notesScratchpad, setNotesScratchpad] = useState(contact.notes || '');

  // Search timeline
  const [timelineSearch, setTimelineSearch] = useState('');

  // Load projects & documents from local storage
  useEffect(() => {
    const savedProjects = localStorage.getItem(`sj_os_projects_${contact.id}`);
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Default project
      const defProj: ProjectItem[] = [
        {
          id: `p_${Date.now()}`,
          name: `${contact.company} - Tower Layout Expansion`,
          value: 4200000,
          status: contact.stage === 'Lead' ? 'Planning' : contact.stage === 'Need Drawing' ? 'CAD' : contact.stage === 'Quotation Sent' ? 'Quoted' : contact.stage === 'Payment Follow-up' ? 'Completed' : 'Production',
          startDate: '2026-07-10',
          endDate: '2026-08-15',
        },
      ];
      setProjects(defProj);
      localStorage.setItem(`sj_os_projects_${contact.id}`, JSON.stringify(defProj));
    }

    const savedDocs = localStorage.getItem(`sj_os_docs_${contact.id}`);
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    } else {
      const defDocs: DocumentItem[] = [
        { id: 'd1', name: 'corporate_profile_sj_elevation.pdf', size: '2.4 MB', type: 'pdf', date: '2026-07-10' },
        { id: 'd2', name: 'billing_registration_details.pdf', size: '420 KB', type: 'pdf', date: '2026-07-12' },
      ];
      setDocuments(defDocs);
      localStorage.setItem(`sj_os_docs_${contact.id}`, JSON.stringify(defDocs));
    }
  }, [contact.id]);

  // Sync projects and docs back to local storage
  const saveProjectsToLocalStorage = (items: ProjectItem[]) => {
    setProjects(items);
    localStorage.setItem(`sj_os_projects_${contact.id}`, JSON.stringify(items));
  };

  const saveDocsToLocalStorage = (items: DocumentItem[]) => {
    setDocuments(items);
    localStorage.setItem(`sj_os_docs_${contact.id}`, JSON.stringify(items));
  };

  // Dispatch global updates
  const triggerGlobalTimelineEvent = (type: TimelineEvent['type'], title: string, notes: string) => {
    const newEvent: TimelineEvent = {
      id: `manual_dossier_${Date.now()}`,
      contactId: contact.id,
      type,
      title,
      notes,
      timestamp: new Date().toISOString(),
    };
    window.dispatchEvent(new CustomEvent('sj_os_add_timeline_event', { detail: newEvent }));
  };

  const triggerGlobalContactUpdate = (updates: Partial<Contact>) => {
    window.dispatchEvent(
      new CustomEvent('sj_os_update_contact', {
        detail: { id: contact.id, updates },
      })
    );
  };

  const triggerGlobalCalendarItem = (title: string, type: CalendarItem['type'], priority: CalendarItem['priority']) => {
    const newItem: CalendarItem = {
      id: `cal_dossier_${Date.now()}`,
      contactId: contact.id,
      title,
      type,
      date: '2026-07-22', // Tomorrow
      time: '10:00',
      durationMinutes: 30,
      priority,
      completed: false,
    };
    window.dispatchEvent(new CustomEvent('sj_os_add_calendar_item', { detail: newItem }));
  };

  // Handle submissions
  const handleAddProject = (e: FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj: ProjectItem = {
      id: `p_${Date.now()}`,
      name: newProjectName.trim(),
      value: newProjectValue,
      status: newProjectStatus,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-09-01',
    };

    const updated = [...projects, newProj];
    saveProjectsToLocalStorage(updated);
    setNewProjectName('');

    triggerGlobalTimelineEvent(
      'system',
      `New Project Initialized`,
      `Created project workspace: "${newProj.name}" with a calculated value of ₹${(newProj.value / 100000).toFixed(2)} Lakhs.`
    );
  };

  const handleAddDocument = (e: FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const nameWithExt = newDocName.toLowerCase().endsWith(`.${newDocType}`)
      ? newDocName
      : `${newDocName}.${newDocType}`;

    const newDoc: DocumentItem = {
      id: `d_${Date.now()}`,
      name: nameWithExt,
      size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
      type: newDocType,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...documents, newDoc];
    saveDocsToLocalStorage(updated);
    setNewDocName('');

    triggerGlobalTimelineEvent(
      'note',
      `Document Uploaded`,
      `Safely archived contract file: "${newDoc.name}" inside partner's electronic vault.`
    );
  };

  const handleSaveMoM = (e: FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingMoM.trim()) return;

    const notesSummary = `Attendees: ${meetingAttendees || 'Unspecified'}\n\nMinutes:\n${meetingMoM}\n\nAction Items:\n${meetingActionItems || 'None'}`;
    triggerGlobalTimelineEvent('meeting', `Minutes: ${meetingTitle}`, notesSummary);

    if (meetingActionItems.trim()) {
      triggerGlobalCalendarItem(`Follow-up on MoM: ${meetingTitle}`, 'deep_work', 'high');
    }

    // Reset Form
    setMeetingTitle('');
    setMeetingAttendees('');
    setMeetingMoM('');
    setMeetingActionItems('');
    alert('Meeting Minutes registered successfully in timeline!');
  };

  const handleSaveCallLog = (e: FormEvent) => {
    e.preventDefault();
    if (!callNotesText.trim()) return;

    triggerGlobalTimelineEvent('call', `Call Logged: ${callOutcome}`, callNotesText);
    setCallNotesText('');
    alert('Call log added to persistent memory archive.');
  };

  const handleAddQuoteItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim()) return;
    setQuoteItems([...quoteItems, { desc: newItemDesc, qty: newItemQty, rate: newItemRate }]);
    setNewItemDesc('');
  };

  const handleIssueQuotation = () => {
    const subtotal = quoteItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
    const discountVal = (subtotal * quoteDiscount) / 100;
    const taxVal = ((subtotal - discountVal) * 18) / 100;
    const finalTotal = subtotal - discountVal + taxVal;

    const notesSummary = `Issued commercial bid QT-${Date.now().toString().slice(-4)}.\nLine Items:\n${quoteItems
      .map((it) => `- ${it.desc}: ${it.qty} units @ ₹${it.rate}`)
      .join('\n')}\n\nSummary:\nSubtotal: ₹${subtotal.toLocaleString()}\nDiscount (${quoteDiscount}%): -₹${discountVal.toLocaleString()}\nGST (18%): ₹${taxVal.toLocaleString()}\nTotal Commercial Bid: ₹${finalTotal.toLocaleString()}`;

    triggerGlobalTimelineEvent('quote', `Commercial Quotation Issued: ₹${(finalTotal / 100000).toFixed(2)} Lakhs`, notesSummary);
    triggerGlobalContactUpdate({ stage: 'Quotation Sent' });
    triggerGlobalCalendarItem(`Call: Review bid with ${contact.name}`, 'quote', 'high');

    alert(`Commercial Quote generated. Sync Complete: Stage modified to "Quotation Sent".`);
  };

  const handleIssueDwgRequest = (e: FormEvent) => {
    e.preventDefault();
    if (!dwgTitle.trim()) return;

    const summary = `CAD Model Requested: ${dwgTitle}\nAssigned Designer: ${dwgDesigner}\nCoverage Dimensions: ${dwgDimensions}`;
    triggerGlobalTimelineEvent('drawing', `CAD Design Active: ${dwgTitle}`, summary);
    triggerGlobalContactUpdate({ stage: 'Need Drawing' });
    triggerGlobalCalendarItem(`Review drawings from ${dwgDesigner}`, 'drawing', 'medium');

    setDwgTitle('');
    alert('CAD Drawing request sent. Pipeline Stage synced to "Need Drawing".');
  };

  const handleAddDispatchLog = (e: FormEvent) => {
    e.preventDefault();
    if (!dispatchRef.trim()) return;

    const summary = `Material Dispatch record: ${dispatchRef}\nCarrier: ${dispatchCarrier}\nVehicle Plate: ${dispatchVehicle}\nItem Details: ${dispatchItems}`;
    triggerGlobalTimelineEvent('dispatch', `Dispatched Ship Ref: ${dispatchRef}`, summary);
    triggerGlobalContactUpdate({ stage: 'Dispatch' });

    setDispatchRef('');
    alert('Logistics dispatch record written to permanent timeline.');
  };

  const handleAddPaymentLog = (e: FormEvent) => {
    e.preventDefault();
    if (!payRef.trim()) return;

    const summary = `Received bank payment receipt.\nAmount: ₹${payAmount.toLocaleString()}\nAllocation: ${payInstallment}\nReference Bank ID: ${payRef}`;
    triggerGlobalTimelineEvent('payment', `Payment Received: ₹${(payAmount / 100000).toFixed(2)} Lakhs`, summary);
    triggerGlobalContactUpdate({ heatScore: Math.min(100, contact.heatScore + 10) });

    setPayRef('');
    alert(`Payment recorded. Sync complete: Partner Heat Score boosted due to successful clearance.`);
  };

  const handleSaveScratchpad = () => {
    triggerGlobalContactUpdate({ notes: notesScratchpad });
    alert('Scratchpad notes updated and synchronized in the contact profile.');
  };

  // Filtered timeline
  const filteredTimeline = timelineEvents
    .filter((e) => e.contactId === contact.id)
    .filter(
      (e) =>
        e.title.toLowerCase().includes(timelineSearch.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(timelineSearch.toLowerCase()))
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Tab Details
  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: <History className="w-3.5 h-3.5" />, color: 'text-blue-500' },
    { id: 'meetings', label: 'Meetings (MoM)', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-indigo-500' },
    { id: 'calls', label: 'Call History', icon: <Phone className="w-3.5 h-3.5" />, color: 'text-sky-500' },
    { id: 'projects', label: 'Projects', icon: <Sliders className="w-3.5 h-3.5" />, color: 'text-amber-500' },
    { id: 'quotes', label: 'Quotations', icon: <FileText className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
    { id: 'drawings', label: 'Drawings (CAD)', icon: <Award className="w-3.5 h-3.5" />, color: 'text-purple-500' },
    { id: 'production', label: 'Production', icon: <Hammer className="w-3.5 h-3.5" />, color: 'text-orange-500' },
    { id: 'dispatch', label: 'Dispatch', icon: <Truck className="w-3.5 h-3.5" />, color: 'text-rose-500' },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-teal-500' },
    { id: 'documents', label: 'Documents', icon: <FolderOpen className="w-3.5 h-3.5" />, color: 'text-gray-500' },
    { id: 'notes', label: 'Notes', icon: <Save className="w-3.5 h-3.5" />, color: 'text-violet-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-lg animate-fadeIn">
      {/* Dossier Header */}
      <div className="bg-gray-50 dark:bg-neutral-850 px-4 py-3 border-b border-gray-150 dark:border-neutral-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-250 dark:hover:bg-neutral-800 rounded-lg text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition flex items-center gap-1 font-bold text-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-4 w-px bg-gray-200 dark:bg-neutral-700" />
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
              {contact.name} Dossier
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
              {contact.company} • Detailed Workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
            {contact.stage}
          </span>
          <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-current" />
            {contact.heatScore}
          </span>
        </div>
      </div>

      {/* Tabs list - horizontal scrollable */}
      <div className="shrink-0 bg-gray-50/50 dark:bg-neutral-850/20 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-1 overflow-x-auto px-4 py-1.5 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-xs border-gray-200 dark:border-neutral-750'
                  : 'text-gray-550 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white border-transparent'
              }`}
            >
              <span className={isActive ? tab.color : 'text-gray-400'}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Detail Pages Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* TAB 1: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Permanent Chronological Event History ({filteredTimeline.length} events)
              </h3>
              <div className="relative w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 bg-gray-50 dark:bg-neutral-850 text-[10px] rounded focus:outline-hidden border border-transparent dark:border-neutral-800 focus:bg-white dark:focus:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredTimeline.map((ev) => {
                const getEventEmoji = (t: string) => {
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
                  <div
                    key={ev.id}
                    className="p-3 bg-gray-50/50 dark:bg-neutral-850/20 rounded-xl border border-gray-100 dark:border-neutral-800 flex items-start gap-3"
                  >
                    <div className="h-7 w-7 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-lg flex items-center justify-center text-xs shadow-xs select-none mt-0.5">
                      {getEventEmoji(ev.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {ev.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold font-mono">
                          {new Date(ev.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-650 dark:text-neutral-400 mt-1 whitespace-pre-wrap leading-relaxed font-medium">
                        {ev.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredTimeline.length === 0 && (
                <div className="py-12 text-center text-gray-400 dark:text-neutral-500">
                  <AlertCircle className="w-8 h-8 text-gray-200 dark:text-neutral-800 mx-auto mb-2" />
                  <p className="text-xs font-bold">No events matching the search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MEETINGS */}
        {activeTab === 'meetings' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Form to log meeting */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Record Minutes of Meeting (MoM)
              </h3>
              <form onSubmit={handleSaveMoM} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Meeting Title (e.g. Design Spec Review)"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-semibold"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Attendees (e.g. Abhishek, CAD Team)"
                    value={meetingAttendees}
                    onChange={(e) => setMeetingAttendees(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  />
                </div>
                <textarea
                  placeholder="Minutes of the Meeting (Key decisions, points discussed, specifications)..."
                  value={meetingMoM}
                  onChange={(e) => setMeetingMoM(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white h-20"
                  required
                />
                <textarea
                  placeholder="Key Action Items & Assignments (If any, schedules auto follow-up task tomorrow)..."
                  value={meetingActionItems}
                  onChange={(e) => setMeetingActionItems(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white h-12"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
                >
                  Save Meeting Minutes
                </button>
              </form>
            </div>

            {/* List of meeting events */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Logged Meetings History
              </h3>
              {timelineEvents
                .filter((e) => e.contactId === contact.id && e.type === 'meeting')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-indigo-50/20 dark:bg-neutral-850/10 rounded-xl border border-indigo-100/50 dark:border-neutral-800/60 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold mb-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {ev.title}
                      </span>
                      <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed font-medium">
                      {ev.notes}
                    </p>
                  </div>
                ))}
              {timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'meeting').length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-4">No logged meetings found.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CALL HISTORY */}
        {activeTab === 'calls' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Call Stats Header */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-sky-50/30 dark:bg-neutral-850/10 p-3 rounded-xl border border-sky-100/60 dark:border-neutral-800/40 text-center">
                <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Total Logged Calls</span>
                <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                  {timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'call').length}
                </span>
              </div>
              <div className="bg-sky-50/30 dark:bg-neutral-850/10 p-3 rounded-xl border border-sky-100/60 dark:border-neutral-800/40 text-center">
                <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Last Call Date</span>
                <span className="text-xs font-extrabold text-gray-700 dark:text-neutral-200">
                  {(() => {
                    const callEvents = timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'call');
                    return callEvents[0] ? new Date(callEvents[0].timestamp).toLocaleDateString() : 'N/A';
                  })()}
                </span>
              </div>
              <div className="bg-sky-50/30 dark:bg-neutral-850/10 p-3 rounded-xl border border-sky-100/60 dark:border-neutral-800/40 text-center">
                <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Phone Number</span>
                <span className="text-xs font-extrabold text-sky-500 font-mono">{contact.phone}</span>
              </div>
            </div>

            {/* Form to log call */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-3 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Register Quick Call Log
              </h3>
              <form onSubmit={handleSaveCallLog} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Call Disposition</label>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                    >
                      <option value="Relationship Check-in">📞 Relationship Check-in</option>
                      <option value="Price negotiation">💰 Price Negotiation</option>
                      <option value="Follow-up on Proposal">💼 Follow-up on Proposal</option>
                      <option value="CAD Specification Discussion">📐 CAD Spec Discussion</option>
                      <option value="Busy / No response">❌ Busy / No response</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Call discussion summary</label>
                  <input
                    type="text"
                    placeholder="e.g., Client verified measurements, happy with pricing structure, requested follow-up next week."
                    value={callNotesText}
                    onChange={(e) => setCallNotesText(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
                >
                  Save Call Log
                </button>
              </form>
            </div>

            {/* List of call events */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Call History Log
              </h3>
              {timelineEvents
                .filter((e) => e.contactId === contact.id && e.type === 'call')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-sky-50/20 dark:bg-neutral-850/10 rounded-xl border border-sky-100/50 dark:border-neutral-800/60 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold mb-1">
                      <span className="text-sky-600 dark:text-sky-400 font-bold">{ev.title}</span>
                      <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 dark:text-neutral-300 font-medium">
                      {ev.notes}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Project List */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Active Construction & Layout Projects
              </h3>
              {projects.map((proj) => {
                const getStatusColor = (st: ProjectItem['status']) => {
                  switch (st) {
                    case 'Planning': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200';
                    case 'CAD': return 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200';
                    case 'Quoted': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200';
                    case 'Production': return 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200';
                    case 'Completed': return 'text-teal-500 bg-teal-50 dark:bg-teal-950/20 border-teal-200';
                  }
                };

                const getStatusProgress = (st: ProjectItem['status']) => {
                  switch (st) {
                    case 'Planning': return 'w-1/5 bg-blue-500';
                    case 'CAD': return 'w-2/5 bg-purple-500';
                    case 'Quoted': return 'w-3/5 bg-emerald-500';
                    case 'Production': return 'w-4/5 bg-orange-500';
                    case 'Completed': return 'w-full bg-teal-500';
                  }
                };

                return (
                  <div
                    key={proj.id}
                    className="p-3 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                          {proj.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          Valued at ₹{(proj.value / 100000).toFixed(2)} Lakhs • Timeline: {proj.startDate} to {proj.endDate}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getStatusColor(proj.status)}`}>
                        {proj.status}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-extrabold uppercase text-gray-400">
                        <span>Planning</span>
                        <span>CAD Design</span>
                        <span>Commercial Bid</span>
                        <span>Fabrication</span>
                        <span>Completed</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${getStatusProgress(proj.status)}`} />
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1 border-t border-gray-50/50 dark:border-neutral-850">
                      {(['Planning', 'CAD', 'Quoted', 'Production', 'Completed'] as ProjectItem['status'][]).map((st) => (
                        <button
                          key={st}
                          onClick={() => {
                            const updated = projects.map((p) => (p.id === proj.id ? { ...p, status: st } : p));
                            saveProjectsToLocalStorage(updated);
                            triggerGlobalTimelineEvent(
                              'status_change',
                              `Project Status updated: ${st}`,
                              `Moved active project "${proj.name}" to the "${st}" milestones category.`
                            );
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition ${
                            proj.status === st
                              ? 'bg-gray-900 text-white dark:bg-neutral-700'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-400 dark:bg-neutral-850 hover:text-gray-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create Project Workspace form */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1">
                <Sliders className="w-4 h-4" />
                Initialize New Project Workspace
              </h3>
              <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Project Workspace Name (e.g. Phase 2 Façade)"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-semibold"
                    required
                  />
                  <div>
                    <input
                      type="number"
                      placeholder="Commercial Value (INR)"
                      value={newProjectValue}
                      onChange={(e) => setNewProjectValue(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-bold"
                    />
                  </div>
                  <select
                    value={newProjectStatus}
                    onChange={(e) => setNewProjectStatus(e.target.value as any)}
                    className="px-2 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  >
                    <option value="Planning">Planning phase</option>
                    <option value="CAD">CAD Elevation</option>
                    <option value="Quoted">Quoted/Bidding</option>
                    <option value="Production">Fabrication started</option>
                    <option value="Completed">Handed over</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
                >
                  Deploy Project Workspace
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: QUOTATIONS */}
        {activeTab === 'quotes' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Active Quotes Ledger */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Commercial Proposals Ledger
              </h3>
              {timelineEvents
                .filter((e) => e.contactId === contact.id && e.type === 'quote')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-emerald-50/20 dark:bg-neutral-850/10 rounded-xl border border-emerald-150/40 dark:border-neutral-800/50 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        COMMERCIAL ESTIMATE ACTIVE
                      </span>
                      <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-white">
                      {ev.title}
                    </div>
                    <pre className="text-[10px] bg-white dark:bg-neutral-900 p-2.5 rounded border border-emerald-100/40 dark:border-neutral-800 font-mono text-gray-650 dark:text-neutral-300 leading-normal overflow-x-auto whitespace-pre-wrap">
                      {ev.notes}
                    </pre>
                  </div>
                ))}
              {timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'quote').length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-4">No quotations issued yet.</p>
              )}
            </div>

            {/* Interactive Quoting Calculator */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Interactive Commercial Quotation Architect
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Design elevation line items in offline workspace. Generates professional PDF ledger equivalents.
                </p>
              </div>

              {/* Items Table list */}
              <div className="space-y-1.5 text-xs">
                <div className="grid grid-cols-12 gap-2 text-[8px] font-extrabold uppercase text-gray-400 pb-1 border-b border-gray-200 dark:border-neutral-800">
                  <div className="col-span-6">Material Description</div>
                  <div className="col-span-2 text-right">Qty (Sq Ft)</div>
                  <div className="col-span-2 text-right">Rate (₹)</div>
                  <div className="col-span-2 text-right">Total (₹)</div>
                </div>

                {quoteItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 py-1 border-b border-gray-100 dark:border-neutral-800 font-mono text-[10px]">
                    <div className="col-span-6 font-semibold font-sans truncate">{item.desc}</div>
                    <div className="col-span-2 text-right">{item.qty.toLocaleString()}</div>
                    <div className="col-span-2 text-right">₹{item.rate}</div>
                    <div className="col-span-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(item.qty * item.rate).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Subtotal calculator summary */}
                {(() => {
                  const subtotal = quoteItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
                  const discountVal = (subtotal * quoteDiscount) / 100;
                  const taxVal = ((subtotal - discountVal) * 18) / 100;
                  const finalTotal = subtotal - discountVal + taxVal;

                  return (
                    <div className="pt-2.5 space-y-1 text-[11px] font-semibold text-gray-650 dark:text-neutral-400 flex flex-col items-end">
                      <div className="w-56 flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono text-gray-950 dark:text-white font-bold">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="w-56 flex justify-between items-center text-rose-500">
                        <span>Discount:</span>
                        <div className="flex items-center gap-1 text-[10px]">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={quoteDiscount}
                            onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                            className="w-10 px-1 py-0.5 bg-white border border-gray-250 dark:bg-neutral-850 dark:border-neutral-800 rounded font-mono text-right text-rose-500 font-bold"
                          />
                          %
                        </div>
                      </div>
                      <div className="w-56 flex justify-between">
                        <span>GST (18%):</span>
                        <span className="font-mono text-gray-950 dark:text-white">₹{taxVal.toLocaleString()}</span>
                      </div>
                      <div className="w-56 flex justify-between border-t border-gray-200 dark:border-neutral-800 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Calculated Bid:</span>
                        <span className="font-mono font-extrabold text-sm">₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Form to add item */}
              <form onSubmit={handleAddQuoteItem} className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Additional Item (e.g. Zinc Finish Elevation)"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="md:col-span-6 px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="md:col-span-2 px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded font-bold"
                />
                <input
                  type="number"
                  placeholder="Rate (₹)"
                  value={newItemRate}
                  onChange={(e) => setNewItemRate(Number(e.target.value))}
                  className="md:col-span-2 px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded font-bold"
                />
                <button
                  type="submit"
                  className="md:col-span-2 px-3 py-1 bg-gray-900 dark:bg-neutral-800 hover:bg-black text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  + Add Item
                </button>
              </form>

              {/* Issue proposal button */}
              <div className="pt-2 flex justify-end border-t border-dashed border-gray-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleIssueQuotation}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Issue Commercial Proposal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DRAWINGS */}
        {activeTab === 'drawings' && (
          <div className="space-y-5 animate-fadeIn">
            {/* CAD Drawing Safe */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Blueprint & CAD drawing files archive
              </h3>
              {timelineEvents
                .filter((e) => e.contactId === contact.id && e.type === 'drawing')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-purple-50/20 dark:bg-neutral-850/10 rounded-xl border border-purple-150/40 dark:border-neutral-800/50 text-xs space-y-2 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold">
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        📐 BLUEPRINT DESIGN REVISION ACTIVE
                      </span>
                      <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="font-extrabold text-gray-800 dark:text-white">
                      {ev.title}
                    </div>
                    <p className="text-[11px] text-gray-650 dark:text-neutral-400 leading-relaxed font-semibold">
                      {ev.notes}
                    </p>
                  </div>
                ))}
              {timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'drawing').length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-4">No drawing files registered.</p>
              )}
            </div>

            {/* Request drawing revision form */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-3 flex items-center gap-1">
                <Award className="w-4 h-4" />
                Blueprint CAD Revision Request Builder
              </h3>
              <form onSubmit={handleIssueDwgRequest} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Revision Title (e.g. Elevation Tower C)"
                    value={dwgTitle}
                    onChange={(e) => setDwgTitle(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-semibold"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Assigned Designer"
                    value={dwgDesigner}
                    onChange={(e) => setDwgDesigner(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Elevation Spacing (e.g. 12,000 sq ft)"
                    value={dwgDimensions}
                    onChange={(e) => setDwgDimensions(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
                >
                  Issue Blueprint CAD Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: PRODUCTION */}
        {activeTab === 'production' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Fabrication Milestone Status Checklist */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1">
                  <Hammer className="w-4 h-4" />
                  Manufacturing & Factory Production Milestones
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Tracks factory fabrication queues for ordered material sets.
                </p>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                {[
                  { name: '1. Sourcing Raw Granite / Quartzite stone slabs', desc: 'Slabs verified and cut with multi-wire edge profile cutters', done: true },
                  { name: '2. CNC Waterjet Precision Dimension Slicing', desc: 'Slabs cut matching exact elevation layout CAD specifications', done: true },
                  { name: '3. Surface Finishing & Micro-polishing treatments', desc: 'Thermal sandblasting and protective chemical seal application', done: false },
                  { name: '4. Batching, Foam Padding & Timber Crate Packaging', desc: 'Secure heavy-load shipping packaging assembled', done: false },
                  { name: '5. Pre-Dispatch Enterprise Quality Assessment', desc: 'Visual inspecting, spacing validation, slab counts clearance', done: false },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                      step.done 
                        ? 'bg-orange-100 text-orange-600 border-orange-200' 
                        : 'bg-white text-gray-400 border-gray-250 dark:bg-neutral-850 dark:border-neutral-800'
                    }`}>
                      {step.done ? <Check className="w-2.5 h-2.5" /> : index + 1}
                    </div>
                    <div>
                      <span className={`block text-xs font-bold ${step.done ? 'text-gray-900 dark:text-white' : 'text-gray-450 dark:text-neutral-500'}`}>
                        {step.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action tracker */}
            <div className="p-4 bg-orange-50/10 dark:bg-neutral-850/10 border border-orange-150/40 rounded-xl text-xs space-y-3">
              <div>
                <h4 className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <span>⚙️</span> Log Factory Production Update
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                  Saves fabrication status reports into permanent chronological timeline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerGlobalTimelineEvent(
                    'production',
                    'Factory Milestone: Surface Finishing Active',
                    'Core sandblasting completed for first 4,000 sq ft. Surface seal chemistry successfully applied on line-2.'
                  );
                  triggerGlobalContactUpdate({ stage: 'Production Started' });
                  alert('Production log entered in timeline. Category synced.');
                }}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
              >
                Log Polish/Seal Phase Completed
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: DISPATCH */}
        {activeTab === 'dispatch' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Active Dispatch Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Logistics & Cargo Dispatch Tracking
              </h3>
              {timelineEvents
                .filter((e) => e.contactId === contact.id && e.type === 'dispatch')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-rose-50/20 dark:bg-neutral-850/10 rounded-xl border border-rose-150/40 dark:border-neutral-800/50 text-xs space-y-2 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold">
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        🚛 TRANSIT SHIPMENT ACTIVE
                      </span>
                      <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="font-extrabold text-gray-800 dark:text-white">
                      {ev.title}
                    </div>
                    <p className="text-[11px] text-gray-650 dark:text-neutral-400 leading-relaxed font-semibold">
                      {ev.notes}
                    </p>
                  </div>
                ))}
              {timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'dispatch').length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-4">No dispatch logs written yet.</p>
              )}
            </div>

            {/* Dispatch logger form */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Log Material Dispatch Shipment
              </h3>
              <form onSubmit={handleAddDispatchLog} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Dispatch Ref No (e.g. DSP-2026-004)"
                    value={dispatchRef}
                    onChange={(e) => setDispatchRef(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-semibold"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Logistics Carrier (e.g. SafeTransit Express)"
                    value={dispatchCarrier}
                    onChange={(e) => setDispatchCarrier(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Vehicle Registration Plate (e.g. MH-04-EY-1234)"
                    value={dispatchVehicle}
                    onChange={(e) => setDispatchVehicle(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Dispatched Slab Batch Details"
                    value={dispatchItems}
                    onChange={(e) => setDispatchItems(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
                >
                  Save Dispatch cargo Log
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Receivable Ledger Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {(() => {
                const totalInvoiceEvents = timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'quote');
                const lastQuote = totalInvoiceEvents[0];
                let val = 4200000; // default c1 Lodha value
                if (contact.id === 'c2') val = 1500000;
                if (contact.id === 'c3') val = 2500000;
                if (contact.id === 'c4') val = 6800000;
                if (contact.id === 'c5') val = 12000000;

                const paymentEvents = timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'payment');
                const totalPaid = paymentEvents.length * 1500000 || (contact.id === 'c5' ? 10200000 : 0);
                const outstanding = val - totalPaid;

                return (
                  <>
                    <div className="bg-teal-50/20 dark:bg-neutral-850/10 p-3 rounded-xl border border-teal-100/50 dark:border-neutral-800/40 text-center">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Estimated contract</span>
                      <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">₹{(val / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="bg-teal-50/20 dark:bg-neutral-850/10 p-3 rounded-xl border border-teal-100/50 dark:border-neutral-800/40 text-center">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Total Paid Receipts</span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">₹{(totalPaid / 100000).toFixed(2)} Lakhs</span>
                    </div>
                    <div className="bg-teal-50/20 dark:bg-neutral-850/10 p-3 rounded-xl border border-teal-100/50 dark:border-neutral-800/40 text-center">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Outstanding Balance</span>
                      <span className={`text-sm font-extrabold ${outstanding > 0 ? 'text-red-500' : 'text-gray-450'}`}>
                        ₹{(outstanding / 100000).toFixed(2)} Lakhs
                      </span>
                    </div>
                    <div className="bg-teal-50/20 dark:bg-neutral-850/10 p-3 rounded-xl border border-teal-100/50 dark:border-neutral-800/40 text-center">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Retention Safety</span>
                      <span className="text-sm font-extrabold text-indigo-500">15% Locked</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Payments list log */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Logged Payment Receipts & Cleared Ledgers
              </h3>
              {timelineEvents
                .filter((e) => e.contactId === contact.id && e.type === 'payment')
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-teal-50/20 dark:bg-neutral-850/10 rounded-xl border border-teal-150/40 dark:border-neutral-800/50 text-xs space-y-2 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold">
                      <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1">
                        💰 REVENUE TRANSACTION VERIFIED
                      </span>
                      <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="font-extrabold text-gray-800 dark:text-white">
                      {ev.title}
                    </div>
                    <p className="text-[11px] text-gray-650 dark:text-neutral-400 leading-relaxed font-semibold whitespace-pre-wrap">
                      {ev.notes}
                    </p>
                  </div>
                ))}
              {timelineEvents.filter((e) => e.contactId === contact.id && e.type === 'payment').length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-4">No logged payments registered.</p>
              )}
            </div>

            {/* Record payment form */}
            <div className="p-4 bg-gray-50/60 dark:bg-neutral-850/20 rounded-xl border border-gray-150 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-500 mb-3 flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                Record Financial Payment Receipt
              </h3>
              <form onSubmit={handleAddPaymentLog} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Receipt Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="Amount Received"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Receipt Allocation Stage</label>
                    <select
                      value={payInstallment}
                      onChange={(e) => setPayInstallment(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-semibold"
                    >
                      <option value="Advance 50% Milestone">Advance 50% Milestone</option>
                      <option value="Dispatch 35% Installment">Dispatch 35% Installment</option>
                      <option value="Retention 15% Clearance">Retention 15% Clearance</option>
                      <option value="Custom Supplementary Invoice">Supplementary Invoice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 font-bold uppercase mb-1">Bank Transaction Reference (UTR)</label>
                    <input
                      type="text"
                      placeholder="Bank reference UTR (e.g. BARCN2026...)"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-mono"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded text-[10px] cursor-pointer shadow-xs transition"
                >
                  Record Payment Receipt
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 10: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-5 animate-fadeIn">
            {/* List of Docs */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                Secure Client Electronic vault
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-xl flex items-center justify-between gap-3 animate-fadeIn"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-neutral-850 flex items-center justify-center text-xs text-gray-500 select-none">
                        📄
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold text-gray-800 dark:text-gray-200 truncate">
                          {doc.name}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold font-mono">
                          {doc.size} • Uploaded {doc.date}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = documents.filter((d) => d.id !== doc.id);
                        saveDocsToLocalStorage(updated);
                        triggerGlobalTimelineEvent(
                          'system',
                          `Document Removed`,
                          `Erased file attachment "${doc.name}" from partner archive.`
                        );
                      }}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* File drag-drop simulated zone */}
            <div className="p-5 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl bg-gray-50/50 dark:bg-neutral-850/5 text-center flex flex-col items-center justify-center space-y-3">
              <FolderOpen className="w-8 h-8 text-gray-300 dark:text-neutral-850" />
              <div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Drag and drop local CAD, PDF invoice, or contracts here
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Simulated local file buffer handles file attachments securely.
                </p>
              </div>

              {/* Upload input */}
              <form onSubmit={handleAddDocument} className="flex items-center gap-1 text-xs">
                <input
                  type="text"
                  placeholder="Simulated file name (e.g. final_po_lodha)"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white"
                  required
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="px-1.5 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded focus:outline-hidden dark:text-white font-mono"
                >
                  <option value="pdf">pdf</option>
                  <option value="dwg">dwg</option>
                  <option value="xlsx">xlsx</option>
                  <option value="png">png</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1 bg-gray-900 dark:bg-neutral-800 hover:bg-black text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  + Upload Attachment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 11: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500">
                Dossier Workspace Free-Form Notes
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                Saved scratchpad syncs back directly onto primary Partner card notes.
              </p>
            </div>

            <textarea
              value={notesScratchpad}
              onChange={(e) => setNotesScratchpad(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-neutral-850/20 text-xs font-semibold rounded-xl border border-gray-150 dark:border-neutral-800 p-4 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-900 dark:text-white h-64 leading-relaxed scrollbar-thin"
              placeholder="Jot down notes, billing specifics, customized constraints, materials checklists..."
            />

            <div className="flex justify-between items-center">
              <span className="text-[9px] text-gray-400 font-bold uppercase">
                Last updated profile notes: {contact.lastContactDate || 'Today'}
              </span>
              <button
                type="button"
                onClick={handleSaveScratchpad}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                Synchronize Notes Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
