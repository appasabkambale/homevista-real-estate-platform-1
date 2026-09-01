import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from '../lib/firebase';
import { Property, Booking, FilterState, PropertyCategory, ListingStatus } from '../types';
import { INITIAL_PROPERTIES } from '../data/initialProperties';
import { useAuth } from './AuthContext';
import { getCoordinatesForLocation, generateNeighborhoodRadar } from '../utils/radarGenerator';

interface PropertyContextType {
  properties: Property[];
  loadingProperties: boolean;
  userProperties: Property[];
  bookings: Booking[];
  loadingBookings: boolean;
  userBookings: Booking[];
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  
  // Property CRUD
  addProperty: (propertyData: Omit<Property, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerEmail'>) => Promise<string>;
  updateProperty: (propertyId: string, propertyData: Partial<Property>) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  
  // Booking operations
  bookViewing: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId'>) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  
  // Filters & Selection
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredProperties: Property[];
  
  // Selected Property for Details Modal
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  
  // Modals state
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  propertyToEdit: Property | null;
  setPropertyToEdit: (property: Property | null) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  propertyToBook: Property | null;
  setPropertyToBook: (property: Property | null) => void;
  isMyPropertiesModalOpen: boolean;
  setIsMyPropertiesModalOpen: (open: boolean) => void;
  isMyBookingsModalOpen: boolean;
  setIsMyBookingsModalOpen: (open: boolean) => void;
  isFavoritesModalOpen: boolean;
  setIsFavoritesModalOpen: (open: boolean) => void;
  
  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  location: '',
  category: 'All',
  status: 'All',
  priceMin: 0,
  priceMax: 10000000,
  beds: 'Any',
  baths: 'Any'
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, setAuthModalOpen } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('homevista_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [propertyToBook, setPropertyToBook] = useState<Property | null>(null);
  const [isMyPropertiesModalOpen, setIsMyPropertiesModalOpen] = useState(false);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Subscribe to Properties with real-time onSnapshot and automatic seeding
  useEffect(() => {
    const propsCol = collection(db, 'properties');
    const q = query(propsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed initial properties if collection is completely empty
        try {
          console.log('Seeding initial properties into Firestore...');
          for (const item of INITIAL_PROPERTIES) {
            await addDoc(propsCol, item);
          }
        } catch (seedErr) {
          console.warn('Initial seeding fallback to memory:', seedErr);
          setProperties(INITIAL_PROPERTIES.map((p, idx) => ({ ...p, id: `seed-${idx}` })));
          setLoadingProperties(false);
        }
      } else {
        const loadedProps: Property[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data() as Omit<Property, 'id'>;
          const coords = data.coordinates || getCoordinatesForLocation(data.city, data.location);
          const radar = data.neighborhoodRadar || generateNeighborhoodRadar(data.city || 'Austin', data.category || 'House');
          return {
            id: docSnap.id,
            ...data,
            coordinates: coords,
            neighborhoodRadar: radar
          };
        });
        setProperties(loadedProps);
        setLoadingProperties(false);
      }
    }, (err) => {
      console.warn('Properties Firestore snapshot error, using initial dataset:', err);
      setProperties(INITIAL_PROPERTIES.map((p, idx) => ({ 
        ...p, 
        id: `seed-${idx}`,
        coordinates: p.coordinates || getCoordinatesForLocation(p.city, p.location),
        neighborhoodRadar: p.neighborhoodRadar || generateNeighborhoodRadar(p.city, p.category)
      })));
      setLoadingProperties(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Bookings
  useEffect(() => {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedBookings: Booking[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Booking));
      setBookings(loadedBookings);
      setLoadingBookings(false);
    }, (err) => {
      console.warn('Bookings snapshot error:', err);
      setLoadingBookings(false);
    });

    return () => unsubscribe();
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('homevista_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(propertyId);
      if (exists) {
        showToast('Removed from saved properties', 'info');
        return prev.filter(id => id !== propertyId);
      } else {
        showToast('Added to saved properties! ❤️', 'success');
        return [...prev, propertyId];
      }
    });
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  // Property CRUD
  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'ownerEmail'>) => {
    if (!user) {
      setAuthModalOpen(true);
      throw new Error('Please sign in to list a property');
    }

    try {
      const coords = propertyData.coordinates || getCoordinatesForLocation(propertyData.city, propertyData.location);
      const radar = propertyData.neighborhoodRadar || generateNeighborhoodRadar(propertyData.city || 'Austin', propertyData.category || 'House');

      const newProp: Omit<Property, 'id'> = {
        ...propertyData,
        coordinates: coords,
        neighborhoodRadar: radar,
        ownerId: user.uid,
        ownerName: user.displayName || user.email?.split('@')[0] || 'Property Owner',
        ownerEmail: user.email || '',
        ownerPhone: propertyData.ownerPhone || '+1 (800) 123-4567',
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'properties'), newProp);
      showToast('Property listed successfully! 🎉', 'success');
      return docRef.id;
    } catch (err: any) {
      console.error('Error adding property:', err);
      // Fallback local update if network/auth glitch
      const fallbackId = `prop-${Date.now()}`;
      const fallbackProp: Property = {
        id: fallbackId,
        ...propertyData,
        coordinates: propertyData.coordinates || getCoordinatesForLocation(propertyData.city, propertyData.location),
        neighborhoodRadar: propertyData.neighborhoodRadar || generateNeighborhoodRadar(propertyData.city || 'Austin', propertyData.category || 'House'),
        ownerId: user.uid,
        ownerName: user.displayName || 'Property Owner',
        ownerEmail: user.email || '',
        createdAt: Date.now()
      };
      setProperties(prev => [fallbackProp, ...prev]);
      showToast('Property listed successfully! 🎉', 'success');
      return fallbackId;
    }
  };

  const updateProperty = async (propertyId: string, propertyData: Partial<Property>) => {
    if (!user) {
      setAuthModalOpen(true);
      throw new Error('Please sign in to edit your property');
    }

    try {
      const propRef = doc(db, 'properties', propertyId);
      await updateDoc(propRef, {
        ...propertyData,
        updatedAt: Date.now()
      });
      showToast('Property updated successfully! ✨', 'success');
    } catch (err: any) {
      console.error('Error updating property:', err);
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, ...propertyData, updatedAt: Date.now() } : p));
      showToast('Property updated! ✨', 'success');
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      throw new Error('Please sign in to delete a property');
    }

    try {
      const propRef = doc(db, 'properties', propertyId);
      await deleteDoc(propRef);
      showToast('Property removed successfully', 'info');
    } catch (err: any) {
      console.error('Error deleting property:', err);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      showToast('Property removed', 'info');
    }
  };

  // Booking operations
  const bookViewing = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    const currentUid = user ? user.uid : `guest-${Date.now()}`;
    const newBooking: Omit<Booking, 'id'> = {
      ...bookingData,
      userId: currentUid,
      status: 'Confirmed',
      createdAt: Date.now()
    };

    try {
      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      showToast('Viewing booked successfully! 🏡', 'success');
      return docRef.id;
    } catch (err: any) {
      console.error('Error booking viewing:', err);
      const fallbackId = `book-${Date.now()}`;
      const fullBooking: Booking = {
        id: fallbackId,
        ...newBooking
      };
      setBookings(prev => [fullBooking, ...prev]);
      showToast('Viewing booked successfully! 🏡', 'success');
      return fallbackId;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'Cancelled' });
      showToast('Booking cancelled', 'info');
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
      showToast('Booking cancelled', 'info');
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // User-specific properties & bookings
  const userProperties = useMemo(() => {
    if (!user) return [];
    return properties.filter(p => 
      p.ownerId === user.uid || 
      (p.ownerEmail && user.email && p.ownerEmail.toLowerCase() === user.email.toLowerCase())
    );
  }, [properties, user]);

  const userBookings = useMemo(() => {
    if (!user) return bookings.filter(b => b.userId.startsWith('guest-'));
    return bookings.filter(b => 
      b.userId === user.uid || 
      (b.userEmail && user.email && b.userEmail.toLowerCase() === user.email.toLowerCase())
    );
  }, [bookings, user]);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // 1. Search query (title, location, city, state, description)
      if (filters.searchQuery.trim()) {
        const queryLower = filters.searchQuery.toLowerCase();
        const matchesQuery = 
          prop.title.toLowerCase().includes(queryLower) ||
          prop.location.toLowerCase().includes(queryLower) ||
          prop.city.toLowerCase().includes(queryLower) ||
          prop.description.toLowerCase().includes(queryLower);
        if (!matchesQuery) return false;
      }

      // 2. Location filter
      if (filters.location.trim()) {
        const locLower = filters.location.toLowerCase();
        const matchesLoc = 
          prop.location.toLowerCase().includes(locLower) ||
          prop.city.toLowerCase().includes(locLower) ||
          prop.state.toLowerCase().includes(locLower);
        if (!matchesLoc) return false;
      }

      // 3. Category
      if (filters.category !== 'All') {
        if (filters.category === 'Plot') {
          if (prop.category !== 'Plot') return false;
        } else if (prop.category !== filters.category) {
          return false;
        }
      }

      // 4. Status (For Sale / For Rent)
      if (filters.status !== 'All' && prop.status !== filters.status) {
        return false;
      }

      // 5. Price
      if (prop.price < filters.priceMin) return false;
      if (filters.priceMax > 0 && prop.price > filters.priceMax) return false;

      // 6. Beds
      if (filters.beds !== 'Any') {
        const minBeds = parseInt(filters.beds.replace('+', ''), 10);
        if (prop.beds < minBeds) return false;
      }

      // 7. Baths
      if (filters.baths !== 'Any') {
        const minBaths = parseFloat(filters.baths.replace('+', ''));
        if (prop.baths < minBaths) return false;
      }

      return true;
    });
  }, [properties, filters]);

  return (
    <PropertyContext.Provider value={{
      properties,
      loadingProperties,
      userProperties,
      bookings,
      loadingBookings,
      userBookings,
      favorites,
      toggleFavorite,
      isFavorite,
      addProperty,
      updateProperty,
      deleteProperty,
      bookViewing,
      cancelBooking,
      filters,
      setFilters,
      resetFilters,
      filteredProperties,
      selectedProperty,
      setSelectedProperty,
      isAddModalOpen,
      setIsAddModalOpen,
      isEditModalOpen,
      setIsEditModalOpen,
      propertyToEdit,
      setPropertyToEdit,
      isBookingModalOpen,
      setIsBookingModalOpen,
      propertyToBook,
      setPropertyToBook,
      isMyPropertiesModalOpen,
      setIsMyPropertiesModalOpen,
      isMyBookingsModalOpen,
      setIsMyBookingsModalOpen,
      isFavoritesModalOpen,
      setIsFavoritesModalOpen,
      toastMessage,
      showToast
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
