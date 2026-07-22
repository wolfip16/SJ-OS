/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Send, Users, X, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from './AuthLockScreen';

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
  avatar: string;
}

interface TeamChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

const INITIAL_MESSAGES: ChatMessage[] = [];

export function TeamChatDrawer({ isOpen, onClose, currentUser }: TeamChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: currentUser.name,
      role: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser.avatar,
    };

    setMessages([...messages, newMsg]);
    setText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-150 shadow-2xl z-50 flex flex-col font-sans animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="bg-[#AF52DE] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">Team Hub Engine</h2>
            <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
              Google Chat Infrastructure • SJ OS Collaboration Space
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

      {/* Messages List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/50">
        {messages.map((msg) => {
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
        })}
      </div>

      {/* Send Input Box */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-150 flex gap-2">
        <input
          type="text"
          placeholder="Type internal team message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#AF52DE] transition shadow-xs"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#AF52DE] hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>

    </div>
  );
}
