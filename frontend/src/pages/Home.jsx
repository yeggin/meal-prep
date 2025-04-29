import { useState, useEffect } from 'react';
import { getMealPlans, getMealPlanDetails } from '../api/mealplans';
import { CalendarDays, Utensils } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';

export default function Home() {
    const [mealPlans, setMealPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [currentPlanData, setCurrentPlanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Get the current day of the week
    const weekDays = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    const [activeDay, setActiveDay] = useState(weekDays[today]);
    
    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    
    // Fetch all meal plans on component mount
    useEffect(() => {
        async function fetchMealPlans() {
            try {
                setLoading(true);
                const data = await getMealPlans();
                setMealPlans(data);
                
                // If meal plans exist, select the first one by default
                if (data.length > 0) {
                    setSelectedPlanId(data[0].id);
                }
            } catch (err) {
                setError('Failed to load meal plans');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        
        fetchMealPlans();
    }, []);
    
    // Fetch selected meal plan details when selectedPlanId changes
    useEffect(() => {
        async function fetchMealPlanDetails() {
            if (!selectedPlanId) return;
            
            try {
                setLoading(true);
                const data = await getMealPlanDetails(selectedPlanId);
                
                // Organize meal items by day and meal type
                const organizedData = {
                    name: data.name,
                    meals: {}
                };
                
                // Initialize the structure for all days and meal types
                weekDays.forEach(day => {
                    organizedData.meals[day] = {};
                    mealTypes.forEach(mealType => {
                        organizedData.meals[day][mealType] = [];
                    });
                });
                
                // Populate with actual meal items
                data.meal_items?.forEach(item => {
                    if (organizedData.meals[item.day]) {
                        const mealType = item.meal_type;
                        if (organizedData.meals[item.day][mealType]) {
                            organizedData.meals[item.day][mealType].push(item.recipe);
                        }
                    }
                });
                
                setCurrentPlanData(organizedData);
            } catch (err) {
                setError('Failed to load meal plan details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        
        fetchMealPlanDetails();
    }, [selectedPlanId]);
    
    // Handle meal plan selection change
    const handlePlanChange = (value) => {
        setSelectedPlanId(value);
    };
    
    if (loading && !currentPlanData) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }
    
    return (
        <div className="space-y-4 px-4 py-6">
            <h1 className="text-2xl font-bold">My Meal Planner</h1>
            
            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                    {error}
                </div>
            )}
            
            {/* Meal Plan Selector */}
            <div className="rounded-lg border bg-card p-4">
                <div className="space-y-2">
                    <label htmlFor="meal-plan-select" className="text-sm font-medium">
                        Select Meal Plan
                    </label>
                    
                    {mealPlans.length > 0 ? (
                        <Select 
                            value={selectedPlanId} 
                            onValueChange={handlePlanChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a meal plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {mealPlans.map(plan => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="text-center p-6 border border-dashed rounded-md">
                            <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No meal plans created yet</p>
                            <button 
                                className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                                onClick={() => navigate('/mealplans/new')}
                            >
                                Create Your First Plan
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {currentPlanData && (
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    <h2 className="text-lg font-semibold">{currentPlanData.name}</h2>
                    
                    {/* Day tabs */}
                    <div className="flex overflow-x-auto border-b">
                        {weekDays.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`flex-1 min-w-16 py-2 text-center text-sm ${
                                    activeDay === day ? "border-b-2 border-primary font-medium" : "text-muted-foreground"
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    
                    {/* Meal sections for active day */}
                    <div className="space-y-6 pt-2">
                        {mealTypes.map(mealType => (
                            <div key={mealType} className="space-y-3">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <Utensils className="h-4 w-4" />
                                    {mealType}
                                </h3>
                                
                                {/* Display recipes for this meal type and day */}
                                {currentPlanData.meals[activeDay][mealType]?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentPlanData.meals[activeDay][mealType].map(recipe => (
                                            <div key={recipe.id} className="flex items-center gap-3 bg-accent/50 p-3 rounded-md">
                                                {recipe.image_url ? (
                                                    <img src={recipe.image_url} alt={recipe.name} className="w-16 h-16 rounded-md object-cover"/>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-md flex items-center justify-center bg-gray-200 text-gray-500">
                                                        {recipe.name ? recipe.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">{recipe.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {recipe.prep_time} prep · {recipe.cook_time} cook
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-4 border border-dashed rounded-md">
                                        <CalendarDays className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                        <p className="text-xs text-muted-foreground">No recipes added</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}