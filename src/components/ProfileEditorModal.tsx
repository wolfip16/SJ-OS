/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, getStoredOrgUsers, saveStoredOrgUsers } from './AuthLockScreen';
import { saveUserProfileToFirestore } from '../lib/firebaseSync';
import { X, User, Mail, Lock, Phone, ShieldCheck, Check, Sparkles, RefreshCw, Key, Palette } from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

const AVATAR_OPTIONS = ['👑', '💼', '📐', '🚛', '🤝', '📦', '💻', '📈', '🎨', '🛠️', '🚀', '🧠', '⚙️', '⚡', '🏢'];
const COLOR_OPTIONS = [
  { name: 'Executive Blue', value: 'from-[#007AFF] to-[#5856D6]' },
  { name: 'Emerald Emerald', value: 'from-[#34C759] to-[#30B0C7]' },
  { name: 'Sunset Amber', value: 'from-[#FF9500] to-[#FF3B30]' },
  { name: 'Royal Purple', value: 'from-[#AF52DE] to-[#FF2D55]' },
  { name: 'Marigold Gold', value: 'from-[#FFCC00] to-[#FF9500]' },
  { name: 'Steel Charcoal', value: 'from-[#8E8E93] to-[#1C1C1E]' },
];

export function ProfileEditorModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: ProfileEditorModalProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [googleId, setGoogleId] = useState(currentUser.googleId || currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98300 00000');
  const [password, setPassword] = useState(currentUser.password || currentUser.pin || '281171');
  const [avatar, setAvatar] = useState(currentUser.avatar || '💼');
  const [color, setColor] = useState(currentUser.color || 'from-[#007AFF] to-[#5856D6]');
  const [isSaved, setIsSaved] = useState(false);
  const [googleSyncing, setGoogleSyncing] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSync = () => {
    setGoogleSyncing(true);
    setTimeout(() => {
      const gEmail = email.includes('@') ? email : `${currentUser.id}@rbagarwalla.com`;
      setGoogleId(gEmail);
      setGoogleSyncing(false);
    }, 800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate initials
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updatedUser: UserProfile = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      googleId: googleId.trim(),
      phone: phone.trim(),
      password: password.trim(),
      pin: password.trim(), // Keep PIN synced to password for legacy PIN keypad
      avatar,
      color,
      initials: initials || 'US',
    };

    // Update in local roster storage
    const allUsers = getStoredOrgUsers();
    const updatedRoster = allUsers.map((u) => (u.id === currentUser.id ? updatedUser : u));
    saveStoredOrgUsers(updatedRoster);

    // Sync to Firestore
    saveUserProfileToFirestore(updatedUser);

    setIsSaved(true);
    onProfileUpdated(updatedUser);

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-md border border-white/20`}>
              {avatar}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Personal Security Profile</h2>
              <p className="text-xs text-gray-300 font-medium">
                Google Workspace & Firebase Secured • SJ OS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Full Name & Avatar Pick */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#007AFF] shadow-xs"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                Avatar Emoji
              </label>
              <select
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#007AFF] shadow-xs"
              >
                {AVATAR_OPTIONS.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji} Preset
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                Official Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#007AFF] shadow-xs"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#007AFF] shadow-xs"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Synced Google ID */}
          <div className="space-y-1 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] uppercase font-bold text-blue-900 tracking-wider">
                Synced Google Workspace ID (Admin Roster)
              </label>
              <button
                type="button"
                onClick={handleGoogleSync}
                disabled={googleSyncing}
                className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${googleSyncing ? 'animate-spin' : ''}`} />
                <span>Auto-Sync Google ID</span>
              </button>
            </div>
            <input
              type="text"
              value={googleId}
              onChange={(e) => setGoogleId(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-900 focus:outline-none"
            />
            <p className="text-[9px] text-blue-700 font-medium">
              This Google Workspace account ID is automatically registered on the Master Executive Roster.
            </p>
          </div>

          {/* Firebase Account Password */}
          <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Firebase Enclave Password
            </label>
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
            <p className="text-[9px] text-gray-500 font-medium">
              Used for Firebase authentication and lock screen unlock. (Admin Reshab password is set to 281171).
            </p>
          </div>

          {/* Color Gradient Theme */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-gray-700 tracking-wider flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              Theme Badge Palette
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`p-2 rounded-xl text-[10px] font-bold text-white bg-gradient-to-r ${c.value} border cursor-pointer transition ${
                    color === c.value ? 'ring-2 ring-black border-white shadow-md' : 'opacity-80 hover:opacity-100 border-transparent'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#007AFF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved & Synced!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update & Sync to Firebase</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
