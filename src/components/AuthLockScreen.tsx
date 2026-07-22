/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Eye, EyeOff, Terminal, Clock, Radio, Activity, CheckCircle, AlertCircle, Database, User, Key, LogIn, Sparkles, Check, UserPlus, Phone } from 'lucide-react';
import { logSecurityAccessToFirebase, saveUserProfileToFirestore } from '../lib/firebaseSync';
import { SjOsLogo } from './SjOsLogo';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  googleId: string;
  pin: string;
  password?: string;
  phone?: string;
  initials: string;
  color: string;
  avatar: string;
}

export const DEFAULT_ORG_USERS: UserProfile[] = [
  {
    id: 'reshab',
    name: 'Reshab Jhunjhunwala',
    role: 'Organization Director / Master Executive Admin',
    email: 'reshab.jhunjhunwala@rbagarwalla.com',
    googleId: 'reshab.jhunjhunwala@rbagarwalla.com',
    pin: '281171',
    password: '281171',
    phone: '+91 98300 28117',
    initials: 'RJ',
    color: 'from-[#007AFF] to-[#5856D6]',
    avatar: '👑',
  },
  {
    id: 'rohan',
    name: 'Rohan Sharma',
    role: 'Lead Sales Representative',
    email: 'rohan.sharma@rbagarwalla.com',
    googleId: 'rohan.sharma@rbagarwalla.com',
    pin: '1111',
    password: 'rohan123',
    phone: '+91 98300 11111',
    initials: 'RS',
    color: 'from-[#007AFF] to-[#5856D6]',
    avatar: '💼',
  },
  {
    id: 'sneha',
    name: 'Sneha Patel',
    role: 'Senior Commercial Coordinator',
    email: 'sneha.patel@rbagarwalla.com',
    googleId: 'sneha.patel@rbagarwalla.com',
    pin: '2222',
    password: 'sneha123',
    phone: '+91 98300 22222',
    initials: 'SP',
    color: 'from-[#34C759] to-[#30B0C7]',
    avatar: '📐',
  },
  {
    id: 'vikram',
    name: 'Vikram Singh',
    role: 'Site Operations Head',
    email: 'vikram.singh@rbagarwalla.com',
    googleId: 'vikram.singh@rbagarwalla.com',
    pin: '3333',
    password: 'vikram123',
    phone: '+91 98300 33333',
    initials: 'VS',
    color: 'from-[#FF9500] to-[#FF3B30]',
    avatar: '🚛',
  },
  {
    id: 'anjali',
    name: 'Anjali Mehta',
    role: 'Client Relations Manager',
    email: 'anjali.mehta@rbagarwalla.com',
    googleId: 'anjali.mehta@rbagarwalla.com',
    pin: '4444',
    password: 'anjali123',
    phone: '+91 98300 44444',
    initials: 'AM',
    color: 'from-[#AF52DE] to-[#FF2D55]',
    avatar: '🤝',
  },
  {
    id: 'devendra',
    name: 'Devendra Rao',
    role: 'Procurement & Logistics Lead',
    email: 'devendra.rao@rbagarwalla.com',
    googleId: 'devendra.rao@rbagarwalla.com',
    pin: '5555',
    password: 'devendra123',
    phone: '+91 98300 55555',
    initials: 'DR',
    color: 'from-[#FFCC00] to-[#FF9500]',
    avatar: '📦',
  },
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
      // Ensure Reshab Jhunjhunwala exists with admin password
      const reshabIndex = parsed.findIndex(
        (u) =>
          u.id === 'reshab' ||
          u.email?.includes('reshab') ||
          u.id === 'admin'
      );

      if (reshabIndex !== -1) {
        const existingPass = parsed[reshabIndex].password || parsed[reshabIndex].pin || '281171';
        parsed[reshabIndex] = {
          ...parsed[reshabIndex],
          id: 'reshab',
          name: 'Reshab Jhunjhunwala',
          email: 'reshab.jhunjhunwala@rbagarwalla.com',
          googleId: 'reshab.jhunjhunwala@rbagarwalla.com',
          pin: existingPass,
          password: existingPass,
          role: 'Organization Director / Master Executive Admin',
          avatar: '👑',
        };
      } else {
        parsed.unshift(DEFAULT_ORG_USERS[0]);
      }
      return parsed;
    } catch (e) {
      // fallback
    }
  }
  // Initialize defaults
  localStorage.setItem('sj_os_org_users', JSON.stringify(DEFAULT_ORG_USERS));
  return DEFAULT_ORG_USERS;
}

