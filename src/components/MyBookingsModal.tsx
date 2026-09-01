import React from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Building } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';

export const MyBookingsModal: React.FC = () => {
  const { 
    isMyBookingsModalOpen, 
    setIsMyBookingsModalOpen, 
    userBookings, 
    cancelBooking,
    setSelectedProperty,
    properties 
  } = useProperties();
  const { user } = useAuth();

  if (!isMyBookingsModalOpen) return null;

  const handleViewProperty = (propertyId: string) => {
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      setIsMyBookingsModalOpen(false);
      setSelectedProperty(prop);
    }
  };

  return (
    <div id="my-bookings-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">My Scheduled Viewings</h3>
              <p className="text-xs text-slate-500">Track and manage your upcoming private property tours</p>
            </div>
          </div>

          <button
            onClick={() => setIsMyBookingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {userBookings.length} {userBookings.length === 1 ? 'Appointment' : 'Appointments'}
            </span>
          </div>

          {userBookings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No scheduled viewing appointments</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Explore our featured properties and click "Book Viewing" to schedule a personalized tour.
              </p>
              <button
                onClick={() => {
                  setIsMyBookingsModalOpen(false);
                  const el = document.getElementById('featured-properties');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Browse Properties
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookings.map((b) => (
                <div 
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img 
                      src={b.propertyImageUrl} 
                      alt={b.propertyTitle} 
                      className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                      onClick={() => handleViewProperty(b.propertyId)}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          b.status === 'Confirmed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status === 'Confirmed' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <span>{b.status}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {b.id.slice(0, 8)}</span>
                      </div>

                      <h4 
                        onClick={() => handleViewProperty(b.propertyId)}
                        className="text-sm font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                      >
                        {b.propertyTitle}
                      </h4>

                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{b.propertyLocation}</span>
                      </p>

                      {/* Date and Time badge */}
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-emerald-700" />
                          <span>{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-emerald-700" />
                          <span>{b.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 justify-end">
                    <button
                      onClick={() => handleViewProperty(b.propertyId)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Property
                    </button>

                    {b.status === 'Confirmed' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Cancel this viewing appointment?')) {
                            await cancelBooking(b.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
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
