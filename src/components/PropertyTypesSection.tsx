import React from 'react';
import { 
  Building2, 
  Home, 
  Palmtree, 
  Building, 
  LandPlot, 
  Warehouse, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { PropertyCategory } from '../types';

interface TypeCard {
  title: string;
  category: PropertyCategory;
  listingsCount: string;
  icon: React.ReactNode;
  bgGradient: string;
}

const PROPERTY_TYPES: TypeCard[] = [
  {
    title: 'Apartments',
    category: 'Apartment',
    listingsCount: '1,245 Listings',
    icon: <Building2 className="w-8 h-8 text-blue-600" />,
    bgGradient: 'bg-blue-50/70 border-blue-100 group-hover:border-blue-300'
  },
  {
    title: 'Houses',
    category: 'House',
    listingsCount: '2,345 Listings',
    icon: <Home className="w-8 h-8 text-amber-600" />,
    bgGradient: 'bg-amber-50/70 border-amber-100 group-hover:border-amber-300'
  },
  {
    title: 'Villas',
    category: 'Villa',
    listingsCount: '856 Listings',
    icon: <Palmtree className="w-8 h-8 text-emerald-600" />,
    bgGradient: 'bg-emerald-50/70 border-emerald-100 group-hover:border-emerald-300'
  },
  {
    title: 'Condos',
    category: 'Condo',
    listingsCount: '1,032 Listings',
    icon: <Building className="w-8 h-8 text-indigo-600" />,
    bgGradient: 'bg-indigo-50/70 border-indigo-100 group-hover:border-indigo-300'
  },
  {
    title: 'Townhouses',
    category: 'Townhouse',
    listingsCount: '645 Listings',
    icon: <Warehouse className="w-8 h-8 text-purple-600" />,
    bgGradient: 'bg-purple-50/70 border-purple-100 group-hover:border-purple-300'
  },
  {
    title: 'Land & Plots',
    category: 'Plot',
    listingsCount: '321 Listings',
    icon: <LandPlot className="w-8 h-8 text-lime-600" />,
    bgGradient: 'bg-lime-50/70 border-lime-100 group-hover:border-lime-300'
  }
];

export const PropertyTypesSection: React.FC = () => {
  const { filters, setFilters } = useProperties();

  const handleSelectType = (cat: PropertyCategory) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === cat ? 'All' : cat
    }));

    const el = document.getElementById('featured-properties');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="property-types-section" className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching reference */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Property Types
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find homes, luxury estates, apartments, and open plots categorized for your needs
            </p>
          </div>

          <button 
            onClick={() => {
              setFilters(prev => ({ ...prev, category: 'All' }));
              const el = document.getElementById('featured-properties');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 6 Category Cards Grid matching reference UI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {PROPERTY_TYPES.map((type) => {
            const isSelected = filters.category === type.category;
            return (
              <div
                key={type.title}
                id={`property-type-${type.category.toLowerCase()}`}
                onClick={() => handleSelectType(type.category)}
                className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center hover:shadow-lg transform hover:-translate-y-1 ${
                  isSelected 
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-lg shadow-emerald-900/15' 
                    : `${type.bgGradient} bg-white text-slate-800 shadow-xs`
                }`}
              >
                <div className={`p-3 rounded-2xl mb-3.5 transition-transform duration-200 group-hover:scale-110 ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-white shadow-xs'
                }`}>
                  {type.icon}
                </div>
                
                <h3 className={`text-sm font-bold tracking-tight mb-1 ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}>
                  {type.title}
                </h3>
                
                <p className={`text-[11px] font-medium ${
                  isSelected ? 'text-emerald-100' : 'text-slate-500'
                }`}>
                  {type.listingsCount}
                </p>

                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-300"></span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
