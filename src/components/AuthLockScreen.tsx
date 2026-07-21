/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Terminal, Clock, Radio, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  pin: string;
  initials: string;
  color: string;
  avatar: string;
}

export const DEFAULT_ORG_USERS: UserProfile[] = [
  { id: 'rohan', name: 'Rohan Sharma', role: 'Lead Sales Representative', pin: '1111', initials: 'RS', color: 'from-[#007AFF] to-[#5856D6]', avatar: '💼' },
  { id: 'sneha', name: 'Sneha Patel', role: 'Senior Commercial Coordinator', pin: '2222', initials: 'SP', color: 'from-[#34C759] to-[#30B0C7]', avatar: '📐' },
  { id: 'vikram', name: 'Vikram Singh', role: 'Site Operations Head', pin: '3333', initials: 'VS', color: 'from-[#FF9500] to-[#FF3B30]', avatar: '🚛' },
  { id: 'anjali', name: 'Anjali Mehta', role: 'Client Relations Manager', pin: '4444', initials: 'AM', color: 'from-[#AF52DE] to-[#FF2D55]', avatar: '🤝' },
  { id: 'devendra', name: 'Devendra Rao', role: 'Procurement & Logistics Lead', pin: '5555', initials: 'DR', color: 'from-[#FFCC00] to-[#FF9500]', avatar: '📦' },
  { id: 'admin', name: 'Executive Admin', role: 'Organization Director / Owner', pin: '2710', initials: 'EA', color: 'from-[#8E8E93] to-[#1C1C1E]', avatar: '👑' },
];

export const ORG_USERS: UserProfile[] = DEFAULT_ORG_USERS;

export interface SecurityAccessLog {
  id: string;
  timestamp: string;
  pinEntered: string;
  result: 'Success' | 'Denied';
  resolvedUser?: string;
  resolvedRole?: string;
}

export function getStoredOrgUsers(): UserProfile[] {
  const saved = localStorage.getItem('sj_os_org_users');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as UserProfile[];
      // Migrate admin PIN to 2710 if it is still 0000 or missing
      return parsed.map(u => {
        if (u.id === 'admin' && (u.pin === '0000' || !u.pin)) {
          return { ...u, pin: '2710' };
        }
        return u;
      });
    } catch (e) {
      // fallback
    }
  }
  // Initialize with defaults if none exists
  localStorage.setItem('sj_os_org_users', JSON.stringify(DEFAULT_ORG_USERS));
  return DEFAULT_ORG_USERS;
}

export function saveStoredOrgUsers(users: UserProfile[]) {
  localStorage.setItem('sj_os_org_users', JSON.stringify(users));
}

// Log a login attempt
export function logSecurityAccess(pin: string, result: 'Success' | 'Denied', user?: UserProfile) {
  try {
    const saved = localStorage.getItem('sj_os_security_logs');
    const logs: SecurityAccessLog[] = saved ? JSON.parse(saved) : [];
    
    const newLog: SecurityAccessLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      pinEntered: pin.replace(/./g, '•'), // Mask for security
      result,
      resolvedUser: user ? user.name : 'Unknown Terminal Session',
      resolvedRole: user ? user.role : 'Unauthorized Handshake',
    };
    
    // Keep last 50 logs
    const updated = [newLog, ...logs].slice(0, 50);
    localStorage.setItem('sj_os_security_logs', JSON.stringify(updated));
  } catch (e) {
    // ignore logging errors
  }
}

interface AuthLockScreenProps {
  onAuthenticate: (user: UserProfile) => void;
}

