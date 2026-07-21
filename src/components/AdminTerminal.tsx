/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { UserProfile, getStoredOrgUsers, saveStoredOrgUsers } from './AuthLockScreen';
import { 
  Shield, 
  Users, 
  Calendar, 
  Award, 
  Zap, 
  Send, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Eye, 
  Plus, 
  Check, 
  X, 
  UserPlus, 
  FileText, 
  Crown, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Contact, CalendarItem, DailyReview, CalendarItemType } from '../types';
import { INITIAL_CONTACTS, INITIAL_CALENDAR_ITEMS } from '../data/mockInitialData';

interface AdminTerminalProps {
  onImpersonate: (user: UserProfile) => void;
  onToast: (msg: string) => void;
}

const AVATAR_PRESETS = ['💼', '📐', '🚛', '🤝', '📦', '💻', '📈', '🎨', '🛠️', '🕵️', '🚀', '🧠'];
const COLOR_PRESETS = [
  { name: 'Classic Blue', value: 'from-[#007AFF] to-[#5856D6]' },
  { name: 'Emerald Green', value: 'from-[#34C759] to-[#30B0C7]' },
  { name: 'Sunset Orange', value: 'from-[#FF9500] to-[#FF3B30]' },
  { name: 'Royal Purple', value: 'from-[#AF52DE] to-[#FF2D55]' },
  { name: 'Marigold Gold', value: 'from-[#FFCC00] to-[#FF9500]' },
  { name: 'Steel Charcoal', value: 'from-[#8E8E93] to-[#1C1C1E]' },
];

