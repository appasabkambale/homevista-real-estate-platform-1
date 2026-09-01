import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Property, NearbyPlace } from '../types';
import { useProperties } from '../context/PropertyContext';
import { 
  Maximize2, 
  MapPin, 
  ArrowRight,
  Footprints,
  GraduationCap,
  X,
  Compass,
  Home
} from 'lucide-react';

interface InteractiveMapFallbackProps {
  properties?: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: Property) => void;
  heightClass?: string;
  showCardPreview?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  showWalkRadius?: boolean;
  radarPlaces?: NearbyPlace[];
  singlePropertyMode?: boolean;
  propertyTitle?: string;
}

export const InteractiveMapFallback: React.FC<InteractiveMapFallbackProps> = ({
  properties = [],
  selectedPropertyId,
  onSelectProperty,
  heightClass = 'h-[550px] lg:h-[650px]',
  showCardPreview = true,
  center: explicitCenter,
  zoom: initialZoom = 12,
  showWalkRadius = false,
  radarPlaces = [],
  singlePropertyMode = false,
  propertyTitle = 'Property Location'
}) => {
  const { setSelectedProperty } = useProperties();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  
  // Viewport state (lat, lng, zoom)
  const [viewport, setViewport] = useState<{ lat: number; lng: number; zoom: number }>(() => {
    if (explicitCenter) {
      return { lat: explicitCenter.lat, lng: explicitCenter.lng, zoom: initialZoom };
    }
    const firstWithCoords = properties.find(p => p.coordinates);
    if (firstWithCoords && firstWithCoords.coordinates) {
      return { lat: firstWithCoords.coordinates.lat, lng: firstWithCoords.coordinates.lng, zoom: initialZoom };
    }
    return { lat: 39.5, lng: -98.35, zoom: 4 };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; lat: number; lng: number }>({ x: 0, y: 0, lat: 0, lng: 0 });

  // Sync selectedPropertyId
  useEffect(() => {
    if (selectedPropertyId) {
      const prop = properties.find(p => p.id === selectedPropertyId);
      if (prop) {
        setActiveProperty(prop);
        if (prop.coordinates) {
          setViewport({ lat: prop.coordinates.lat, lng: prop.coordinates.lng, zoom: 14 });
        }
      }
    }
  }, [selectedPropertyId, properties]);

  // Sync explicit center changes
  useEffect(() => {
    if (explicitCenter) {
      setViewport(prev => ({ ...prev, lat: explicitCenter.lat, lng: explicitCenter.lng, zoom: initialZoom }));
    }
  }, [explicitCenter?.lat, explicitCenter?.lng, initialZoom]);

  const validProperties = useMemo(() => {
    return properties.filter(
      p => p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number'
    );
  }, [properties]);

  const formatPriceShort = (price: number, status: string) => {
    if (status === 'For Rent') {
      return `$${(price / 1000).toFixed(1)}k/mo`;
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 2)}M`;
    }
    return `$${Math.round(price / 1000)}k`;
  };

  // Convert lat/lng to container pixel coordinates via Web Mercator projection
  const latLngToPixel = (lat: number, lng: number, width: number, height: number) => {
    const scale = 256 * Math.pow(2, viewport.zoom);
    
    const worldCoordX = ((lng + 180) / 360) * scale;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const clampedSinLat = Math.max(-0.9999, Math.min(0.9999, sinLat));
    const worldCoordY = (0.5 - Math.log((1 + clampedSinLat) / (1 - clampedSinLat)) / (4 * Math.PI)) * scale;

    const centerWorldX = ((viewport.lng + 180) / 360) * scale;
    const centerSinLat = Math.sin((viewport.lat * Math.PI) / 180);
    const centerClamped = Math.max(-0.9999, Math.min(0.9999, centerSinLat));
    const centerWorldY = (0.5 - Math.log((1 + centerClamped) / (1 - centerClamped)) / (4 * Math.PI)) * scale;

    const px = width / 2 + (worldCoordX - centerWorldX);
    const py = height / 2 + (worldCoordY - centerWorldY);

    return { x: px, y: py };
  };

  // Calculate visible tiles for high performance tile layer rendering
  const tiles = useMemo(() => {
    if (!containerRef.current) return [];
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;
    const z = Math.round(viewport.zoom);
    const scale = 256 * Math.pow(2, z);

    const centerWorldX = ((viewport.lng + 180) / 360) * scale;
    const centerSinLat = Math.sin((viewport.lat * Math.PI) / 180);
    const centerClamped = Math.max(-0.9999, Math.min(0.9999, centerSinLat));
    const centerWorldY = (0.5 - Math.log((1 + centerClamped) / (1 - centerClamped)) / (4 * Math.PI)) * scale;

    const minX = centerWorldX - width / 2;
    const maxX = centerWorldX + width / 2;
    const minY = centerWorldY - height / 2;
    const maxY = centerWorldY + height / 2;

    const minTileX = Math.floor(minX / 256);
    const maxTileX = Math.floor(maxX / 256);
    const minTileY = Math.floor(minY / 256);
    const maxTileY = Math.floor(maxY / 256);

    const tileList: Array<{ key: string; url: string; left: number; top: number }> = [];
    const maxIndex = Math.pow(2, z);

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty >= 0 && ty < maxIndex) {
          const normTx = ((tx % maxIndex) + maxIndex) % maxIndex;
          const left = tx * 256 - (centerWorldX - width / 2);
          const top = ty * 256 - (centerWorldY - height / 2);
          
          const url = mapType === 'satellite'
            ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${normTx}`
            : `https://tile.openstreetmap.org/${z}/${normTx}/${ty}.png`;

          tileList.push({
            key: `${z}-${normTx}-${ty}-${mapType}`,
            url,
            left,
            top
          });
        }
      }
    }
    return tileList;
  }, [viewport.lat, viewport.lng, viewport.zoom, mapType]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: viewport.lat,
      lng: viewport.lng
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const scale = 256 * Math.pow(2, viewport.zoom);
    const dLng = (-dx / scale) * 360;
    const dLat = (dy / scale) * 180;

    setViewport(prev => ({
      ...prev,
      lat: Math.max(-85, Math.min(85, dragStartRef.current.lat + dLat)),
      lng: ((dragStartRef.current.lng + dLng + 180) % 360) - 180
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, zoom: Math.min(19, prev.zoom + 1) }));
  };

  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, zoom: Math.max(2, prev.zoom - 1) }));
  };

  const handleFitAll = () => {
    if (validProperties.length === 0) return;
    if (validProperties.length === 1) {
      setViewport({
        lat: validProperties[0].coordinates!.lat,
        lng: validProperties[0].coordinates!.lng,
        zoom: 14
      });
      return;
    }
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    validProperties.forEach(p => {
      minLat = Math.min(minLat, p.coordinates!.lat);
      maxLat = Math.max(maxLat, p.coordinates!.lat);
      minLng = Math.min(minLng, p.coordinates!.lng);
      maxLng = Math.max(maxLng, p.coordinates!.lng);
    });
    setViewport({
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
      zoom: 11
    });
  };

  // Dimensions for marker positioning
  const containerWidth = containerRef.current?.clientWidth || 800;
  const containerHeight = containerRef.current?.clientHeight || 600;

  // Walk radius pixel dimensions
  const walkMetersToPixels = (meters: number) => {
    const latRad = (viewport.lat * Math.PI) / 180;
    const metersPerPixel = (156543.03392 * Math.cos(latRad)) / Math.pow(2, viewport.zoom);
    return meters / metersPerPixel;
  };

  const radius5MinPx = walkMetersToPixels(450);
  const radius10MinPx = walkMetersToPixels(850);
  const singleCenterPos = explicitCenter ? latLngToPixel(explicitCenter.lat, explicitCenter.lng, containerWidth, containerHeight) : null;

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100 flex flex-col select-none cursor-grab active:cursor-grabbing`}
    >
      {/* Tile Map Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {tiles.map(tile => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            loading="lazy"
            className="absolute w-[256px] h-[256px] object-cover transition-opacity duration-200"
            style={{
              left: `${tile.left}px`,
              top: `${tile.top}px`
            }}
          />
        ))}
      </div>

      {/* Walk Radius Circles Overlay */}
      {showWalkRadius && singleCenterPos && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* 10 min walk circle */}
          <circle
            cx={singleCenterPos.x}
            cy={singleCenterPos.y}
            r={radius10MinPx}
            fill="#60a5fa"
            fillOpacity="0.1"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* 5 min walk circle */}
          <circle
            cx={singleCenterPos.x}
            cy={singleCenterPos.y}
            r={radius5MinPx}
            fill="#10b981"
            fillOpacity="0.16"
            stroke="#059669"
            strokeWidth="2"
          />
        </svg>
      )}

      {/* Markers Layer */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Single Property Mode Center Pin */}
        {singlePropertyMode && singleCenterPos && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer"
            style={{ left: `${singleCenterPos.x}px`, top: `${singleCenterPos.y}px` }}
          >
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-emerald-500/40">
                <Home className="w-5 h-5" />
              </div>
              <div className="w-3 h-3 bg-emerald-700 rotate-45 mx-auto -mt-1 shadow-xs border-r-2 border-b-2 border-white" />
            </div>
          </div>
        )}

        {/* Multi-Property Listings Markers */}
        {!singlePropertyMode && validProperties.map(prop => {
          const isSelected = activeProperty?.id === prop.id;
          const pos = latLngToPixel(prop.coordinates!.lat, prop.coordinates!.lng, containerWidth, containerHeight);
          const priceText = formatPriceShort(prop.price, prop.status);
          const isRent = prop.status === 'For Rent';

          // Skip rendering if off screen
          if (pos.x < -100 || pos.x > containerWidth + 100 || pos.y < -100 || pos.y > containerHeight + 100) {
            return null;
          }

          return (
            <div
              key={prop.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveProperty(prop);
                if (onSelectProperty) onSelectProperty(prop);
              }}
              className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer"
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            >
              <div className={`group transition-all duration-200 transform select-none ${
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
            </div>
          );
        })}
      </div>

      {/* Floating Header Info */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/80 text-xs font-bold text-slate-800 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          {singlePropertyMode ? propertyTitle : `${properties.length} Properties on Radar`}
        </span>
      </div>

      {/* Map Type & Zoom Control Panel */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* Map / Satellite Switcher */}
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
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Zoom Controls */}
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
          {!singlePropertyMode && (
            <button
              onClick={handleFitAll}
              className="p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
              title="Fit All Properties"
              aria-label="Fit All Properties"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Property Floating Preview Card */}
      {showCardPreview && !singlePropertyMode && activeProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-30 animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto">
          <div className="bg-white/98 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-slate-200/90 flex gap-3.5 relative">
            <button
              onClick={() => setActiveProperty(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer z-10"
              aria-label="Close preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Thumbnail */}
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

            {/* Details */}
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

              {/* Radar Scores Preview */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-1">
                {activeProperty.neighborhoodRadar && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100" title="WalkScore">
                    <Footprints className="w-3 h-3 text-emerald-600" />
                    <span>Walk {activeProperty.neighborhoodRadar.walkScore}</span>
                  </div>
                )}
                {activeProperty.neighborhoodRadar && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100" title="School Rating">
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