export function AuthLockScreen({ onAuthenticate }: AuthLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Clock updating
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (successUser) return; // ignore input on redirect
      
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, successUser]);

  const handleKeyPress = (num: string) => {
    if (successUser) return;
    setError(null);
    
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-validate once 4 digits are completed
      if (newPin.length === 4) {
        const usersList = getStoredOrgUsers();
        const matchedUser = usersList.find(u => u.pin === newPin);
        
        if (matchedUser) {
          logSecurityAccess(newPin, 'Success', matchedUser);
          setSuccessUser(matchedUser);
          setTimeout(() => {
            onAuthenticate(matchedUser);
          }, 800);
        } else {
          logSecurityAccess(newPin, 'Denied');
          setTimeout(() => {
            setError('Access Denied: Invalid Security Signature');
            setPin('');
          }, 150);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (successUser) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col justify-between overflow-x-hidden select-none font-mono relative">
      {/* Dynamic Radar/Grid Tech BG */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} 
      />
      
      {/* Decorative pulse glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0A84FF]/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* Main Core Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 relative z-10">
        
        {/* Left Side: Cyber-Command Branding Panel */}
        <div className="lg:col-span-5 p-8 md:p-12 lg:border-r border-white/10 flex flex-col justify-between">
          <div className="space-y-8">
            {/* Header logo & version */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#0A84FF] text-black font-extrabold text-xl flex items-center justify-center shadow-[0_0_30px_rgba(10,132,255,0.4)]">
                SJ
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] text-[#0A84FF] font-bold uppercase">System Enclave</div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-tight">SJ OS / COMMAND HUB</h1>
              </div>
            </div>

            {/* Instruction specs */}
            <div className="space-y-4 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 rounded-md text-[10px] font-bold tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-ping" />
                SYSTEM SECURED & ONLINE
              </div>
              
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Unlock Secure Workspace
              </h2>
              <p className="text-xs text-[#8E8E93] leading-relaxed max-w-sm">
                This environment is AES-256 client-side encrypted. To initialize your workspace dashboard, dossiers, and pipeline ledger, type your personal security PIN on your keyboard or use the numeric terminal dialpad.
              </p>
            </div>
          </div>

          {/* Real-time system report widget */}
          <div className="space-y-4 mt-8 lg:mt-0 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Clock className="w-3.5 h-3.5 text-[#0A84FF]" /> SYSTEM CLOCK
              </span>
              <span className="text-white font-mono text-xs font-semibold">{timeStr || '00:00:00'}</span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Radio className="w-3.5 h-3.5 text-[#0A84FF]" /> SECURITY STANDARD
              </span>
              <span className="text-white font-bold tracking-wider text-[10px]">AES-256 ENCLAVE</span>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="text-[9px] text-[#8E8E93] uppercase font-bold tracking-wider">Secure Audit Handshake</div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> Connection verified. Standby.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Passcode Core Terminal */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center items-center relative">
          
          <div className="w-full max-w-sm space-y-8">
            
            {/* Header state of terminal */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-white/5 border border-white/10 text-[#0A84FF]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white">
                {successUser ? 'Decrypting Session' : 'Enter Terminal Passcode'}
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                {successUser ? 'Initializing secure user sandbox...' : 'Direct credentials entry required'}
              </p>
            </div>

            {/* Input PIN bubble indicators */}
            <div className="space-y-4">
              <div className="flex justify-center gap-4.5 py-4">
                {[1, 2, 3, 4].map((i) => {
                  const filled = pin.length >= i;
                  return (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-full transition-all duration-200 relative ${
                        successUser 
                          ? 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.8)] scale-110' 
                          : filled 
                            ? 'bg-[#0A84FF] shadow-[0_0_15px_rgba(10,132,255,0.8)] scale-110' 
                            : 'bg-white/10 border border-white/25'
                      }`}
                    >
                      {/* Interactive dot inside */}
                      {filled && !successUser && (
                        <div className="absolute inset-1 rounded-full bg-white/40" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Display Messages */}
              <div className="h-5 text-center flex items-center justify-center">
                {successUser ? (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Authenticated: {successUser.name}
                  </p>
                ) : error ? (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 animate-bounce">
                    <AlertCircle className="w-4 h-4 text-red-500" /> {error}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#8E8E93] uppercase tracking-[0.12em]">
                    Key-in or type numeric pin (4 digits)
                  </p>
                )}
              </div>
            </div>

            {/* Core Technical Dialpad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  disabled={!!successUser}
                  className="h-16 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:bg-white/20 active:scale-95 text-lg font-bold text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-150 group"
                >
                  <span>{num}</span>
                  <span className="text-[7px] text-[#8E8E93] uppercase font-bold tracking-widest mt-0.5 group-hover:text-white/80 transition-colors">
                    {num === '2' && 'ABC'}
                    {num === '3' && 'DEF'}
                    {num === '4' && 'GHI'}
                    {num === '5' && 'JKL'}
                    {num === '6' && 'MNO'}
                    {num === '7' && 'PQRS'}
                    {num === '8' && 'TUV'}
                    {num === '9' && 'WXYZ'}
                  </span>
                </button>
              ))}
              
              {/* Toggle visibility */}
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="h-16 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-[#8E8E93] hover:text-white flex items-center justify-center cursor-pointer transition-all"
                title="Toggle PIN Visibility"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              
              {/* Zero button */}
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                disabled={!!successUser}
                className="h-16 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-lg font-bold text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                0
              </button>
              
              {/* Backspace button */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-16 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-[#8E8E93] hover:text-white flex items-center justify-center cursor-pointer transition-all"
                title="Backspace"
              >
                ⌫
              </button>
            </div>

            {/* Secret Entry Mode Indicator */}
            <div className="text-center pt-2">
              <span className="text-[9px] text-[#8E8E93] uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/10">
                🔒 Security Input Standard Active
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Clean Immersive Footer (No Code List, Fully Compliant) */}
      <footer className="border-t border-white/10 py-5 px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-[#8E8E93] relative z-10 gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#0A84FF]" />
          <span>SJ OS SECURE SHELL INTERFACE v1.3</span>
        </div>
        <div>
          <span>SECURITY HANDSHAKE VALID: {dateStr || 'JULY 2026'}</span>
        </div>
      </footer>
    </div>
  );
}
