import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, Plus, X, CalendarDays } from "lucide-react";
import { createMealPlan } from '../../api/mealplans';
import RecipeSelection from '../../components/mealplans/RecipeSelection';

export default function MealPlanNew() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [recipeSelectionIsOpen, setRecipeSelectionIsOpen] = useState(false);
    const [currentMealContext, setCurrentMealContext] = useState({ day: null, mealType: null });
    
    const [formData, setFormData] = useState({
        name: '',
        start_date: "",
        end_date: "",
    });

    const [activeDay, setActiveDay] = useState("Mon");
    const [selectedRecipes, setSelectedRecipes] = useState({});
    const weekDays = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    

    // Handle form data change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle opening recipe selection
    const handleOpenRecipeSelection = (day, mealType) => {
        setCurrentMealContext({ day, mealType });
        setRecipeSelectionIsOpen(true);
    };
    
    // Handle recipe selection completion
    const handleRecipeSelectionDone = (recipes) => {
        const { day, mealType } = currentMealContext;
        
        setSelectedRecipes(prev => {
        const newState = { ...prev };
        
        // Initialize nested structure if it doesn't exist
        if (!newState[day]) {
            newState[day] = {};
        }
        
        // Set the selected recipes for this day and meal type
        newState[day][mealType] = recipes;
        
        return newState;
        });
        
        setRecipeSelectionIsOpen(false);
    };
    
    // Handle recipe removal
    const handleRemoveRecipe = (day, mealType, recipeId) => {
        setSelectedRecipes(prev => {
            const newState = { ...prev };
            if (newState[day] && newState[day][mealType]) {
                newState[day][mealType] = newState[day][mealType].filter(recipe => recipe.id !== recipeId);
            }
            return newState;
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.start_date || !formData.end_date) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Prepare meal plan data
            const mealPlanData = {
                name: formData.name,
                start_date: formData.start_date,
                end_date: formData.end_date,
                meal_items: []
            };

            // Convert selectedRecipes structure to meal_items array for backend
            // Convert selectedRecipes structure to meal_items array for backend
            Object.keys(selectedRecipes).forEach(day => {
                if (selectedRecipes[day]) {  // Check if this day exists
                    Object.keys(selectedRecipes[day]).forEach(mealType => {
                        if (selectedRecipes[day][mealType] && Array.isArray(selectedRecipes[day][mealType])) {  // Check if this meal type exists and is an array
                            selectedRecipes[day][mealType].forEach(recipe => {
                                mealPlanData.meal_items.push({
                                    recipe_id: recipe.id,
                                    day: day,
                                    meal_type: mealType
                                });
                            });
                        }
                    });
                }
            });
        } 
        catch (err) {
            setError('Error creating meal plan. Please try again.');
            console.error(err);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="space-y-4 px-4 py-6">
            {/* Page header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/mealplans')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Create Meal Plan</h1>
            </div>
            
            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">
                    {error}
                </div>
            )}

            {/* Recipe Selection Modal */}
            <RecipeSelection
                day={currentMealContext.day}
                mealType={currentMealContext.mealType}
                initialSelectedRecipes={
                    selectedRecipes[currentMealContext.day]?.[currentMealContext.mealType] || []
                }
                onSelectionDone={handleRecipeSelectionDone}
                onCancel={() => setRecipeSelectionIsOpen(false)}
                isOpen={recipeSelectionIsOpen}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Meal plan details */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    {/* Meal plan name */}
                    <div className="space-y-2">
                        <label htmlFor="plan-name" className="text-sm font-medium">
                            Plan Name
                        </label>
                        <input
                            type="text"
                            id="plan-name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="e.g., Weekly Diet Plan"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                
                    {/* Date Input */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label htmlFor="start-date" className="text-sm font-medium">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="start-date"
                                name="start_date"
                                value={formData.start_date || ""}
                                onChange={handleFormChange}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="end-date" className="text-sm font-medium">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="end-date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleFormChange}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    {/* Day tabs */}
                    <div className="flex overflow-x-auto border-b">
                        {weekDays.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setActiveDay(day)}
                                className={`flex-1 min-w-16 py-2 text-center text-sm ${
                                    activeDay === day ? "border-b-2 border-primary font-medium" : "text-muted-foreground"
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Meal sections for the active day */}
                    <div className="space-y-4 pt-2">
                        {mealTypes.map(mealType => (
                            <div key={mealType} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium">{mealType}</h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleOpenRecipeSelection(activeDay, mealType)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                {/* Display selected recipes for this meal and day */}
                                {selectedRecipes[activeDay]?.[mealType]?.map(recipe => (
                                    <div key={recipe.id} className="flex items-center gap-2 bg-accent/50 p-2 rounded-md">
                                        {recipe.image_url ? (
                                            <img src={recipe.image_url} alt={recipe.name} className="w-10 h-10 rounded-md object-cover"/>
                                        ) : (
                                            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gray-200 text-gray-500">
                                                {recipe.name ? recipe.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{recipe.name}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleRemoveRecipe(activeDay, mealType, recipe.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                
                                {/* Empty state */}
                                {(!selectedRecipes[activeDay]?.[mealType] || 
                                    selectedRecipes[activeDay]?.[mealType]?.length === 0) && (
                                    <div className="text-center p-3 border border-dashed rounded-md">
                                        <CalendarDays className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                        <p className="text-xs text-muted-foreground">No recipes added</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/mealplans')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Plan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}