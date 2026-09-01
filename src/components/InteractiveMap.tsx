import React, { useEffect, useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus
} from '@vis.gl/react-google-maps';
import { Property } from '../types';
import { useProperties } from '../context/PropertyContext';
import { 
  Maximize2, 
  MapPin, 
  ArrowRight,
  Footprints,
  GraduationCap,
  X
} from 'lucide-react';
import { InteractiveMapFallback } from './InteractiveMapFallback';

interface InteractiveMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: Property) => void;
  heightClass?: string;
  showCardPreview?: boolean;
}

// Inner helper component to manage camera bounds and pan actions
const MapBoundsController: React.FC<{
  properties: Property[];
  activeProperty: Property | null;
}> = ({ properties, activeProperty }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const validProps = properties.filter(
      p => p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number'
    );

    if (validProps.length === 0) return;

    if (activeProperty && activeProperty.coordinates) {
      map.panTo({
        lat: activeProperty.coordinates.lat,
        lng: activeProperty.coordinates.lng
      });
      map.setZoom(14);
      return;
    }

    if (validProps.length === 1) {
      map.panTo({
        lat: validProps[0].coordinates!.lat,
        lng: validProps[0].coordinates!.lng
      });
      map.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    validProps.forEach(prop => {
      bounds.extend({
        lat: prop.coordinates!.lat,
        lng: prop.coordinates!.lng
      });
    });

    map.fitBounds(bounds, {
      top: 60,
      right: 60,
      bottom: 80,
      left: 60
    });
  }, [map, properties, activeProperty?.id]);

  return null;
};