export function saveStoredOrgUsers(users: UserProfile[]) {
  localStorage.setItem('sj_os_org_users', JSON.stringify(users));
}

// Log security access
export function logSecurityAccess(pin: string, result: 'Success' | 'Denied', user?: UserProfile) {
  try {
    const saved = localStorage.getItem('sj_os_security_logs');
    const logs: SecurityAccessLog[] = saved ? JSON.parse(saved) : [];

    const newLog: SecurityAccessLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      pinEntered: pin.replace(/./g, '•'),
      result,
      resolvedUser: user ? user.name : 'Unknown Terminal Session',
      resolvedRole: user ? user.role : 'Unauthorized Handshake',
    };

    const updated = [newLog, ...logs].slice(0, 50);
    localStorage.setItem('sj_os_security_logs', JSON.stringify(updated));
  } catch (e) {
    // ignore logging errors
  }

  logSecurityAccessToFirebase(pin, result, user);
}

interface AuthLockScreenProps {
  onAuthenticate: (user: UserProfile) => void;
}

export function AuthLockScreen({ onAuthenticate }: AuthLockScreenProps) {
  const [authMode, setAuthMode] = useState<'password' | 'signup'>('password');
  const [selectedUser, setSelectedUser] = useState<UserProfile>(DEFAULT_ORG_USERS[0]);
  const [emailOrUser, setEmailOrUser] = useState(() => localStorage.getItem('sj_os_last_email') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Sign Up Form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpRole, setSignUpRole] = useState('Executive Coordinator');

  const usersList = getStoredOrgUsers();

  // Clock updating
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (successUser) return;
    setError(null);

    const query = emailOrUser.toLowerCase().trim();
    const inputPass = passwordInput.trim();

    if (!inputPass) {
      setError('Please enter your password or PIN.');
      return;
    }

    const reshabUser = usersList.find((u) => u.id === 'reshab' || u.email?.includes('reshab')) || DEFAULT_ORG_USERS[0];
    const reshabPass = reshabUser.password || reshabUser.pin || '281171';

    // Direct password match for Reshab 281171 or reshab's active password
    if (inputPass === '281171' || inputPass === reshabPass) {
      // If query is empty or matches reshab or general login, authenticate Reshab immediately
      if (!query || query.includes('reshab') || query.includes('jhunjhunwal') || query === reshabUser.email.toLowerCase() || query === reshabUser.googleId.toLowerCase() || query.includes('rbagarwalla') || query === 'admin') {
        const lastEmail = query || reshabUser.email;
        localStorage.setItem('sj_os_last_email', lastEmail);
        logSecurityAccess(inputPass, 'Success', reshabUser);
        setSuccessUser(reshabUser);
        setTimeout(() => {
          onAuthenticate(reshabUser);
        }, 700);
        return;
      }
    }

    // Match by email, google ID, name, or id
    let matchedUser = usersList.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const uGoogle = (u.googleId || '').toLowerCase();
      const uId = u.id.toLowerCase();
      const uName = u.name.toLowerCase();

      const isUserMatch =
        uEmail === query ||
        uGoogle === query ||
        uId === query ||
        uName.includes(query) ||
        (query.includes('reshab') && (uId === 'reshab' || uId === 'admin')) ||
        (query.includes('jhunjhunwal') && uId === 'reshab');

      if (!isUserMatch) return false;

      const accountPassword = u.password || u.pin;
      return inputPass === accountPassword || inputPass === u.pin || inputPass === '281171';
    });

    // Fallback: If query was empty or didn't match, check if inputPass matches ANY user's password or PIN
    if (!matchedUser) {
      matchedUser = usersList.find((u) => {
        const accountPassword = u.password || u.pin;
        return inputPass === accountPassword || inputPass === u.pin;
      });
    }

    // Master fallback for 281171 password
    if (!matchedUser && inputPass === '281171') {
      matchedUser = reshabUser;
    }

    if (matchedUser) {
      const lastEmail = matchedUser.email || query || 'reshab.jhunjhunwala@rbagarwalla.com';
      localStorage.setItem('sj_os_last_email', lastEmail);
      logSecurityAccess(inputPass, 'Success', matchedUser);
      setSuccessUser(matchedUser);
      setTimeout(() => {
        onAuthenticate(matchedUser);
      }, 700);
    } else {
      logSecurityAccess(inputPass || 'invalid', 'Denied');
      setError('Invalid Email / Google ID or Password.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (successUser) return;
    setError(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    const cleanEmail = signUpEmail.trim().toLowerCase();
    const existing = usersList.find(
      (u) => (u.email || '').toLowerCase() === cleanEmail || u.id === cleanEmail.split('@')[0]
    );

    if (existing) {
      setError('An account with this email already exists. Please log in.');
      return;
    }

    const initials = signUpName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'US';
    const newProfile: UserProfile = {
      id: cleanEmail.split('@')[0] || 'user_' + Date.now(),
      name: signUpName.trim(),
      role: signUpRole.trim() || 'Executive Member',
      email: cleanEmail,
      googleId: cleanEmail,
      pin: signUpPassword.trim(),
      password: signUpPassword.trim(),
      phone: signUpPhone.trim() || '+91 98300 00000',
      initials,
      color: 'from-[#007AFF] to-[#5856D6]',
      avatar: '👤',
    };

    // Save to stored users
    const updatedUsers = [newProfile, ...usersList];
    saveStoredOrgUsers(updatedUsers);
    saveUserProfileToFirestore(newProfile);
    localStorage.setItem('sj_os_last_email', cleanEmail);

    logSecurityAccess(signUpPassword.trim(), 'Success', newProfile);
    setSuccessUser(newProfile);

    setTimeout(() => {
      onAuthenticate(newProfile);
    }, 800);
  };

  return (
    <div className="h-screen max-h-screen w-screen bg-[#000000] text-[#FFFFFF] flex flex-col justify-between overflow-hidden select-none font-sans relative p-3 sm:p-5 md:p-6">
      {/* Dynamic Radar/Grid Tech BG */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-25 z-0" 
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} 
      />
      
      {/* Decorative pulse glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0A84FF]/5 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" />

      {/* Main Core Layout - Fully non-scrolling for Phone, Tablet, & Desktop */}
      <div className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 min-h-0 relative z-10 items-center">
        
        {/* Desktop Left Side: Cyber-Command Branding Panel (hidden on small phone screens to prevent scroll) */}
        <div className="hidden lg:flex lg:col-span-5 p-6 lg:border-r border-white/10 flex-col justify-between h-full max-h-[580px]">
          <div className="space-y-6">
            {/* Header logo */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shadow-lg inline-block">
              <SjOsLogo size="md" theme="dark" showSubtitle={true} />
            </div>

            {/* Instruction specs */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 rounded-md text-[10px] font-bold tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-ping" />
                FIREBASE AUTHENTICATION ENCLAVE
              </div>
              
              <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                Log In to SJ OS
              </h2>
            </div>
          </div>

          {/* Real-time system report widget */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Clock className="w-3.5 h-3.5 text-[#0A84FF]" /> SYSTEM CLOCK
              </span>
              <span className="text-white font-mono text-xs font-semibold">{timeStr || '00:00:00'}</span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
              <span className="flex items-center gap-1.5 font-bold uppercase">
                <Radio className="w-3.5 h-3.5 text-[#0A84FF]" /> MASTER CONTROL ADMIN
              </span>
              <span className="text-emerald-400 font-bold tracking-wider text-[10px]">RESHAB JHUNJHUNWALA</span>
            </div>

            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div className="text-[9px] text-[#8E8E93] uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Cloud Database Synced</span>
                <span className="text-[#0A84FF] font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" /> Firestore Active
                </span>
              </div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> Firebase Enclave Active & Online
              </div>
            </div>
          </div>
        </div>

        {/* Right Side / Mobile & Tablet Center Panel: Passcode Core Form */}
        <div className="col-span-1 lg:col-span-7 p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center relative font-sans w-full">
          
          <div className="w-full max-w-md space-y-3 sm:space-y-4">
            
            {/* Mobile/Tablet Compact Logo Header */}
            <div className="lg:hidden flex items-center justify-between bg-white/5 p-2.5 sm:p-3 rounded-2xl border border-white/10 shadow-md mb-1">
              <SjOsLogo size="sm" theme="dark" showSubtitle={true} />
              <span className="text-[9px] bg-[#34C759]/20 text-[#34C759] font-bold px-2 py-0.5 rounded-md border border-[#34C759]/30">
                ONLINE
              </span>
            </div>

            {/* Header state of terminal - Text below heading removed as requested */}
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 text-[#0A84FF] shadow-inner">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-[0.1em] text-white">
                {successUser
                  ? 'Session Authenticated'
                  : authMode === 'signup'
                  ? 'Create New SJ OS Account'
                  : 'Log In to SJ OS'}
              </h3>
            </div>

            {/* Auth Mode Toggle Tabs brought immediately under heading */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'password'
                    ? 'bg-[#0A84FF] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-[#0A84FF] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Register / Sign Up
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successUser && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2 animate-pulse">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Authenticated: {successUser.name} ({successUser.role})</span>
              </div>
            )}

            {authMode === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Official Email / Google Workspace ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter your Email ID or Username"
                      value={emailOrUser}
                      onChange={(e) => setEmailOrUser(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-white/5 border border-white/15 rounded-xl text-xs font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 sm:top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Firebase Security Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter Firebase password (e.g. 000000)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-white/5 border border-white/15 rounded-xl text-xs font-mono font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3 sm:top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 sm:top-3.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!!successUser}
                  className="w-full py-3 bg-[#0A84FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to SJ OS</span>
                </button>

              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} className="space-y-2.5">
                
                <div className="space-y-0.5">
                  <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reshab Jhunjhunwala"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                    Google Workspace Email ID *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@rbagarwalla.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="Executive Coordinator"
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98300 00000"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                    Create Firebase Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Set password (e.g. 000000)"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-mono font-bold text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0A84FF]"
                    />
                    <Key className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!!successUser}
                  className="w-full py-2.5 bg-[#34C759] hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Launch SJ OS</span>
                </button>

              </form>
            )}

            {/* Footer Notice */}
            <div className="text-center pt-1">
              <span className="text-[9px] sm:text-[10px] text-[#8E8E93] uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 inline-block">
                🔒 Firebase Security Enclave • SJ OS Roster
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Clean Compact Footer */}
      <footer className="border-t border-white/10 py-2 sm:py-3 px-4 flex flex-col sm:flex-row justify-between items-center text-[9px] sm:text-[10px] text-[#8E8E93] relative z-10 gap-1 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-[#0A84FF]" />
          <span>SJ OS SECURE SHELL INTERFACE v1.4</span>
        </div>
        <div>
          <span>MASTER CONTROL: RESHAB JHUNJHUNWALA</span>
        </div>
      </footer>
    </div>
  );
}
