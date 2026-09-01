import React, { useState } from 'react';
import { Home, Heart, User as UserIcon, PlusCircle, ChevronDown, LogOut, Building2, Calendar, Menu, X, ShieldCheck, MessageSquare, Scale, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { useChat } from '../context/ChatContext';

export const Navbar: React.FC = () => {
  const { user, userProfile, logout, setAuthModalOpen, setAuthMode } = useAuth();
  const { 
    favorites, 
    setIsFavoritesModalOpen,
    comparisonList,
    setIsComparisonModalOpen,
    setIsAddModalOpen, 
    setIsMyPropertiesModalOpen, 
    setIsMyBookingsModalOpen,
    isAnalyticsModalOpen,
    setIsAnalyticsModalOpen,
    openAnalyticsModal,
    userProperties,
    userBookings,
    setFilters
  } = useProperties();
  const { openChatModal, totalUnreadCount, conversations } = useChat();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavCategory = (category: string, status?: 'For Sale' | 'For Rent') => {
    setFilters(prev => ({
      ...prev,
      category: category as any,
      status: status || 'All',
      searchQuery: '',
      location: ''
    }));
    const el = document.getElementById('featured-properties');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-navbar-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo matching reference */}
          <a 
            href="#" 
            className="flex items-center gap-3 group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
              <Home className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">HomeVista</span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-1">Find. Buy. Live Better.</span>
            </div>
          </a>

          {/* Desktop Navigation Links matching reference */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-700">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-emerald-700 font-semibold border-b-2 border-emerald-600 pb-1 cursor-pointer transition-colors"
            >
              Home
            </button>
            <div className="relative group cursor-pointer">
              <button 
                onClick={() => handleNavCategory('All', 'For Sale')}
                className="flex items-center gap-1 hover:text-emerald-600 py-2 transition-colors cursor-pointer"
              >
                <span>Buy</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <button 
                  onClick={() => handleNavCategory('House', 'For Sale')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Houses For Sale
                </button>
                <button 
                  onClick={() => handleNavCategory('Apartment', 'For Sale')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Apartments For Sale
                </button>
                <button 
                  onClick={() => handleNavCategory('Plot', 'For Sale')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Plots & Land For Sale
                </button>
                <button 
                  onClick={() => handleNavCategory('Villa', 'For Sale')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Luxury Villas
                </button>
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <button 
                onClick={() => handleNavCategory('All', 'For Rent')}
                className="flex items-center gap-1 hover:text-emerald-600 py-2 transition-colors cursor-pointer"
              >
                <span>Rent</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-50">
                <button 
                  onClick={() => handleNavCategory('Apartment', 'For Rent')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Rental Apartments
                </button>
                <button 
                  onClick={() => handleNavCategory('House', 'For Rent')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Rental Houses
                </button>
                <button 
                  onClick={() => handleNavCategory('Townhouse', 'For Rent')}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Rental Townhouses
                </button>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!user) {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              Sell
            </button>
            <a 
              href="#why-choose-us" 
              className="hover:text-emerald-600 transition-colors"
            >
              Agents
            </a>
            <a 
              href="#testimonials" 
              className="hover:text-emerald-600 transition-colors"
            >
              Reviews
            </a>
            <a 
              href="#contact-footer" 
              className="hover:text-emerald-600 transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Right Action Icons & List Property Button */}
          <div className="flex items-center space-x-3">
            
            {/* Comparison Tool Button */}
            <button 
              id="nav-compare-button"
              onClick={() => setIsComparisonModalOpen(true)}
              className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
                comparisonList.length > 0
                  ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
              title="Side-by-Side Property Comparison"
              aria-label="Compare Properties"
            >
              <Scale className="w-5 h-5" />
              {comparisonList.length > 0 && (
                <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {comparisonList.length}
                </span>
              )}
            </button>

            {/* Owner & Agent Analytics Dashboard Button */}
            <button
              id="nav-analytics-button"
              onClick={() => openAnalyticsModal()}
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
              title="Owner & Agent Analytics Dashboard"
              aria-label="Analytics Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* Direct Messages Icon Button */}
            <button
              id="nav-messages-button"
              onClick={() => openChatModal()}
              className="relative p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
              title="Direct Inquiries & Messages"
              aria-label="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            {/* Favorites Icon */}
            <button 
              id="nav-favorites-button"
              onClick={() => setIsFavoritesModalOpen(true)}
              className="relative p-2.5 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              title="Saved Properties"
              aria-label="Favorites"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative">
                <button 
                  id="nav-user-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-all cursor-pointer"
                >
                  <img 
                    src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full bg-emerald-100 object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline-block">
                    {userProfile?.displayName || 'My Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{userProfile?.displayName || 'User'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified User</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openChatModal();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <span>Messages & Offers</span>
                          </div>
                          {totalUnreadCount > 0 ? (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {totalUnreadCount}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {conversations.length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsMyPropertiesModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>My Listed Properties</span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {userProperties.length}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openAnalyticsModal();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                            <span>Owner & Agent Analytics</span>
                          </div>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            Reports
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsMyBookingsModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span>My Viewing Bookings</span>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {userBookings.length}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsAddModalOpen(true);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                          <span>Add New Property</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                id="nav-signin-button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* List Your Property CTA Button matching reference */}
            <button 
              id="nav-list-property-button"
              onClick={() => {
                if (!user) {
                  setAuthMode('signin');
                  setAuthModalOpen(true);
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Property</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavCategory('House', 'For Sale')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Houses For Sale
            </button>
            <button 
              onClick={() => handleNavCategory('Apartment', 'For Rent')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Apartments For Rent
            </button>
            <button 
              onClick={() => handleNavCategory('Plot', 'For Sale')}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Plots & Land
            </button>
            <button 
              onClick={() => {
                setIsComparisonModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50/70 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Compare Properties</span>
              </div>
              {comparisonList.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {comparisonList.length} selected
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                openChatModal();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Direct Messages & Inquiries</span>
              </div>
              {totalUnreadCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {totalUnreadCount} new
                </span>
              )}
            </button>
            {user && (
              <>
                <button 
                  onClick={() => {
                    setIsMyPropertiesModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg"
                >
                  My Listed Properties ({userProperties.length})
                </button>
                <button 
                  onClick={() => {
                    openAnalyticsModal();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Owner & Agent Analytics</span>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    Insights
                  </span>
                </button>
                <button 
                  onClick={() => {
                    setIsMyBookingsModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg"
                >
                  My Viewing Bookings ({userBookings.length})
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