export function AdminTerminal({ onImpersonate, onToast }: AdminTerminalProps) {
  // Navigation Tabs
  const [tab, setTab] = useState<'dashboard' | 'employees' | 'tasks' | 'eod_logs'>('dashboard');

  // Core organization list loaded dynamically
  const [employeesList, setEmployeesList] = useState<UserProfile[]>([]);
  const [userStats, setUserStats] = useState<any[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [allReviews, setAllReviews] = useState<any[]>([]);

  // EOD reviews edit states
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewUser, setEditingReviewUser] = useState<string>('');
  const [editWins, setEditWins] = useState('');
  const [editBlockers, setEditBlockers] = useState('');
  const [editTomorrow, setEditTomorrow] = useState('');

  // Employee CRUD states
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empPin, setEmpPin] = useState('');
  const [empAvatar, setEmpAvatar] = useState('💼');
  const [empColor, setEmpColor] = useState('from-[#007AFF] to-[#5856D6]');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  // Task Assigner state
  const [taskTargetUserId, setTaskTargetUserId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<CalendarItemType>('call');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskDate, setTaskDate] = useState('2026-07-21');
  const [taskTime, setTaskTime] = useState('10:00');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskContactId, setTaskContactId] = useState('');

  // Task Viewer state (to review tasks of others)
  const [reviewStaffId, setReviewStaffId] = useState('');
  const [reviewDate, setReviewDate] = useState('2026-07-21');

  // Load roster
  const loadRosterAndStats = () => {
    const list = getStoredOrgUsers();
    setEmployeesList(list);

    // Default target for reviews and task assignments
    const firstStaff = list.find(u => u.id !== 'admin');
    if (firstStaff) {
      if (!taskTargetUserId) setTaskTargetUserId(firstStaff.id);
      if (!reviewStaffId) setReviewStaffId(firstStaff.id);
    }

    // Collect stats for each employee (excluding admin)
    const stats = list.filter(u => u.id !== 'admin').map((user) => {
      const savedContacts = localStorage.getItem(`sj_os_${user.id}_contacts`);
      const contacts: Contact[] = savedContacts ? JSON.parse(savedContacts) : INITIAL_CONTACTS;
      
      const savedCalendar = localStorage.getItem(`sj_os_${user.id}_calendar`);
      const calendarItems: CalendarItem[] = savedCalendar ? JSON.parse(savedCalendar) : INITIAL_CALENDAR_ITEMS;

      const savedReviews = localStorage.getItem(`sj_os_${user.id}_reviews`);
      const reviews: DailyReview[] = savedReviews ? JSON.parse(savedReviews) : [];

      const todayItems = calendarItems.filter((item) => item.date === '2026-07-21');
      const completedToday = todayItems.filter(item => item.completed).length;
      
      const totalHeat = contacts.reduce((sum, c) => sum + c.heatScore, 0);
      const avgHeat = contacts.length > 0 ? Math.round(totalHeat / contacts.length) : 0;

      return {
        ...user,
        contactsCount: contacts.length,
        completedToday,
        totalToday: todayItems.length,
        avgHeat,
        reviewCount: reviews.length,
        reviews,
      };
    });

    setUserStats(stats);

    // Gather and flatten EOD Reviews
    const flatReviews: any[] = [];
    stats.forEach(u => {
      u.reviews.forEach((r: DailyReview) => {
        flatReviews.push({
          ...r,
          userId: u.id,
          userName: u.name,
          userRole: u.role,
          userColor: u.color,
          userInitials: u.initials,
        });
      });
    });
    flatReviews.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    setAllReviews(flatReviews);
  };

  useEffect(() => {
    loadRosterAndStats();
  }, [taskTargetUserId, reviewStaffId]);

  // Handle Employee CRUD Operations
  const handleAddOrEditEmployee = (e: FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empRole.trim() || !empPin.trim()) {
      onToast('Please fill in all employee fields.');
      return;
    }
    if (empPin.length !== 4 || isNaN(Number(empPin))) {
      onToast('Passcode PIN must be exactly 4 numeric digits.');
      return;
    }

    const list = getStoredOrgUsers();

    if (editingEmployeeId) {
      // Edit
      const updated = list.map(emp => {
        if (emp.id === editingEmployeeId) {
          return {
            ...emp,
            name: empName.trim(),
            role: empRole.trim(),
            pin: empPin.trim(),
            avatar: empAvatar,
            color: empColor,
            initials: empName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          };
        }
        return emp;
      });
      saveStoredOrgUsers(updated);
      onToast(`Successfully updated credentials for ${empName.trim()}.`);
    } else {
      // Add
      const newId = empName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (list.some(emp => emp.id === newId)) {
        onToast('An employee with this name already exists.');
        return;
      }
      const newEmp: UserProfile = {
        id: newId,
        name: empName.trim(),
        role: empRole.trim(),
        pin: empPin.trim(),
        initials: empName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        color: empColor,
        avatar: empAvatar,
      };
      const updated = [...list, newEmp];
      saveStoredOrgUsers(updated);
      
      // Initialize seed data so user isn't blank
      localStorage.setItem(`sj_os_${newId}_contacts`, JSON.stringify(INITIAL_CONTACTS));
      localStorage.setItem(`sj_os_${newId}_calendar`, JSON.stringify(INITIAL_CALENDAR_ITEMS));
      
      onToast(`Registered new staff profile for ${empName.trim()}.`);
    }

    // Reset Form
    setEmpName('');
    setEmpRole('');
    setEmpPin('');
    setEmpAvatar('💼');
    setEmpColor('from-[#007AFF] to-[#5856D6]');
    setEditingEmployeeId(null);
    loadRosterAndStats();
  };

  const handleEditEmployeeClick = (emp: UserProfile) => {
    setEditingEmployeeId(emp.id);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpPin(emp.pin);
    setEmpAvatar(emp.avatar);
    setEmpColor(emp.color);
  };

  const handleDeleteEmployee = (empId: string, empName: string) => {
    if (empId === 'admin') {
      onToast('Error: Executive Director Admin cannot be removed.');
      return;
    }
    if (confirm(`Are you sure you want to permanently remove ${empName} from the organization directory? All their database sandboxes will remain intact but they will lose account login access.`)) {
      const list = getStoredOrgUsers();
      const updated = list.filter(emp => emp.id !== empId);
      saveStoredOrgUsers(updated);
      onToast(`Staff account ${empName} was removed.`);
      loadRosterAndStats();
    }
  };

  // Assign a direct task to employee
  const handleAssignTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskTargetUserId) {
      onToast('Select a target team member.');
      return;
    }
    if (!taskTitle.trim()) {
      onToast('Please enter a descriptive task title.');
      return;
    }

    const savedCalendarKey = `sj_os_${taskTargetUserId}_calendar`;
    const savedCalendar = localStorage.getItem(savedCalendarKey);
    const calendar: CalendarItem[] = savedCalendar ? JSON.parse(savedCalendar) : INITIAL_CALENDAR_ITEMS;

    const newTask: CalendarItem = {
      id: 'task_' + Date.now(),
      title: `📋 [Admin Assigned] ${taskTitle.trim()}`,
      type: taskType,
      priority: taskPriority,
      date: taskDate,
      time: taskTime,
      durationMinutes: taskDuration,
      completed: false,
    };

    if (taskContactId) {
      newTask.contactId = taskContactId;
    }

    localStorage.setItem(savedCalendarKey, JSON.stringify([newTask, ...calendar]));

    // Register inside user's timeline logs as well
    const savedTimelineKey = `sj_os_${taskTargetUserId}_timeline`;
    const savedTimeline = localStorage.getItem(savedTimelineKey);
    const timeline = savedTimeline ? JSON.parse(savedTimeline) : [];
    const newLog = {
      id: 'log_' + Date.now(),
      contactId: taskContactId || 'system',
      type: 'system',
      title: `Director assigned core objective: "${taskTitle.trim()}"`,
      notes: `Due on ${taskDate} at ${taskTime} (${taskDuration}m). Priority: ${taskPriority.toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(savedTimelineKey, JSON.stringify([newLog, ...timeline]));

    setTaskTitle('');
    setTaskContactId('');
    onToast(`Assigned core objective successfully dispatched to employee agenda.`);
    loadRosterAndStats();
  };

  // Review & control employee tasks
  const handleToggleTaskCompleteness = (uid: string, taskId: string) => {
    const key = `sj_os_${uid}_calendar`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const items: CalendarItem[] = JSON.parse(saved);
      const updated = items.map(item => {
        if (item.id === taskId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(updated));
      onToast('Task completion status toggled.');
      loadRosterAndStats();
    }
  };

  const handleDeleteTargetTask = (uid: string, taskId: string) => {
    if (confirm('Permanently cancel and delete this task?')) {
      const key = `sj_os_${uid}_calendar`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const items: CalendarItem[] = JSON.parse(saved);
        const updated = items.filter(item => item.id !== taskId);
        localStorage.setItem(key, JSON.stringify(updated));
        onToast('Task permanently removed from employee workload.');
        loadRosterAndStats();
      }
    }
  };

  // Global Directive Broadcast to yellow pads
  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;

    employeesList.filter(u => u.id !== 'admin').forEach((user) => {
      const savedNotes = localStorage.getItem(`sj_os_${user.id}_master_notes`) || '';
      const formattedBroadcast = `📢 DIRECTIVE FROM THE OFFICE OF THE DIRECTOR (Issued ${new Date().toLocaleDateString()})\n- "${broadcastMessage.trim()}"\n\n${savedNotes}`;
      localStorage.setItem(`sj_os_${user.id}_master_notes`, formattedBroadcast);
    });

    setBroadcastMessage('');
    onToast(`Directive embedded successfully in all ${employeesList.length - 1} staff executive pads.`);
    loadRosterAndStats();
  };

  // Wipe / Restore user sandbox database
  const handleResetUserSandbox = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to restore ${userName}'s database back to pristine defaults? All their custom modifications will be discarded.`)) {
      localStorage.removeItem(`sj_os_${userId}_contacts`);
      localStorage.removeItem(`sj_os_${userId}_calendar`);
      localStorage.removeItem(`sj_os_${userId}_timeline`);
      localStorage.removeItem(`sj_os_${userId}_reviews`);
      localStorage.removeItem(`sj_os_${userId}_master_notes`);
      
      onToast(`Wiped & restored default template for ${userName}.`);
      loadRosterAndStats();
    }
  };

  // Save modified EOD review
  const handleSaveEditedReview = (userId: string, reviewId: string) => {
    const savedReviewsKey = `sj_os_${userId}_reviews`;
    const savedReviews = localStorage.getItem(savedReviewsKey);
    if (savedReviews) {
      const reviews: DailyReview[] = JSON.parse(savedReviews);
      const updated = reviews.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            wins: editWins,
            blockers: editBlockers,
            tomorrowPriorities: editTomorrow,
          };
        }
        return r;
      });
      localStorage.setItem(savedReviewsKey, JSON.stringify(updated));
      setEditingReviewId(null);
      onToast('EOD realignment review updated successfully.');
      loadRosterAndStats();
    }
  };

  // Delete EOD Review
  const handleDeleteReview = (userId: string, reviewId: string) => {
    if (confirm('Permanently remove this historical EOD realignment report?')) {
      const savedReviewsKey = `sj_os_${userId}_reviews`;
      const savedReviews = localStorage.getItem(savedReviewsKey);
      if (savedReviews) {
        const reviews: DailyReview[] = JSON.parse(savedReviews);
        const updated = reviews.filter(r => r.id !== reviewId);
        localStorage.setItem(savedReviewsKey, JSON.stringify(updated));
        onToast('EOD realignment record permanently deleted.');
        loadRosterAndStats();
      }
    }
  };

  // Helper lists
  const getTargetUserContacts = (uid: string): Contact[] => {
    if (!uid) return [];
    const saved = localStorage.getItem(`sj_os_${uid}_contacts`);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  };

  const getTargetUserCalendar = (uid: string): CalendarItem[] => {
    if (!uid) return [];
    const saved = localStorage.getItem(`sj_os_${uid}_calendar`);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_ITEMS;
  };

  const reviewContacts = taskTargetUserId ? getTargetUserContacts(taskTargetUserId) : [];
  const activeReviewsAgenda = reviewStaffId ? getTargetUserCalendar(reviewStaffId).filter(item => item.date === reviewDate) : [];

  return (
    <div className="space-y-6 text-[#1D1D1F] animate-fadeIn">
      {/* 1. Header & Navigation Rails */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Executive Office Control Deck
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Oversee personnel rosters, allocate workload targets, broadcast directives, and audit daily operations.
          </p>
        </div>

        {/* Dynamic Navigation Tabs Segmented Control */}
        <div className="bg-[#E3E3E9] p-0.5 rounded-xl flex items-center border border-gray-200 shrink-0">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'dashboard'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-[#1D1D1F]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Control Deck
          </button>
          <button
            onClick={() => setTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'employees'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-[#1D1D1F]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Roster Manager
          </button>
          <button
            onClick={() => setTab('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'tasks'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-[#1D1D1F]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Task Assigner & Reviewer
          </button>
          <button
            onClick={() => setTab('eod_logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'eod_logs'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                : 'text-gray-500 hover:text-[#1D1D1F]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            EOD Logs Audit
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT MODULES */}

      {/* TAB A: CONTROL DECK (Stats, directory listing, broadcast, data wipes) */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#007AFF] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Active Staff Profiles</span>
                <span className="text-xl font-bold">{employeesList.length - 1} Employees</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#34C759] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Managed Partners</span>
                <span className="text-xl font-bold">
                  {userStats.reduce((sum, u) => sum + u.contactsCount, 0)} Profiles
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-[#AF52DE] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Avg Pipeline Heat</span>
                <span className="text-xl font-bold">
                  {Math.round(userStats.reduce((sum, u) => sum + u.avgHeat, 0) / (userStats.length || 1))}% Heat
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-[#FF9500] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Total EOD Log Files</span>
                <span className="text-xl font-bold">{allReviews.length} Submitted</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Master Team Directory table */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1D1D1F]">Master Personnel Directory</h2>
                <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">
                  Supervise operational workflows, track objective completion metrics, and enter individual enclaves.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] uppercase font-extrabold text-[#8E8E93] tracking-widest pb-3">
                      <th className="pb-3 pr-2">Team Member</th>
                      <th className="pb-3 px-2">Role Title</th>
                      <th className="pb-3 px-2 text-center">Partners</th>
                      <th className="pb-3 px-2 text-center">Day Workload</th>
                      <th className="pb-3 px-2 text-center">Avg Heat</th>
                      <th className="pb-3 pl-2 text-right">Workspace Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold">
                    {userStats.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 pr-2 flex items-center gap-2.5">
                          <div className={`h-8.5 w-8.5 rounded-xl bg-linear-to-br ${u.color} text-white font-bold text-[10px] flex items-center justify-center relative overflow-hidden shrink-0 shadow-xs`}>
                            {u.initials}
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] opacity-80">{u.avatar}</span>
                          </div>
                          <div>
                            <span className="block font-bold text-[#1D1D1F]">{u.name}</span>
                            <span className="text-[9px] text-gray-400 font-bold font-mono">PIN: {u.pin}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-gray-500 text-[11px] font-semibold">{u.role}</td>
                        <td className="py-3.5 px-2 text-center font-bold text-[#007AFF]">{u.contactsCount}</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            u.completedToday === u.totalToday && u.totalToday > 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-gray-100 text-gray-600 border border-gray-150'
                          }`}>
                            {u.completedToday}/{u.totalToday} Done
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center font-extrabold text-amber-500">{u.avgHeat}%</td>
                        <td className="py-3.5 pl-2 text-right space-x-2">
                          <button
                            onClick={() => onImpersonate(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[10px] font-extrabold rounded-lg cursor-pointer shadow-xs transition active:scale-95 uppercase tracking-wider"
                            title={`Inspect and modify ${u.name}'s active workspace`}
                          >
                            <Eye className="w-3 h-3" />
                            Impersonate
                          </button>
                          <button
                            onClick={() => handleResetUserSandbox(u.id, u.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition"
                            title="Reset entire sandbox database to defaults"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Broadcast Board */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Send className="w-4 h-4 fill-amber-500/10" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Executive Directive Broadcast</h3>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                Draft a global corporate directive. This message will instantly mount at the top of all employees' active workspaces for mandatory operational compliance.
              </p>

              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. Action Required: Please verify material delivery logs with clients on today's agenda before 5:00 PM."
                className="w-full text-xs p-3.5 border border-gray-200 rounded-xl h-28 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium placeholder-gray-400 resize-none leading-relaxed"
              />

              <button
                onClick={handleBroadcast}
                disabled={!broadcastMessage.trim()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-150 disabled:text-gray-400 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast To Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: ROSTER MANAGER (Dynamic Employee CRUD) */}
      {tab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Employee Add/Edit Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {editingEmployeeId ? 'Modify Credentials & Profile' : 'Register New Personnel Profile'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {editingEmployeeId ? 'Update access codes, roles, and profile settings.' : 'Hire or enroll a new team member with custom passcode access.'}
              </p>
            </div>

            <form onSubmit={handleAddOrEditEmployee} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Employee Name</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Corporate Role / Title</label>
                <input
                  type="text"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  placeholder="e.g. Regional Logistics Architect"
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Secure Passcode PIN (4 digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={empPin}
                  onChange={(e) => setEmpPin(e.target.value)}
                  placeholder="e.g. 7777"
                  className="w-full text-xs font-mono font-bold p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Avatar Preset Grid */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Avatar Symbol</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_PRESETS.map(av => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setEmpAvatar(av)}
                      className={`h-8 w-8 text-sm flex items-center justify-center rounded-lg border cursor-pointer transition-all ${
                        empAvatar === av 
                          ? 'bg-amber-50 border-amber-400 scale-105 shadow-xs font-bold' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Gradient presets */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Aesthetic Accent Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map(c => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setEmpColor(c.value)}
                      className={`p-2 rounded-xl text-left border cursor-pointer flex items-center gap-2 text-[10px] font-bold transition-all ${
                        empColor === c.value
                          ? 'border-amber-400 bg-amber-50/10 shadow-xs'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className={`h-4.5 w-4.5 rounded-md bg-linear-to-br ${c.value}`} />
                      <span className="truncate text-gray-700">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  {editingEmployeeId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingEmployeeId ? 'Save Access Codes' : 'Disenroll & Register Team Member'}
                </button>
                {editingEmployeeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmployeeId(null);
                      setEmpName('');
                      setEmpRole('');
                      setEmpPin('');
                    }}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Current Roster Renders */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Active Operational Directory</h3>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Review PIN access credentials, update titles, or adjust payroll profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employeesList.map(emp => (
                <div key={emp.id} className="p-4 rounded-xl border border-gray-150 hover:border-gray-200 transition-all bg-white relative flex flex-col justify-between h-36">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-9 w-9 rounded-xl bg-linear-to-br ${emp.color} text-white flex items-center justify-center text-sm font-bold shadow-xs relative overflow-hidden shrink-0`}>
                          <span>{emp.initials}</span>
                          <span className="absolute bottom-0.5 right-0.5 text-[9px]">{emp.avatar}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 truncate max-w-[140px]">{emp.name}</h4>
                          <span className="block text-[9px] text-gray-500 font-semibold truncate max-w-[140px] uppercase tracking-wider">{emp.role}</span>
                        </div>
                      </div>
                      
                      {emp.id === 'admin' ? (
                        <span className="text-[8px] bg-amber-500/10 text-amber-600 font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                          System Owner
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded-md">
                          PIN: {emp.pin}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      ID: {emp.id}
                    </span>

                    {emp.id !== 'admin' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditEmployeeClick(emp)}
                          className="p-1.5 bg-gray-50 hover:bg-gray-150 text-gray-500 hover:text-amber-600 rounded-lg transition cursor-pointer"
                          title="Edit titles & access codes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                          title="Disenroll from workspace directory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB C: TASK ASSIGNER & REVIEW (Assign & Review Tasks of Others) */}
      {tab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Assign New Task Section */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Dispatch Task Target</h3>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Inject custom directives directly onto individual personnel agendas.
              </p>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target Recipient</label>
                <select
                  value={taskTargetUserId}
                  onChange={(e) => setTaskTargetUserId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  {employeesList.filter(u => u.id !== 'admin').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Action Description Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Call client to verify site cladding layout draft"
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as CalendarItemType)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="call">📞 Phone / Call</option>
                    <option value="meeting">🤝 Client Meeting</option>
                    <option value="drawing">📐 Layout Drawing</option>
                    <option value="quote">💼 Quotation Delivery</option>
                    <option value="payment">💳 Invoice Payment</option>
                    <option value="deep_work">💻 Focused Deep Work</option>
                    <option value="planning">📅 Strategy Planning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Priority Rank</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="high">🔴 High Importance</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Due Time</label>
                  <input
                    type="text"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    placeholder="10:00"
                    className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-xl focus:outline-hidden text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Minutes</label>
                  <input
                    type="number"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-xl focus:outline-hidden text-center"
                  />
                </div>
              </div>

              {/* Linked Partner list if existing */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Link to Partner Profile (Optional)</label>
                <select
                  value={taskContactId}
                  onChange={(e) => setTaskContactId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- No linked profile --</option>
                  {reviewContacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                Dispatch Directive Task
              </button>
            </form>
          </div>

          {/* Review & Toggle Assigned Tasks Grid */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Agenda Auditor & Objective Review</h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Audit and change operational objectives, mark completes, or cancel tasks live.
                </p>
              </div>
            </div>

            {/* Selection Controls for audit */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-1">Target Personnel</label>
                <select
                  value={reviewStaffId}
                  onChange={(e) => setReviewStaffId(e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-gray-200 rounded-lg bg-white"
                >
                  {employeesList.filter(u => u.id !== 'admin').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full text-xs font-semibold p-1.5 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* List of active tasks */}
            <div className="space-y-3">
              {activeReviewsAgenda.length === 0 ? (
                <div className="p-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl text-xs font-medium">
                  No active objectives scheduled for this staff member on {reviewDate}.
                </div>
              ) : (
                activeReviewsAgenda.map(task => (
                  <div key={task.id} className="p-3.5 bg-white rounded-xl border border-gray-150 shadow-2xs flex items-center justify-between gap-3 hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskCompleteness(reviewStaffId, task.id)}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                          task.completed 
                            ? 'bg-[#34C759] border-transparent text-white' 
                            : 'border-gray-300 hover:border-[#007AFF] hover:bg-gray-50'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 font-bold" />}
                      </button>

                      <div>
                        <h4 className={`text-xs font-bold leading-tight ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold font-mono">
                          <span className="uppercase">{task.type}</span>
                          <span>•</span>
                          <span>{task.time} ({task.durationMinutes}m)</span>
                          <span>•</span>
                          <span className={`uppercase font-extrabold ${
                            task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                          }`}>{task.priority}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTargetTask(reviewStaffId, task.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Delete task from workload"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: EOD LOGS AUDIT (Daily alignment reports audit) */}
      {tab === 'eod_logs' && (
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1D1D1F]">Daily EOD Logs & Alignment Audit</h2>
            <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">
              Review, moderate, or edit daily work reports completed by directory staff at shift conclusions.
            </p>
          </div>

          {allReviews.length === 0 ? (
            <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl text-xs font-medium">
              No daily EOD alignment reviews logged by staff yet. Daily reports will display here instantly when submitted.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReviews.map((rev) => {
                const isEditing = editingReviewId === rev.id && editingReviewUser === rev.userId;
                
                return (
                  <div key={`${rev.userId}_${rev.id}`} className="p-4 bg-white rounded-xl border border-gray-150 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-6.5 w-6.5 rounded-lg bg-linear-to-br ${rev.userColor} text-white font-extrabold text-[8px] flex items-center justify-center`}>
                          {rev.userInitials}
                        </div>
                        <div>
                          <span className="block text-[11px] font-extrabold text-[#1D1D1F]">{rev.userName}</span>
                          <span className="block text-[8px] text-gray-400 font-bold font-mono">SUBMITTED: {new Date(rev.completedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-extrabold">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEditedReview(rev.userId, rev.id)}
                              className="text-emerald-600 hover:underline cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="text-gray-400 hover:underline cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setEditingReviewUser(rev.userId);
                                setEditWins(rev.wins || '');
                                setEditBlockers(rev.blockers || '');
                                setEditTomorrow(rev.tomorrowPriorities || '');
                              }}
                              className="text-gray-400 hover:text-[#007AFF] cursor-pointer flex items-center gap-0.5"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.userId, rev.id)}
                              className="text-gray-400 hover:text-red-500 cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Wins</label>
                          <input type="text" value={editWins} onChange={(e) => setEditWins(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Blockers</label>
                          <input type="text" value={editBlockers} onChange={(e) => setEditBlockers(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Tomorrow's Priorities</label>
                          <input type="text" value={editTomorrow} onChange={(e) => setEditTomorrow(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-xs" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-[10px] leading-relaxed">
                        <div className="bg-emerald-50/20 p-2 rounded-lg border border-emerald-100/40">
                          <span className="block text-[8px] uppercase tracking-wider text-emerald-600 font-bold mb-0.5">🏆 Wins</span>
                          <p className="text-gray-700 font-semibold truncate" title={rev.wins}>{rev.wins || 'None logged.'}</p>
                        </div>
                        <div className="bg-rose-50/20 p-2 rounded-lg border border-rose-100/40">
                          <span className="block text-[8px] uppercase tracking-wider text-rose-500 font-bold mb-0.5">🛑 Blockers</span>
                          <p className="text-gray-700 font-semibold truncate" title={rev.blockers}>{rev.blockers || 'None logged.'}</p>
                        </div>
                        <div className="bg-blue-50/20 p-2 rounded-lg border border-blue-100/40">
                          <span className="block text-[8px] uppercase tracking-wider text-blue-600 font-bold mb-0.5">🎯 Tomorrow</span>
                          <p className="text-gray-700 font-semibold truncate" title={rev.tomorrowPriorities}>{rev.tomorrowPriorities || 'None.'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
