export type PropertyCategory = 'House' | 'Apartment' | 'Plot' | 'Villa' | 'Condo' | 'Townhouse';
export type ListingStatus = 'For Sale' | 'For Rent';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type PlaceCategory = 'school' | 'transit' | 'grocery' | 'park' | 'hospital' | 'restaurant' | 'cafe';

export interface NearbyPlace {
  id?: string;
  name: string;
  category: PlaceCategory;
  distance: string; // e.g. "0.2 mi"
  timeWalk: string; // e.g. "4 min walk"
  rating?: number; // e.g. 4.8
  address?: string;
}

export interface NeighborhoodRadar {
  walkScore: number; // 0-100
  walkScoreLabel: string; // e.g. "Walker's Paradise"
  transitScore: number; // 0-100
  transitScoreLabel: string; // e.g. "Rider's Paradise"
  safetyScore: number; // 0-100
  safetyLabel: string; // e.g. "Top 5% Safest"
  schoolsRating: number; // 0-10 (e.g. 9.4)
  schoolsLabel: string; // e.g. "A+ Rated District"
  noiseLevel?: string; // e.g. "Quiet (38 dB)"
  nearbyPlaces: NearbyPlace[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  event: 'Listed' | 'Price Change' | 'Pending' | 'Sold';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  state: string;
  category: PropertyCategory;
  status: ListingStatus;
  beds: number;
  baths: number;
  sqft: number;
  plotArea?: number; // for Plots
  zoning?: string; // for Plots
  yearBuilt?: number;
  hoaFeePerMonth?: number;
  propertyTaxAnnual?: number;
  priceHistory?: PriceHistoryPoint[];
  viewsCount?: number;
  bookmarksCount?: number;
  inquiriesCount?: number;
  imageUrl: string;
  gallery?: string[];
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  featured?: boolean;
  coordinates?: Coordinates;
  neighborhoodRadar?: NeighborhoodRadar;
  createdAt: number | string;
  updatedAt?: number | string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImageUrl: string;
  propertyPrice: number;
  propertyStatus: ListingStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt: number | string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
}

export type MessageType = 'text' | 'inquiry' | 'offer';

export interface MessageOffer {
  amount: number;
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  downPaymentPercent?: number;
  closingDays?: number;
  contingencies?: string[];
  terms?: string;
  counterAmount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'buyer' | 'owner' | 'agent';
  text: string;
  type: MessageType;
  offer?: MessageOffer;
  inquiryTopic?: string;
  createdAt: number | string;
  read: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyStatus: ListingStatus;
  propertyImage: string;
  propertyLocation: string;
  propertyCategory: PropertyCategory;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  lastMessage: string;
  lastMessageTime: number | string;
  lastSenderId: string;
  unreadCount?: number;
  createdAt: number | string;
  updatedAt: number | string;
}

export interface FilterState {
  searchQuery: string;
  location: string;
  category: 'All' | PropertyCategory;
  status: 'All' | ListingStatus;
  priceMin: number;
  priceMax: number;
  beds: string;
  baths: string;
}

export interface DailyAnalyticsPoint {
  date: string;
  fullDate?: string;
  views: number;
  bookmarks: number;
  inquiries: number;
  bookings: number;
  offers: number;
}

export interface ListingAnalyticsSummary {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyStatus: ListingStatus;
  propertyCategory: PropertyCategory;
  propertyImageUrl: string;
  views: number;
  bookmarks: number;
  inquiries: number;
  bookings: number;
  offers: number;
  inquiryCtr: number; // percentage e.g. 3.4
  bookmarkRate: number; // percentage e.g. 6.2
  leadConversionRate: number; // percentage e.g. 18.5
}
