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
    <div className="bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-2xl shadow-xs overflow-hidden">
      <div className="px-4.5 py-3 border-b border-[#F2F2F7] dark:border-[#2C2C2E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-[#FF9500] fill-[#FF9500]/10" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] dark:text-[#FFFFFF]">
            SJ Dynamic Pipeline Optimizer
          </h2>
        </div>
        <span className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-wider">
          Active Recommendations ({activeSuggestions.length})
        </span>
      </div>

      <div className="divide-y divide-[#F2F2F7] dark:divide-[#2C2C2E]">
        {activeSuggestions.map((suggestion) => {
          // Choose styling based on suggestion type
          let bgClass = 'bg-white dark:bg-[#1C1C1E]';
          let icon = <Lightbulb className="w-4.5 h-4.5 text-[#FF9500]" />;

          switch (suggestion.type) {
            case 'warning':
              bgClass = 'bg-[#FF3B30]/5 dark:bg-[#FF3B30]/10';
              icon = <ShieldAlert className="w-4.5 h-4.5 text-[#FF3B30]" />;
              break;
            case 'action':
              bgClass = 'bg-[#007AFF]/5 dark:bg-[#007AFF]/10';
              icon = <AlertCircle className="w-4.5 h-4.5 text-[#007AFF]" />;
              break;
            case 'success':
              bgClass = 'bg-[#34C759]/5 dark:bg-[#34C759]/10';
              icon = <CheckCircle2 className="w-4.5 h-4.5 text-[#34C759]" />;
              break;
            default:
              bgClass = 'bg-gray-55/5 dark:bg-neutral-850/5';
              icon = <Lightbulb className="w-4.5 h-4.5 text-[#FF9500]" />;
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
                  <p className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                    {suggestion.message}
                  </p>
                  <p className="text-[10px] text-[#8E8E93] font-medium mt-0.5">
                    SJ Decision Engine suggested action based on real-time pipeline status
                  </p>
                </div>
              </div>

              {suggestion.actionLabel && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {suggestion.actionType !== 'dismiss' && (
                    <button
                      onClick={() => onTriggerAction(suggestion)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0066CC] text-white font-medium text-xs tracking-tight transition-all active:scale-95 cursor-pointer"
                      id={`btn_action_${suggestion.id}`}
                    >
                      <span>{suggestion.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDismissSuggestion(suggestion.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-[#2C2C2E] dark:hover:bg-[#3A3A3C] text-[#1D1D1F] dark:text-white font-medium text-xs transition-all cursor-pointer active:scale-95"
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
