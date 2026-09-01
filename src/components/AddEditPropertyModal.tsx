import React, { useState, useEffect } from 'react';
import { 
  X, 
  Home, 
  DollarSign, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Tag, 
  Check, 
  Phone,
  LandPlot
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { PropertyCategory, ListingStatus } from '../types';
import { PHOTO_PRESETS } from '../data/initialProperties';
import { ImageUploader } from './ImageUploader';

const AMENITY_OPTIONS = [
  'Swimming Pool',
  'Garage / Parking',
  'Central AC',
  'Balcony / Terrace',
  'Smart Home Automation',
  'Private Garden',
  'Solar Panels',
  'Gym & Fitness',
  '24/7 Security',
  'Hardwood Floors',
  'High-Speed Wifi',
  'Pet Friendly'
];

export const AddEditPropertyModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    isEditModalOpen, 
    setIsEditModalOpen, 
    propertyToEdit, 
    setPropertyToEdit,
    addProperty,
    updateProperty
  } = useProperties();
  const { user } = useAuth();

  const isEditing = isEditModalOpen && propertyToEdit !== null;
  const isOpen = isAddModalOpen || isEditModalOpen;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('House');
  const [status, setStatus] = useState<ListingStatus>('For Sale');
  const [beds, setBeds] = useState<number>(3);
  const [baths, setBaths] = useState<number>(2);
  const [sqft, setSqft] = useState<number | ''>(2000);
  const [plotArea, setPlotArea] = useState<number | ''>('');
  const [zoning, setZoning] = useState('Residential (Single-Family)');
  const [photos, setPhotos] = useState<string[]>([PHOTO_PRESETS[0].url]);
  const [amenities, setAmenities] = useState<string[]>(['Garage / Parking', 'Central AC']);
  const [ownerPhone, setOwnerPhone] = useState('+1 (555) 012-3456');
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (isEditing && propertyToEdit) {
      setTitle(propertyToEdit.title);
      setDescription(propertyToEdit.description);
      setPrice(propertyToEdit.price);
      setLocation(propertyToEdit.location);
      setCity(propertyToEdit.city || '');
      setState(propertyToEdit.state || '');
      setCategory(propertyToEdit.category);
      setStatus(propertyToEdit.status);
      setBeds(propertyToEdit.beds);
      setBaths(propertyToEdit.baths);
      setSqft(propertyToEdit.sqft);
      setPlotArea(propertyToEdit.plotArea || '');
      setZoning(propertyToEdit.zoning || 'Residential (Single-Family)');
      const initialPhotos = propertyToEdit.gallery && propertyToEdit.gallery.length > 0
        ? propertyToEdit.gallery
        : propertyToEdit.imageUrl ? [propertyToEdit.imageUrl] : [PHOTO_PRESETS[0].url];
      setPhotos(initialPhotos);
      setAmenities(propertyToEdit.amenities || []);
      setOwnerPhone(propertyToEdit.ownerPhone || '+1 (555) 012-3456');
    } else {
      // Reset defaults for Add mode
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setCity('Austin');
      setState('TX');
      setCategory('House');
      setStatus('For Sale');
      setBeds(3);
      setBaths(2);
      setSqft(2100);
      setPlotArea('');
      setZoning('Residential (Single-Family)');
      setPhotos([PHOTO_PRESETS[0].url]);
      setAmenities(['Garage / Parking', 'Central AC', 'High-Speed Wifi']);
    }
  }, [isEditing, propertyToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleAmenity = (item: string) => {
    setAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setPropertyToEdit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || Number(price) <= 0) return;
    if (photos.length === 0) return;

    setLoading(true);

    try {
      const primaryCover = photos[0];
      const payload = {
        title: title.trim(),
        description: description.trim() || 'Beautiful property with premier amenities and verified documentation.',
        price: Number(price),
        location: location.trim(),
        city: city.trim() || 'Austin',
        state: state.trim() || 'TX',
        category,
        status,
        beds: category === 'Plot' ? 0 : Number(beds),
        baths: category === 'Plot' ? 0 : Number(baths),
        sqft: Number(sqft) || (Number(plotArea) || 2000),
        plotArea: category === 'Plot' ? (Number(plotArea) || Number(sqft) || 5000) : undefined,
        zoning: category === 'Plot' ? zoning : undefined,
        imageUrl: primaryCover,
        gallery: photos,
        amenities,
        ownerPhone: ownerPhone.trim()
      };

      if (isEditing && propertyToEdit) {
        await updateProperty(propertyToEdit.id, payload);
      } else {
        await addProperty(payload);
      }

      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="add-edit-property-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              {isEditing ? 'Property Management' : 'New Listing'}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {isEditing ? 'Edit Property Listing' : 'List Your Property on HomeVista'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Property Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Luxury Waterfront Villa with Private Pool"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Property Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Plot">Plot / Land</option>
                <option value="Villa">Villa</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Listing Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('For Sale')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    status === 'For Sale'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  For Sale
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('For Rent')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    status === 'For Rent'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price ({status === 'For Rent' ? '$/month' : 'Total USD'}) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={status === 'For Rent' ? '3500' : '750000'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Street Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., 742 Evergreen Terrace, Springfield"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Specs: Beds, Baths, Sqft OR Plot Area & Zoning */}
          {category === 'Plot' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-lime-50/60 border border-lime-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plot Area (sq ft) *</label>
                <div className="relative">
                  <LandPlot className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    value={plotArea}
                    onChange={(e) => setPlotArea(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="8500"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Zoning Classification</label>
                <input
                  type="text"
                  value={zoning}
                  onChange={(e) => setZoning(e.target.value)}
                  placeholder="Residential R-1 / Multi-Family"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area (sq ft)</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2100"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Photo Upload & Gallery with Drag-to-Reorder */}
          <div className="pt-1">
            <ImageUploader 
              images={photos} 
              onChange={setPhotos} 
              userId={user?.uid || 'user'} 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Property Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architectural highlights, floor plan, views, neighborhood, and upgrades..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Amenities Multi-select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Key Features & Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((item) => {
                const selected = amenities.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                      selected 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Owner Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone Number for Buyer Inquiries
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Saving Property...' : isEditing ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
