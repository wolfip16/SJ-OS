/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { DailyReview } from '../types';
import { FileCheck2, Calendar, ClipboardCheck, Award, AlertCircle, Bookmark, Sparkles, History, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyReviewProps {
  onCompleteReview: (reviewData: Omit<DailyReview, 'id' | 'completedAt'>) => void;
  reviewsHistory: DailyReview[];
}

export function DailyReviewComponent({
  onCompleteReview,
  reviewsHistory,
}: DailyReviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const [wins, setWins] = useState('');
  const [blockers, setBlockers] = useState('');
  const [unfinishedNotes, setUnfinishedNotes] = useState('');
  const [tomorrowPriorities, setTomorrowPriorities] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!wins.trim() || !tomorrowPriorities.trim()) return;

    onCompleteReview({
      date: '2026-07-21', // Set to current system day
      wins,
      blockers,
      unfinishedNotes,
      tomorrowPriorities,
    });

    // Reset and Close
    setWins('');
    setBlockers('');
    setUnfinishedNotes('');
    setTomorrowPriorities('');
    setIsOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View Historical Reviews Trigger */}
      {reviewsHistory.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#F5F5F7] hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-gray-700 dark:text-neutral-200 border border-gray-200/60 dark:border-neutral-700 transition"
          id="btn_history_reviews"
        >
          <History className="w-4 h-4 text-gray-500" />
          <span>Past Daily Logs ({reviewsHistory.length})</span>
        </button>
      )}

      {/* Main End of Day Review Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95 transition"
        id="btn_open_daily_review"
      >
        <ClipboardCheck className="w-4 h-4" />
        Conclude Today & Sweep
      </button>

      {/* Modal Dialog for EOD review */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50" onClick={() => setIsOpen(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-neutral-850 rounded-2xl shadow-2xl p-5 z-50 text-xs animate-scaleUp overflow-y-auto max-h-[90vh]"
            id="daily_review_modal"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-150 dark:border-neutral-800">
              <div>
                <h3 className="font-extrabold text-sm dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                  SJ OS: Conclude Alignment Desk
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                  Automate pipeline clean-up for July 21, 2026
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <XButton />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5 mt-4">
              {/* Informational Callout */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/45 rounded-xl text-gray-600 dark:text-neutral-400 leading-normal">
                <span className="font-extrabold text-gray-800 dark:text-neutral-200 block mb-0.5">
                  Intelligent Task Sweeping Enabled
                </span>
                Concluding today will automatically forward outstanding or incomplete call blocks, task emails, and draft deliverables to tomorrow's dynamic workload template!
              </div>

              {/* Wins Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Primary Strategic Wins *
                </label>
                <textarea
                  placeholder="Which partner relationships advanced today? (e.g., Lodha Group approved custom elevation specs)"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-850 dark:text-white border border-gray-200 dark:border-neutral-700/60 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 min-h-[60px]"
                  required
                />
              </div>

              {/* Tomorrow Priorities */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  Core Priorities Tomorrow *
                </label>
                <textarea
                  placeholder="What is the single most critical high-heat objective for tomorrow? (e.g. secure Tata PO clearance)"
                  value={tomorrowPriorities}
                  onChange={(e) => setTomorrowPriorities(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-850 dark:text-white border border-gray-200 dark:border-neutral-700/60 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 min-h-[60px]"
                  required
                />
              </div>

              {/* Blockers & Unfinished Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    Blockers & Bottlenecks
                  </label>
                  <textarea
                    placeholder="Are any CAD approvals delayed? Supply chain constraints?"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-850 dark:text-white border border-gray-200 dark:border-neutral-700/60 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 min-h-[50px] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Unfinished / Follow-up Notes
                  </label>
                  <textarea
                    placeholder="Additional logs to persist in system chronological database..."
                    value={unfinishedNotes}
                    onChange={(e) => setUnfinishedNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-850 dark:text-white border border-gray-200 dark:border-neutral-700/60 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500 min-h-[50px] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-150 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Conclude & Shift Overdue Tasks
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Slide-out/Overlay for Past Daily Reviews (Historical Data) */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50" onClick={() => setShowHistory(false)} />
          <div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#1C1C1E] border-l border-gray-200 dark:border-neutral-800 shadow-2xl p-5 z-50 overflow-y-auto text-xs animate-slideLeft"
            id="history_reviews_sidebar"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-150 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="font-extrabold text-sm dark:text-white flex items-center gap-1.5">
                  <History className="w-4.5 h-4.5 text-amber-500" />
                  Daily Reflections Database
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                  Historical Records of Completed Workdays
                </p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-850"
              >
                <XButton />
              </button>
            </div>

            <div className="space-y-4">
              {reviewsHistory.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 bg-gray-50 dark:bg-neutral-850/60 rounded-xl border border-gray-150 dark:border-neutral-800/60 text-gray-700 dark:text-neutral-300 space-y-2"
                  id={`review_history_item_${rev.id}`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-150/50 dark:border-neutral-800/50">
                    <span className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      Reflections for {rev.date}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      Logged {new Date(rev.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-1.5 leading-relaxed text-[11px]">
                    <div>
                      <span className="font-extrabold text-amber-500 block text-[9px] uppercase tracking-wider">
                        🏆 Strategic Wins
                      </span>
                      <p className="font-medium">{rev.wins}</p>
                    </div>

                    <div className="pt-1">
                      <span className="font-extrabold text-amber-500 block text-[9px] uppercase tracking-wider">
                        🚀 Tomorrow's Top Goals
                      </span>
                      <p className="font-medium">{rev.tomorrowPriorities}</p>
                    </div>

                    {(rev.blockers || rev.unfinishedNotes) && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-150/30 dark:border-neutral-800/30">
                        {rev.blockers && (
                          <div>
                            <span className="font-extrabold text-red-500 block text-[9px] uppercase tracking-wider">
                              ⚠️ Blockers
                            </span>
                            <p className="font-medium text-gray-500 dark:text-neutral-450">{rev.blockers}</p>
                          </div>
                        )}
                        {rev.unfinishedNotes && (
                          <div>
                            <span className="font-extrabold text-blue-500 block text-[9px] uppercase tracking-wider">
                              📝 Additional Notes
                            </span>
                            <p className="font-medium text-gray-500 dark:text-neutral-450">{rev.unfinishedNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function XButton() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-gray-500 dark:text-neutral-450">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
