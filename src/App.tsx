import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { ChatProvider } from './context/ChatContext';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PropertyTypesSection } from './components/PropertyTypesSection';
import { FeaturedPropertiesSection } from './components/FeaturedPropertiesSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BookingModal } from './components/BookingModal';
import { AddEditPropertyModal } from './components/AddEditPropertyModal';
import { MyPropertiesModal } from './components/MyPropertiesModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { FavoritesModal } from './components/FavoritesModal';
import { PropertyComparisonModal } from './components/PropertyComparisonModal';
import { ComparisonFloatingBar } from './components/ComparisonFloatingBar';
import { OwnerAnalyticsModal } from './components/OwnerAnalyticsModal';
import { ChatModal } from './components/ChatModal';
import { AskQuestionModal } from './components/AskQuestionModal';
import { MakeOfferModal } from './components/MakeOfferModal';
import { FloatingChatButton } from './components/FloatingChatButton';
import { Toast } from './components/Toast';

export default function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <ChatProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
            {/* Top Banner Contact bar */}
            <TopBar />

            {/* Main Navigation */}
            <Navbar />

            {/* Main Website Sections matching reference */}
            <main className="flex-1">
              <HeroSection />
              <PropertyTypesSection />
              <FeaturedPropertiesSection />
              <WhyChooseUsSection />
              <TestimonialsSection />
              <NewsletterSection />
            </main>

            {/* Footer */}
            <Footer />

            {/* Interactive Modals & Dashboards */}
            <AuthModal />
            <PropertyDetailModal />
            <PropertyComparisonModal />
            <ComparisonFloatingBar />
            <OwnerAnalyticsModal />
            <BookingModal />
            <AddEditPropertyModal />
            <MyPropertiesModal />
            <MyBookingsModal />
            <FavoritesModal />

            {/* Real-Time Messaging & Negotiation Modals */}
            <ChatModal />
            <AskQuestionModal />
            <MakeOfferModal />
            <FloatingChatButton />

            {/* Floating Toast Notification */}
            <Toast />
          </div>
        </ChatProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}
