/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Send, Users, X, Sparkles, Megaphone, User, Hash, ShieldCheck } from 'lucide-react';
import { UserProfile } from './AuthLockScreen';

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
  avatar: string;
  channel: 'direct' | 'groups' | 'announcements';
  groupName?: string;
}

interface TeamChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export function TeamChatDrawer({ isOpen, onClose, currentUser }: TeamChatDrawerProps) {
  const [activeTab, setActiveTab] = useState<'direct' | 'groups' | 'announcements'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<string>('#general');
  const [selectedDMUser, setSelectedDMUser] = useState<string>('Executive Coordinator');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'announcements') return m.channel === 'announcements';
    if (activeTab === 'groups') return m.channel === 'groups' && m.groupName === selectedGroup;
    return m.channel === 'direct' && m.groupName === selectedDMUser;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: currentUser.name,
      role: currentUser.role,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser.avatar || '👤',
      channel: activeTab,
      groupName: activeTab === 'groups' ? selectedGroup : activeTab === 'direct' ? selectedDMUser : 'All Company',
    };

    setMessages([...messages, newMsg]);
    setText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-150 shadow-2xl z-50 flex flex-col font-sans animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="bg-[#AF52DE] text-white p-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Team Hub Engine</h2>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                Google Workspace Chat • Creative Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Creative Chat Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'direct' ? 'bg-white text-purple-900 shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            <User className="w-3 h-3" /> Personal DM
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'groups' ? 'bg-white text-purple-900 shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            <Hash className="w-3 h-3" /> Groups
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'announcements' ? 'bg-white text-purple-900 shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            <Megaphone className="w-3 h-3" /> Broadcast
          </button>
        </div>
      </div>

      {/* Group or DM Sub-selector Bar */}
      {activeTab === 'groups' && (
        <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold text-purple-900">
          {['#general', '#site-operations', '#procurement', '#cad-engineering'].map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                selectedGroup === grp ? 'bg-purple-600 text-white shadow-xs' : 'bg-white hover:bg-purple-100 border border-purple-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'direct' && (
        <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2 text-xs font-bold text-purple-900">
          <span className="text-[10px] uppercase text-purple-500 font-extrabold">Recipient:</span>
          <select
            value={selectedDMUser}
            onChange={(e) => setSelectedDMUser(e.target.value)}
            className="flex-1 bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
          >
            <option value="Executive Coordinator">Executive Coordinator</option>
            <option value="Commercial Department">Commercial Department</option>
            <option value="Logistics Lead">Logistics Lead</option>
          </select>
        </div>
      )}

      {/* Messages List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/50">
        {filteredMessages.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-purple-200" />
            <p className="text-xs font-bold text-gray-500">No messages in {activeTab === 'groups' ? selectedGroup : activeTab === 'direct' ? selectedDMUser : 'Company Broadcast'} yet</p>
            <p className="text-[10px] text-gray-400">Type a message below to start real-time communication.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.sender === currentUser.name;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {msg.avatar}
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center gap-1.5 text-[10px] text-gray-400 ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-bold text-gray-700">{msg.sender}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs font-medium leading-relaxed border ${
                      isMe
                        ? 'bg-[#AF52DE] text-white border-purple-400'
                        : 'bg-white text-gray-800 border-gray-200 shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder={
            activeTab === 'announcements'
              ? 'Post official company announcement...'
              : activeTab === 'groups'
              ? `Message ${selectedGroup}...`
              : `Private DM to ${selectedDMUser}...`
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-purple-500 focus:bg-white transition"
        />
        <button
          type="submit"
          className="p-2.5 bg-[#AF52DE] hover:bg-purple-700 text-white rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
