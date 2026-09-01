import React from 'react';
import { Heart, MapPin, Bed, Bath, Maximize2, Calendar, Edit3, Trash2, ShieldCheck, LandPlot } from 'lucide-react';
import { Property } from '../types';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { 
    isFavorite, 
    toggleFavorite, 
    setSelectedProperty, 
    setPropertyToBook, 
    setIsBookingModalOpen,
    setPropertyToEdit,
    setIsEditModalOpen,
    deleteProperty
  } = useProperties();
  const { user } = useAuth();

  const isOwner = user && (property.ownerId === user.uid || property.ownerEmail === user.email);
  const favorited = isFavorite(property.id);

  const formatPrice = (price: number, status: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);

    if (status === 'For Rent') {
      return `${formatted} /mo`;
    }
    return formatted;
  };

  const handleCardClick = () => {
    setSelectedProperty(property);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPropertyToBook(property);
    setIsBookingModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPropertyToEdit(property);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${property.title}"?`)) {
      await deleteProperty(property.id);
    }
  };

  return (
    <div 
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-100/90 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            // Fallback image if broken
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-sm text-white ${
            property.status === 'For Sale' ? 'bg-blue-600' : 'bg-slate-900'
          }`}>
            {property.status}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs">
            {property.category}
          </span>
        </div>

        {/* Favorite Heart Button matching reference */}
        <button
          id={`favorite-btn-${property.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md transition-all hover:bg-white hover:scale-110 cursor-pointer ${
            favorited ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'
          }`}
          aria-label="Save Property"
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Owner Indicator */}
        {isOwner && (
          <div className="absolute bottom-3 left-3 bg-emerald-900/90 backdrop-blur-xs text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Your Listing</span>
          </div>
        )}
      </div>

      {/* Card Content matching reference */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Price */}
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700 tracking-tight">
              {formatPrice(property.price, property.status)}
            </span>
          </div>
        </div>

        {/* Specs Metadata Row matching reference */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          {property.category === 'Plot' ? (
            <>
              <div className="flex items-center gap-1.5" title="Plot Land Area">
                <LandPlot className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{property.plotArea || property.sqft} sq ft</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[140px]">
                <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-medium truncate">
                  {property.zoning || 'Residential'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5" title="Bedrooms">
                <Bed className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{property.beds} <span className="hidden sm:inline font-normal text-slate-500">Beds</span></span>
              </div>
              <div className="flex items-center gap-1.5" title="Bathrooms">
                <Bath className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{property.baths} <span className="hidden sm:inline font-normal text-slate-500">Baths</span></span>
              </div>
              <div className="flex items-center gap-1.5" title="Square Footage">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{property.sqft.toLocaleString()} <span className="hidden sm:inline font-normal text-slate-500">sq ft</span></span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3 flex items-center gap-2">
          <button
            onClick={handleBookClick}
            className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Viewing</span>
          </button>

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleEditClick}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Edit Property"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Property"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
