/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContactStage =
  | 'Lead'
  | 'Meeting Fixed'
  | 'Need Drawing'
  | 'Drawing Sent'
  | 'Quotation Sent'
  | 'Order Expected'
  | 'Order Received'
  | 'Production Started'
  | 'Dispatch'
  | 'Payment Follow-up'
  | 'Completed';

export interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  city?: string;
  stage: ContactStage;
  heatScore: number; // 0 - 100
  lastContactDate?: string; // YYYY-MM-DD or ISO
  nextFollowUpDate?: string; // YYYY-MM-DD
  interactionCount: number;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  contactId: string;
  type:
    | 'call'
    | 'meeting'
    | 'email'
    | 'drawing'
    | 'quote'
    | 'order'
    | 'production'
    | 'dispatch'
    | 'payment'
    | 'status_change'
    | 'note'
    | 'system';
  title: string;
  notes?: string;
  timestamp: string; // ISO String
}

export type CalendarItemType =
  | 'call'
  | 'meeting'
  | 'email'
  | 'drawing'
  | 'quote'
  | 'payment'
  | 'break'
  | 'buffer'
  | 'deep_work'
  | 'planning'
  | 'research'
  | 'task';

export interface CalendarItem {
  id: string;
  contactId?: string;
  title: string;
  type: CalendarItemType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  overdueRescheduled?: boolean;
}

export interface DailyReview {
  id: string;
  date: string; // YYYY-MM-DD
  wins: string;
  blockers: string;
  unfinishedNotes: string;
  tomorrowPriorities: string;
  completedAt: string;
}

export interface InsightSuggestion {
  id: string;
  type: 'warning' | 'info' | 'success' | 'action';
  message: string;
  actionLabel?: string;
  actionType?: 'schedule_call' | 'create_quote' | 'rebalance' | 'dismiss';
  targetContactId?: string;
  dismissed?: boolean;
}
