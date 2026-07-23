/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Calculator, Copy, Trash2, RotateCcw, Check, History } from 'lucide-react';

interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export function CalculatorModal({ isOpen, onClose, onToast }: CalculatorModalProps) {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showHistoryMobile, setShowHistoryMobile] = useState<boolean>(false);

  // History state - limited to last 10 calculations
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sj_os_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (newHistory: CalculationHistoryItem[]) => {
    // Keep max 10 items
    const truncated = newHistory.slice(0, 10);
    setHistory(truncated);
    try {
      localStorage.setItem('sj_os_calc_history', JSON.stringify(truncated));
    } catch {
      // ignore
    }
  };

  const clearHistory = () => {
    saveHistory([]);
    if (onToast) onToast('Calculator history cleared.');
  };

  const addHistoryItem = (expr: string, res: string) => {
    const newItem: CalculationHistoryItem = {
      id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      expression: expr,
      result: res,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    saveHistory([newItem, ...history]);
  };

  const handleDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      if (displayValue === '0' && digit !== '.') {
        setDisplayValue(digit);
      } else if (digit === '.' && displayValue.includes('.')) {
        return; // ignore duplicate decimal
      } else {
        setDisplayValue(displayValue + digit);
      }
    }
  }, [displayValue, waitingForOperand]);

  const handleClear = useCallback(() => {
    setDisplayValue('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression('');
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  }, [displayValue, waitingForOperand]);

  const handleToggleSign = useCallback(() => {
    const num = parseFloat(displayValue);
    if (num !== 0) {
      setDisplayValue(String(-num));
    }
  }, [displayValue]);

  const handlePercentage = useCallback(() => {
    const num = parseFloat(displayValue);
    const res = num / 100;
    setDisplayValue(String(res));
  }, [displayValue]);

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (prevValue == null) {
      setPrevValue(String(inputValue));
      setExpression(`${inputValue} ${nextOperator}`);
    } else if (operator) {
      const currentVal = parseFloat(prevValue) || 0;
      let calculated = 0;

      switch (operator) {
        case '+':
          calculated = currentVal + inputValue;
          break;
        case '-':
          calculated = currentVal - inputValue;
          break;
        case '×':
        case '*':
          calculated = currentVal * inputValue;
          break;
        case '÷':
        case '/':
          calculated = inputValue !== 0 ? currentVal / inputValue : 0;
          break;
        default:
          calculated = inputValue;
      }

      // Format result gracefully
      const formattedRes = Number.isInteger(calculated)
        ? String(calculated)
        : String(parseFloat(calculated.toFixed(8)));

      setPrevValue(formattedRes);
      setDisplayValue(formattedRes);
      setExpression(`${formattedRes} ${nextOperator}`);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = useCallback(() => {
    if (!operator || prevValue == null) return;

    const inputValue = parseFloat(displayValue);
    const currentVal = parseFloat(prevValue) || 0;
    let calculated = 0;

    switch (operator) {
      case '+':
        calculated = currentVal + inputValue;
        break;
      case '-':
        calculated = currentVal - inputValue;
        break;
      case '×':
      case '*':
        calculated = currentVal * inputValue;
        break;
      case '÷':
      case '/':
        calculated = inputValue !== 0 ? currentVal / inputValue : 0;
        break;
      default:
        calculated = inputValue;
    }

    const formattedRes = Number.isInteger(calculated)
      ? String(calculated)
      : String(parseFloat(calculated.toFixed(8)));

    const fullExpr = `${prevValue} ${operator} ${displayValue}`;
    
    // Add to history (max 10 items)
    addHistoryItem(fullExpr, formattedRes);

    setDisplayValue(formattedRes);
    setExpression(`${fullExpr} =`);
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [operator, prevValue, displayValue, addHistoryItem]);

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDigit('.');
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleEquals, handleBackspace, handleClear]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    if (onToast) onToast(`Copied ${displayValue} to clipboard.`);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUseHistoryItem = (item: CalculationHistoryItem) => {
    setDisplayValue(item.result);
    setWaitingForOperand(true);
    if (onToast) onToast(`Loaded ${item.result} into display.`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 grid grid-cols-1 md:grid-cols-12">
        
        {/* Main Calculator Panel (7 cols on desktop) */}
        <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-gray-150 dark:border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/15 text-[#007AFF] dark:text-blue-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Executive Calculator
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                  Basic Math Engine & History
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistoryMobile(!showHistoryMobile)}
                className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:text-blue-500 text-xs font-bold flex items-center gap-1"
                title="Toggle History"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calculator Screen / Display */}
          <div className="bg-gray-100 dark:bg-neutral-900 p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 text-right flex flex-col justify-end min-h-[100px] relative group">
            <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 min-h-[18px] truncate font-semibold">
              {expression || (prevValue && operator ? `${prevValue} ${operator}` : '')}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-gray-200/80 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Copy current display value"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="text-2xl sm:text-3xl font-mono font-black text-gray-900 dark:text-white tracking-tight truncate pl-2">
                {displayValue}
              </div>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2 text-sm font-bold">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition active:scale-95 cursor-pointer font-extrabold"
            >
              {displayValue !== '0' || prevValue ? 'C' : 'AC'}
            </button>
            <button
              onClick={handleToggleSign}
              className="py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 rounded-xl transition active:scale-95 cursor-pointer"
            >
              +/–
            </button>
            <button
              onClick={handlePercentage}
              className="py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 rounded-xl transition active:scale-95 cursor-pointer"
            >
              %
            </button>
            <button
              onClick={() => performOperation('÷')}
              className={`py-3 rounded-xl transition active:scale-95 cursor-pointer font-extrabold text-base ${
                operator === '÷'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500/15 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-400 hover:bg-blue-500/25'
              }`}
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleDigit('7')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              7
            </button>
            <button
              onClick={() => handleDigit('8')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              8
            </button>
            <button
              onClick={() => handleDigit('9')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              9
            </button>
            <button
              onClick={() => performOperation('×')}
              className={`py-3 rounded-xl transition active:scale-95 cursor-pointer font-extrabold text-base ${
                operator === '×'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500/15 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-400 hover:bg-blue-500/25'
              }`}
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleDigit('4')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              4
            </button>
            <button
              onClick={() => handleDigit('5')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              5
            </button>
            <button
              onClick={() => handleDigit('6')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              6
            </button>
            <button
              onClick={() => performOperation('-')}
              className={`py-3 rounded-xl transition active:scale-95 cursor-pointer font-extrabold text-base ${
                operator === '-'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500/15 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-400 hover:bg-blue-500/25'
              }`}
            >
              –
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleDigit('1')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              1
            </button>
            <button
              onClick={() => handleDigit('2')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              2
            </button>
            <button
              onClick={() => handleDigit('3')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              3
            </button>
            <button
              onClick={() => performOperation('+')}
              className={`py-3 rounded-xl transition active:scale-95 cursor-pointer font-extrabold text-base ${
                operator === '+'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500/15 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-400 hover:bg-blue-500/25'
              }`}
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleDigit('0')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer col-span-1"
            >
              0
            </button>
            <button
              onClick={() => handleDigit('.')}
              className="py-3 bg-gray-50 dark:bg-neutral-850 hover:bg-gray-150 dark:hover:bg-neutral-800 text-gray-900 dark:text-white rounded-xl transition active:scale-95 cursor-pointer"
            >
              .
            </button>
            <button
              onClick={handleBackspace}
              className="py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center"
              title="Backspace"
            >
              ⌫
            </button>
            <button
              onClick={handleEquals}
              className="py-3 bg-[#007AFF] hover:bg-blue-600 text-white font-black rounded-xl transition active:scale-95 cursor-pointer text-base shadow-xs"
            >
              =
            </button>
          </div>
        </div>

        {/* History Panel (5 cols on desktop, max 10 entries) */}
        <div className={`md:col-span-5 p-5 bg-gray-50 dark:bg-neutral-900/60 flex flex-col justify-between space-y-3 ${
          showHistoryMobile ? 'block' : 'hidden md:flex'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white">
                Calculation History (Last 10)
              </h4>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-1 text-gray-400 hover:text-red-500 rounded transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                title="Clear History"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[320px] space-y-2 pr-1 scrollbar-thin">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 dark:text-gray-500 space-y-2">
                <Calculator className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium">No calculations in history yet.</p>
                <p className="text-[10px]">Results will automatically save up to the last 10 entries.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleUseHistoryItem(item)}
                  className="p-2.5 bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 transition cursor-pointer group flex items-center justify-between"
                  title="Click to load result"
                >
                  <div className="truncate pr-2">
                    <span className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 truncate">
                      {item.expression} =
                    </span>
                    <span className="block text-sm font-mono font-black text-gray-900 dark:text-white group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition">
                      {item.result}
                    </span>
                  </div>

                  <div className="text-[9px] font-mono text-gray-400 dark:text-gray-500 shrink-0">
                    {item.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-neutral-800 text-[10px] text-gray-500 dark:text-gray-400 text-center font-medium">
            Keyboard support enabled • Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-neutral-800 rounded font-mono text-[9px]">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-neutral-800 rounded font-mono text-[9px]">=</kbd> to evaluate
          </div>
        </div>

      </div>
    </div>
  );
}
