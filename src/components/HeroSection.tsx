import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Bed, 
  Bath, 
  Search, 
  ArrowRight, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Building,
  TreePine
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { PropertyCategory } from '../types';

export const HeroSection: React.FC = () => {
  const { filters, setFilters, setSelectedProperty, properties } = useProperties();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Local search form state to allow editing before submission
  const [localLocation, setLocalLocation] = useState(filters.location);
  const [localCategory, setLocalCategory] = useState<string>(filters.category);
  const [localPriceRange, setLocalPriceRange] = useState<string>('all');
  const [localBeds, setLocalBeds] = useState<string>(filters.beds);
  const [localBaths, setLocalBaths] = useState<string>(filters.baths);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let priceMax = 10000000;
    let priceMin = 0;
    if (localPriceRange === 'under-500k') {
      priceMax = 500000;
    } else if (localPriceRange === '500k-1m') {
      priceMin = 500000;
      priceMax = 1000000;
    } else if (localPriceRange === '1m-3m') {
      priceMin = 1000000;
      priceMax = 3000000;
    } else if (localPriceRange === '3m-plus') {
      priceMin = 3000000;
    }

    setFilters(prev => ({
      ...prev,
      location: localLocation,
      category: (localCategory === 'all' ? 'All' : localCategory) as any,
      priceMin,
      priceMax,
      beds: localBeds,
      baths: localBaths
    }));

    const el = document.getElementById('featured-properties');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Featured hero property (Beverly Hills Modern House)
  const heroProperty = properties.find(p => p.title.includes('Beverly Hills') || p.price === 2450000) || properties[0];

  return (
    <section id="hero-section" className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Hero Layout: Left Content & Right Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle, CTA, Social Proof */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>The #1 Verified Real Estate Marketplace</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Find Your Dream Home
                <span className="block text-emerald-600 font-extrabold mt-1">
                  Live Your Best Life
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed pt-2 max-w-lg">
                Explore thousands of verified properties and find a place you'll love to call home.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                id="hero-explore-button"
                onClick={() => {
                  const el = document.getElementById('featured-properties');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 transition-all cursor-pointer transform active:scale-98"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                id="hero-how-it-works-button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-emerald-700 ml-0.5" />
                </div>
                <span>How It Works</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-3.5">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img 
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                  alt="Client avatar" 
                />
                <img 
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" 
                  alt="Client avatar" 
                />
                <img 
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover" 
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" 
                  alt="Client avatar" 
                />
                <div className="h-9 w-9 rounded-full ring-2 ring-white bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  +
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Trusted by <span className="text-emerald-700 font-bold">10,000+</span> happy clients
              </p>
            </div>
          </div>

          {/* Right Column: Hero Architecture Showcase with Floating Card */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group">
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80" 
                alt="Modern luxury house with pool" 
                className="w-full h-[380px] sm:h-[460px] lg:h-[500px] object-cover group-hover:scale-103 transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Floating Property Info Card matching reference */}
              <div 
                onClick={() => heroProperty && setSelectedProperty(heroProperty)}
                className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 flex items-center gap-3.5 cursor-pointer hover:bg-white transition-all transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Modern House</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">For Sale</span>
                  </div>
                  <p className="text-xs text-slate-500">Beverly Hills, CA</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-0.5">$2,450,000</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating / Integrated Search Bar matching reference */}
        <div className="mt-8 lg:mt-10">
          <form 
            id="hero-search-form"
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-100/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center"
          >
            {/* Location Field */}
            <div className="lg:col-span-3 px-3 py-2 bg-slate-50/80 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Location
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <input 
                  type="text" 
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  placeholder="Enter city, state or address..."
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
                />
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="lg:col-span-3 px-3 py-2 bg-slate-50/80 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Property Type
              </label>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                <select 
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Any Type</option>
                  <option value="House">Houses</option>
                  <option value="Apartment">Apartments</option>
                  <option value="Plot">Plots & Land</option>
                  <option value="Villa">Villas</option>
                  <option value="Condo">Condos</option>
                  <option value="Townhouse">Townhouses</option>
                </select>
              </div>
            </div>

            {/* Price Range Dropdown */}
            <div className="lg:col-span-2 px-3 py-2 bg-slate-50/80 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Price Range
              </label>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                <select 
                  value={localPriceRange}
                  onChange={(e) => setLocalPriceRange(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                >
                  <option value="all">$0 - Any Price</option>
                  <option value="under-500k">Under $500k</option>
                  <option value="500k-1m">$500k - $1M</option>
                  <option value="1m-3m">$1M - $3M</option>
                  <option value="3m-plus">$3M+</option>
                </select>
              </div>
            </div>

            {/* Beds Dropdown */}
            <div className="lg:col-span-1 px-3 py-2 bg-slate-50/80 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Beds
              </label>
              <select 
                value={localBeds}
                onChange={(e) => setLocalBeds(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="Any">Any</option>
                <option value="1+">1+</option>
                <option value="2+">2+</option>
                <option value="3+">3+</option>
                <option value="4+">4+</option>
                <option value="5+">5+</option>
              </select>
            </div>

            {/* Baths Dropdown */}
            <div className="lg:col-span-1 px-3 py-2 bg-slate-50/80 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Baths
              </label>
              <select 
                value={localBaths}
                onChange={(e) => setLocalBaths(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="Any">Any</option>
                <option value="1+">1+</option>
                <option value="2+">2+</option>
                <option value="3+">3+</option>
                <option value="4+">4+</option>
              </select>
            </div>

            {/* Search Button matching reference */}
            <div className="lg:col-span-2">
              <button 
                type="submit"
                id="hero-submit-search"
                className="w-full h-full min-h-[50px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all cursor-pointer active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* "How It Works" Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-emerald-700 ml-0.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">How HomeVista Works</h3>
              </div>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2">1</div>
                  <h4 className="font-bold text-slate-900 text-sm">Browse & Filter</h4>
                  <p className="text-xs text-slate-600 mt-1">Discover verified houses, apartments, and plots with detailed photos and pricing.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2">2</div>
                  <h4 className="font-bold text-slate-900 text-sm">Book Viewing</h4>
                  <p className="text-xs text-slate-600 mt-1">Pick a convenient date and time slot with instant calendar confirmation.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-2">3</div>
                  <h4 className="font-bold text-slate-900 text-sm">Own or Rent</h4>
                  <p className="text-xs text-slate-600 mt-1">Direct communication with verified owners and real estate professionals.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-full hover:bg-emerald-800"
              >
                Got It, Let's Explore
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
