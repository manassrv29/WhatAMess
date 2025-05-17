import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  // DEBUG: Track userRole changes
  React.useEffect(() => { console.log('userRole changed:', userRole); }, [userRole]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile from backend to get role
        try {
          const token = await user.getIdToken();
          // Store the latest Firebase ID token in localStorage for API requests
          localStorage.setItem('token', token);
          const response = await fetch('http://localhost:8000/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.role) {
              console.log('Fetched user profile, role:', data.role);
              setUserRole(data.role);
            } else {
              console.error('Profile fetch succeeded but role missing in response:', data);
              setUserRole(null);
            }
          } else {
            console.error('Profile fetch failed with status:', response.status);
            setUserRole(null);
          }
        } catch (e) {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
        // Remove token from localStorage on logout
        localStorage.removeItem('token');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role after login
      const token = await userCredential.user.getIdToken();
      // Store the latest Firebase ID token in localStorage for API requests
      localStorage.setItem('token', token);
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
        console.log('User role fetched:', data.role);
        return { user: userCredential.user, role: data.role };
      } else {
        console.error('Failed to fetch user profile:', await response.text());
        setUserRole(null);
        return { user: userCredential.user, role: null };
      }
    } catch (error) {
      console.error('Login error:', error);
      setUserRole(null);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Remove token from localStorage on logout
      localStorage.removeItem('token');
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    signup,
    logout,
  };

  console.log('AuthContext userRole:', userRole);
  return (
    <AuthContext.Provider value={value}>
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