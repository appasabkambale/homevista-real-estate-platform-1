import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useProperties();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to exclusive updates! 📬', 'success');
  };

  return (
    <section id="newsletter-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner matching reference */}
        <div className="bg-[#0b2319] rounded-3xl overflow-hidden shadow-xl text-white grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left: Living Room Image cutout */}
          <div className="lg:col-span-4 h-48 lg:h-full min-h-[180px] relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80" 
              alt="Cozy modern living room interior" 
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0b2319] hidden lg:block" />
          </div>

          {/* Right: Copy & Subscription Form */}
          <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10">
            <div className="max-w-xl">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Get Exclusive Property Updates
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 leading-relaxed">
                Subscribe to our newsletter and be the first to know about new listings, price drops, and special offers.
              </p>

              {/* Form */}
              {subscribed ? (
                <div className="mt-5 flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-semibold bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Thank you for subscribing! You'll receive our weekly curated properties.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-5 flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all cursor-pointer shadow-md active:scale-98 shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
