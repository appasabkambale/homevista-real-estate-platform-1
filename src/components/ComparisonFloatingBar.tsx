import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const ComparisonFloatingBar: React.FC = () => {
  const { comparisonList, toggleCompare, clearComparison, setIsComparisonModalOpen, properties } = useProperties();

  if (comparisonList.length === 0) return null;

  const selectedProps = comparisonList
    .map(id => properties.find(p => p.id === id))
    .filter((p): p is typeof properties[0] => p !== undefined);

  return (
    <aside 
      aria-label="Comparison dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Scale className="w-4 h-4" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {selectedProps.map(prop => (
            <div 
              key={prop.id}
              className="group relative flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg pl-1 pr-2 py-0.5 shrink-0 text-xs"
            >
              <img 
                src={prop.imageUrl} 
                alt={prop.title} 
                className="w-5 h-5 rounded-md object-cover" 
              />
              <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium text-slate-200">
                {prop.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompare(prop.id);
                }}
                className="text-slate-400 hover:text-rose-400 ml-0.5 p-0.5 rounded-full hover:bg-slate-700 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {selectedProps.length < 4 && (
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pl-1">
              +{4 - selectedProps.length} slot{4 - selectedProps.length > 1 ? 's' : ''} left
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <button
          onClick={clearComparison}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => setIsComparisonModalOpen(true)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-102"
        >
          <span>Compare ({selectedProps.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
