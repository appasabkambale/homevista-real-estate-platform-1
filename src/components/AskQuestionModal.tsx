import React, { useState } from 'react';
import { X, Send, HelpCircle, FileText, DollarSign, Hammer, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export const AskQuestionModal: React.FC = () => {
  const { 
    isAskQuestionModalOpen, 
    closeAskQuestionModal, 
    targetPropertyForChat, 
    startOrOpenConversation 
  } = useChat();
  const { user, setAuthModalOpen, setAuthMode } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState<string>('General Inquiry');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isAskQuestionModalOpen || !targetPropertyForChat) return null;

  const topics = [
    {
      id: 'General Inquiry',
      label: 'General Inquiry',
      icon: HelpCircle,
      desc: 'Ask general questions about the property, area, or timeline.',
      template: `Hi ${targetPropertyForChat.ownerName}, I'm interested in ${targetPropertyForChat.title}. Is this property still available for private viewings?`
    },
    {
      id: 'HOA & Taxes',
      label: 'HOA & Property Taxes',
      icon: DollarSign,
      desc: 'Verify monthly HOA fees, special assessments, and property tax rates.',
      template: `Could you please provide the latest breakdown of monthly HOA dues, what they cover, and annual property taxes for ${targetPropertyForChat.title}?`
    },
    {
      id: 'Inspection & Condition',
      label: 'Condition & Upgrades',
      icon: Hammer,
      desc: 'Inquire about roof age, HVAC systems, recent renovations, or warranty.',
      template: `Could you share details on the age of the roof, HVAC systems, and any recent renovations done on ${targetPropertyForChat.title}?`
    },
    {
      id: 'Disclosures & Reports',
      label: 'Seller Disclosures',
      icon: FileText,
      desc: 'Request seller disclosure documents and property title status.',
      template: `I would like to review the official seller disclosures and property report for ${targetPropertyForChat.title}.`
    },
    {
      id: 'Offer Guidelines',
      label: 'Offer Deadlines & Terms',
      icon: Sparkles,
      desc: 'Find out if there are competing offers or preferred seller terms.',
      template: `Are there any active offers or offer review deadlines for ${targetPropertyForChat.title}? What are the seller's preferred closing terms?`
    }
  ];

  const handleSelectTopic = (topic: typeof topics[0]) => {
    setSelectedTopic(topic.id);
    setCustomMessage(topic.template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    if (!user) {
      setAuthMode('signin');
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await startOrOpenConversation(
        targetPropertyForChat,
        customMessage,
        selectedTopic
      );
      closeAskQuestionModal();
      setCustomMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Direct Agent Inquiry
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              Ask a Question
            </h3>
          </div>
          <button
            onClick={closeAskQuestionModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Property Header Thumbnail */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={targetPropertyForChat.imageUrl}
              alt={targetPropertyForChat.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                {targetPropertyForChat.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{targetPropertyForChat.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-extrabold text-emerald-700">
                  {targetPropertyForChat.status === 'For Rent'
                    ? `$${targetPropertyForChat.price.toLocaleString()}/mo`
                    : `$${targetPropertyForChat.price.toLocaleString()}`}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">• Listing Agent: {targetPropertyForChat.ownerName}</span>
              </div>
            </div>
          </div>

          {/* Quick Topic Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Inquiry Topic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTopic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTopic(t)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{t.label}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Message
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your question or request for the listing agent..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-900 transition-all outline-hidden resize-none"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>💡 Responses will appear immediately in your direct chat thread.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAskQuestionModal}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !customMessage.trim()}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send Inquiry to Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
