import React from 'react';
import { ShieldCheck, DollarSign, Headphones, ClipboardCheck } from 'lucide-react';

export const WhyChooseUsSection: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: "Verified Listings",
      description: "All properties are verified and trusted."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
      title: "Best Price",
      description: "We help you find the best price possible."
    },
    {
      icon: <Headphones className="w-8 h-8 text-emerald-600" />,
      title: "Expert Agents",
      description: "Our agents are here to guide you 24/7."
    },
    {
      icon: <ClipboardCheck className="w-8 h-8 text-emerald-600" />,
      title: "Easy Process",
      description: "Simple and transparent from start to finish."
    }
  ];

  return (
    <section id="why-choose-us" className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title matching reference */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose HomeVista?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            The modern standard in real estate discovery, transparent bookings, and property management.
          </p>
        </div>

        {/* 4 Feature Columns matching reference layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                {feature.icon}
              </div>
              <div className="pt-1">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
