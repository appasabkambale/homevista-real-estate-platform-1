import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote: "HomeVista made finding our dream home so easy. The team was professional, helpful, and always available!",
      author: "Emily Johnson",
      location: "New York, NY",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      rating: 5
    },
    {
      quote: "The best real estate experience I've ever had. Highly recommend HomeVista to anyone looking to buy or rent.",
      author: "Michael Brown",
      location: "Austin, TX",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      rating: 5
    },
    {
      quote: "I sold my property in record time with HomeVista. Their marketing and support were outstanding!",
      author: "Sophia Martinez",
      location: "Miami, FL",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      rating: 5
    },
    {
      quote: "Booking property viewings online was instant and completely seamless. Found our suburban family house in two weeks!",
      author: "David & Sarah Chen",
      location: "Chicago, IL",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      rating: 5
    }
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Carousel Controls matching reference */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What Our Clients Say
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Read real feedback from home buyers, renters, and property owners
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Testimonials 3-Card Grid matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((item, index) => (
            <div 
              key={index}
              className="bg-slate-50/70 rounded-3xl p-6 sm:p-7 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all duration-300 relative group"
            >
              {/* Quote Mark Icon */}
              <div>
                <span className="text-3xl sm:text-4xl font-serif text-emerald-600 font-extrabold leading-none select-none block mb-3">
                  “
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {item.quote}
                </p>
              </div>

              {/* Author Info & Star Rating */}
              <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.avatar} 
                    alt={item.author} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {item.author}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.location}</p>
                  </div>
                </div>

                {/* 5 Golden Stars matching reference */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
