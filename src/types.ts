export type PropertyCategory = 'House' | 'Apartment' | 'Plot' | 'Villa' | 'Condo' | 'Townhouse';
export type ListingStatus = 'For Sale' | 'For Rent';

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
  imageUrl: string;
  gallery?: string[];
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  featured?: boolean;
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
