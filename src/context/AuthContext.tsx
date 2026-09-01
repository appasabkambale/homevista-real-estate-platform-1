import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  updateProfile, 
  onAuthStateChanged,
  db,
  doc,
  setDoc
} from '../lib/firebase';
import { UserProfile } from '../types';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  demoSignIn: (role?: string) => Promise<void>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem('homevista_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mappedUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
        };
        setUser(mappedUser);
        try {
          localStorage.setItem('homevista_auth_user', JSON.stringify(mappedUser));
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...mappedUser,
            lastLogin: Date.now()
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore user profile sync warning:', e);
        }
      } else {
        // If not a Firebase session, check if there was a manually stored demo session
        const stored = localStorage.getItem('homevista_auth_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // If it's a demo user, keep it active
            if (parsed && (parsed.uid?.startsWith('demo_') || parsed.isDemo)) {
              setUser(parsed);
            } else {
              setUser(null);
              localStorage.removeItem('homevista_auth_user');
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const mapped: AppUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          photoURL: res.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`
        };
        setUser(mapped);
        localStorage.setItem('homevista_auth_user', JSON.stringify(mapped));
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const mapped: AppUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          photoURL: res.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`
        };
        setUser(mapped);
        localStorage.setItem('homevista_auth_user', JSON.stringify(mapped));
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, {
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`
        });
        const mapped: AppUser = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`
        };
        setUser(mapped);
        localStorage.setItem('homevista_auth_user', JSON.stringify(mapped));
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  const demoSignIn = async (role = 'Buyer') => {
    const isOwner = role.toLowerCase().includes('owner');
    
    // Create instant guaranteed demo profile
    const demoUser: AppUser & { isDemo: boolean } = isOwner ? {
      uid: 'demo_owner_victoria',
      email: 'victoria@homevista.com',
      displayName: 'Victoria Sterling (Owner)',
      photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      isDemo: true
    } : {
      uid: 'demo_buyer_alex',
      email: 'alex.buyer@homevista.com',
      displayName: 'Alex Rivera (Buyer)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isDemo: true
    };

    // Immediately set active user session
    setUser(demoUser);
    localStorage.setItem('homevista_auth_user', JSON.stringify(demoUser));
    setAuthModalOpen(false);

    // Sync in background to Firestore if accessible
    try {
      await setDoc(doc(db, 'users', demoUser.uid), {
        uid: demoUser.uid,
        email: demoUser.email,
        displayName: demoUser.displayName,
        photoURL: demoUser.photoURL,
        role: isOwner ? 'Owner' : 'Buyer',
        lastLogin: Date.now()
      }, { merge: true });
    } catch (e) {
      // Non-blocking sync
      console.warn('Demo profile firestore notice:', e);
    }
  };

  const logout = async () => {
    localStorage.removeItem('homevista_auth_user');
    setUser(null);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  };

  const userProfile: UserProfile | null = user ? {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
  } : null;

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      demoSignIn,
      logout,
      authModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
