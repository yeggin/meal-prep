import apiClient from './client';

export const getRecipes = async (searchParams = {}) => {
    try {
        const response = await apiClient.get('/recipes', {params: searchParams});
        return response.data;
    }
    catch (error) {
        console.error("Error fetching recipes:", error);
        throw error;
    }
};

export const getRecipeById = async (id) => {
    try {
        const response = await apiClient.get(`/recipes/${id}`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching recipe:", error);
        throw error;
    }
};

export const createRecipe = async (recipe) => {
    try {
        const response = await apiClient.post('/recipes', recipe);
        return response.data;
    }
    catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
    }
};

export const updateRecipe = async (id, recipe) => {
    try {
        const response = await apiClient.put(`/recipes/${id}`, recipe);
        return response.data;
    }
    catch (error) {
        console.error("Error updating recipe:", error);
        throw error;
    }
}

export const deleteRecipe = async (id) => {
    try {
        const response = await apiClient.delete(`/recipes/${id}`);
        return response.data;
    }
    catch (error) {
        console.error("Error deleting recipe:", error);
        throw error;
    }
}
