import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import apiClient from '../api/client'; // Import your existing API client

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the initial session and subscribe to auth changes
    const setupAuth = async () => {
      setLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        // Store the token for your API client to use
        localStorage.setItem('token', session.access_token);
      }
      
      // Set up listener for future auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
          
          // Update token in localStorage when auth state changes
          if (session) {
            localStorage.setItem('token', session.access_token);
          } else {
            localStorage.removeItem('token');
          }
        }
      );

      setLoading(false);
      
      // Clean up subscription
      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear token from localStorage
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);