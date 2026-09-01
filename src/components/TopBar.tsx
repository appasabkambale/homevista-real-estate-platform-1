import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div id="homevista-topbar" className="bg-white border-b border-slate-100 text-xs text-slate-600 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* Left Contact Info */}
        <div className="flex items-center space-x-6">
          <a 
            href="mailto:info@homevista.com" 
            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-600" />
            <span>info@homevista.com</span>
          </a>
          <a 
            href="tel:+18001234567" 
            className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>+1 (800) 123-4567</span>
          </a>
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>123 Dream Street, New York, NY 10001</span>
          </div>
        </div>

        {/* Right Social Links */}
        <div className="flex items-center space-x-4">
          <span className="text-slate-500">Follow us:</span>
          <div className="flex items-center space-x-3 text-slate-500">
            <a href="#social" className="hover:text-emerald-600 transition-colors" aria-label="Facebook">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="#social" className="hover:text-emerald-600 transition-colors" aria-label="Instagram">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="#social" className="hover:text-emerald-600 transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a href="#social" className="hover:text-emerald-600 transition-colors" aria-label="Twitter">
              <Twitter className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
