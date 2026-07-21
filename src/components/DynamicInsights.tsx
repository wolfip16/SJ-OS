/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InsightSuggestion } from '../types';
import { AlertCircle, Lightbulb, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface DynamicInsightsProps {
  suggestions: InsightSuggestion[];
  onTriggerAction: (suggestion: InsightSuggestion) => void;
  onDismissSuggestion: (id: string) => void;
}

export function DynamicInsights({
  suggestions,
  onTriggerAction,
  onDismissSuggestion,
}: DynamicInsightsProps) {
  // Filter dismissed suggestions
  const activeSuggestions = suggestions.filter((s) => !s.dismissed);

  if (activeSuggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="px-4.5 py-3 border-b border-gray-150 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-800 dark:text-neutral-200">
            SJ Dynamic Pipeline Optimizer
          </h2>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
          Active Recommendations ({activeSuggestions.length})
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        {activeSuggestions.map((suggestion) => {
          // Choose styling based on suggestion type
          let bgClass = 'bg-white dark:bg-neutral-900';
          let icon = <Lightbulb className="w-4 h-4 text-amber-500" />;

          switch (suggestion.type) {
            case 'warning':
              bgClass = 'bg-red-50/20 dark:bg-red-950/5';
              icon = <ShieldAlert className="w-4.5 h-4.5 text-red-500" />;
              break;
            case 'action':
              bgClass = 'bg-blue-50/20 dark:bg-blue-950/5';
              icon = <AlertCircle className="w-4.5 h-4.5 text-blue-500" />;
              break;
            case 'success':
              bgClass = 'bg-emerald-50/20 dark:bg-emerald-950/5';
              icon = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />;
              break;
            default:
              bgClass = 'bg-gray-50/20 dark:bg-neutral-850/5';
              icon = <Lightbulb className="w-4.5 h-4.5 text-orange-500" />;
          }

          return (
            <div
              key={suggestion.id}
              className={`p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 ${bgClass} transition hover:bg-black/[0.01] dark:hover:bg-white/[0.01]`}
              id={`insight_item_${suggestion.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-neutral-200 leading-relaxed">
                    {suggestion.message}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium mt-0.5">
                    SJ Decision Engine suggested action based on real-time pipeline status
                  </p>
                </div>
              </div>

              {suggestion.actionLabel && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {suggestion.actionType !== 'dismiss' && (
                    <button
                      onClick={() => onTriggerAction(suggestion)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-xs tracking-tight transition active:scale-95"
                      id={`btn_action_${suggestion.id}`}
                    >
                      <span>{suggestion.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDismissSuggestion(suggestion.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-850 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 font-bold text-xs transition"
                    id={`btn_dismiss_${suggestion.id}`}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
