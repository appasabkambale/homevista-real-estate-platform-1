import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus
} from '@vis.gl/react-google-maps';
import { Property, NearbyPlace, PlaceCategory } from '../types';
import { 
  Footprints, 
  Bus, 
  ShieldCheck, 
  GraduationCap, 
  Volume2, 
  MapPin, 
  ShoppingCart, 
  Trees, 
  HeartPulse, 
  Coffee, 
  Compass, 
  Star, 
  Clock,
  Home
} from 'lucide-react';
import { InteractiveMapFallback } from './InteractiveMapFallback';

interface NeighborhoodRadarSectionProps {
  property: Property;
}

// Helper to draw 5-min and 10-min walk radius circles on Google Map
const WalkRadiusCircles: React.FC<{
  center: { lat: number; lng: number };
}> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const circle5Min = new google.maps.Circle({
      map,
      center,
      radius: 450,
      strokeColor: '#059669',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.12,
      clickable: false
    });

    const circle10Min = new google.maps.Circle({
      map,
      center,
      radius: 850,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
      fillColor: '#60a5fa',
      fillOpacity: 0.06,
      clickable: false
    });

    return () => {
      circle5Min.setMap(null);
      circle10Min.setMap(null);
    };
  }, [map, center.lat, center.lng]);

  return null;
};

// Map Pan Controller for Selected Property
const MapCenterController: React.FC<{
  center: { lat: number; lng: number };
}> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(15);
  }, [map, center.lat, center.lng]);

  return null;
};

// Inner Google Maps Radar
const GoogleMapsRadarView: React.FC<{
  coords: { lat: number; lng: number };
  propertyTitle: string;
  noiseLevel: string;
  onAuthError: () => void;
}> = ({ coords, propertyTitle, noiseLevel, onAuthError }) => {
  const loadingStatus = useApiLoadingStatus();

  useEffect(() => {
    if (loadingStatus === APILoadingStatus.AUTH_FAILURE || loadingStatus === APILoadingStatus.FAILED) {
      onAuthError();
    }
  }, [loadingStatus, onAuthError]);

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner h-64 sm:h-72">
      <Map
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={{ lat: coords.lat, lng: coords.lng }}
        defaultZoom={15}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        className="w-full h-full"
      >
        <MapCenterController center={{ lat: coords.lat, lng: coords.lng }} />
        <WalkRadiusCircles center={{ lat: coords.lat, lng: coords.lng }} />

        <AdvancedMarker
          position={{ lat: coords.lat, lng: coords.lng }}
          title={propertyTitle}
          zIndex={100}
        >
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-emerald-500/40">
              <Home className="w-5 h-5" />
            </div>
            <div className="w-3 h-3 bg-emerald-700 rotate-45 mx-auto -mt-1 shadow-xs border-r-2 border-b-2 border-white" />
          </div>
        </AdvancedMarker>
      </Map>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-3 text-[11px] font-bold text-slate-700 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span>5 min walk (0.25 mi)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
          <span>10 min walk (0.5 mi)</span>
        </div>
      </div>

      {/* Noise Level Tag */}
      <div className="absolute top-3 right-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold flex items-center gap-1.5 pointer-events-none">
        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>{noiseLevel}</span>
      </div>
    </div>
  );
};

