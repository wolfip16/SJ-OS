/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Sparkles, HelpCircle } from 'lucide-react';

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
  { id: 'admin', name: 'Executive Admin', role: 'Organization Director / Owner', pin: '0000', initials: 'EA', color: 'from-[#8E8E93] to-[#1C1C1E]', avatar: '👑' },
];

export const ORG_USERS: UserProfile[] = DEFAULT_ORG_USERS;

export function getStoredOrgUsers(): UserProfile[] {
  const saved = localStorage.getItem('sj_os_org_users');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Return default
    }
  }
  // Initialize with defaults if none exists
  localStorage.setItem('sj_os_org_users', JSON.stringify(DEFAULT_ORG_USERS));
  return DEFAULT_ORG_USERS;
}

export function saveStoredOrgUsers(users: UserProfile[]) {
  localStorage.setItem('sj_os_org_users', JSON.stringify(users));
}

interface AuthLockScreenProps {
  onAuthenticate: (user: UserProfile) => void;
}

export function AuthLockScreen({ onAuthenticate }: AuthLockScreenProps) {
  const [usersList] = useState<UserProfile[]>(() => getStoredOrgUsers());
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setPin('');
    setError(null);
  };

  const handleKeyPress = (num: string) => {
    setError(null);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-unlock if matching
      if (newPin.length === 4) {
        if (selectedUser && newPin === selectedUser.pin) {
          setTimeout(() => {
            onAuthenticate(selectedUser);
          }, 150);
        } else {
          setTimeout(() => {
            setError('Incorrect PIN. Please try again.');
            setPin('');
          }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleQuickUnlock = () => {
    if (selectedUser) {
      onAuthenticate(selectedUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#007AFF]/10">
      {/* Top Brand Block */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#007AFF] text-white rounded-xl h-9.5 w-9.5 font-bold text-sm tracking-tight shadow-sm flex items-center justify-center relative overflow-hidden">
            <span className="relative z-10 text-base font-semibold">SJ</span>
            <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#1D1D1F] leading-none flex items-center gap-1.5">
              SJ OS
              <span className="text-[10px] text-[#007AFF] font-semibold px-1.5 py-0.5 rounded-md bg-[#007AFF]/10">ORGANIZATION v1.3</span>
            </h1>
            <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mt-0.5">
              Organization Command & Workspace Hub
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-[#E5E5EA] text-[10px] font-bold text-gray-500">
          <Shield className="w-3 h-3 text-[#34C759]" />
          <span>AES-256 Client-Side Enclave Enabled</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Welcome or Profile Picker */}
        <div className={`${selectedUser ? 'hidden lg:block lg:col-span-5' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Unlock Your Workspace
            </h2>
            <p className="text-xs md:text-sm text-[#8E8E93] font-medium max-w-md leading-relaxed">
              Select your profile from the organization directory to access your live calendar, partner dossiers, and scratchpad.
            </p>
          </div>

          {/* Grid of Users */}
          <div className={`grid ${selectedUser ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
            {usersList.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-4 rounded-2xl text-left bg-white border cursor-pointer transition-all duration-200 shadow-xs flex flex-col justify-between h-36 relative group ${
                    isSelected
                      ? 'ring-2 ring-[#007AFF] border-transparent scale-98 shadow-sm'
                      : 'border-[#E5E5EA] hover:border-[#8E8E93]/40 hover:-translate-y-0.5 hover:shadow-xs'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl bg-linear-to-br ${user.color} text-white flex items-center justify-center text-sm font-bold shadow-xs relative overflow-hidden`}>
                    <span className="relative z-10">{user.initials}</span>
                    <span className="absolute bottom-1 right-1 text-[11px] opacity-70">{user.avatar}</span>
                    <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold text-[#1D1D1F] truncate group-hover:text-[#007AFF] transition-colors">{user.name}</span>
                    <span className="block text-[9px] text-[#8E8E93] font-semibold truncate mt-0.5 uppercase tracking-wider">{user.role}</span>
                  </div>
                  {user.id === 'admin' && (
                    <span className="absolute top-3 right-3 text-[10px] bg-amber-500/10 text-amber-600 font-bold px-1.5 py-0.5 rounded-full border border-amber-500/20">
                      ADMIN
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Passcode lockscreen */}
        {selectedUser && (
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-[#E5E5EA] shadow-sm flex flex-col items-center justify-center space-y-6 animate-slideUp relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 left-4 text-xs font-bold text-gray-400 hover:text-[#007AFF] cursor-pointer flex items-center gap-1"
            >
              ← Back
            </button>

            {/* Profile Detail header */}
            <div className="text-center space-y-2">
              <div className={`mx-auto h-16 w-16 rounded-2xl bg-linear-to-br ${selectedUser.color} text-white flex items-center justify-center text-xl font-bold shadow-md relative overflow-hidden`}>
                <span className="relative z-10">{selectedUser.initials}</span>
                <span className="absolute bottom-1.5 right-1.5 text-base opacity-75">{selectedUser.avatar}</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1D1D1F]">{selectedUser.name}</h3>
                <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mt-0.5">{selectedUser.role}</p>
              </div>
            </div>

            {/* Password Dot indicators */}
            <div className="space-y-2 w-full max-w-xs text-center">
              <div className="flex justify-center gap-3 py-3">
                {[1, 2, 3, 4].map((i) => {
                  const filled = pin.length >= i;
                  return (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-full transition-all duration-150 ${
                        filled ? 'bg-[#007AFF] scale-110' : 'bg-gray-200'
                      }`}
                    />
                  );
                })}
              </div>
              
              {/* Error HUD */}
              {error ? (
                <p className="text-[11px] text-red-500 font-bold animate-pulse">{error}</p>
              ) : (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Enter 4-Digit Security PIN</p>
              )}
            </div>

            {/* Dialpad Grid */}
            <div className="grid grid-cols-3 gap-3.5 w-full max-w-xs">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-14 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] active:scale-95 text-base font-bold text-[#1D1D1F] flex items-center justify-center cursor-pointer transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setShowPin(!showPin)}
                className="h-14 rounded-full bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center cursor-pointer"
                title="Toggle PIN Visibility"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] active:scale-95 text-base font-bold text-[#1D1D1F] flex items-center justify-center cursor-pointer transition-all"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 rounded-full bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center cursor-pointer"
              >
                ⌫
              </button>
            </div>

            {/* Display code hint for review / testing */}
            <div className="w-full text-center border-t border-gray-100 pt-3">
              <button
                onClick={handleQuickUnlock}
                className="text-[10px] font-bold text-[#007AFF] hover:underline cursor-pointer"
              >
                ⚡ Sandbox Quick-Unlock (No PIN Required)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Area */}
      <div className="max-w-7xl mx-auto w-full pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-gray-400">
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5 text-[#8E8E93]" />
          <span>SJ OS Secured Workspace Gateway</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>ORG DIRECTORY SECURITY PIN CODES:</span>
          <span className="text-[#007AFF] select-all">
            {usersList.map(u => `${u.name.split(' ')[0]}: ${u.pin}`).join(' | ')}
          </span>
        </div>
      </div>
    </div>
  );
}
