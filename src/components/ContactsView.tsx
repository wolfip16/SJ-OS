/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { Contact, TimelineEvent, CalendarItem, ContactStage } from '../types';
import { DeepDossier } from './DeepDossier';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Flame,
  Activity,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle,
  FileCheck2,
  Calendar,
  Send,
  Sliders,
  History,
  X,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Layers,
  BarChart3,
  Check,
  Info,
  FileText,
} from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  timelineEvents: TimelineEvent[];
  calendarItems: CalendarItem[];
  onAddContact: (contactData: Omit<Contact, 'id' | 'interactionCount' | 'createdAt'>) => void;
  onDeleteContact: (id: string) => void;
  onSelectContact: (id: string | null) => void;
  selectedContactId: string | null;
  onTriggerOneTapWorkflow: (contactId: string, actionType: string) => void;
}

export function ContactsView({
  contacts,
  timelineEvents,
  calendarItems,
  onAddContact,
  onDeleteContact,
  onSelectContact,
  selectedContactId,
  onTriggerOneTapWorkflow,
}: ContactsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Mobile/Tablet responsive view switcher: 'list' or 'detail'
  const [mobileView, setMobileView] = useState<'list' | 'detail'>(selectedContactId ? 'detail' : 'list');

  useEffect(() => {
    if (selectedContactId) {
      setMobileView('detail');
    } else {
      setMobileView('list');
    }
  }, [selectedContactId]);

  // New Note state
  const [newNoteText, setNewNoteText] = useState('');
  const [newInteractionType, setNewInteractionType] = useState<string>('Relationship Call');
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  // Principle of Progressive Depth states
  const [activeLayerTab, setActiveLayerTab] = useState<'layer1' | 'layer2' | 'layer3' | 'layer4' | 'all'>('layer1');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'call' | 'meeting' | 'quote' | 'drawing' | 'payment' | 'note'>('all');

  // Information Hierarchy Detailed Dossiers state
  const [selectedDetailDossier, setSelectedDetailDossier] = useState<
    | null
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
  >(null);

  // Reusable detailed form inputs
  const [dossierText1, setDossierText1] = useState('');
  const [dossierText2, setDossierText2] = useState('');
  const [dossierSelect, setDossierSelect] = useState('');

  // Add Contact Form States
  const [addName, setAddName] = useState('');
  const [addCompany, setAddCompany] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addCity, setAddCity] = useState('');
  const [addStage, setAddStage] = useState<ContactStage>('Lead');
  const [addHeatScore, setAddHeatScore] = useState(50);
  const [addNotes, setAddNotes] = useState('');

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Filter contacts
  const filteredContacts = contacts
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStage = stageFilter === 'all' || c.stage === stageFilter;
      return matchSearch && matchStage;
    })
    .sort((a, b) => b.heatScore - a.heatScore);

  // Filter timeline events for the selected contact
  const selectedTimeline = timelineEvents
    .filter((e) => e.contactId === selectedContactId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const handleAddContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addCompany.trim()) return;

    onAddContact({
      name: addName,
      company: addCompany,
      phone: addPhone.trim() || 'Unspecified',
      email: addEmail.trim() || undefined,
      city: addCity.trim() || undefined,
      stage: addStage,
      heatScore: Number(addHeatScore),
      notes: addNotes.trim() || undefined,
      lastContactDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: new Date().toISOString().split('T')[0],
    });

    // Reset Form
    setAddName('');
    setAddCompany('');
    setAddPhone('');
    setAddEmail('');
    setAddCity('');
    setAddStage('Lead');
    setAddHeatScore(50);
    setAddNotes('');
    setIsAddingContact(false);
    setShowOptionalDetails(false);
  };

  // Maps custom interaction types to standard base categories
  const mapInteractionToType = (interaction: string): TimelineEvent['type'] => {
    switch (interaction) {
      case 'Relationship Call':
      case 'General Check-in':
      case 'Technical Discussion':
      case 'Courtesy Call':
        return 'call';
      case 'Meeting':
      case 'Site Visit':
        return 'meeting';
      case 'Payment Follow-up':
        return 'payment';
      case 'Quotation Discussion':
        return 'quote';
      case 'Production Follow-up':
        return 'production';
      case 'Complaint':
      case 'New Introduction':
      case 'General Observation':
      default:
        return 'note';
    }
  };

  // Allow manual timeline note additions
  const handleAddManualTimeline = (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedContactId) return;

    // Send custom event or mutate directly via window listener to let App state append
    const newEvent: TimelineEvent = {
      id: `manual_timeline_${Date.now()}`,
      contactId: selectedContactId,
      type: mapInteractionToType(newInteractionType),
      title: newInteractionType,
      notes: newNoteText,
      timestamp: new Date().toISOString(),
    };

    const customEvent = new CustomEvent('sj_os_add_timeline_event', { detail: newEvent });
    window.dispatchEvent(customEvent);

    setNewNoteText('');
  };

  // Heat Indicator Styling
  const getHeatColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-250';
    if (score >= 50) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-250';
    return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-250';
  };

  return (
    <div id="contacts_and_timeline_module" className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full items-stretch">
      {/* 1. Directory List Panel (5 Cols) */}
      <div className={`md:col-span-5 bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-2xl p-4 flex flex-col h-full overflow-hidden shadow-xs ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
        {/* Directory Controls */}
        <div className="space-y-3 shrink-0 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#FFFFFF] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#007AFF]" />
              Partners Directory
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  alert('Synced 8 contacts & team members with Google Workspace Directory!');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[10px] font-semibold text-gray-700 dark:text-gray-200 transition-all active:scale-95 cursor-pointer border border-gray-200 dark:border-gray-700"
                title="Sync Google Contacts & Directory"
              >
                <RefreshCw className="w-3 h-3 text-[#007AFF]" /> Sync Contacts
              </button>
              <button
                onClick={() => setIsAddingContact(!isAddingContact)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0066CC] dark:bg-[#007AFF] dark:hover:bg-[#0066CC] text-[10px] font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                id="btn_add_contact_toggle"
              >
                <Plus className="w-3.5 h-3.5" /> Add Lead
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="Search by name, company, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-xs rounded-lg focus:outline-hidden border border-transparent dark:border-transparent focus:bg-[#E5E5EA] dark:focus:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#FFFFFF] placeholder-[#8E8E93] font-medium"
            />
          </div>

          {/* Quick Category / Stage Filter pills (Sleek horizontal segment control) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-medium">
            {['all', 'Lead', 'Need Drawing', 'Quotation Sent', 'Order Expected', 'Payment Follow-up'].map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  stageFilter === st
                    ? 'bg-[#007AFF] text-white shadow-xs font-semibold'
                    : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Stages' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-1.5 relative">
          {/* Create Lead Modal Form overlay inline */}
          {isAddingContact && (
            <div className="bg-gray-50 dark:bg-neutral-850 p-3.5 rounded-xl border border-gray-200/60 dark:border-neutral-800 space-y-2.5 animate-fadeIn z-10 relative">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">
                  Register Strategic Account
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-850"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleAddContactSubmit} className="space-y-2.5 text-xs">
                <input
                  type="text"
                  placeholder="Contact Full Name *"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg focus:outline-hidden dark:text-white font-semibold"
                  required
                />
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={addCompany}
                  onChange={(e) => setAddCompany(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg focus:outline-hidden dark:text-white font-semibold"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                  className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-1 pt-1"
                >
                  {showOptionalDetails ? 'Hide Optional Settings' : 'Configure Optional Details (Phone, Email, Notes, etc.)'}
                </button>

                {showOptionalDetails && (
                  <div className="space-y-2.5 pt-1 animate-fadeIn">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg focus:outline-hidden dark:text-white"
                    />
                    <input
                      type="email"
                      placeholder="Email ID"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg focus:outline-hidden dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={addCity}
                        onChange={(e) => setAddCity(e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg focus:outline-hidden dark:text-white"
                      />
                      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 px-2 border border-gray-200 dark:border-neutral-700/60 rounded-lg">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <input
                          type="number"
                          placeholder="Heat"
                          min="0"
                          max="100"
                          value={addHeatScore}
                          onChange={(e) => setAddHeatScore(Number(e.target.value))}
                          className="w-full py-1.5 bg-transparent focus:outline-hidden text-xs dark:text-white font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-400 uppercase font-bold mb-0.5">Initial Stage</label>
                      <select
                        value={addStage}
                        onChange={(e) => setAddStage(e.target.value as ContactStage)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg dark:text-white"
                      >
                        <option value="Lead">Lead</option>
                        <option value="Need Drawing">Need Drawing</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Order Expected">Order Expected</option>
                        <option value="Payment Follow-up">Payment Follow-up</option>
                      </select>
                    </div>

                    <textarea
                      placeholder="General Notes & Specs..."
                      value={addNotes}
                      onChange={(e) => setAddNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/60 rounded-lg focus:outline-hidden dark:text-white h-12 text-xs"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingContact(false)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-150 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow-xs"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-neutral-500">
              <Users className="w-8 h-8 text-gray-200 dark:text-neutral-850 mx-auto mb-2" />
              <p className="text-xs font-bold">No contacts found</p>
            </div>
          ) : (
            filteredContacts.map((c) => {
              const isSelected = c.id === selectedContactId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectContact(c.id);
                    setSelectedDetailDossier(null);
                    setDossierText1('');
                    setDossierText2('');
                    setDossierSelect('');
                  }}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 border border-transparent active:scale-98 ${
                    isSelected
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/40 hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7]'
                  }`}
                  id={`directory_item_${c.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold truncate">{c.name}</h4>
                    <p className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#8E8E93]'}`}>
                      {c.company} • {c.city || 'National'}
                    </p>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider mt-1.5 ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#E3E3E9] dark:bg-[#3A3A3C] text-[#1D1D1F] dark:text-[#F5F5F7]'
                    }`}>
                      {c.stage}
                    </span>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${
                      isSelected
                        ? 'text-white border-white/30 bg-white/10'
                        : getHeatColor(c.heatScore)
                    }`}>
                      <Flame className="w-3 h-3 fill-current" />
                      {c.heatScore}
                    </span>
                    <span className={`text-[9px] font-semibold ${isSelected ? 'text-white/70' : 'text-[#8E8E93]'}`}>
                      {c.interactionCount} touches
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Focused Operations & Chronological History (7 Cols) */}
      <div className={`md:col-span-7 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-2xl p-4 flex flex-col h-full overflow-hidden ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}`}>
        {selectedContact ? (
          selectedDetailDossier !== null ? (
            <DeepDossier
              contact={selectedContact}
              timelineEvents={timelineEvents}
              calendarItems={calendarItems}
              activeTab={selectedDetailDossier}
              onChangeTab={setSelectedDetailDossier}
              onClose={() => setSelectedDetailDossier(null)}
            />
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Lead Header Specs */}
            <div className="pb-3 border-b border-gray-100 dark:border-neutral-800 shrink-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => onSelectContact(null)}
                className="md:hidden mb-2.5 flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Partners
              </button>

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                    {selectedContact.name}
                  </h2>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-0.5">
                    {selectedContact.company}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${getHeatColor(selectedContact.heatScore)}`}>
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Heat: {selectedContact.heatScore}/100
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Confirm deletion of partner directory profile "${selectedContact.company}"?`)) {
                        onDeleteContact(selectedContact.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                    title="Delete Partner Profile"
                    id="btn_delete_contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid Specs */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-gray-550 dark:text-neutral-400 mt-3 pt-2.5 border-t border-gray-100/40 dark:border-neutral-800/40">
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedContact.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{selectedContact.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedContact.city || 'No Address'}</span>
                </div>
              </div>

              {/* Derived System Parameters Panel */}
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200 dark:border-neutral-800">
                <div className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1 flex items-center gap-1">
                  <span>⚡</span> Derived Profile Metrics (Computed from history logs)
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50/50 dark:bg-neutral-850/30 px-2 py-1.5 rounded-lg border border-gray-100/60 dark:border-neutral-800/40">
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Last Call</span>
                    <span className="font-extrabold text-[10px] text-gray-800 dark:text-gray-200">
                      {(() => {
                        const callEv = selectedTimeline.find(e => e.type === 'call');
                        return callEv ? new Date(callEv.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'None';
                      })()}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-neutral-850/30 px-2 py-1.5 rounded-lg border border-gray-100/60 dark:border-neutral-800/40">
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Last Meeting</span>
                    <span className="font-extrabold text-[10px] text-gray-800 dark:text-gray-200">
                      {(() => {
                        const meetEv = selectedTimeline.find(e => e.type === 'meeting');
                        return meetEv ? new Date(meetEv.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'None';
                      })()}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-neutral-850/30 px-2 py-1.5 rounded-lg border border-gray-100/60 dark:border-neutral-800/40">
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Derived Status</span>
                    <span className="font-extrabold text-[10px] text-amber-500 dark:text-amber-400 truncate block">
                      {selectedTimeline[0] ? selectedTimeline[0].title : selectedContact.stage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deep Dossier Dedicated Pages Quick Launcher */}
              <div className="mt-3 p-2.5 bg-gradient-to-r from-blue-50/45 via-indigo-50/20 to-purple-50/45 dark:from-neutral-850/40 dark:via-neutral-850/20 dark:to-neutral-850/40 rounded-xl border border-blue-100/50 dark:border-neutral-800 shrink-0">
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Deep Dossier Workspace (10% Complex Historical Audit)
                  </span>
                  <button
                    onClick={() => setSelectedDetailDossier('timeline')}
                    className="text-[9px] text-blue-500 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    Open Full Dossier →
                  </button>
                </div>
                {/* 11 quick links to pages */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 text-[9px] font-bold">
                  {[
                    { id: 'timeline', label: 'Timeline', icon: '🕒' },
                    { id: 'meetings', label: 'Meetings', icon: '🤝' },
                    { id: 'calls', label: 'Calls', icon: '📞' },
                    { id: 'projects', label: 'Projects', icon: '🏗️' },
                    { id: 'quotes', label: 'Quotes', icon: '💼' },
                    { id: 'drawings', label: 'Drawings', icon: '📐' },
                    { id: 'production', label: 'Production', icon: '🏭' },
                    { id: 'dispatch', label: 'Dispatch', icon: '🚛' },
                    { id: 'payments', label: 'Payments', icon: '💰' },
                    { id: 'documents', label: 'Documents', icon: '📂' },
                    { id: 'notes', label: 'Notes', icon: '📝' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedDetailDossier(p.id as any)}
                      className="px-1.5 py-1 bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-850 border border-gray-150 dark:border-neutral-750 rounded text-center truncate hover:border-blue-400 cursor-pointer transition text-gray-700 dark:text-neutral-300"
                    >
                      <span className="mr-0.5">{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4-Layer Progressive Depth Selector */}
            <div className="shrink-0 mt-3.5 mb-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#1D1D1F]/50 dark:text-[#E8E8ED]/40 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-500" />
                  Progressive Depth Layers
                </span>
                <span className="text-[8px] font-bold text-gray-400">
                  Select layer detail level
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 bg-gray-50 dark:bg-neutral-850 p-1 rounded-xl border border-gray-150 dark:border-neutral-800">
                {[
                  { id: 'layer1', label: 'L1: Action', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                  { id: 'layer2', label: 'L2: Context', icon: <Info className="w-3.5 h-3.5" /> },
                  { id: 'layer3', label: 'L3: History', icon: <History className="w-3.5 h-3.5" /> },
                  { id: 'layer4', label: 'L4: Analysis', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                  { id: 'all', label: 'All Dossier', icon: <Layers className="w-3.5 h-3.5" /> },
                ].map((tab) => {
                  const isActive = activeLayerTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveLayerTab(tab.id as any)}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold transition active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs border border-gray-150 dark:border-neutral-750/50'
                          : 'text-gray-550 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Layer Container */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 scrollbar-thin">
              {/* LAYER 1: ACTION */}
              {(activeLayerTab === 'layer1' || activeLayerTab === 'all') && (
                <div className="bg-white dark:bg-neutral-900/50 p-3.5 rounded-xl border border-gray-150 dark:border-neutral-800/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-extrabold">1</span>
                      Layer 1 — Immediate Action Desk
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase">Daily focus</span>
                  </div>

                  {/* Immediate Answers: Next Follow-up & Reminders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50/50 dark:bg-neutral-850/20 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800/40">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-extrabold mb-1">📅 Next Scheduled Action</span>
                      {(() => {
                        // Find upcoming tasks
                        const contactTasks = calendarItems
                          .filter(item => item.contactId === selectedContact.id && !item.completed)
                          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
                        
                        if (contactTasks.length > 0) {
                          const nextTask = contactTasks[0];
                          return (
                            <div>
                              <div className="font-extrabold text-gray-800 dark:text-neutral-200 text-[11px] truncate">
                                {nextTask.title}
                              </div>
                              <span className="inline-block text-[9px] text-blue-500 font-bold mt-1">
                                Scheduled on {nextTask.date === '2026-07-21' ? 'Today' : nextTask.date} at {nextTask.time}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div>
                            <p className="text-gray-400 dark:text-neutral-500 text-[10px] font-semibold">
                              No follow-up registered.
                            </p>
                            <span className="text-[9px] text-amber-500 font-bold">
                              ⚠️ Action required: Trigger workflow below to queue follow-up.
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-gray-50/50 dark:bg-neutral-850/20 p-2.5 rounded-lg border border-gray-100/40 dark:border-neutral-800/40">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-extrabold mb-1">💬 Last Interaction Summary</span>
                      {selectedTimeline[0] ? (
                        <div>
                          <div className="font-extrabold text-gray-800 dark:text-neutral-200 text-[11px] truncate">
                            {selectedTimeline[0].title}
                          </div>
                          <p className="text-gray-500 dark:text-neutral-400 text-[10px] font-medium line-clamp-1 mt-0.5">
                            {selectedTimeline[0].notes || 'No accompanying notes.'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-neutral-500 text-[10px] font-semibold">
                          No registered timeline events.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Immediate Actions Trigger block */}
                  <div className="bg-gray-50/50 dark:bg-neutral-850/20 p-3 rounded-lg border border-gray-100/40 dark:border-neutral-800/40">
                    <span className="block text-[8px] text-gray-400 uppercase font-extrabold tracking-wider mb-2">
                      ⚡ Quick-Tap Execution Workflows
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'need_drawing')}
                        className="p-2 bg-white dark:bg-neutral-900 hover:bg-purple-50 dark:hover:bg-purple-950/20 border border-gray-150 dark:border-neutral-800 hover:border-purple-200 rounded-lg transition text-left flex flex-col justify-between cursor-pointer"
                        id="workflow_btn_drawing"
                      >
                        <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400">📐 Request Drawing</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 font-semibold">Sets stage & alerts CAD design</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'need_quote')}
                        className="p-2 bg-white dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-gray-150 dark:border-neutral-800 hover:border-emerald-200 rounded-lg transition text-left flex flex-col justify-between cursor-pointer"
                        id="workflow_btn_quote"
                      >
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">💼 Submit Proposal</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 font-semibold">Prepares quotation dispatch</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'payment_followup')}
                        className="p-2 bg-white dark:bg-neutral-900 hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-gray-150 dark:border-neutral-800 hover:border-orange-200 rounded-lg transition text-left flex flex-col justify-between cursor-pointer"
                        id="workflow_btn_payment"
                      >
                        <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400">💰 Payment Alert</span>
                        <span className="text-[8px] text-gray-400 mt-0.5 font-semibold">Asks retention clearance</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-gray-200/50 dark:border-neutral-800/40">
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'call_tomorrow')}
                        className="px-2 py-1 bg-white hover:bg-blue-50 dark:bg-neutral-900 dark:hover:bg-blue-950/20 border border-gray-150 dark:border-neutral-800 rounded text-[9px] font-bold text-gray-650 dark:text-neutral-300 transition text-center cursor-pointer"
                      >
                        📞 Call Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'call_next_week')}
                        className="px-2 py-1 bg-white hover:bg-blue-50 dark:bg-neutral-900 dark:hover:bg-blue-950/20 border border-gray-150 dark:border-neutral-800 rounded text-[9px] font-bold text-gray-650 dark:text-neutral-300 transition text-center cursor-pointer"
                      >
                        📅 Defer 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'busy')}
                        className="px-2 py-1 bg-white hover:bg-red-50 dark:bg-neutral-900 dark:hover:bg-red-950/20 border border-gray-150 dark:border-neutral-800 rounded text-[9px] font-bold text-red-600 dark:text-red-400 transition text-center cursor-pointer"
                      >
                        ❌ Busy/Missed
                      </button>
                      <button
                        type="button"
                        onClick={() => onTriggerOneTapWorkflow(selectedContact.id, 'sample_required')}
                        className="px-2 py-1 bg-white hover:bg-amber-50 dark:bg-neutral-900 dark:hover:bg-amber-950/20 border border-gray-150 dark:border-neutral-800 rounded text-[9px] font-bold text-amber-600 dark:text-amber-400 transition text-center cursor-pointer"
                      >
                        🧪 Send Samples
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LAYER 2: CONTEXT */}
              {(activeLayerTab === 'layer2' || activeLayerTab === 'all') && (
                <div className="bg-white dark:bg-neutral-900/50 p-3.5 rounded-xl border border-gray-150 dark:border-neutral-800/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-extrabold">2</span>
                      Layer 2 — Surrounding Context Briefing
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase">Surrounding Status</span>
                  </div>

                  {/* Context Explanation based on pipeline state */}
                  <div className="bg-blue-50/30 dark:bg-neutral-850/20 p-3 rounded-lg border border-blue-150/40 dark:border-blue-950/30 text-xs text-gray-750 dark:text-neutral-350 leading-relaxed font-medium">
                    <p className="font-extrabold text-blue-600 dark:text-blue-400 text-[11px] mb-1 flex items-center gap-1">
                      <span>💡</span> Current Stage Diagnosis: {selectedContact.stage}
                    </p>
                    {selectedContact.stage === 'Lead' && (
                      <span>Establishing contact with account. Primary objective: configure spatial specs, catalog key contacts, or request site drawings for engineered estimates.</span>
                    )}
                    {selectedContact.stage === 'Need Drawing' && (
                      <span>Awaiting engineered blueprint models. Project cannot transition to quoting until layout constraints and CAD measurements are dispatched.</span>
                    )}
                    {selectedContact.stage === 'Quotation Sent' && (
                      <span>Commercial quote v1 shared with buyer's commercial managers. Follow up is crucial to register any objections on raw materials and delivery.</span>
                    )}
                    {selectedContact.stage === 'Order Expected' && (
                      <span>All specs approved. Final PO draft queued in their accounting software. Follow up to clear pipeline obstacles and reserve production schedule slots.</span>
                    )}
                    {selectedContact.stage === 'Payment Follow-up' && (
                      <span>Commercial deliveries fulfilled. Retention ledger and installment status are currently pending local bank receipt. Invoice verification is active.</span>
                    )}
                  </div>

                  {/* Pending projects / open things summary */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-600 dark:text-neutral-400">
                    <div className="bg-gray-50/50 dark:bg-neutral-850/10 p-2 rounded-lg border border-gray-100 dark:border-neutral-800/40">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">📐 Drawing Status</span>
                      <span className={selectedContact.stage === 'Need Drawing' ? 'text-amber-500 font-extrabold' : 'text-gray-500'}>
                        {selectedContact.stage === 'Need Drawing' ? 'Needs BlueprintCAD' : 'Inactive'}
                      </span>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-neutral-850/10 p-2 rounded-lg border border-gray-100 dark:border-neutral-800/40">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">💼 Quotation v1</span>
                      <span className={selectedContact.stage === 'Quotation Sent' ? 'text-emerald-500 font-extrabold' : 'text-gray-500'}>
                        {selectedContact.stage === 'Quotation Sent' ? 'Bid Active' : 'Unsubmitted'}
                      </span>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-neutral-850/10 p-2 rounded-lg border border-gray-100 dark:border-neutral-800/40">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">💰 Balance Retained</span>
                      <span className={selectedContact.stage === 'Payment Follow-up' ? 'text-orange-500 font-extrabold' : 'text-gray-500'}>
                        {selectedContact.stage === 'Payment Follow-up' ? 'Pending Clearance' : 'Resolved'}
                      </span>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-neutral-850/10 p-2 rounded-lg border border-gray-100 dark:border-neutral-800/40">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">🤝 Upcoming Meetings</span>
                      <span>
                        {calendarItems.filter(i => i.contactId === selectedContact.id && i.type === 'meeting' && !i.completed).length > 0 ? 'Scheduled' : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Context Timeline Snippet */}
                  <div className="pt-1.5">
                    <span className="block text-[8px] text-gray-400 uppercase font-extrabold tracking-wider mb-2">
                      Recent Timeline Context
                    </span>
                    <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                      {selectedTimeline.slice(0, 2).map(ev => (
                        <div key={ev.id} className="text-[10px] pl-3 border-l-2 border-blue-500/50 text-gray-650 dark:text-neutral-400 font-medium">
                          <div className="flex items-center justify-between font-bold text-gray-700 dark:text-neutral-300">
                            <span>{ev.title}</span>
                            <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="truncate mt-0.5">{ev.notes}</p>
                        </div>
                      ))}
                      {selectedTimeline.length === 0 && (
                        <p className="text-center text-gray-400 text-[10px]">No recent interaction context found.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* LAYER 3: HISTORY */}
              {(activeLayerTab === 'layer3' || activeLayerTab === 'all') && (
                <div className="bg-white dark:bg-neutral-900/50 p-3.5 rounded-xl border border-gray-150 dark:border-neutral-800/80 shadow-xs space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-extrabold">3</span>
                      Layer 3 — Permanent Memory & Full Archive
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase">{selectedTimeline.length} Logs</span>
                  </div>

                  {/* Manual Log interaction Form */}
                  <div className="bg-gray-50/40 dark:bg-neutral-850/10 p-2.5 rounded-lg border border-gray-150 dark:border-neutral-800">
                    <span className="block text-[8px] text-gray-400 uppercase font-extrabold tracking-wider mb-1.5">
                      Log New Historical Event / Minutes of Meeting
                    </span>
                    <form
                      onSubmit={handleAddManualTimeline}
                      className="flex flex-col sm:flex-row items-stretch gap-1.5"
                      id="add_timeline_form"
                    >
                      <select
                        value={newInteractionType}
                        onChange={(e) => setNewInteractionType(e.target.value)}
                        className="px-2 py-1 text-[10px] font-bold border border-gray-200 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900 dark:text-white focus:outline-hidden cursor-pointer"
                      >
                        <option value="Relationship Call">📞 Relationship Call</option>
                        <option value="General Check-in">👋 General Check-in</option>
                        <option value="Technical Discussion">⚙️ Technical Discussion</option>
                        <option value="Payment Follow-up">💰 Payment Follow-up</option>
                        <option value="Meeting">🤝 Meeting</option>
                        <option value="Site Visit">📐 Site Visit</option>
                        <option value="Complaint">⚠️ Complaint</option>
                        <option value="New Introduction">✨ New Introduction</option>
                        <option value="Quotation Discussion">💼 Quotation Discussion</option>
                        <option value="Production Follow-up">🏭 Production Follow-up</option>
                        <option value="Courtesy Call">🌸 Courtesy Call</option>
                        <option value="General Observation">📝 General Observation</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Type minutes of meeting or conversation specs..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-neutral-900 dark:text-white rounded border border-gray-250 dark:border-neutral-800 focus:outline-hidden"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-gray-900 dark:bg-neutral-800 text-white rounded text-[10px] font-bold hover:bg-black flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Send className="w-3 h-3" /> Log Event
                      </button>
                    </form>
                  </div>

                  {/* Filters for history archive */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[9px] font-bold">
                    {[
                      { id: 'all', label: 'All Memory' },
                      { id: 'call', label: 'Calls 📞' },
                      { id: 'meeting', label: 'Meetings 🤝' },
                      { id: 'quote', label: 'Proposals 💼' },
                      { id: 'drawing', label: 'CAD 📐' },
                      { id: 'payment', label: 'Payments 💰' },
                      { id: 'note', label: 'Notes 📝' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setHistoryFilter(f.id as any)}
                        className={`px-2 py-0.5 rounded transition whitespace-nowrap border cursor-pointer ${
                          historyFilter === f.id
                            ? 'bg-purple-500 dark:bg-purple-900 text-white border-purple-500'
                            : 'bg-gray-50 hover:bg-gray-100 dark:bg-neutral-850 text-gray-500 border-transparent dark:text-neutral-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Master Chronicle list */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                    {(() => {
                      const filteredHistory = selectedTimeline.filter(ev => {
                        if (historyFilter === 'all') return true;
                        return ev.type === historyFilter;
                      });

                      if (filteredHistory.length === 0) {
                        return (
                          <p className="text-center text-gray-400 text-[10px] py-4">
                            No archived logs matching "{historyFilter}" found in memory.
                          </p>
                        );
                      }

                      return filteredHistory.map(ev => {
                        const getTimelineIcon = (type: string) => {
                          switch (type) {
                            case 'call': return '📞';
                            case 'meeting': return '🤝';
                            case 'drawing': return '📐';
                            case 'quote': return '💼';
                            case 'payment': return '💰';
                            case 'status_change': return '🔄';
                            default: return '📝';
                          }
                        };

                        return (
                          <div key={ev.id} className="relative pl-5 pb-2 border-l border-gray-150 dark:border-neutral-800 text-xs text-gray-700 dark:text-neutral-350">
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-full flex items-center justify-center text-[10px] shadow-xs select-none">
                              {getTimelineIcon(ev.type)}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold mb-0.5">
                              <span>{ev.title}</span>
                              <span>{new Date(ev.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="font-medium text-gray-650 dark:text-neutral-450 text-[11px] leading-relaxed">
                              {ev.notes}
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* LAYER 4: ANALYSIS */}
              {(activeLayerTab === 'layer4' || activeLayerTab === 'all') && (
                <div className="bg-white dark:bg-neutral-900/50 p-3.5 rounded-xl border border-gray-150 dark:border-neutral-800/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-extrabold">4</span>
                      Layer 4 — Performance Analytics & Decisions
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase">Business Intelligence</span>
                  </div>

                  {/* Relationship Health & Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50/50 dark:bg-neutral-850/10 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800/40 space-y-1.5">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">🔥 Heat Score Progression</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              selectedContact.heatScore >= 80 ? 'bg-red-500' : selectedContact.heatScore >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${selectedContact.heatScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold dark:text-white">{selectedContact.heatScore}%</span>
                      </div>
                      <p className="text-[9px] text-gray-500 dark:text-neutral-400 leading-relaxed font-semibold">
                        {selectedContact.heatScore >= 80 ? (
                          "🔥 High Potential: Strong, hyper-active account with immediate deal close opportunity."
                        ) : selectedContact.heatScore >= 50 ? (
                          "⚡ Active Flow: Account is responding steadily. Focus on delivering CAD blueprints or quote adjustments."
                        ) : (
                          "❄️ Dormant Risk: Low engagement velocity. Prioritize check-in activities or site-assessment workflows."
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-neutral-850/10 p-2.5 rounded-lg border border-gray-100 dark:border-neutral-800/40 space-y-1.5">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold">📋 Touch Frequency Metrics</span>
                      <div className="grid grid-cols-2 gap-2 text-center pt-1">
                        <div className="bg-white dark:bg-neutral-900 rounded p-1 border border-gray-150/50 dark:border-neutral-850/60">
                          <span className="block text-[7px] text-gray-400 font-bold uppercase">Total Touches</span>
                          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{selectedContact.interactionCount}</span>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 rounded p-1 border border-gray-150/50 dark:border-neutral-850/60">
                          <span className="block text-[7px] text-gray-400 font-bold uppercase">Health Index</span>
                          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                            {selectedContact.interactionCount >= 8 ? 'Excellent' : selectedContact.interactionCount >= 4 ? 'Optimal' : 'Needs Work'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 dark:text-neutral-500 text-center font-bold">
                        Lead registered: {new Date(selectedContact.createdAt || '2026-07-20').toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Consistency Score Card */}
                  <div className="bg-emerald-50/30 dark:bg-neutral-850/20 p-2.5 rounded-lg border border-emerald-150/40 dark:border-emerald-950/20 text-xs">
                    <span className="block text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">💡 Execution Guidance Insight</span>
                    <p className="text-gray-700 dark:text-neutral-350 leading-relaxed font-medium">
                      Average engagement interval is **{(15 / (selectedContact.interactionCount || 1)).toFixed(1)} days**. 
                      Follow-up consistency matches enterprise best practices. To optimize conversion, maintain an interaction at least every **3 business days** during CAD specification review.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 dark:text-neutral-500 h-full">
            <Users className="w-12 h-12 text-gray-100 dark:text-neutral-850 mb-3.5" />
            <p className="text-sm font-bold">No profile selected</p>
            <p className="text-xs text-gray-400 dark:text-neutral-600 font-semibold max-w-[280px] mt-1.5">
              Select any lead from the directory layout to configure strategic workflows, view timeline history logs, or schedule subsequent check-ins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
