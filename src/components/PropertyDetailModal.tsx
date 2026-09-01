import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Check, 
  Edit3, 
  Trash2, 
  Share2,
  Building,
  LandPlot,
  MessageSquare,
  DollarSign,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Scale,
  BarChart3
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { NeighborhoodRadarSection } from './NeighborhoodRadarSection';

export const PropertyDetailModal: React.FC = () => {
  const { 
    selectedProperty, 
    setSelectedProperty, 
    isFavorite, 
    toggleFavorite,
    isComparing,
    toggleCompare,
    setIsComparisonModalOpen,
    setPropertyToBook, 
    setIsBookingModalOpen,
    setPropertyToEdit,
    setIsEditModalOpen,
    deleteProperty,
    openAnalyticsModal,
    recordPropertyView,
    showToast
  } = useProperties();
  const { user } = useAuth();
  const { startOrOpenConversation, openMakeOfferModal, openAskQuestionModal } = useChat();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (selectedProperty) {
      recordPropertyView(selectedProperty.id);
    }
  }, [selectedProperty?.id]);

  if (!selectedProperty) return null;

  const images = selectedProperty.gallery && selectedProperty.gallery.length > 0 
    ? selectedProperty.gallery 
    : [selectedProperty.imageUrl];

  const currentImage = images[activeImageIndex] || selectedProperty.imageUrl;
  const favorited = isFavorite(selectedProperty.id);
  const comparing = isComparing(selectedProperty.id);
  const isOwner = user && (selectedProperty.ownerId === user.uid || selectedProperty.ownerEmail === user.email);

  const formatPrice = (price: number, status: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);

    if (status === 'For Rent') return `${formatted} /month`;
    return formatted;
  };

  const handleBookViewing = () => {
    setPropertyToBook(selectedProperty);
    setIsBookingModalOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Property link copied to clipboard! 📋', 'success');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedProperty.title}"?`)) {
      await deleteProperty(selectedProperty.id);
      setSelectedProperty(null);
    }
  };

  return (
    <div id="property-detail-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
              selectedProperty.status === 'For Sale' ? 'bg-blue-600' : 'bg-slate-900'
            }`}>
              {selectedProperty.status}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {selectedProperty.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleCompare(selectedProperty.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                comparing
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              title={comparing ? "Remove from comparison" : "Add to side-by-side comparison"}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{comparing ? 'In Comparison' : 'Compare'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Share property"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleFavorite(selectedProperty.id)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                favorited ? 'text-rose-500 bg-rose-50' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => setSelectedProperty(null)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
              <img 
                src={currentImage} 
                alt={selectedProperty.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium pointer-events-none">
                Photo {activeImageIndex + 1} of {images.length}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-400/30' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedProperty.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mt-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{selectedProperty.location}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block">
                {formatPrice(selectedProperty.price, selectedProperty.status)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Estimated ${Math.round(selectedProperty.price / (selectedProperty.sqft || 1))}/sq ft
              </span>
            </div>
          </div>

          {/* Key Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedProperty.category === 'Plot' ? (
              <>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Plot Area</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <LandPlot className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">{selectedProperty.plotArea || selectedProperty.sqft} sq ft</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Zoning</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1 truncate">{selectedProperty.zoning || 'Residential'}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="font-bold text-emerald-700 text-sm block mt-1">Clear Title / Verified</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Utilities</span>
                  <span className="font-bold text-slate-900 text-sm block mt-1">Road & Power Ready</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bedrooms</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Bed className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">{selectedProperty.beds} Beds</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bathrooms</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Bath className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">{selectedProperty.baths} Baths</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Living Area</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Maximize2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">{selectedProperty.sqft.toLocaleString()} sq ft</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Property Type</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">{selectedProperty.category}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Property Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {selectedProperty.description}
            </p>
          </div>

          {/* Amenities & Features */}
          {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Features & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selectedProperty.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-semibold text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-3" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Neighborhood Radar & WalkScore Section */}
          <NeighborhoodRadarSection property={selectedProperty} />

          {/* Listed By / Agent Contact */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base shrink-0">
                {selectedProperty.ownerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{selectedProperty.ownerName}</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Lister
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedProperty.ownerEmail}</p>
                {selectedProperty.ownerPhone && (
                  <p className="text-xs text-slate-600 font-semibold">{selectedProperty.ownerPhone}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  startOrOpenConversation(selectedProperty);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
              </button>
              <a
                href={`mailto:${selectedProperty.ownerEmail}?subject=Inquiry regarding ${encodeURIComponent(selectedProperty.title)}`}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email</span>
              </a>
              {selectedProperty.ownerPhone && (
                <a
                  href={`tel:${selectedProperty.ownerPhone}`}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                const targetId = selectedProperty.id;
                setSelectedProperty(null);
                openAnalyticsModal(targetId);
              }}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
              title="View Performance Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Stats & Funnel</span>
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setPropertyToEdit(selectedProperty);
                    setIsEditModalOpen(true);
                  }}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Property</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setSelectedProperty(null)}
              className="px-3.5 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => openAskQuestionModal(selectedProperty)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ask Question</span>
            </button>
            <button
              onClick={() => openMakeOfferModal(selectedProperty)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>Make an Offer</span>
            </button>
            <button
              id="detail-modal-book-viewing"
              onClick={handleBookViewing}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Tour</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
