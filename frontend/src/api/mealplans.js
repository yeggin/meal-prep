// TODO: Add post, put, delete for meal plan items? 
import apiClient from './client';

export const getMealPlans = async (searchParams = {}) => {
    try {
        const response = await apiClient.get('/mealplans', {params: searchParams});
        return response.data;
    }
    catch (error) {
        console.error("Error fetching meal plans:", error);
        throw error;
    }
}
export const getMealPlanById = async (id) => {
    try {
        const response = await apiClient.get(`/mealplans/${id}`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching meal plan:", error);
        throw error;
    }
};
export const createMealPlan = async (mealplan) => {
    try {
        const response = await apiClient.post('/mealplans', mealplan);
        return response.data;
    }
    catch (error) {
        console.error("Error creating meal plan:", error);
        throw error;
    }
};
export const updateMealPlan = async (id, mealplan) => {
    try {
        const response = await apiClient.put(`/mealplans/${id}`, mealplan);
        return response.data;
    }
    catch (error) {
        console.error("Error updating meal plan:", error);
        throw error;
    }
}
export const deleteMealPlan = async (id) => {
    try {
        const response = await apiClient.delete(`/mealplans/${id}`);
        return response.data;
    }
    catch (error) {
        console.error("Error deleting meal plan:", error);
        throw error;
    }
}

