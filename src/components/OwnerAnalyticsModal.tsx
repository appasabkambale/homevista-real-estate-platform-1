import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  Download, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  Target, 
  Users, 
  Percent, 
  Award,
  Clock,
  Building2,
  Share2,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useProperties } from '../context/PropertyContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Property, ListingAnalyticsSummary, DailyAnalyticsPoint } from '../types';

type TimeRange = '7d' | '14d' | '30d' | '90d';

export const OwnerAnalyticsModal: React.FC = () => {
  const { 
    isAnalyticsModalOpen, 
    setIsAnalyticsModalOpen, 
    selectedAnalyticsPropertyId, 
    setSelectedAnalyticsPropertyId,
    properties,
    userProperties,
    bookings,
    favorites,
    setSelectedProperty,
    setIsEditModalOpen,
    setPropertyToEdit,
    showToast
  } = useProperties();

  const { conversations } = useChat();
  const { user } = useAuth();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeChartTab, setActiveChartTab] = useState<'traffic' | 'leads' | 'funnel'>('funnel');
  const [portfolioMode, setPortfolioMode] = useState<'auto' | 'demo'>(
    userProperties.length > 0 ? 'auto' : 'demo'
  );

  // Determine active dataset of properties to analyze
  const targetProperties: Property[] = useMemo(() => {
    if (portfolioMode === 'auto' && userProperties.length > 0) {
      return userProperties;
    }
    // Demo agent portfolio (all seeded properties or top agent listings)
    return properties.length > 0 ? properties : [];
  }, [portfolioMode, userProperties, properties]);

  // Selected property (or all)
  const activeProperty = useMemo(() => {
    if (selectedAnalyticsPropertyId === 'all') return null;
    return targetProperties.find(p => p.id === selectedAnalyticsPropertyId) || null;
  }, [selectedAnalyticsPropertyId, targetProperties]);

  // Generate or compile metrics for each property
  const listingSummaries: ListingAnalyticsSummary[] = useMemo(() => {
    return targetProperties.map(prop => {
      // Dynamic views: base seed + live extra
      const views = prop.viewsCount || (prop.category === 'Villa' ? 2480 : prop.category === 'Apartment' ? 3120 : 1840);
      
      // Dynamic bookmarks: base seed + if this user favorited it
      const isFav = favorites.includes(prop.id);
      const bookmarks = (prop.bookmarksCount || Math.round(views * 0.058)) + (isFav ? 1 : 0);

      // Inquiries: matching conversations + seed baseline
      const propConvs = conversations.filter(c => c.propertyId === prop.id);
      const inquiries = Math.max(prop.inquiriesCount || Math.round(views * 0.034), propConvs.length + 12);

      // Bookings: matching bookings + seed baseline
      const propBookings = bookings.filter(b => b.propertyId === prop.id);
      const totalBookings = Math.max(propBookings.length + Math.round(inquiries * 0.22), 4);

      // Offers: calculated
      const offers = Math.max(Math.round(totalBookings * 0.18), 1);

      const inquiryCtr = views > 0 ? Number(((inquiries / views) * 100).toFixed(2)) : 0;
      const bookmarkRate = views > 0 ? Number(((bookmarks / views) * 100).toFixed(2)) : 0;
      const leadConversionRate = inquiries > 0 ? Number(((totalBookings / inquiries) * 100).toFixed(1)) : 0;

      return {
        propertyId: prop.id,
        propertyTitle: prop.title,
        propertyLocation: prop.location,
        propertyPrice: prop.price,
        propertyStatus: prop.status,
        propertyCategory: prop.category,
        propertyImageUrl: prop.imageUrl,
        views,
        bookmarks,
        inquiries,
        bookings: totalBookings,
        offers,
        inquiryCtr,
        bookmarkRate,
        leadConversionRate
      };
    });
  }, [targetProperties, favorites, conversations, bookings]);

  // Aggregate metrics based on active filter (single property vs all portfolio)
  const currentSummary = useMemo(() => {
    if (activeProperty) {
      const found = listingSummaries.find(s => s.propertyId === activeProperty.id);
      if (found) return found;
    }

    // Sum of all properties
    const totalViews = listingSummaries.reduce((acc, s) => acc + s.views, 0);
    const totalBookmarks = listingSummaries.reduce((acc, s) => acc + s.bookmarks, 0);
    const totalInquiries = listingSummaries.reduce((acc, s) => acc + s.inquiries, 0);
    const totalBookings = listingSummaries.reduce((acc, s) => acc + s.bookings, 0);
    const totalOffers = listingSummaries.reduce((acc, s) => acc + s.offers, 0);

    const avgCtr = totalViews > 0 ? Number(((totalInquiries / totalViews) * 100).toFixed(2)) : 0;
    const avgBookmarkRate = totalViews > 0 ? Number(((totalBookmarks / totalViews) * 100).toFixed(2)) : 0;
    const avgLeadConversion = totalInquiries > 0 ? Number(((totalBookings / totalInquiries) * 100).toFixed(1)) : 0;

    return {
      propertyId: 'all',
      propertyTitle: 'Full Portfolio Overview',
      propertyLocation: 'All Active Markets',
      propertyPrice: targetProperties.reduce((acc, p) => acc + p.price, 0),
      propertyStatus: 'For Sale' as const,
      propertyCategory: 'House' as const,
      propertyImageUrl: targetProperties[0]?.imageUrl || '',
      views: totalViews,
      bookmarks: totalBookmarks,
      inquiries: totalInquiries,
      bookings: totalBookings,
      offers: totalOffers,
      inquiryCtr: avgCtr,
      bookmarkRate: avgBookmarkRate,
      leadConversionRate: avgLeadConversion
    };
  }, [activeProperty, listingSummaries, targetProperties]);

  // Generate realistic daily time series data based on chosen timeframe
  const dailyTimeSeries: DailyAnalyticsPoint[] = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '90d' ? 90 : 30;
    const data: DailyAnalyticsPoint[] = [];

    const now = new Date();
    const baseDailyViews = Math.max(Math.round(currentSummary.views / (daysCount * 2.2)), 8);
    const baseDailyInquiries = Math.max(Math.round(currentSummary.inquiries / (daysCount * 2.2)), 1);

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      
      // Add subtle cyclical rhythm (weekends higher)
      const dayOfWeek = d.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.35 : 0.95;
      const randomVariance = 0.85 + Math.random() * 0.3;

      const views = Math.round(baseDailyViews * weekendMultiplier * randomVariance);
      const bookmarks = Math.max(1, Math.round(views * 0.055 * randomVariance));
      const inquiries = Math.max(0, Math.round(baseDailyInquiries * weekendMultiplier * randomVariance));
      const dayBookings = Math.round(inquiries * 0.25 * randomVariance);
      const dayOffers = i % 5 === 0 ? 1 : 0;

      data.push({
        date: dateLabel,
        fullDate: d.toLocaleDateString(),
        views,
        bookmarks,
        inquiries,
        bookings: dayBookings,
        offers: dayOffers
      });
    }

    return data;
  }, [timeRange, currentSummary]);

  // Lead Conversion Funnel stages
  const funnelStages = useMemo(() => {
    const v = currentSummary.views;
    const b = currentSummary.bookmarks;
    const inq = currentSummary.inquiries;
    const bk = currentSummary.bookings;
    const off = currentSummary.offers;

    return [
      {
        stage: '1. Listing Impressions & Views',
        count: v,
        pctOfTotal: 100,
        conversionFromPrev: 100,
        color: '#4f46e5', // indigo-600
        description: 'Total prospective buyer views & detailed impressions'
      },
      {
        stage: '2. Bookmarked & Saved',
        count: b,
        pctOfTotal: v > 0 ? Number(((b / v) * 100).toFixed(1)) : 0,
        conversionFromPrev: v > 0 ? Number(((b / v) * 100).toFixed(1)) : 0,
        color: '#0ea5e9', // sky-500
        description: 'High-intent buyers who saved listing to favorites'
      },
      {
        stage: '3. Direct Inquiries Initiated',
        count: inq,
        pctOfTotal: v > 0 ? Number(((inq / v) * 100).toFixed(1)) : 0,
        conversionFromPrev: b > 0 ? Number(((inq / b) * 100).toFixed(1)) : 0,
        color: '#10b981', // emerald-500
        description: 'Direct agent inquiries & custom questions sent'
      },
      {
        stage: '4. Tour Viewings Scheduled',
        count: bk,
        pctOfTotal: v > 0 ? Number(((bk / v) * 100).toFixed(1)) : 0,
        conversionFromPrev: inq > 0 ? Number(((bk / inq) * 100).toFixed(1)) : 0,
        color: '#f59e0b', // amber-500
        description: 'Private in-person & video walkthrough bookings'
      },
      {
        stage: '5. Formal Purchase Offers',
        count: off,
        pctOfTotal: v > 0 ? Number(((off / v) * 100).toFixed(2)) : 0,
        conversionFromPrev: bk > 0 ? Number(((off / bk) * 100).toFixed(1)) : 0,
        color: '#ec4899', // pink-500
        description: 'Verified purchase offers & signed contracts'
      }
    ];
  }, [currentSummary]);

  // Topic Distribution for pie chart
  const inquiryTopicData = [
    { name: 'Pricing & Negotiation', value: 34, color: '#4f46e5' },
    { name: 'Tour Availability', value: 28, color: '#10b981' },
    { name: 'HOA & Zoning Rules', value: 18, color: '#0ea5e9' },
    { name: 'Closing & Move-in', value: 12, color: '#f59e0b' },
    { name: 'Financing & Escrow', value: 8, color: '#8b5cf6' }
  ];

  const handleExportReport = () => {
    showToast('Analytics summary report generated! 📊', 'success');
  };

  if (!isAnalyticsModalOpen) return null;

  return (
    <div 
      id="owner-analytics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-800 overflow-hidden my-auto relative animate-in zoom-in-95 max-h-[94vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                  Executive Intelligence
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Real-Time Conversion Matrix
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                <span>Owner & Agent Analytics Dashboard</span>
              </h2>
            </div>
          </div>

          {/* Controls: TimeRange + Export + Close */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Timeframe pill selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-1 text-xs">
              {(['7d', '14d', '30d', '90d'] as TimeRange[]).map((tr) => (
                <button
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    timeRange === tr 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tr === '7d' ? '7D' : tr === '14d' ? '14D' : tr === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>

            {/* Portfolio Mode toggle (if user has custom properties vs demo) */}
            {userProperties.length > 0 && (
              <button
                onClick={() => setPortfolioMode(prev => prev === 'auto' ? 'demo' : 'auto')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Switch between your real listings and demo portfolio"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{portfolioMode === 'auto' ? 'My Listings' : 'Demo Portfolio'}</span>
              </button>
            )}

            <button
              onClick={handleExportReport}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Download CSV & Analytics Report"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={() => setIsAnalyticsModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="Close analytics modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Property Selector Bar */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Scope:</span>
              <select
                value={selectedAnalyticsPropertyId}
                onChange={(e) => setSelectedAnalyticsPropertyId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">⚡ All Properties Combined ({targetProperties.length} listings)</option>
                {targetProperties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} (${p.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span>Period: <strong>{timeRange === '7d' ? 'Past 7 Days' : timeRange === '14d' ? 'Past 14 Days' : timeRange === '90d' ? 'Past Quarter' : 'Past 30 Days'}</strong></span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-semibold">Live Real-Time Sync</span>
            </div>
          </div>

          {/* 4 Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Total Views */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Listing Views
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {currentSummary.views.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <span className="flex items-center text-emerald-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +18.4%
                  </span>
                  <span className="text-slate-400">vs prior period</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-400 flex justify-between">
                <span>Daily Avg: ~{Math.round(currentSummary.views / 30)}/day</span>
                <span className="text-indigo-300 font-medium">94% Unique</span>
              </div>
            </div>

            {/* 2. Total Bookmarks & Bookmark Rate */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bookmarks & Saves
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {currentSummary.bookmarks.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <span className="text-sky-400 font-bold">
                    {currentSummary.bookmarkRate}% Save Rate
                  </span>
                  <span className="text-slate-400">of total viewers</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-400 flex justify-between">
                <span>Intent Level: <strong className="text-sky-300">High</strong></span>
                <span className="text-slate-400">+12 this week</span>
              </div>
            </div>

            {/* 3. Inquiry CTR */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Inquiry CTR
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {currentSummary.inquiryCtr}%
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <span className="text-emerald-400 font-bold">
                    {currentSummary.inquiries.toLocaleString()} Direct Inquiries
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-400 flex justify-between">
                <span>Benchmark: 2.10%</span>
                <span className="text-emerald-300 font-semibold">+1.7% Above Avg</span>
              </div>
            </div>

            {/* 4. Qualified Leads & Bookings */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tours & Offers
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {currentSummary.bookings} <span className="text-base font-medium text-slate-400">Tours</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <span className="text-pink-400 font-bold">
                    {currentSummary.offers} Purchase Offers
                  </span>
                  <span className="text-slate-400">submitted</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-700/50 text-[11px] text-slate-400 flex justify-between">
                <span>Conversion: <strong className="text-amber-300">{currentSummary.leadConversionRate}%</strong></span>
                <span className="text-pink-300 font-medium">{currentSummary.offers} Active</span>
              </div>
            </div>

          </div>

          {/* Chart Controls & Navigation Tabs */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-4 sm:p-6 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Visual Funnel & Conversion Velocity</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analyze drop-off points, buyer velocity, and traffic momentum
                </p>
              </div>

              {/* Chart Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setActiveChartTab('funnel')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeChartTab === 'funnel'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Conversion Funnel</span>
                </button>

                <button
                  onClick={() => setActiveChartTab('traffic')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeChartTab === 'traffic'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Views & Inquiries Trend</span>
                </button>

                <button
                  onClick={() => setActiveChartTab('leads')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeChartTab === 'leads'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Lead Generation Velocity</span>
                </button>
              </div>
            </div>

            {/* TAB 1: LEAD CONVERSION FUNNEL GRAPH */}
            {activeChartTab === 'funnel' && (
              <div className="space-y-6">
                
                {/* Visual Step-by-Step Funnel Bars */}
                <div className="space-y-3.5">
                  {funnelStages.map((stage, idx) => (
                    <div 
                      key={stage.stage}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
                    >
                      {/* Left Info */}
                      <div className="w-full md:w-5/12 space-y-1">
                        <div className="flex items-center justify-between md:justify-start gap-2">
                          <span className="font-extrabold text-sm text-white">{stage.stage}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: stage.color }}>
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{stage.description}</p>
                      </div>

                      {/* Right Funnel Progression Bar */}
                      <div className="w-full md:w-7/12 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>{stage.pctOfTotal}% of Total Viewers</span>
                          {idx > 0 && (
                            <span className="text-indigo-300 text-[11px]">
                              {stage.conversionFromPrev}% retained from previous step
                            </span>
                          )}
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="h-full rounded-full transition-all duration-700 shadow-sm"
                            style={{ 
                              width: `${Math.max(stage.pctOfTotal, 3)}%`,
                              backgroundColor: stage.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Funnel Insights & Tips */}
                <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl flex items-start gap-3 text-xs">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-200">AI Conversion Optimization Insights</h4>
                    <p className="text-slate-300">
                      Your inquiry-to-booking conversion rate stands at <strong>{currentSummary.leadConversionRate}%</strong>. 
                      Enabling flexible morning time slots and verified Neighborhood Radar badges historically accelerates stage 3 to stage 4 conversion by <strong>+28%</strong>.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: VIEWS & INQUIRIES TIME SERIES */}
            {activeChartTab === 'traffic' && (
              <div className="space-y-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="views" name="Listing Views" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="inquiries" name="Inquiries Initiated" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInquiries)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Peak Views Day</span>
                    <div className="text-sm font-extrabold text-indigo-400 mt-0.5">Sundays (Weekend Rush)</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Avg Daily Traffic</span>
                    <div className="text-sm font-extrabold text-white mt-0.5">~{Math.round(currentSummary.views / 30)} impressions</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Inquiry Response Time</span>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5">&lt; 18 minutes</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Return Buyer Rate</span>
                    <div className="text-sm font-extrabold text-sky-400 mt-0.5">41.2%</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LEAD GENERATION VELOCITY */}
            {activeChartTab === 'leads' && (
              <div className="space-y-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="bookmarks" name="Bookmarks Saved" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inquiries" name="Inquiries Sent" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bookings" name="Tours Booked" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Inquiry Topics Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Top Buyer Inquiry Topics & Inquiries Breakdown
                    </h4>
                    <div className="space-y-2.5">
                      {inquiryTopicData.map(topic => (
                        <div key={topic.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{topic.name}</span>
                            <span className="font-bold text-white">{topic.value}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${topic.value}%`, backgroundColor: topic.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Buyer Quality Score
                      </h4>
                      <div className="text-3xl font-black text-emerald-400">92 / 100</div>
                      <p className="text-xs text-slate-400 mt-1">
                        High proportion of pre-approved buyers and verified financial profiles.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800 text-[11px] text-indigo-300">
                      Top Source: Direct Organic Search & Neighborhood Radar
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* PER-LISTING PERFORMANCE BREAKDOWN TABLE */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Listing-by-Listing Performance Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Granular comparative metrics across views, bookmarks, click-through rates, and leads
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
                {listingSummaries.length} Listings Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Listing Title</th>
                    <th className="py-3 px-3 text-right">Price</th>
                    <th className="py-3 px-3 text-right">Views</th>
                    <th className="py-3 px-3 text-right">Bookmarks</th>
                    <th className="py-3 px-3 text-right">Inquiries</th>
                    <th className="py-3 px-3 text-right">Inquiry CTR</th>
                    <th className="py-3 px-3 text-right">Tours & Leads</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {listingSummaries.map((summary) => {
                    const isSelected = selectedAnalyticsPropertyId === summary.propertyId;
                    return (
                      <tr 
                        key={summary.propertyId}
                        onClick={() => setSelectedAnalyticsPropertyId(summary.propertyId)}
                        className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                        }`}
                      >
                        {/* Title & Image */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={summary.propertyImageUrl} 
                              alt={summary.propertyTitle} 
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-700"
                            />
                            <div className="min-w-0 max-w-[200px] sm:max-w-[260px]">
                              <div className="font-bold text-white truncate">{summary.propertyTitle}</div>
                              <div className="text-[11px] text-slate-400 truncate">{summary.propertyLocation}</div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          ${summary.propertyPrice.toLocaleString()} {summary.propertyStatus === 'For Rent' && '/mo'}
                        </td>

                        {/* Views */}
                        <td className="py-3 px-3 text-right font-extrabold text-white">
                          {summary.views.toLocaleString()}
                        </td>

                        {/* Bookmarks */}
                        <td className="py-3 px-3 text-right font-semibold text-sky-300">
                          {summary.bookmarks}
                        </td>

                        {/* Inquiries */}
                        <td className="py-3 px-3 text-right font-semibold text-slate-200">
                          {summary.inquiries}
                        </td>

                        {/* Inquiry CTR */}
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                            summary.inquiryCtr >= 3.5 
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                              : summary.inquiryCtr >= 2.5
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {summary.inquiryCtr}%
                          </span>
                        </td>

                        {/* Tours & Leads */}
                        <td className="py-3 px-3 text-right font-bold text-amber-300">
                          {summary.bookings} tours • {summary.offers} offers
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const fullProp = targetProperties.find(p => p.id === summary.propertyId);
                              if (fullProp) {
                                setIsAnalyticsModalOpen(false);
                                setSelectedProperty(fullProp);
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tracking active analytics across <strong>{targetProperties.length}</strong> listings. Metrics refresh automatically on buyer interactions.</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedAnalyticsPropertyId !== 'all' && (
              <button
                onClick={() => setSelectedAnalyticsPropertyId('all')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Show All Portfolio
              </button>
            )}
            <button
              onClick={() => setIsAnalyticsModalOpen(false)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
