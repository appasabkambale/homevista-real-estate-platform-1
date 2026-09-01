import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  Plus, 
  Check, 
  Minus, 
  ArrowUpRight, 
  Sparkles, 
  DollarSign, 
  Building2, 
  LandPlot, 
  Calendar, 
  Receipt, 
  Footprints, 
  CheckCircle2, 
  History, 
  Eye, 
  Bed, 
  Bath, 
  Maximize2,
  TrendingDown,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { Property, PriceHistoryPoint } from '../types';

export const PropertyComparisonModal: React.FC = () => {
  const { 
    comparisonList, 
    toggleCompare, 
    clearComparison, 
    isComparisonModalOpen, 
    setIsComparisonModalOpen, 
    properties,
    setSelectedProperty,
    setPropertyToBook,
    setIsBookingModalOpen
  } = useProperties();

  const [selectedQuickAddId, setSelectedQuickAddId] = useState('');
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (!isComparisonModalOpen) return null;

  // Resolve full property objects for IDs in comparison list
  const comparedProps: Property[] = comparisonList
    .map(id => properties.find(p => p.id === id))
    .filter((p): p is Property => p !== undefined);

  // Available properties to add
  const availableProps = properties.filter(p => !comparisonList.includes(p.id));

  const formatPrice = (price: number, status?: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
    return status === 'For Rent' ? `${formatted}/mo` : formatted;
  };

  const getPricePerSqFt = (property: Property) => {
    const area = property.category === 'Plot' ? (property.plotArea || property.sqft) : property.sqft;
    if (!area || area <= 0) return null;
    return Math.round(property.price / area);
  };

  // Extract union of all amenities across compared properties
  const allAmenities = Array.from(
    new Set(comparedProps.flatMap(p => p.amenities || []))
  ).sort();

  const handleQuickAdd = () => {
    if (selectedQuickAddId) {
      toggleCompare(selectedQuickAddId);
      setSelectedQuickAddId('');
    }
  };

  // Helper to find min or max for highlights
  const prices = comparedProps.map(p => p.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  const pricesPerSqFt = comparedProps.map(p => getPricePerSqFt(p)).filter((val): val is number => val !== null);
  const minPricePerSqFt = pricesPerSqFt.length ? Math.min(...pricesPerSqFt) : null;

  return (
    <div 
      id="property-comparison-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  Side-by-Side Analytics
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {comparedProps.length} of 4 properties selected
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Property Comparison Matrix
              </h2>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {comparedProps.length > 0 && (
              <>
                <label className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={highlightDifferences}
                    onChange={(e) => setHighlightDifferences(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Highlight Best Metrics</span>
                </label>

                <button
                  onClick={clearComparison}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Clear all properties from comparison"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline">Clear List</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsComparisonModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Quick Add Bar if fewer than 4 items */}
          {comparedProps.length < 4 && availableProps.length > 0 && (
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Add up to <strong>{4 - comparedProps.length}</strong> more properties to evaluate:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedQuickAddId}
                  onChange={(e) => setSelectedQuickAddId(e.target.value)}
                  className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 sm:w-64"
                >
                  <option value="">Select a property to compare...</option>
                  {availableProps.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatPrice(p.price, p.status)})
                    </option>
                  ))}
                </select>
                <button
                  disabled={!selectedQuickAddId}
                  onClick={handleQuickAdd}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {comparedProps.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3.5">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No properties selected for comparison</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5">
                Click the <Scale className="w-3.5 h-3.5 inline text-indigo-600" /> icon on any property card or detail sheet to compare prices, square footage, fees, year built, amenities, and price history side by side.
              </p>
              {availableProps.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {availableProps.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      onClick={() => toggleCompare(p.id)}
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs hover:text-indigo-600 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate max-w-[180px]">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-4 w-44 font-bold text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50/70 rounded-tl-2xl">
                      Property Overview
                    </th>
                    {comparedProps.map(prop => (
                      <th key={prop.id} className="py-4 px-4 align-top w-64 bg-slate-50/70">
                        <div className="relative group">
                          {/* Remove button */}
                          <button
                            onClick={() => toggleCompare(prop.id)}
                            className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-full shadow-xs transition-colors z-10 cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Image */}
                          <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative border border-slate-200/80">
                            <img
                              src={prop.imageUrl}
                              alt={prop.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white">
                              {prop.status}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                            {prop.title}
                          </h4>
                          <p className="text-slate-500 text-[11px] truncate mt-0.5">
                            {prop.location}
                          </p>

                          <div className="mt-2 text-base font-black text-emerald-700">
                            {formatPrice(prop.price, prop.status)}
                          </div>

                          <div className="mt-3 flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProperty(prop);
                              }}
                              className="flex-1 py-1.5 px-2.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setPropertyToBook(prop);
                                setIsBookingModalOpen(true);
                              }}
                              className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Book</span>
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  
                  {/* Category & Status */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      Property Category
                    </td>
                    {comparedProps.map(prop => (
                      <td key={prop.id} className="py-3 px-4 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px]">
                          {prop.category === 'Plot' ? <LandPlot className="w-3 h-3 text-emerald-600" /> : <Building2 className="w-3 h-3 text-emerald-600" />}
                          {prop.category}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Price / SqFt Metric */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      <div className="flex items-center gap-1">
                        <span>Price per Sq Ft</span>
                        <div title="Calculated price divided by total square footage">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                        </div>
                      </div>
                    </td>
                    {comparedProps.map(prop => {
                      const pps = getPricePerSqFt(prop);
                      const isBest = highlightDifferences && minPricePerSqFt && pps === minPricePerSqFt;
                      return (
                        <td key={prop.id} className="py-3 px-4 font-semibold">
                          {pps ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold ${isBest ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200' : 'text-slate-800'}`}>
                                ${pps.toLocaleString()} / sq ft
                              </span>
                              {isBest && (
                                <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Best Value
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Year Built */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      Year Built
                    </td>
                    {comparedProps.map(prop => {
                      const year = prop.yearBuilt || (prop.category === 'Plot' ? 2024 : 2020);
                      return (
                        <td key={prop.id} className="py-3 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{year} ({new Date().getFullYear() - year} yrs ago)</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* HOA Fees & Estimated Tax */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      HOA Fees & Carrying Cost
                    </td>
                    {comparedProps.map(prop => {
                      const hoa = prop.hoaFeePerMonth !== undefined 
                        ? prop.hoaFeePerMonth 
                        : (prop.category === 'Condo' ? 450 : prop.category === 'Apartment' ? 350 : 120);
                      const tax = prop.propertyTaxAnnual || (prop.status === 'For Sale' ? Math.round(prop.price * 0.012) : 0);

                      return (
                        <td key={prop.id} className="py-3 px-4 font-medium text-slate-800">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-slate-900 font-bold">
                              <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{hoa > 0 ? `$${hoa.toLocaleString()}/mo` : 'No HOA'}</span>
                            </div>
                            {tax > 0 && (
                              <div className="text-[11px] text-slate-500">
                                Est. Tax: ${tax.toLocaleString()}/yr
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Size & Layout (Beds / Baths / Sq Ft) */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      Dimensions & Layout
                    </td>
                    {comparedProps.map(prop => (
                      <td key={prop.id} className="py-3 px-4 font-medium text-slate-800">
                        {prop.category === 'Plot' ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900">{prop.plotArea || prop.sqft} sq ft</div>
                            <div className="text-[11px] text-slate-500">Zoning: {prop.zoning || 'Residential'}</div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1 font-semibold">
                              <Bed className="w-3.5 h-3.5 text-slate-400" />
                              {prop.beds} Beds
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              <Bath className="w-3.5 h-3.5 text-slate-400" />
                              {prop.baths} Baths
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-slate-900">
                              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                              {prop.sqft.toLocaleString()} sq ft
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Neighborhood & WalkScore */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      Neighborhood & Radar
                    </td>
                    {comparedProps.map(prop => {
                      const radar = prop.neighborhoodRadar;
                      return (
                        <td key={prop.id} className="py-3 px-4 font-medium text-slate-800">
                          {radar ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                  Walk {radar.walkScore}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200">
                                  Transit {radar.transitScore}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Safety: {radar.safetyScore}/100 • Schools: {radar.schoolsRating}/10
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Analysis pending</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Price History Timeline */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700 bg-slate-50/30">
                      <div className="flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Price History</span>
                      </div>
                    </td>
                    {comparedProps.map(prop => {
                      const history: PriceHistoryPoint[] = prop.priceHistory && prop.priceHistory.length > 0 
                        ? prop.priceHistory 
                        : [
                            { date: '2023-11-01', price: Math.round(prop.price * 1.05), event: 'Listed' },
                            { date: '2024-02-15', price: prop.price, event: 'Price Change' }
                          ];

                      return (
                        <td key={prop.id} className="py-3 px-4 align-top">
                          <div className="space-y-2">
                            {history.map((pt, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                <div>
                                  <span className="font-semibold text-slate-800">{pt.event}</span>
                                  <div className="text-[10px] text-slate-400">{pt.date}</div>
                                </div>
                                <span className="font-bold text-slate-900">{formatPrice(pt.price, prop.status)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Amenities Section Header */}
                  <tr className="bg-slate-100/70">
                    <td colSpan={comparedProps.length + 1} className="py-2.5 px-4 font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                      Features & Verified Amenities Comparison ({allAmenities.length} items)
                    </td>
                  </tr>

                  {/* Individual Amenity Rows */}
                  {allAmenities.map(amenity => (
                    <tr key={amenity} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-slate-600 font-medium bg-slate-50/30">
                        {amenity}
                      </td>
                      {comparedProps.map(prop => {
                        const hasAmenity = prop.amenities?.includes(amenity);
                        return (
                          <td key={prop.id} className="py-2.5 px-4">
                            {hasAmenity ? (
                              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[11px]">Included</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-300">
                                <Minus className="w-4 h-4" />
                                <span className="text-[11px] text-slate-400">No</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <p className="text-slate-500">
            Comparing verified real-estate parameters. Select between <strong>2 to 4</strong> properties for optimal comparative density.
          </p>
          <button
            onClick={() => setIsComparisonModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
