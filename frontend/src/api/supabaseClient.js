// api/supabase.js
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anon key is missing. Make sure they are defined in your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error);
    return null;
  }
  return session;
};

// Database table operations for recipes
export const recipeService = {
  // Get all recipes for the current user
  getRecipes: async (filters = {}) => {
    let query = supabase
      .from('recipes')
      .select('*');
    
    // Add filters if provided
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    // By default, only get the current user's recipes
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      query = query.eq('user_id', user.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
    
    return data;
  },

  // Get a single recipe by ID
  getRecipeById: async (id) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
    
    return data;
  },

  // Create a new recipe
  createRecipe: async (recipe) => {
    // Get current user ID and add it to recipe data
    const { data: { user } } = await supabase.auth.getUser();
    
    const recipeWithUserId = {
      ...recipe,
      user_id: user.id,
      created_at: new Date()
    };
    
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeWithUserId])
      .select();
    
    if (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
    
    return data[0];
  },

  // Update an existing recipe
  updateRecipe: async (id, recipe) => {
    const { data, error } = await supabase
      .from('recipes')
      .update({
        ...recipe,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
    
    return data[0];
  },

  // Delete a recipe
  deleteRecipe: async (id) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
    
    return true;
  }
};

// Similar structure for meal plans
export const mealPlanService = {
  // Get all meal plans for the current user
  getMealPlans: async () => {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
    
    return data;
  },

  // Get a single meal plan by ID
  getMealPlanById: async (id) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
    
    return data;
  },

  // Create a new meal plan
  createMealPlan: async (mealPlan) => {
    // Get current user ID and add it to meal plan data
    const { data: { user } } = await supabase.auth.getUser();
    
    const mealPlanWithUserId = {
      ...mealPlan,
      user_id: user.id,
      created_at: new Date()
    };
    
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([mealPlanWithUserId])
      .select();
    
    if (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
    
    return data[0];
  },

  // Update an existing meal plan
  updateMealPlan: async (id, mealPlan) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .update({
        ...mealPlan,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
    
    return data[0];
  },

  // Delete a meal plan
  deleteMealPlan: async (id) => {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
    
    return true;
  }
};

export default supabase;