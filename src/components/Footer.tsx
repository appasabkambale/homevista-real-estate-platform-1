import React from 'react';
import { Home, Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { setFilters, setIsAddModalOpen } = useProperties();
  const { user, setAuthModalOpen } = useAuth();

  const handleCategoryFilter = (cat: any) => {
    setFilters(prev => ({
      ...prev,
      category: cat,
      status: 'All'
    }));
    const el = document.getElementById('featured-properties');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStatusFilter = (status: 'For Sale' | 'For Rent') => {
    setFilters(prev => ({
      ...prev,
      status: status,
      category: 'All'
    }));
    const el = document.getElementById('featured-properties');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact-footer" className="bg-[#0b2319] text-white pt-14 pb-8 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-emerald-900/60">
          
          {/* Brand Column (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none">HomeVista</span>
                <span className="text-[10px] font-medium text-emerald-300 tracking-wider uppercase mt-1">Find. Buy. Live Better.</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-sm">
              Your trusted partner in finding the perfect property. Verified residential and commercial listings across premier locations.
            </p>

            {/* Social Icons matching reference */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#social" className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 flex items-center justify-center text-emerald-200 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#social" className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 flex items-center justify-center text-emerald-200 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#social" className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 flex items-center justify-center text-emerald-200 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#social" className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-700 flex items-center justify-center text-emerald-200 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column (Col 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Quick Links</h4>
            <ul className="space-y-2 text-xs text-emerald-100/70">
              <li>
                <button onClick={() => handleStatusFilter('For Sale')} className="hover:text-white transition-colors cursor-pointer">
                  Buy
                </button>
              </li>
              <li>
                <button onClick={() => handleStatusFilter('For Rent')} className="hover:text-white transition-colors cursor-pointer">
                  Rent
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (!user) setAuthModalOpen(true);
                    else setIsAddModalOpen(true);
                  }} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sell
                </button>
              </li>
              <li>
                <a href="#why-choose-us" className="hover:text-white transition-colors">
                  Agents
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  Reviews & Blog
                </a>
              </li>
              <li>
                <a href="#contact-footer" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Property Types Column (Col 7-8) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Property Types</h4>
            <ul className="space-y-2 text-xs text-emerald-100/70">
              <li>
                <button onClick={() => handleCategoryFilter('Apartment')} className="hover:text-white transition-colors cursor-pointer">
                  Apartments
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('House')} className="hover:text-white transition-colors cursor-pointer">
                  Houses
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('Villa')} className="hover:text-white transition-colors cursor-pointer">
                  Villas
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('Condo')} className="hover:text-white transition-colors cursor-pointer">
                  Condos
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('Townhouse')} className="hover:text-white transition-colors cursor-pointer">
                  Townhouses
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryFilter('Plot')} className="hover:text-white transition-colors cursor-pointer">
                  Land & Plots
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column (Col 9-10) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Company</h4>
            <ul className="space-y-2 text-xs text-emerald-100/70">
              <li><a href="#why-choose-us" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Us Column (Col 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Contact Us</h4>
            <div className="space-y-2.5 text-xs text-emerald-100/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>123 Dream Street, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">info@homevista.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar matching reference */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 gap-4">
          <p>© 2026 HomeVista. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
            <span>for your dream home</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