export const NeighborhoodRadarSection: React.FC<NeighborhoodRadarSectionProps> = ({ property }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | PlaceCategory>('all');
  const [, setHoveredPlace] = useState<NearbyPlace | null>(null);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  const radar = property.neighborhoodRadar;
  const coords = property.coordinates || { lat: 30.2672, lng: -97.7431 };
  const rawApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = typeof rawApiKey === 'string' && rawApiKey.trim().length > 5;

  const places = radar?.nearbyPlaces || [];
  const filteredPlaces = selectedCategory === 'all'
    ? places
    : places.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (cat: PlaceCategory) => {
    switch (cat) {
      case 'school': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'transit': return <Bus className="w-4 h-4 text-indigo-600" />;
      case 'grocery': return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'park': return <Trees className="w-4 h-4 text-emerald-700" />;
      case 'hospital': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'cafe':
      case 'restaurant': return <Coffee className="w-4 h-4 text-amber-600" />;
      default: return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
              Google Maps Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">• Live Radar</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            Neighborhood Radar & WalkScore
          </h3>
        </div>
      </div>

      {/* 4 Major Radar Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. WalkScore */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">WalkScore®</span>
            <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-700">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{radar?.walkScore || 88}</span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1 line-clamp-1">
              {radar?.walkScoreLabel || "Walker's Paradise"}
            </p>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${radar?.walkScore || 88}%` }}
            />
          </div>
        </div>

        {/* 2. Transit Score */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Transit Score</span>
            <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{radar?.transitScore || 82}</span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] font-semibold text-blue-700 mt-1 line-clamp-1">
              {radar?.transitScoreLabel || "Excellent Transit Options"}
            </p>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${radar?.transitScore || 82}%` }}
            />
          </div>
        </div>

        {/* 3. Safety Index */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Safety Index</span>
            <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{radar?.safetyScore || 94}</span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1 line-clamp-1">
              {radar?.safetyLabel || "Top 5% Safest District"}
            </p>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${radar?.safetyScore || 94}%` }}
            />
          </div>
        </div>

        {/* 4. Schools Rating */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">School District</span>
            <div className="p-1.5 rounded-lg bg-indigo-100/70 text-indigo-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{radar?.schoolsRating || 9.4}</span>
              <span className="text-xs text-slate-400 font-bold">/ 10</span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-700 mt-1 line-clamp-1">
              {radar?.schoolsLabel || "A+ Rated Academic Zone"}
            </p>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${((radar?.schoolsRating || 9.4) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Embedded Map with Walk Radius */}
      {hasApiKey && !googleMapsError ? (
        <APIProvider apiKey={rawApiKey} libraries={['marker', 'geometry']}>
          <GoogleMapsRadarView
            coords={coords}
            propertyTitle={property.title}
            noiseLevel={radar?.noiseLevel || 'Quiet & Serene (32 dB)'}
            onAuthError={() => setGoogleMapsError(true)}
          />
        </APIProvider>
      ) : (
        <div className="relative">
          <InteractiveMapFallback
            center={coords}
            zoom={15}
            heightClass="h-64 sm:h-72"
            showWalkRadius={true}
            singlePropertyMode={true}
            propertyTitle={property.title}
          />
          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-3 text-[11px] font-bold text-slate-700 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              <span>5 min walk (0.25 mi)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
              <span>10 min walk (0.5 mi)</span>
            </div>
          </div>
          {/* Noise Level Tag */}
          <div className="absolute top-3 right-3 z-30 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold flex items-center gap-1.5 pointer-events-none">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{radar?.noiseLevel || 'Quiet & Serene (32 dB)'}</span>
          </div>
        </div>
      )}

      {/* Nearby Amenities & Points of Interest */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Nearby Amenities & Distance Radar</span>
          </h4>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('school')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === 'school'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Schools</span>
            </button>
            <button
              onClick={() => setSelectedCategory('transit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === 'transit'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bus className="w-3 h-3" />
              <span>Transit</span>
            </button>
            <button
              onClick={() => setSelectedCategory('grocery')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === 'grocery'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Groceries</span>
            </button>
            <button
              onClick={() => setSelectedCategory('park')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === 'park'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Trees className="w-3 h-3" />
              <span>Parks</span>
            </button>
          </div>
        </div>

        {/* Places List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredPlaces.map((place, idx) => (
            <div 
              key={idx} 
              onMouseEnter={() => setHoveredPlace(place)}
              onMouseLeave={() => setHoveredPlace(null)}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(place.category)}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{place.name}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5 font-semibold text-emerald-700">
                      <Clock className="w-3 h-3" />
                      {place.timeWalk}
                    </span>
                    <span>•</span>
                    <span>{place.distance}</span>
                  </div>
                </div>
              </div>

              {place.rating && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-extrabold shrink-0">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{place.rating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
