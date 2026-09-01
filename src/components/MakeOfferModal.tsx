import React, { useState, useEffect } from 'react';
import { X, DollarSign, Clock, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Send, MapPin } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { MessageOffer } from '../types';

export const MakeOfferModal: React.FC = () => {
  const { 
    isMakeOfferModalOpen, 
    closeMakeOfferModal, 
    targetPropertyForChat, 
    startOrOpenConversation 
  } = useChat();
  const { user, setAuthModalOpen, setAuthMode } = useAuth();

  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [closingDays, setClosingDays] = useState<number>(30);
  const [contingencies, setContingencies] = useState<string[]>([
    'Financing Contingency (21 days)',
    'Home Inspection Approval (10 days)'
  ]);
  const [customTerms, setCustomTerms] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize offer price to asking price when target property opens
  useEffect(() => {
    if (targetPropertyForChat) {
      setOfferPrice(targetPropertyForChat.price);
    }
  }, [targetPropertyForChat]);

  if (!isMakeOfferModalOpen || !targetPropertyForChat) return null;

  const askingPrice = targetPropertyForChat.price;
  const difference = offerPrice - askingPrice;
  const percentDiff = ((difference / askingPrice) * 100).toFixed(1);
  const downPaymentAmount = Math.round(offerPrice * (downPaymentPercent / 100));
  const loanAmount = offerPrice - downPaymentAmount;

  const availableContingencies = [
    'Financing Contingency (21 days)',
    'Home Inspection Approval (10 days)',
    'Appraisal at or above offer price',
    'Clear Title & HOA document review',
    'Include Major Appliances & Fixtures',
    'All-Cash Purchase (No Financing Contingency)'
  ];

  const toggleContingency = (c: string) => {
    if (contingencies.includes(c)) {
      setContingencies(contingencies.filter((item) => item !== c));
    } else {
      setContingencies([...contingencies, c]);
    }
  };

  const handlePresetPercentage = (pct: number) => {
    setOfferPrice(Math.round(askingPrice * pct));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthMode('signin');
      setAuthModalOpen(true);
      return;
    }

    if (offerPrice <= 0) return;

    setIsSubmitting(true);
    try {
      const offerPayload: MessageOffer = {
        amount: offerPrice,
        status: 'pending',
        downPaymentPercent,
        closingDays,
        contingencies,
        terms: customTerms || `Formal offer for ${targetPropertyForChat.title} at $${offerPrice.toLocaleString()} with ${downPaymentPercent}% down and ${closingDays}-day closing.`
      };

      const initialText = `Formal Offer Submitted: $${offerPrice.toLocaleString()} (${downPaymentPercent}% Down, ${closingDays}-Day Closing)`;

      await startOrOpenConversation(
        targetPropertyForChat,
        initialText,
        undefined,
        offerPayload
      );
      closeMakeOfferModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Direct Negotiation
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Seller Direct</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              Make a Formal Offer
            </h3>
          </div>
          <button
            onClick={closeMakeOfferModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Property Thumbnail */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={targetPropertyForChat.imageUrl}
              alt={targetPropertyForChat.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {targetPropertyForChat.title}
              </h4>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{targetPropertyForChat.location}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="text-slate-500 font-medium">Asking Price:</span>
                <span className="font-extrabold text-slate-900">
                  ${askingPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {targetPropertyForChat.status}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Offer Amount Input & Presets */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Offer Amount ($ USD)
              </label>
              {difference !== 0 && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  difference > 0 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {difference > 0 ? `+${percentDiff}% over asking` : `${percentDiff}% under asking`} (${Math.abs(difference).toLocaleString()})
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-emerald-700">$</span>
              <input
                type="number"
                min="1000"
                step="5000"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-emerald-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 text-xl font-black text-slate-900 outline-hidden transition-all"
                required
              />
            </div>

            {/* Quick Quick percentage buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Quick Adjust:</span>
              <button
                type="button"
                onClick={() => handlePresetPercentage(0.92)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                -8% (${Math.round(askingPrice * 0.92).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handlePresetPercentage(0.95)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                -5% (${Math.round(askingPrice * 0.95).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handlePresetPercentage(1.0)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                Full Asking (${askingPrice.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => handlePresetPercentage(1.03)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                +3% (${Math.round(askingPrice * 1.03).toLocaleString()})
              </button>
            </div>
          </div>

          {/* 2. Down Payment & Financing Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Down Payment: {downPaymentPercent}% (${downPaymentAmount.toLocaleString()})
              </label>
              <div className="flex items-center gap-1.5">
                {[10, 20, 25, 30, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      downPaymentPercent === pct
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct === 100 ? 'Cash' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Closing Timeline: {closingDays} Days
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 30, 45, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setClosingDays(days)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      closingDays === days
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Contingencies Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Standard Contingencies & Clauses
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableContingencies.map((c, i) => {
                const isChecked = contingencies.includes(c);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleContingency(c)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Custom Terms / Letter to Seller */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Note or Custom Terms for Seller
            </label>
            <textarea
              rows={3}
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
              placeholder="e.g., Pre-approved with Chase Private Client. Flexible on closing date if seller needs extra time to relocate."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-900 transition-all outline-hidden resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              <span>Estimated Loan: </span>
              <span className="font-bold text-slate-800">${loanAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeMakeOfferModal}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || offerPrice <= 0}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Formal Offer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
