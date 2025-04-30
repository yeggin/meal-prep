// api/user.js
import { supabase, getCurrentUser, getCurrentSession } from './supabaseClient';

export const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const login = async (credentials) => {
  try {
    const { email, password } = credentials;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    // Save auth data in localStorage
    if (data.session) {
      localStorage.setItem('authToken', data.session.access_token);
      localStorage.setItem('userId', data.user.id);
    }
    
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async (credentials) => {
  try {
    const { email, password } = credentials;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    // Some Supabase configurations require email confirmation
    if (!data.session) {
      return { message: 'Please check your email to confirm your account' };
    }
    
    // Save auth data in localStorage
    localStorage.setItem('authToken', data.session.access_token);
    localStorage.setItem('userId', data.user.id);
    
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // You can fetch additional user profile data from your 'profiles' table if needed
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    // Combine auth data with profile data
    return {
      id: user.id,
      email: user.email,
      ...data
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};