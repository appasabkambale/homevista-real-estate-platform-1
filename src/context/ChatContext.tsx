import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, Conversation, Message, MessageType, MessageOffer } from '../types';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertyContext';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from '../lib/firebase';
import confetti from 'canvas-confetti';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  isChatModalOpen: boolean;
  isMakeOfferModalOpen: boolean;
  isAskQuestionModalOpen: boolean;
  targetPropertyForChat: Property | null;
  totalUnreadCount: number;
  openChatModal: (conversationId?: string) => void;
  closeChatModal: () => void;
  setActiveConversationId: (id: string | null) => void;
  openAskQuestionModal: (property: Property) => void;
  closeAskQuestionModal: () => void;
  openMakeOfferModal: (property: Property) => void;
  closeMakeOfferModal: () => void;
  startOrOpenConversation: (
    property: Property, 
    initialMessage?: string, 
    inquiryTopic?: string, 
    offerData?: MessageOffer
  ) => Promise<string>;
  sendMessage: (
    conversationId: string, 
    text: string, 
    type?: MessageType, 
    offerData?: MessageOffer, 
    inquiryTopic?: string
  ) => Promise<void>;
  respondToOffer: (
    conversationId: string,
    messageId: string,
    status: 'accepted' | 'countered' | 'declined',
    counterAmount?: number
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial Demo Seed Conversations to ensure rich interactive experience
const INITIAL_DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-demo-1',
    propertyId: 'prop-1',
    propertyTitle: 'Modern Architectural Villa with Infinity Pool',
    propertyPrice: 2450000,
    propertyStatus: 'For Sale',
    propertyImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    propertyLocation: 'West Lake Hills, Austin, TX',
    propertyCategory: 'Villa',
    buyerId: 'demo-buyer',
    buyerName: 'Alex Morgan',
    buyerEmail: 'alex.morgan@demo.com',
    ownerId: 'owner-sarah',
    ownerName: 'Sarah Jenkins (Top Agent)',
    ownerEmail: 'sarah.realtor@homevista.com',
    lastMessage: "I'd be thrilled to host you for a private walkthrough this Thursday at 3:00 PM!",
    lastMessageTime: Date.now() - 1000 * 60 * 25, // 25 mins ago
    lastSenderId: 'owner-sarah',
    unreadCount: 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 25
  },
  {
    id: 'conv-demo-2',
    propertyId: 'prop-2',
    propertyTitle: 'Luxury Skyline Penthouse with 360 Panoramic Views',
    propertyPrice: 1850000,
    propertyStatus: 'For Sale',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    propertyLocation: 'Downtown Financial District, Miami, FL',
    propertyCategory: 'Apartment',
    buyerId: 'demo-buyer',
    buyerName: 'Alex Morgan',
    buyerEmail: 'alex.morgan@demo.com',
    ownerId: 'owner-david',
    ownerName: 'David Miller (Premier Estates)',
    ownerEmail: 'david.miller@homevista.com',
    lastMessage: "Formal Offer Submitted: $1,775,000 with 25% down payment.",
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    lastSenderId: 'demo-buyer',
    unreadCount: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3
  }
];

