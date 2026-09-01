import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export const FloatingChatButton: React.FC = () => {
  const { openChatModal, totalUnreadCount, isChatModalOpen } = useChat();

  if (isChatModalOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        id="floating-chat-launcher"
        onClick={() => openChatModal()}
        className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20 cursor-pointer"
        aria-label="Open In-App Messages"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
              {totalUnreadCount}
            </span>
          )}
        </div>
        <div className="flex flex-col items-start pr-1">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            <span>Direct Chat</span>
            <Sparkles className="w-3 h-3 text-emerald-300" />
          </span>
          <span className="text-[10px] text-emerald-200 font-medium leading-none">
            {totalUnreadCount > 0 ? `${totalUnreadCount} new message` : 'Ask agents & make offers'}
          </span>
        </div>
      </button>
    </div>
  );
};