// Custom Google Maps Control Panel
const MapCustomControls: React.FC<{
  mapType: 'roadmap' | 'hybrid';
  setMapType: (type: 'roadmap' | 'hybrid') => void;
  properties: Property[];
}> = ({ mapType, setMapType, properties }) => {
  const map = useMap();

  const handleZoomIn = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 10) + 1);
  };

  const handleZoomOut = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 10) - 1);
  };

  const handleFitAll = () => {
    if (!map) return;
    const validProps = properties.filter(
      p => p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number'
    );
    if (validProps.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    validProps.forEach(prop => {
      bounds.extend({
        lat: prop.coordinates!.lat,
        lng: prop.coordinates!.lng
      });
    });
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 80, left: 60 });
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
      {/* Map / Satellite Layer Switcher */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 p-1 flex items-center">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mapType === 'roadmap'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mapType === 'hybrid'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Zoom and Fit View Buttons */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 flex flex-col divide-y divide-slate-100 overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors font-bold text-base cursor-pointer flex items-center justify-center"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors font-bold text-base cursor-pointer flex items-center justify-center"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleFitAll}
          className="p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
          title="Fit All Properties"
          aria-label="Fit All Properties"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Inner Google Maps renderer with status checking
const GoogleMapInner: React.FC<{
  properties: Property[];
  activeProperty: Property | null;
  setActiveProperty: (p: Property | null) => void;
  onSelectProperty?: (property: Property) => void;
  heightClass: string;
  showCardPreview: boolean;
  onAuthError: () => void;
}> = ({
  properties,
  activeProperty,
  setActiveProperty,
  onSelectProperty,
  heightClass,
  showCardPreview,
  onAuthError
}) => {
  const { setSelectedProperty } = useProperties();
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const loadingStatus = useApiLoadingStatus();

  useEffect(() => {
    if (loadingStatus === APILoadingStatus.AUTH_FAILURE || loadingStatus === APILoadingStatus.FAILED) {
      onAuthError();
    }
  }, [loadingStatus, onAuthError]);

  const formatPriceShort = (price: number, status: string) => {
    if (status === 'For Rent') {
      return `$${(price / 1000).toFixed(1)}k/mo`;
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 2)}M`;
    }
    return `$${Math.round(price / 1000)}k`;
  };

  const validProperties = useMemo(() => {
    return properties.filter(
      p => p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number'
    );
  }, [properties]);

  const initialCenter = useMemo(() => {
    if (validProperties.length > 0) {
      return {
        lat: validProperties[0].coordinates!.lat,
        lng: validProperties[0].coordinates!.lng
      };
    }
    return { lat: 39.5, lng: -98.35 };
  }, [validProperties]);

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100 flex flex-col`}>
      <Map
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={initialCenter}
        defaultZoom={validProperties.length > 1 ? 5 : 12}
        mapTypeId={mapType}
        gestureHandling="greedy"
        disableDefaultUI={true}
        className="w-full h-full"
      >
        <MapBoundsController properties={validProperties} activeProperty={activeProperty} />
        <MapCustomControls mapType={mapType} setMapType={setMapType} properties={validProperties} />

        {validProperties.map((prop) => {
          const isSelected = activeProperty?.id === prop.id;
          const priceText = formatPriceShort(prop.price, prop.status);
          const isRent = prop.status === 'For Rent';

          return (
            <AdvancedMarker
              key={prop.id}
              position={{
                lat: prop.coordinates!.lat,
                lng: prop.coordinates!.lng
              }}
              title={prop.title}
              zIndex={isSelected ? 100 : 10}
              onClick={() => {
                setActiveProperty(prop);
                if (onSelectProperty) onSelectProperty(prop);
              }}
            >
              <div className={`group cursor-pointer transition-all duration-200 transform select-none ${
                isSelected ? 'scale-115 z-50' : 'hover:scale-110 z-10'
              }`}>
                <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg flex items-center gap-1.5 border-2 transition-all ${
                  isSelected 
                    ? 'bg-emerald-700 text-white border-white ring-4 ring-emerald-500/40 shadow-emerald-950/40' 
                    : isRent
                      ? 'bg-slate-900 text-white border-slate-700 hover:bg-emerald-700 hover:border-white'
                      : 'bg-white text-slate-900 border-emerald-700 hover:bg-emerald-700 hover:text-white'
                }`}>
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white animate-ping' : isRent ? 'bg-emerald-400' : 'bg-emerald-600'
                  }`} />
                  <span>{priceText}</span>
                </div>
                <div className={`w-2.5 h-2.5 rotate-45 mx-auto -mt-1 shadow-xs ${
                  isSelected 
                    ? 'bg-emerald-700' 
                    : isRent 
                      ? 'bg-slate-900' 
                      : 'bg-white border-r-2 border-b-2 border-emerald-700'
                }`} />
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Floating Header Info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/80 text-xs font-bold text-slate-800 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{properties.length} Properties on Google Maps Radar</span>
      </div>

      {/* Selected Property Preview */}
      {showCardPreview && activeProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-20 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-white/98 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-slate-200/90 flex gap-3.5 relative">
            <button
              onClick={() => setActiveProperty(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer z-10"
              aria-label="Close preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 relative bg-slate-100">
              <img
                src={activeProperty.imageUrl}
                alt={activeProperty.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedProperty(activeProperty)}
              />
              <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                activeProperty.status === 'For Sale' ? 'bg-blue-600' : 'bg-slate-900'
              }`}>
                {activeProperty.status}
              </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between pr-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                    {activeProperty.status === 'For Rent'
                      ? `$${activeProperty.price.toLocaleString()}/mo`
                      : `$${activeProperty.price.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {activeProperty.category}
                  </span>
                </div>

                <h4 
                  onClick={() => setSelectedProperty(activeProperty)}
                  className="font-bold text-xs sm:text-sm text-slate-900 truncate hover:text-emerald-700 cursor-pointer mt-0.5"
                >
                  {activeProperty.title}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeProperty.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-1">
                {activeProperty.neighborhoodRadar && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    <Footprints className="w-3 h-3 text-emerald-600" />
                    <span>Walk {activeProperty.neighborhoodRadar.walkScore}</span>
                  </div>
                )}
                {activeProperty.neighborhoodRadar && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    <span>School {activeProperty.neighborhoodRadar.schoolsRating}/10</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedProperty(activeProperty)}
                  className="ml-auto text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  heightClass = 'h-[550px] lg:h-[650px]',
  showCardPreview = true
}) => {
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  const rawApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = typeof rawApiKey === 'string' && rawApiKey.trim().length > 5;

  useEffect(() => {
    if (selectedPropertyId) {
      const prop = properties.find(p => p.id === selectedPropertyId);
      if (prop) setActiveProperty(prop);
    }
  }, [selectedPropertyId, properties]);

  // Global auth failure handler for Google Maps
  useEffect(() => {
    const prevAuthFailure = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure: () => void }).gm_authFailure = () => {
      setGoogleMapsError(true);
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
    };
    return () => {
      (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = prevAuthFailure;
    };
  }, []);

  if (!hasApiKey || googleMapsError) {
    return (
      <InteractiveMapFallback
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onSelectProperty={onSelectProperty}
        heightClass={heightClass}
        showCardPreview={showCardPreview}
      />
    );
  }

  return (
    <APIProvider apiKey={rawApiKey} libraries={['marker', 'geometry']}>
      <GoogleMapInner
        properties={properties}
        activeProperty={activeProperty}
        setActiveProperty={setActiveProperty}
        onSelectProperty={onSelectProperty}
        heightClass={heightClass}
        showCardPreview={showCardPreview}
        onAuthError={() => setGoogleMapsError(true)}
      />
    </APIProvider>
  );
};
