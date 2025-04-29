// api/mealplan.js
import apiClient from './client';
import { getCurrentUserId } from './user';

export const getMealPlans = async (searchParams = {}) => {
    try {
        // Get current user ID and add it to search parameters
        const userId = getCurrentUserId();
        const paramsWithUserId = userId ? { ...searchParams, user_id: userId } : searchParams;
        
        const response = await apiClient.get('/mealplans', { params: paramsWithUserId });
        return response.data;
    } catch (error) {
        console.error("Error fetching meal plans:", error);
        throw error;
    }
};

export const getMealPlanById = async (id) => {
    try {
        const response = await apiClient.get(`/mealplans/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching meal plan:", error);
        throw error;
    }
};

export const createMealPlan = async (mealplan) => {
    try {
        const userId = getCurrentUserId();
        
        // Add user_id to mealplan data if available
        const mealplanWithUserId = userId ? {
            ...mealplan,
            user_id: userId
        } : mealplan;
        
        const response = await apiClient.post('/mealplans', mealplanWithUserId);
        return response.data;
    } catch (error) {
        console.error("Error creating meal plan:", error);
        throw error;
    }
};

export const updateMealPlan = async (id, mealplan) => {
    try {
        const userId = getCurrentUserId();
        
        // Add user_id to updated mealplan data if available
        const mealplanWithUserId = userId ? {
            ...mealplan,
            user_id: userId
        } : mealplan;
        
        console.log("Sending meal plan data:", JSON.stringify(mealplanWithUserId));
        const response = await apiClient.put(`/mealplans/${id}`, mealplanWithUserId);
        return response.data;
    } catch (error) {
        console.error("Error updating meal plan:", error);
        throw error;
    }
};

export const deleteMealPlan = async (id) => {
    try {
        const response = await apiClient.delete(`/mealplans/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting meal plan:", error);
        throw error;
    }
};

// TODO: Add post, put, delete for meal plan items
export const getMealPlanItems = async (mealPlanId) => {
    try {
        const response = await apiClient.get(`/mealplans/${mealPlanId}/items`);
        return response.data;
    } catch (error) {
        console.error("Error fetching meal plan items:", error);
        throw error;
    }
};