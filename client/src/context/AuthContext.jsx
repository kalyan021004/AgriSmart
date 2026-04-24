import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase user with MongoDB after login
  const syncWithBackend = async (fbUser, name) => {
    try {
      const res = await api.post('/users/sync', {
        name: name || fbUser.displayName || 'Farmer',
        phone: fbUser.phoneNumber?.replace('+91', '') || '',
      });
      setDbUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error('Backend sync failed:', err.message);
      return null;
    }
  };

  const refreshDbUser = async () => {
    try {
      const res = await api.get('/users/me');
      setDbUser(res.data.user);
    } catch (err) {
      console.error('Refresh user failed:', err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setDbUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncWithBackend(user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        setDbUser,
        loading,
        syncWithBackend,
        refreshDbUser,
        logout,
        isAuthenticated: !!firebaseUser,
        isProfileComplete: dbUser?.isProfileComplete || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
