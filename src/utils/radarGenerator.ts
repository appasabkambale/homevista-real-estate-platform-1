import { Coordinates, NeighborhoodRadar, NearbyPlace } from '../types';

export const CITY_COORDINATES: Record<string, Coordinates> = {
  miami: { lat: 25.7781, lng: -80.1313 },
  'new york': { lat: 40.7535, lng: -73.9754 },
  ny: { lat: 40.7535, lng: -73.9754 },
  nyc: { lat: 40.7535, lng: -73.9754 },
  austin: { lat: 30.2985, lng: -97.7420 },
  chicago: { lat: 41.8860, lng: -87.6247 },
  scottsdale: { lat: 33.5092, lng: -111.8990 },
  'beverly hills': { lat: 34.0900, lng: -118.4065 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  la: { lat: 34.0522, lng: -118.2437 },
  boulder: { lat: 40.0150, lng: -105.2705 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  denver: { lat: 39.7392, lng: -104.9903 },
  dallas: { lat: 32.7767, lng: -96.7970 },
  houston: { lat: 29.7604, lng: -95.3698 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  sf: { lat: 37.7749, lng: -122.4194 },
  boston: { lat: 42.3601, lng: -71.0589 },
  atlanta: { lat: 33.7490, lng: -84.3880 }
};

export function getCoordinatesForLocation(city: string, location?: string): Coordinates {
  const normCity = (city || '').toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normCity.includes(key) || (location && location.toLowerCase().includes(key))) {
      // Add slight randomized jitter for multiple properties in same city so pins don't directly overlap
      const jitterLat = (Math.random() - 0.5) * 0.02;
      const jitterLng = (Math.random() - 0.5) * 0.02;
      return {
        lat: Number((coords.lat + jitterLat).toFixed(5)),
        lng: Number((coords.lng + jitterLng).toFixed(5))
      };
    }
  }

  // Default coordinate (Austin central) with jitter
  const baseLat = 30.2672 + (Math.random() - 0.5) * 0.04;
  const baseLng = -97.7431 + (Math.random() - 0.5) * 0.04;
  return {
    lat: Number(baseLat.toFixed(5)),
    lng: Number(baseLng.toFixed(5))
  };
}

export function generateNeighborhoodRadar(city: string, category: string): NeighborhoodRadar {
  const isUrban = ['Apartment', 'Condo', 'Townhouse'].includes(category) || 
                  ['new york', 'chicago', 'san francisco', 'boston'].some(c => city.toLowerCase().includes(c));

  const walkScore = isUrban ? Math.floor(88 + Math.random() * 11) : Math.floor(74 + Math.random() * 18);
  const transitScore = isUrban ? Math.floor(85 + Math.random() * 14) : Math.floor(65 + Math.random() * 20);
  const safetyScore = Math.floor(88 + Math.random() * 10);
  const schoolsRating = Number((8.6 + Math.random() * 1.2).toFixed(1));

  const nearbyPlaces: NearbyPlace[] = [
    {
      name: `${city} Central Preparatory Academy`,
      category: 'school',
      distance: '0.4 mi',
      timeWalk: '8 min walk',
      rating: 9.4
    },
    {
      name: 'Metro Express Transit Station',
      category: 'transit',
      distance: '0.2 mi',
      timeWalk: '4 min walk',
      rating: 4.8
    },
    {
      name: 'Whole Foods Market & Organic Grocers',
      category: 'grocery',
      distance: '0.3 mi',
      timeWalk: '6 min walk',
      rating: 4.9
    },
    {
      name: 'Memorial Green Park & Recreation Loop',
      category: 'park',
      distance: '0.5 mi',
      timeWalk: '10 min walk',
      rating: 4.9
    },
    {
      name: 'St. Jude Regional Medical Health Center',
      category: 'hospital',
      distance: '1.2 mi',
      timeWalk: '4 min drive',
      rating: 4.7
    },
    {
      name: 'Artisan Bistro & Espresso Roasters',
      category: 'cafe',
      distance: '0.1 mi',
      timeWalk: '2 min walk',
      rating: 4.9
    }
  ];

  return {
    walkScore,
    walkScoreLabel: walkScore >= 90 ? "Walker's Paradise (Daily errands do not require a car)" : "Very Walkable (Most errands accomplished on foot)",
    transitScore,
    transitScoreLabel: transitScore >= 85 ? "Rider's Paradise (World-class transit options)" : "Excellent Transit (Transit is convenient for most trips)",
    safetyScore,
    safetyLabel: safetyScore >= 90 ? "Top Tier Safety (Lowest 5% incident rate)" : "High Safety Index (Quiet & securely patrolled)",
    schoolsRating,
    schoolsLabel: "A+ Rated Public & Private District",
    noiseLevel: isUrban ? "Moderate Urban (52 dB)" : "Peaceful & Quiet (36 dB)",
    nearbyPlaces
  };
}
