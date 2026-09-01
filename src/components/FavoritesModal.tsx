import React from 'react';
import { X, Heart, MapPin, ArrowRight, Bed, Bath, Trash2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const FavoritesModal: React.FC = () => {
  const { 
    isFavoritesModalOpen, 
    setIsFavoritesModalOpen, 
    favorites, 
    toggleFavorite, 
    properties, 
    setSelectedProperty,
    setPropertyToBook,
    setIsBookingModalOpen
  } = useProperties();

  if (!isFavoritesModalOpen) return null;

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <div id="favorites-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Saved Properties</h3>
              <p className="text-xs text-slate-500">Your curated collection of favorite homes & plots</p>
            </div>
          </div>

          <button
            onClick={() => setIsFavoritesModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {favoriteProperties.length} Saved {favoriteProperties.length === 1 ? 'Property' : 'Properties'}
            </span>
          </div>

          {favoriteProperties.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No properties saved yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Click the heart icon on any property card to save it to your personal shortlist.
              </p>
              <button
                onClick={() => {
                  setIsFavoritesModalOpen(false);
                  const el = document.getElementById('featured-properties');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteProperties.map((prop) => (
                <div 
                  key={prop.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-200 hover:shadow-md transition-all"
                >
                  <div 
                    className="flex items-center gap-3.5 min-w-0 cursor-pointer"
                    onClick={() => {
                      setIsFavoritesModalOpen(false);
                      setSelectedProperty(prop);
                    }}
                  >
                    <img 
                      src={prop.imageUrl} 
                      alt={prop.title} 
                      className="w-20 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {prop.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                          prop.status === 'For Sale' ? 'bg-blue-600' : 'bg-slate-900'
                        }`}>
                          {prop.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate hover:text-emerald-700">{prop.title}</h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{prop.location}</span>
                      </p>
                      <p className="text-xs font-extrabold text-emerald-700 mt-1">
                        ${prop.price.toLocaleString()} {prop.status === 'For Rent' && '/mo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 justify-end">
                    <button
                      onClick={() => {
                        setIsFavoritesModalOpen(false);
                        setPropertyToBook(prop);
                        setIsBookingModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Book Tour
                    </button>

                    <button
                      onClick={() => toggleFavorite(prop.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
