// api/recipe.js
import apiClient from './client';
import { getCurrentUserId } from './user';

export const getRecipes = async (searchParams = {}) => {
    try {
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
        const response = await apiClient.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        throw error;
    }
};

export const createRecipe = async (recipe) => {
    try {
        const userId = getCurrentUserId();
        
        // Add user_id to recipe data if available
        const recipeWithUserId = userId ? {
            ...recipe,
            user_id: userId
        } : recipe;
        
        const response = await apiClient.post('/recipes', recipeWithUserId);
        return response.data;
    } catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
    }
};

export const updateRecipe = async (id, recipe) => {
    try {
        const userId = getCurrentUserId();
        
        // Add user_id to updated recipe data if available
        const recipeWithUserId = userId ? {
            ...recipe,
            user_id: userId
        } : recipe;
        
        const response = await apiClient.put(`/recipes/${id}`, recipeWithUserId);
        return response.data;
    } catch (error) {
        console.error("Error updating recipe:", error);
        throw error;
    }
};

export const deleteRecipe = async (id) => {
    try {
        const response = await apiClient.delete(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting recipe:", error);
        throw error;
    }
};