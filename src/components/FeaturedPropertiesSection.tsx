import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  SlidersHorizontal, 
  Building, 
  Home, 
  LandPlot, 
  Search, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from './PropertyCard';

export const FeaturedPropertiesSection: React.FC = () => {
  const { 
    filteredProperties, 
    loadingProperties, 
    filters, 
    setFilters, 
    resetFilters,
    setIsAddModalOpen
  } = useProperties();
  const { user, setAuthModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  const tabs = [
    { label: 'All Properties', value: 'All' },
    { label: 'Houses', value: 'House' },
    { label: 'Apartments', value: 'Apartment' },
    { label: 'Plots & Land', value: 'Plot' },
    { label: 'Villas', value: 'Villa' },
    { label: 'For Sale', value: 'For Sale' },
    { label: 'For Rent', value: 'For Rent' }
  ];

  const handleTabClick = (tabValue: string) => {
    setActiveTab(tabValue);
    if (tabValue === 'All') {
      setFilters(prev => ({ ...prev, category: 'All', status: 'All' }));
    } else if (tabValue === 'For Sale' || tabValue === 'For Rent') {
      setFilters(prev => ({ ...prev, status: tabValue, category: 'All' }));
    } else {
      setFilters(prev => ({ ...prev, category: tabValue as any, status: 'All' }));
    }
  };

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  return (
    <section id="featured-properties" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Tab Navigation matching reference */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Verified Listings
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Properties
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {sortedProperties.length} available properties matching your criteria
            </p>
          </div>

          {/* Quick Tab Filters */}
          <div className="flex items-center flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = (tab.value === 'All' && filters.category === 'All' && filters.status === 'All') ||
                               (filters.category === tab.value) ||
                               (filters.status === tab.value);
              return (
                <button
                  key={tab.label}
                  onClick={() => handleTabClick(tab.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-toolbar: Search Input + Sorting */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/70 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search title, city, or features..."
              className="w-full pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {filters.searchQuery && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Listed</option>
              </select>
            </div>

            {/* Reset / Add Listing CTA */}
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (!user) setAuthModalOpen(true);
                else setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingProperties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-4">
                <div className="aspect-4/3 bg-slate-200 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
              </div>
            ))}
          </div>
        ) : sortedProperties.length > 0 ? (
          /* Property Cards Grid matching reference */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {sortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          /* Empty State with reset button */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No matching properties found</h3>
            <p className="text-xs text-slate-500 mb-6">
              We couldn't find any properties matching your current filters. Try resetting the filters or add a new property listing.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => {
                  if (!user) setAuthModalOpen(true);
                  else setIsAddModalOpen(true);
                }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                List a Property
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
