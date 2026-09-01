import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const BookingModal: React.FC = () => {
  const { 
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    propertyToBook, 
    setPropertyToBook, 
    bookViewing, 
    setIsMyBookingsModalOpen 
  } = useProperties();
  const { user, userProfile } = useAuth();

  // Tomorrow's date default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [userName, setUserName] = useState(userProfile?.displayName || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userPhone, setUserPhone] = useState(userProfile?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  if (!isBookingModalOpen || !propertyToBook) return null;

  const timeSlots = [
    '09:30 AM',
    '11:00 AM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM'
  ];

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingId = await bookViewing({
        propertyId: propertyToBook.id,
        propertyTitle: propertyToBook.title,
        propertyLocation: propertyToBook.location,
        propertyImageUrl: propertyToBook.imageUrl,
        propertyPrice: propertyToBook.price,
        propertyStatus: propertyToBook.status,
        userName: userName.trim() || 'Valued Guest',
        userEmail: userEmail.trim(),
        userPhone: userPhone.trim(),
        date,
        timeSlot,
        notes
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setBookingSuccess(bookingId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsBookingModalOpen(false);
    setPropertyToBook(null);
    setBookingSuccess(null);
  };

  return (
    <div id="booking-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 my-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {bookingSuccess ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-2" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Viewing Scheduled!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
              Your private tour for <strong className="text-slate-900">{propertyToBook.title}</strong> is confirmed for:
            </p>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 font-semibold text-sm max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-emerald-800">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeSlot} (Onsite Tour)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              A confirmation and calendar reminder have been recorded.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setIsMyBookingsModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View My Bookings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <>
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Private Appointment
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Book a Property Viewing
              </h3>
            </div>

            {/* Property Summary Strip */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
              <img 
                src={propertyToBook.imageUrl} 
                alt={propertyToBook.title} 
                className="w-16 h-14 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{propertyToBook.title}</h4>
                <p className="text-[11px] text-slate-500 truncate">{propertyToBook.location}</p>
                <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                  ${propertyToBook.price.toLocaleString()} {propertyToBook.status === 'For Rent' && '/mo'}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              
              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={tomorrowStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Questions (Optional)</label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Interested in immediate move-in or pre-approval requirements..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{loading ? 'Confirming Tour...' : 'Confirm Viewing Appointment'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Free cancellation anytime. Verified agent will meet you at property.</span>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
