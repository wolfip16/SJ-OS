/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarItem, Contact, CalendarItemType, InsightSuggestion, ContactStage } from '../types';

// Converts time string "HH:MM" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [hrs, mins] = timeStr.split(':').map(Number);
  return hrs * 60 + mins;
}

// Converts minutes from midnight to "HH:MM" string
export function minutesToTime(mins: number): string {
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  return `${hrs.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Intelligent Rescheduling Engine:
 * Finds a free slot for tomorrow (or a specified date) or shifts low priority tasks
 * to accommodate an overdue item.
 */
export function rescheduleOverdueTask(
  overdueItem: CalendarItem,
  targetDate: string,
  allCalendarItems: CalendarItem[]
): {
  updatedAllItems: CalendarItem[];
  scheduledTime: string;
  shiftedItemTitle?: string;
} {
  // Filter for events on tomorrow's date
  const tomorrowEvents = allCalendarItems
    .filter((item) => item.date === targetDate)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Business hours are 09:00 (540 mins) to 18:00 (1080 mins)
  const startDay = 540;
  const endDay = 1080;
  const duration = overdueItem.durationMinutes || 30;

  let chosenStartMins = -1;
  let shiftedItemTitle: string | undefined;

  // 1. Try to find a natural gap during business hours
  let currentPointer = startDay;
  for (const event of tomorrowEvents) {
    const eventStart = timeToMinutes(event.time);
    if (eventStart - currentPointer >= duration) {
      // Found a gap!
      chosenStartMins = currentPointer;
      break;
    }
    currentPointer = eventStart + event.durationMinutes;
  }

  // Check gap at the end of the day
  if (chosenStartMins === -1 && endDay - currentPointer >= duration) {
    chosenStartMins = currentPointer;
  }

  // 2. If no natural gap, look for a slot occupied by a lower-priority non-critical event
  // Types like 'break', 'buffer', 'research', or priority === 'low'
  let modifiedTomorrowEvents = [...tomorrowEvents];

  if (chosenStartMins === -1) {
    const displaceableTypes: CalendarItemType[] = ['buffer', 'research', 'break', 'email'];
    
    // Find the first displaceable event
    const displaceCandidate = tomorrowEvents.find(
      (ev) => displaceableTypes.includes(ev.type) || ev.priority === 'low'
    );

    if (displaceCandidate) {
      shiftedItemTitle = displaceCandidate.title;
      chosenStartMins = timeToMinutes(displaceCandidate.time);

      // We shift the displaceable candidate forward, or push it to end of day
      modifiedTomorrowEvents = tomorrowEvents.map((ev) => {
        if (ev.id === displaceCandidate.id) {
          // Push it later in the day or reschedule it to the end of the day
          const proposedTime = minutesToTime(Math.min(endDay - ev.durationMinutes, chosenStartMins + duration));
          return {
            ...ev,
            time: proposedTime,
            priority: 'low' as const, // Deprioritize
          };
        }
        return ev;
      });
    } else {
      // If tomorrow is completely packed with high-priority items, force it in at 11:15 AM (the peak buffer hour) or at the start
      chosenStartMins = 675; // 11:15 AM
      // Shift all subsequent items by the duration of this rescheduled item
      modifiedTomorrowEvents = tomorrowEvents.map((ev) => {
        const evStart = timeToMinutes(ev.time);
        if (evStart >= chosenStartMins) {
          return {
            ...ev,
            time: minutesToTime(evStart + duration),
          };
        }
        return ev;
      });
    }
  }

  const newScheduledTime = minutesToTime(chosenStartMins);

  // Build the rescheduled item
  const rescheduledItem: CalendarItem = {
    ...overdueItem,
    id: `resched_${overdueItem.id}_${Date.now()}`,
    date: targetDate,
    time: newScheduledTime,
    completed: false,
    overdueRescheduled: true,
  };

  // Combine back into all items list
  const tomorrowEventIds = tomorrowEvents.map((e) => e.id);
  const otherDaysItems = allCalendarItems.filter((item) => !tomorrowEventIds.includes(item.id) && item.id !== overdueItem.id);

  // Return full updated state
  const updatedAllItems = [
    ...otherDaysItems,
    ...modifiedTomorrowEvents,
    rescheduledItem,
  ];

  return {
    updatedAllItems,
    scheduledTime: newScheduledTime,
    shiftedItemTitle,
  };
}

/**
 * Intelligent Workload Balancing Engine:
 * Takes a day's schedule and optimizes it by:
 * - Alternating heavy mental work (calls, meetings, deep work) with lighter items (email, breaks, research, planning).
 * - Preventing too many back-to-back calls.
 */
export function balanceDayWorkload(dayItems: CalendarItem[]): CalendarItem[] {
  if (dayItems.length <= 2) return dayItems;

  const date = dayItems[0].date;
  const sorted = [...dayItems].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Find call blocks
  const calls = sorted.filter((item) => item.type === 'call');
  const others = sorted.filter((item) => item.type !== 'call');

  // If there are more than 3 calls, try to space them out so they are not back-to-back
  const balanced: CalendarItem[] = [];
  let callIndex = 0;
  let otherIndex = 0;

  // Re-build starting at 09:00 AM
  let currentMins = 540;

  while (callIndex < calls.length || otherIndex < others.length) {
    // If we have back-to-back calls, try to inject an 'other' item or a break if possible
    if (callIndex < calls.length && (balanced.length === 0 || balanced[balanced.length - 1].type !== 'call')) {
      const call = { ...calls[callIndex] };
      call.time = minutesToTime(currentMins);
      balanced.push(call);
      currentMins += call.durationMinutes;
      callIndex++;
    } else if (otherIndex < others.length) {
      const other = { ...others[otherIndex] };
      other.time = minutesToTime(currentMins);
      balanced.push(other);
      currentMins += other.durationMinutes;
      otherIndex++;
    } else if (callIndex < calls.length) {
      // If we have no other tasks but still have calls, insert a 15-minute mental break before scheduling the next call
      const mentalBreak: CalendarItem = {
        id: `auto_break_${Date.now()}_${callIndex}`,
        title: 'Mental Breath & Buffer',
        type: 'break',
        date,
        time: minutesToTime(currentMins),
        durationMinutes: 15,
        priority: 'low',
        completed: false,
      };
      balanced.push(mentalBreak);
      currentMins += 15;

      const call = { ...calls[callIndex] };
      call.time = minutesToTime(currentMins);
      balanced.push(call);
      currentMins += call.durationMinutes;
      callIndex++;
    }
  }

  return balanced;
}

/**
 * Intelligent Weekly Plan Generator:
 * Automatically builds a calendar layout for a given 5-day week starting at startDate (YYYY-MM-DD)
 * based on strategic importance (heat scores) and contact stages.
 */
export function generateWeeklySchedule(
  contacts: Contact[],
  startDateStr: string
): CalendarItem[] {
  const result: CalendarItem[] = [];
  const start = new Date(startDateStr);

  // Generate for 5 working days (Monday - Friday)
  for (let d = 0; d < 5; d++) {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + d);
    const dateStr = currentDay.toISOString().split('T')[0];

    // Distribute contacts across days based on priority
    // Sort contacts by heatScore descending
    const sortedContacts = [...contacts].sort((a, b) => b.heatScore - a.heatScore);
    const dayContacts = sortedContacts.filter((_, idx) => idx % 5 === d);

    let currentMins = 540; // Start at 09:00 AM

    // 1. Morning Alignment / Planning
    result.push({
      id: `week_plan_align_${dateStr}`,
      title: 'SJ OS: Day Alignment & Priorities',
      type: 'planning',
      date: dateStr,
      time: minutesToTime(currentMins),
      durationMinutes: 30,
      priority: 'high',
      completed: false,
    });
    currentMins += 30;

    // 2. High-priority Call Block
    dayContacts.forEach((contact, idx) => {
      // Determine what task matches their stage
      let title = `Call: ${contact.name} (${contact.company})`;
      let type: CalendarItemType = 'call';
      let priority: 'high' | 'medium' | 'low' = contact.heatScore > 80 ? 'high' : 'medium';

      if (contact.stage === 'Need Drawing') {
        title = `CAD Design: ${contact.company} Floorplan`;
        type = 'drawing';
      } else if (contact.stage === 'Quotation Sent') {
        title = `Follow-up: ${contact.company} Quote Acceptance`;
        type = 'quote';
      } else if (contact.stage === 'Payment Follow-up') {
        title = `Collection Call: ${contact.company}`;
        type = 'payment';
        priority = 'high';
      }

      result.push({
        id: `week_plan_${contact.id}_${dateStr}`,
        contactId: contact.id,
        title,
        type,
        date: dateStr,
        time: minutesToTime(currentMins),
        durationMinutes: 30,
        priority,
        completed: false,
      });
      currentMins += 30;

      // Inject research/emails or breaks to maintain mental energy
      if (idx === 0) {
        // Deep Work blocks
        result.push({
          id: `week_plan_deep_${dateStr}_${idx}`,
          title: 'Deep Work: Strategy & Quotations formulation',
          type: 'deep_work',
          date: dateStr,
          time: minutesToTime(currentMins),
          durationMinutes: 60,
          priority: 'medium',
          completed: false,
        });
        currentMins += 60;
      } else if (idx === 1) {
        // Post-call coffee break
        result.push({
          id: `week_plan_break_${dateStr}_${idx}`,
          title: 'Coffee Break & Buffer',
          type: 'break',
          date: dateStr,
          time: minutesToTime(currentMins),
          durationMinutes: 15,
          priority: 'low',
          completed: false,
        });
        currentMins += 15;
      }
    });

    // Lunch Break
    if (currentMins < 780) {
      currentMins = 780; // Ensure lunch starts around 1:00 PM
    }
    result.push({
      id: `week_plan_lunch_${dateStr}`,
      title: 'Lunch Break',
      type: 'break',
      date: dateStr,
      time: minutesToTime(currentMins),
      durationMinutes: 60,
      priority: 'low',
      completed: false,
    });
    currentMins += 60;

    // Afternoon Block: Research and Buffer
    result.push({
      id: `week_plan_research_${dateStr}`,
      title: 'Research: Material Sourcing & Vendor Audit',
      type: 'research',
      date: dateStr,
      time: minutesToTime(currentMins),
      durationMinutes: 45,
      priority: 'low',
      completed: false,
    });
    currentMins += 45;

    result.push({
      id: `week_plan_buffer_${dateStr}`,
      title: 'Email Catch-up & Administrative Buffer',
      type: 'buffer',
      date: dateStr,
      time: minutesToTime(currentMins),
      durationMinutes: 45,
      priority: 'medium',
      completed: false,
    });
  }

  return result;
}

/**
 * Dynamic Intelligence Engine:
 * Scans the contacts and schedule to yield a list of high-value insights.
 */
export function generateSuggestions(
  contacts: Contact[],
  calendarItems: CalendarItem[],
  currentDateStr: string
): InsightSuggestion[] {
  const suggestions: InsightSuggestion[] = [];

  // 1. Check for stale high-value contacts (Strategic contacts not touched in > 10 days)
  const tenDaysAgo = new Date(currentDateStr);
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  contacts.forEach((contact) => {
    if (contact.lastContactDate) {
      const lastContact = new Date(contact.lastContactDate);
      if (lastContact < tenDaysAgo) {
        suggestions.push({
          id: `s_stale_${contact.id}`,
          type: 'warning',
          message: `You haven't contacted ${contact.company} in ${Math.round(
            (new Date(currentDateStr).getTime() - lastContact.getTime()) / (1000 * 3600 * 24)
          )} days. High priority risk!`,
          actionLabel: `Schedule Call`,
          actionType: 'schedule_call',
          targetContactId: contact.id,
        });
      }
    }
  });

  // 2. Check for pending quotations that need follow-up
  const quoteContacts = contacts.filter((c) => c.stage === 'Quotation Sent');
  quoteContacts.forEach((contact) => {
    suggestions.push({
      id: `s_quote_${contact.id}`,
      type: 'action',
      message: `${contact.company} quotation requires standard follow-up to finalize.`,
      actionLabel: `Check Timeline`,
      actionType: 'schedule_call',
      targetContactId: contact.id,
    });
  });

  // 3. Check for overloaded tomorrow
  const tomorrow = new Date(currentDateStr);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowItems = calendarItems.filter((e) => e.date === tomorrowStr);
  
  if (tomorrowItems.length > 8) {
    suggestions.push({
      id: `s_overload_${tomorrowStr}`,
      type: 'info',
      message: `Tomorrow (${tomorrowStr}) is overloaded with ${tomorrowItems.length} items. SJ OS recommends rebalancing.`,
      actionLabel: `Rebalance`,
      actionType: 'rebalance',
    });
  }

  // 4. Default success suggestion if everything looks optimized
  if (suggestions.length === 0) {
    suggestions.push({
      id: 's_all_good',
      type: 'success',
      message: 'All customer schedules optimized. Working week balanced sustainably.',
    });
  }

  return suggestions;
}
