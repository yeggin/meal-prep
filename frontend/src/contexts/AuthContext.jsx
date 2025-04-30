import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

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
      }
      
      // Set up listener for future auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
