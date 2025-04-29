// api/recipe.js
import apiClient from './client';
import { getCurrentUserId, isAuthenticated } from './user';

export const getRecipes = async (searchParams = {}) => {
    try {
        // Make sure we're authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required');
        }
        
        // Get current user ID and add it to search parameters
        const userId = getCurrentUserId();
        const paramsWithUserId = userId ? { ...searchParams, user_id: userId } : searchParams;
        
        const response = await apiClient.get('/recipes', { params: paramsWithUserId });
        return response.data;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        throw error;
    }
};

export const getRecipeById = async (id) => {
    try {
        // Make sure we're authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required');
        }
        
        const response = await apiClient.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        throw error;
    }
};

export const createRecipe = async (recipe) => {
    try {
        // Make sure we're authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required');
        }
        
        const userId = getCurrentUserId();
        
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        // Add user_id to recipe data
        const recipeWithUserId = {
            ...recipe,
            user_id: userId
        };
        
        // Debug log
        console.log('Sending recipe payload:', JSON.stringify(recipeWithUserId));
        
        const response = await apiClient.post('/recipes', recipeWithUserId);
        return response.data;
    } catch (error) {
        // Enhanced error logging
        if (error.response) {
            console.error("Server error creating recipe:", {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error("Error creating recipe:", error.message);
        }
        throw error;
    }
};

export const updateRecipe = async (id, recipe) => {
    try {
        // Make sure we're authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required');
        }
        
        const userId = getCurrentUserId();
        
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        // Add user_id to updated recipe data
        const recipeWithUserId = {
            ...recipe,
            user_id: userId
        };
        
        const response = await apiClient.put(`/recipes/${id}`, recipeWithUserId);
        return response.data;
    } catch (error) {
        console.error("Error updating recipe:", error);
        throw error;
    }
};

export const deleteRecipe = async (id) => {
    try {
        // Make sure we're authenticated
        if (!isAuthenticated()) {
            throw new Error('Authentication required');
        }
        
        const response = await apiClient.delete(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting recipe:", error);
        throw error;
    }
};