const INITIAL_DEMO_MESSAGES: Record<string, Message[]> = {
  'conv-demo-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-demo-1',
      senderId: 'demo-buyer',
      senderName: 'Alex Morgan',
      senderEmail: 'alex.morgan@demo.com',
      senderRole: 'buyer',
      text: 'Hello Sarah! I am very interested in this villa. Could you confirm if the smart home automation and solar battery backup are included in the asking price?',
      type: 'inquiry',
      inquiryTopic: 'Features & Inclusions',
      createdAt: Date.now() - 1000 * 60 * 60,
      read: true
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-demo-1',
      senderId: 'owner-sarah',
      senderName: 'Sarah Jenkins (Top Agent)',
      senderEmail: 'sarah.realtor@homevista.com',
      senderRole: 'agent',
      text: 'Hi Alex! Yes, absolutely. The full Tesla Powerwall system, Lutron smart lighting, and motorized shades are all fully owned and included in the listing sale.',
      type: 'text',
      createdAt: Date.now() - 1000 * 60 * 45,
      read: true
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-demo-1',
      senderId: 'demo-buyer',
      senderName: 'Alex Morgan',
      senderEmail: 'alex.morgan@demo.com',
      senderRole: 'buyer',
      text: 'That is fantastic. Could we arrange a private in-person inspection sometime this week?',
      type: 'text',
      createdAt: Date.now() - 1000 * 60 * 30,
      read: true
    },
    {
      id: 'msg-1-4',
      senderId: 'owner-sarah',
      conversationId: 'conv-demo-1',
      senderName: 'Sarah Jenkins (Top Agent)',
      senderEmail: 'sarah.realtor@homevista.com',
      senderRole: 'agent',
      text: "I'd be thrilled to host you for a private walkthrough this Thursday at 3:00 PM! Let me know if that time suits you.",
      type: 'text',
      createdAt: Date.now() - 1000 * 60 * 25,
      read: false
    }
  ],
  'conv-demo-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-demo-2',
      senderId: 'demo-buyer',
      senderName: 'Alex Morgan',
      senderEmail: 'alex.morgan@demo.com',
      senderRole: 'buyer',
      text: 'We love the view and private elevator access. We would like to place a formal purchase offer for seller consideration.',
      type: 'offer',
      offer: {
        amount: 1775000,
        status: 'pending',
        downPaymentPercent: 25,
        closingDays: 30,
        contingencies: ['Financing Contingency', 'Inspection Report Approval'],
        terms: 'Ready for quick 30-day closing with pre-approved jumbo financing.'
      },
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      read: true
    }
  ]
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { showToast } = useProperties();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('homevista_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_CONVERSATIONS;
      }
    }
    return INITIAL_DEMO_CONVERSATIONS;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('homevista_messages_map');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_MESSAGES;
      }
    }
    return INITIAL_DEMO_MESSAGES;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Modals state
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState<boolean>(false);
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState<boolean>(false);
  const [targetPropertyForChat, setTargetPropertyForChat] = useState<Property | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('homevista_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('homevista_messages_map', JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Firestore Live Listener for User Conversations
  useEffect(() => {
    if (!user) return;

    setLoadingConversations(true);
    const convsRef = collection(db, 'conversations');

    const unsubscribe = onSnapshot(
      convsRef,
      (snapshot) => {
        const firestoreConvs: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Conversation;
          // Filter if current user is either buyer or owner
          if (
            data.buyerId === user.uid ||
            data.ownerId === user.uid ||
            data.buyerEmail === user.email ||
            data.ownerEmail === user.email
          ) {
            firestoreConvs.push({
              ...data,
              id: docSnap.id
            });
          }
        });

        if (firestoreConvs.length > 0) {
          setConversations((prev) => {
            const merged = [...firestoreConvs];
            // Merge demo conversations if not already in list
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) {
                merged.push(p);
              }
            });
            return merged.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
          });
        }
        setLoadingConversations(false);
      },
      (error) => {
        console.warn('Conversations Firestore sync (offline/local fallback):', error.message);
        setLoadingConversations(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Firestore Live Listener for Active Conversation Messages
  useEffect(() => {
    if (!activeConversationId) return;

    setLoadingMessages(true);
    const msgsRef = collection(db, `conversations/${activeConversationId}/messages`);
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveMsgs: Message[] = [];
        snapshot.forEach((docSnap) => {
          liveMsgs.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Message, 'id'>)
          });
        });

        if (liveMsgs.length > 0) {
          setMessagesMap((prev) => ({
            ...prev,
            [activeConversationId]: liveMsgs
          }));
        }
        setLoadingMessages(false);
      },
      (error) => {
        // Expected if offline or local fallback
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [activeConversationId]);

  // Calculate total unread count for current user
  const totalUnreadCount = conversations.reduce((acc, conv) => {
    const msgs = messagesMap[conv.id] || [];
    const currentUid = user?.uid || 'demo-buyer';
    const unread = msgs.filter((m) => !m.read && m.senderId !== currentUid).length;
    return acc + unread;
  }, 0);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversationId ? messagesMap[activeConversationId] || [] : [];

  // Modal open helpers
  const openChatModal = useCallback((convId?: string) => {
    if (convId) {
      setActiveConversationId(convId);
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
    setIsChatModalOpen(true);
  }, [activeConversationId, conversations]);

  const closeChatModal = useCallback(() => {
    setIsChatModalOpen(false);
  }, []);

  const openAskQuestionModal = useCallback((property: Property) => {
    setTargetPropertyForChat(property);
    setIsAskQuestionModalOpen(true);
  }, []);

  const closeAskQuestionModal = useCallback(() => {
    setIsAskQuestionModalOpen(false);
  }, []);

  const openMakeOfferModal = useCallback((property: Property) => {
    setTargetPropertyForChat(property);
    setIsMakeOfferModalOpen(true);
  }, []);

  const closeMakeOfferModal = useCallback(() => {
    setIsMakeOfferModalOpen(false);
  }, []);

  // Mark all messages in a conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    const currentUid = user?.uid || 'demo-buyer';
    setMessagesMap((prev) => {
      const convMsgs = prev[conversationId] || [];
      const updated = convMsgs.map((m) =>
        m.senderId !== currentUid ? { ...m, read: true } : m
      );
      return { ...prev, [conversationId]: updated };
    });

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, [user]);

  // Start or find existing conversation for a property
  const startOrOpenConversation = async (
    property: Property,
    initialMessage?: string,
    inquiryTopic?: string,
    offerData?: MessageOffer
  ): Promise<string> => {
    const currentUid = user?.uid || 'demo-buyer';
    const currentName = userProfile?.displayName || user?.displayName || 'Alex Morgan';
    const currentEmail = user?.email || 'alex.morgan@demo.com';

    // Find if conversation already exists between current user & property owner
    let existing = conversations.find(
      (c) =>
        c.propertyId === property.id &&
        (c.buyerId === currentUid || c.buyerEmail === currentEmail)
    );

    let convId = existing ? existing.id : `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (!existing) {
      const newConv: Conversation = {
        id: convId,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyStatus: property.status,
        propertyImage: property.imageUrl,
        propertyLocation: property.location,
        propertyCategory: property.category,
        buyerId: currentUid,
        buyerName: currentName,
        buyerEmail: currentEmail,
        ownerId: property.ownerId || 'agent-default',
        ownerName: property.ownerName || 'Listing Agent',
        ownerEmail: property.ownerEmail || 'agent@homevista.com',
        lastMessage: initialMessage || (offerData ? `Formal Offer: $${offerData.amount.toLocaleString()}` : 'Inquiry regarding property'),
        lastMessageTime: Date.now(),
        lastSenderId: currentUid,
        unreadCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      setConversations((prev) => [newConv, ...prev]);

      try {
        await setDoc(doc(db, 'conversations', convId), newConv);
      } catch (err) {
        console.warn('Firestore write fallback to local state');
      }
    }

    // If there is an initial message, offer, or question, send it!
    if (initialMessage || offerData) {
      await sendMessage(
        convId,
        initialMessage || (offerData ? `Formal Offer: $${offerData.amount.toLocaleString()}` : 'Hello, I have a question regarding this property.'),
        offerData ? 'offer' : (inquiryTopic ? 'inquiry' : 'text'),
        offerData,
        inquiryTopic
      );
    }

    setActiveConversationId(convId);
    setIsChatModalOpen(true);
    return convId;
  };

  // Send a message in a conversation
  const sendMessage = async (
    conversationId: string,
    text: string,
    type: MessageType = 'text',
    offerData?: MessageOffer,
    inquiryTopic?: string
  ): Promise<void> => {
    const currentUid = user?.uid || 'demo-buyer';
    const currentName = userProfile?.displayName || user?.displayName || 'Alex Morgan';
    const currentEmail = user?.email || 'alex.morgan@demo.com';

    const currentConv = conversations.find((c) => c.id === conversationId);
    const isOwnerOfListing = currentConv && currentConv.ownerId === currentUid;
    const role: 'buyer' | 'owner' | 'agent' = isOwnerOfListing ? 'owner' : 'buyer';

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: Message = {
      id: msgId,
      conversationId,
      senderId: currentUid,
      senderName: currentName,
      senderEmail: currentEmail,
      senderRole: role,
      text,
      type,
      offer: offerData,
      inquiryTopic,
      createdAt: Date.now(),
      read: true
    };

    // Update messages in local state
    setMessagesMap((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    // Update conversation metadata
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: Date.now(),
              lastSenderId: currentUid,
              updatedAt: Date.now()
            }
          : c
      )
    );

    // Save to Firestore
    try {
      await setDoc(doc(db, `conversations/${conversationId}/messages`, msgId), newMsg);
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageTime: Date.now(),
        lastSenderId: currentUid,
        updatedAt: Date.now()
      });
    } catch (err) {
      console.warn('Firestore message save fallback to local state');
    }

    // Trigger instant agent smart auto-reply if chatting with an agent/owner offline
    if (role === 'buyer') {
      const recipientName = currentConv?.ownerName || 'Agent';
      const isOffer = type === 'offer';
      const isQuestion = type === 'inquiry';

      setTimeout(async () => {
        const replyId = `msg-${Date.now()}-reply`;
        let replyText = '';

        if (isOffer) {
          replyText = `Thank you for your formal offer of $${offerData?.amount.toLocaleString()}! I have forwarded this directly to the seller for formal review. We will provide an official response within 24 hours.`;
        } else if (isQuestion) {
          replyText = `Thank you for reaching out regarding "${inquiryTopic || 'this property'}"! I am pulling up the documentation and seller disclosures right now. Feel free to request a private viewing or inspection anytime!`;
        } else {
          const cannedResponses = [
            `Thanks for your message! I'm currently reviewing this listing schedule. Let me know if you'd like to schedule an in-person tour or video walkthrough!`,
            `Received! I'll get back to you with the latest seller disclosures and title packet shortly.`,
            `Great question! This property has high buyer interest this week. Would you like me to reserve a priority inspection slot for you?`
          ];
          replyText = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
        }

        const agentReply: Message = {
          id: replyId,
          conversationId,
          senderId: currentConv?.ownerId || 'agent-auto',
          senderName: recipientName,
          senderEmail: currentConv?.ownerEmail || 'agent@homevista.com',
          senderRole: 'agent',
          text: replyText,
          type: 'text',
          createdAt: Date.now(),
          read: false
        };

        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), agentReply]
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: replyText,
                  lastMessageTime: Date.now(),
                  lastSenderId: agentReply.senderId,
                  unreadCount: (c.unreadCount || 0) + 1,
                  updatedAt: Date.now()
                }
              : c
          )
        );

        showToast(`💬 New response from ${recipientName}`, 'success');

        try {
          await setDoc(doc(db, `conversations/${conversationId}/messages`, replyId), agentReply);
        } catch (e) {}
      }, 1400);
    }
  };

  // Respond to formal offer (Accept, Counter, Decline)
  const respondToOffer = async (
    conversationId: string,
    messageId: string,
    status: 'accepted' | 'countered' | 'declined',
    counterAmount?: number
  ): Promise<void> => {
    // Update message state
    setMessagesMap((prev) => {
      const convMsgs = prev[conversationId] || [];
      const updated = convMsgs.map((m) => {
        if (m.id === messageId && m.offer) {
          return {
            ...m,
            offer: {
              ...m.offer,
              status,
              counterAmount: counterAmount || m.offer.counterAmount
            }
          };
        }
        return m;
      });
      return { ...prev, [conversationId]: updated };
    });

    if (status === 'accepted') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('🎉 Offer Accepted! Congratulations to both buyer and seller!', 'success');
      await sendMessage(
        conversationId,
        `🎉 Congratulations! The offer has been officially ACCEPTED. We will now proceed with escrow and paperwork!`,
        'text'
      );
    } else if (status === 'countered') {
      showToast(`Counter offer of $${counterAmount?.toLocaleString()} submitted.`, 'info');
      await sendMessage(
        conversationId,
        `Seller submitted a Counter-Offer of $${counterAmount?.toLocaleString()}. Awaiting buyer review.`,
        'text'
      );
    } else {
      showToast('Offer declined.', 'info');
      await sendMessage(
        conversationId,
        `The seller has respectfully declined the offer. Feel free to submit a revised offer or inquiry.`,
        'text'
      );
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId,
        messages,
        loadingConversations,
        loadingMessages,
        isChatModalOpen,
        isMakeOfferModalOpen,
        isAskQuestionModalOpen,
        targetPropertyForChat,
        totalUnreadCount,
        openChatModal,
        closeChatModal,
        setActiveConversationId,
        openAskQuestionModal,
        closeAskQuestionModal,
        openMakeOfferModal,
        closeMakeOfferModal,
        startOrOpenConversation,
        sendMessage,
        respondToOffer,
        markAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
