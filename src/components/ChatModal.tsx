import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Search, 
  MessageSquare, 
  DollarSign, 
  HelpCircle, 
  Calendar, 
  CheckCheck, 
  Building2, 
  MapPin, 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { Message, Conversation, MessageOffer } from '../types';

export const ChatModal: React.FC = () => {
  const { 
    isChatModalOpen, 
    closeChatModal, 
    conversations, 
    activeConversation, 
    activeConversationId, 
    setActiveConversationId, 
    messages, 
    sendMessage, 
    respondToOffer, 
    markAsRead,
    openMakeOfferModal,
    openAskQuestionModal
  } = useChat();

  const { user } = useAuth();
  const { setSelectedProperty, properties } = useProperties();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [counterInputOpenForId, setCounterInputOpenForId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUid = user?.uid || 'demo-buyer';

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
      setMobileView('chat');
    }
    scrollToBottom();
  }, [activeConversationId, messages.length, markAsRead]);

  if (!isChatModalOpen) return null;

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.propertyTitle.toLowerCase().includes(query) ||
      c.ownerName.toLowerCase().includes(query) ||
      c.buyerName.toLowerCase().includes(query) ||
      c.propertyLocation.toLowerCase().includes(query)
    );
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConversationId) return;

    const text = inputMessage.trim();
    setInputMessage('');
    await sendMessage(activeConversationId, text, 'text');
    scrollToBottom();
  };

  const handleQuickQuestion = async (question: string) => {
    if (!activeConversationId) return;
    await sendMessage(activeConversationId, question, 'inquiry', undefined, 'Quick FAQ');
    scrollToBottom();
  };

  const handleViewProperty = (propertyId: string) => {
    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      setSelectedProperty(prop);
    }
  };

  const handleOpenOfferForActive = () => {
    if (!activeConversation) return;
    const prop = properties.find((p) => p.id === activeConversation.propertyId) || {
      id: activeConversation.propertyId,
      title: activeConversation.propertyTitle,
      price: activeConversation.propertyPrice,
      location: activeConversation.propertyLocation,
      city: 'Austin',
      state: 'TX',
      category: activeConversation.propertyCategory || 'House',
      status: activeConversation.propertyStatus || 'For Sale',
      beds: 3,
      baths: 2,
      sqft: 2400,
      imageUrl: activeConversation.propertyImage,
      amenities: [],
      ownerId: activeConversation.ownerId,
      ownerName: activeConversation.ownerName,
      ownerEmail: activeConversation.ownerEmail,
      createdAt: Date.now(),
      description: ''
    };
    openMakeOfferModal(prop as any);
  };

  const handleOpenAskForActive = () => {
    if (!activeConversation) return;
    const prop = properties.find((p) => p.id === activeConversation.propertyId) || {
      id: activeConversation.propertyId,
      title: activeConversation.propertyTitle,
      price: activeConversation.propertyPrice,
      location: activeConversation.propertyLocation,
      city: 'Austin',
      state: 'TX',
      category: activeConversation.propertyCategory || 'House',
      status: activeConversation.propertyStatus || 'For Sale',
      beds: 3,
      baths: 2,
      sqft: 2400,
      imageUrl: activeConversation.propertyImage,
      amenities: [],
      ownerId: activeConversation.ownerId,
      ownerName: activeConversation.ownerName,
      ownerEmail: activeConversation.ownerEmail,
      createdAt: Date.now(),
      description: ''
    };
    openAskQuestionModal(prop as any);
  };

  const formatTimestamp = (ts: number | string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[820px] overflow-hidden border border-slate-200/80 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Modal Top Navigation Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            {mobileView === 'chat' && (
              <button
                onClick={() => setMobileView('list')}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 sm:hidden cursor-pointer"
                title="Back to inbox"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 leading-none">
                  Direct Messages & Inquiries
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live Agent Chat
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Connect directly with property owners and certified listing agents
              </p>
            </div>
          </div>

          <button
            onClick={closeChatModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Panel Body: Conversations Inbox + Active Chat Thread */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Conversation List / Inbox */}
          <div 
            className={`w-full sm:w-80 md:w-96 border-r border-slate-100 flex flex-col bg-white shrink-0 ${
              mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Search filter in inbox */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/40">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search inquiries & properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">No conversations yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                    Click "Ask a Question" or "Make an Offer" on any property to start chatting!
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversationId === conv.id;
                  const isUserBuyer = conv.buyerId === currentUid;
                  const otherPartyName = isUserBuyer ? conv.ownerName : conv.buyerName;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setMobileView('chat');
                      }}
                      className={`p-3.5 transition-all cursor-pointer flex gap-3 relative ${
                        isSelected 
                          ? 'bg-emerald-50/70 border-l-4 border-emerald-600' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Property Thumbnail */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.propertyImage}
                          alt={conv.propertyTitle}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        {/* Status badge dot */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300"></span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {otherPartyName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {formatTimestamp(conv.lastMessageTime)}
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-emerald-800 truncate mt-0.5">
                          {conv.propertyTitle}
                        </p>

                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-extrabold text-slate-700">
                            ${conv.propertyPrice.toLocaleString()}
                          </span>
                          {conv.unreadCount && conv.unreadCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white">
                              {conv.unreadCount} new
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Thread */}
          {activeConversation ? (
            <div 
              className={`flex-1 flex flex-col bg-slate-50/40 overflow-hidden ${
                mobileView === 'list' ? 'hidden sm:flex' : 'flex'
              }`}
            >
              {/* Active Conversation Property Info Header */}
              <div className="p-3 sm:p-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shadow-xs shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeConversation.propertyImage}
                    alt={activeConversation.propertyTitle}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 cursor-pointer"
                    onClick={() => handleViewProperty(activeConversation.propertyId)}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {activeConversation.propertyTitle}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        ${activeConversation.propertyPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {activeConversation.ownerName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online (Avg response &lt;5 min)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Shortcuts */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleViewProperty(activeConversation.propertyId)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="View Property"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline">Listing</span>
                  </button>

                  <button
                    onClick={handleOpenOfferForActive}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Make Offer</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Container */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                {/* Conversation Started Banner */}
                <div className="text-center my-2">
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    Direct Inquiry Thread with {activeConversation.ownerName}
                  </span>
                </div>

                {messages.map((msg) => {
                  const isMyMessage = msg.senderId === currentUid;
                  const isOfferMessage = msg.type === 'offer' && msg.offer;
                  const isInquiry = msg.type === 'inquiry';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[75%]">
                        {!isMyMessage && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center shrink-0 mb-1">
                            {msg.senderName.charAt(0)}
                          </div>
                        )}

                        <div className="flex flex-col">
                          {/* Sender name label on incoming */}
                          {!isMyMessage && (
                            <span className="text-[10px] font-bold text-slate-400 ml-1 mb-0.5">
                              {msg.senderName} ({msg.senderRole === 'agent' || msg.senderRole === 'owner' ? 'Listing Agent' : 'Buyer'})
                            </span>
                          )}

                          {/* 1. Formal Offer Bubble Card */}
                          {isOfferMessage ? (
                            <div className={`rounded-3xl p-4 sm:p-5 shadow-md border transition-all ${
                              isMyMessage 
                                ? 'bg-emerald-900 text-white border-emerald-800' 
                                : 'bg-white text-slate-900 border-slate-200'
                            }`}>
                              <div className="flex items-center justify-between gap-3 border-b pb-3 mb-3 border-emerald-800/40">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                                      Formal Purchase Offer
                                    </span>
                                    <h4 className="text-xl sm:text-2xl font-black">
                                      ${msg.offer?.amount.toLocaleString()}
                                    </h4>
                                  </div>
                                </div>

                                {/* Status badge */}
                                <div className="shrink-0">
                                  {msg.offer?.status === 'accepted' ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-xs">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Offer Accepted!
                                    </span>
                                  ) : msg.offer?.status === 'declined' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white">
                                      <XCircle className="w-3.5 h-3.5" />
                                      Declined
                                    </span>
                                  ) : msg.offer?.status === 'countered' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      Counter: ${msg.offer.counterAmount?.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500 text-white">
                                      <Clock className="w-3.5 h-3.5" />
                                      Pending Review
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Offer Specifics Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div className={`p-2 rounded-xl ${isMyMessage ? 'bg-emerald-950/60' : 'bg-slate-50'}`}>
                                  <span className="text-[10px] text-slate-400 block font-medium">Down Payment</span>
                                  <span className="font-bold">{msg.offer?.downPaymentPercent}% (${Math.round((msg.offer?.amount || 0) * ((msg.offer?.downPaymentPercent || 20) / 100)).toLocaleString()})</span>
                                </div>
                                <div className={`p-2 rounded-xl ${isMyMessage ? 'bg-emerald-950/60' : 'bg-slate-50'}`}>
                                  <span className="text-[10px] text-slate-400 block font-medium">Closing Period</span>
                                  <span className="font-bold">{msg.offer?.closingDays || 30} Days</span>
                                </div>
                              </div>

                              {/* Contingencies */}
                              {msg.offer?.contingencies && msg.offer.contingencies.length > 0 && (
                                <div className="mb-3 space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Contingencies</span>
                                  <div className="flex flex-wrap gap-1">
                                    {msg.offer.contingencies.map((c, i) => (
                                      <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                        isMyMessage ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
                                      }`}>
                                        ✓ {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Note / Terms */}
                              {msg.offer?.terms && (
                                <p className={`text-xs italic p-2.5 rounded-xl ${
                                  isMyMessage ? 'bg-emerald-950/50 text-emerald-200' : 'bg-slate-50 text-slate-600'
                                }`}>
                                  "{msg.offer.terms}"
                                </p>
                              )}

                              {/* Action Buttons for Seller / Listing Agent */}
                              {!isMyMessage && msg.offer?.status === 'pending' && (
                                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => respondToOffer(activeConversation.id, msg.id, 'accepted')}
                                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Accept Offer</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setCounterInputOpenForId(msg.id);
                                      setCounterPrice(Math.round((msg.offer?.amount || 0) * 1.03));
                                    }}
                                    className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Counter</span>
                                  </button>

                                  <button
                                    onClick={() => respondToOffer(activeConversation.id, msg.id, 'declined')}
                                    className="py-2 px-3 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Decline</span>
                                  </button>
                                </div>
                              )}

                              {/* Counter Offer Price Input Form */}
                              {counterInputOpenForId === msg.id && (
                                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 space-y-2 animate-in fade-in">
                                  <label className="text-xs font-bold text-amber-900 block">
                                    Enter Counter-Offer Price ($ USD):
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="5000"
                                      value={counterPrice}
                                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                                      className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-sm font-extrabold outline-hidden"
                                    />
                                    <button
                                      onClick={() => {
                                        respondToOffer(activeConversation.id, msg.id, 'countered', counterPrice);
                                        setCounterInputOpenForId(null);
                                      }}
                                      className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                                    >
                                      Submit Counter
                                    </button>
                                    <button
                                      onClick={() => setCounterInputOpenForId(null)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 2. Standard Text / Inquiry Bubble */
                            <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                              isMyMessage 
                                ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs' 
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                            }`}>
                              {isInquiry && msg.inquiryTopic && (
                                <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 mb-1">
                                  <HelpCircle className="w-3 h-3" />
                                  <span>Inquiry: {msg.inquiryTopic}</span>
                                </div>
                              )}
                              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                            </div>
                          )}

                          {/* Timestamp and Read Status */}
                          <div className={`flex items-center gap-1 text-[10px] text-slate-400 mt-1 ${
                            isMyMessage ? 'justify-end mr-1' : 'justify-start ml-1'
                          }`}>
                            <span>{formatTimestamp(msg.createdAt)}</span>
                            {isMyMessage && (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick FAQ Suggestion Chips */}
              <div className="px-4 py-2 bg-white/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Quick Ask:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickQuestion('Is this property still available for private tour this week?')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors shrink-0 cursor-pointer"
                >
                  📅 Available for tour?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuestion('Could you share the HOA fees and annual property tax breakdown?')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors shrink-0 cursor-pointer"
                >
                  💰 HOA & Tax Breakdown?
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickQuestion('Are the seller disclosures and home inspection reports available for download?')}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors shrink-0 cursor-pointer"
                >
                  📜 Seller Disclosures?
                </button>
                <button
                  type="button"
                  onClick={handleOpenOfferForActive}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  <span>Submit Purchase Offer</span>
                </button>
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 shrink-0"
              >
                <button
                  type="button"
                  onClick={handleOpenAskForActive}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Ask a structured inquiry"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenOfferForActive}
                  className="p-2.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Make a formal offer"
                >
                  <DollarSign className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message to the listing agent..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-900 outline-hidden transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* No Conversation Selected Placeholder */
            <div className="flex-1 hidden sm:flex items-center justify-center p-8 bg-slate-50/40 text-center">
              <div className="max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-sm">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Select a Conversation
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Choose a listing from your inbox on the left, or browse properties and click <strong>Ask a Question</strong> or <strong>Make an Offer</strong>.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
