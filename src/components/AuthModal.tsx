import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield, Sparkles, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authMode, 
    setAuthMode, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail,
    demoSignIn 
  } = useAuth();
  const { showToast } = useProperties();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
        showToast('Welcome back! 👋', 'success');
      } else {
        if (!name.trim()) {
          setError('Please provide your name');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
        showToast('Account created successfully! 🎉', 'success');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials or try Demo Login.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google! ✨', 'success');
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-in was interrupted. You can also use Email or 1-Click Demo Login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role: 'Buyer' | 'Owner') => {
    setError(null);
    setLoading(true);
    try {
      await demoSignIn(role);
      showToast(`Logged in as Demo ${role}! 🚀`, 'success');
    } catch (err: any) {
      console.error(err);
      setError('Demo login failed. Please try with email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-2xs">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {authMode === 'signin' ? 'Welcome to HomeVista' : 'Create an Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {authMode === 'signin' 
              ? 'Sign in to manage your listings, favorites, and viewings' 
              : 'Join HomeVista to list properties and schedule viewings'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-2xs font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-slate-300 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-slate-400 font-medium">Or continue with email</span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Fast 1-Click Demo Accounts */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSignIn('Buyer')}
              disabled={loading}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Buyer</span>
            </button>
            <button
              onClick={() => handleDemoSignIn('Owner')}
              disabled={loading}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Demo Owner</span>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setError(null);
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
              }}
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
