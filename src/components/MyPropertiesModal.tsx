import React from 'react';
import { X, Building2, Plus, Edit3, Trash2, MapPin, DollarSign, Eye, ExternalLink } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';

export const MyPropertiesModal: React.FC = () => {
  const { 
    isMyPropertiesModalOpen, 
    setIsMyPropertiesModalOpen, 
    userProperties,
    setIsAddModalOpen,
    setPropertyToEdit,
    setIsEditModalOpen,
    setSelectedProperty,
    deleteProperty
  } = useProperties();
  const { user } = useAuth();

  if (!isMyPropertiesModalOpen) return null;

  return (
    <div id="my-properties-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">My Listed Properties</h3>
              <p className="text-xs text-slate-500">Manage, update, and remove your active property listings</p>
            </div>
          </div>

          <button
            onClick={() => setIsMyPropertiesModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {userProperties.length} {userProperties.length === 1 ? 'Listing' : 'Listings'} Found
            </span>

            <button
              onClick={() => {
                setIsMyPropertiesModalOpen(false);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Property</span>
            </button>
          </div>

          {userProperties.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">You haven't listed any properties yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Publish your house, apartment, or land to reach thousands of verified prospective buyers.
              </p>
              <button
                onClick={() => {
                  setIsMyPropertiesModalOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userProperties.map((prop) => (
                <div 
                  key={prop.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
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
                      <h4 className="text-sm font-bold text-slate-900 truncate">{prop.title}</h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{prop.location}</span>
                      </p>
                      <p className="text-xs font-extrabold text-emerald-700 mt-1">
                        ${prop.price.toLocaleString()} {prop.status === 'For Rent' && '/mo'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => {
                        setIsMyPropertiesModalOpen(false);
                        setSelectedProperty(prop);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsMyPropertiesModalOpen(false);
                        setPropertyToEdit(prop);
                        setIsEditModalOpen(true);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete "${prop.title}"?`)) {
                          await deleteProperty(prop.id);
                        }
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Property"
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
