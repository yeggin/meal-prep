import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import MealPlanCard from '../../components/mealplans/MealPlanCard';
import { getMealPlans, deleteMealPlan } from '../../api/mealplans';
import apiClient from '../../api/client';

export default function MealPlanList() {
    const [mealPlans, setMealPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async ( search = '' ) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getMealPlans({ search });

            const apiUrl = apiClient.defaults.baseURL;
            console.log("Using API URL:", apiUrl);
            // Set this as user-visible error
            if (!apiUrl || apiUrl.includes('localhost')) {
                setError(`API Configuration Issue: Using URL "${apiUrl}"`);
                return;
            }

            console.log("API Response:", response);
            console.log("Type:", typeof response);
            console.log("Is Array:", Array.isArray(response));
            // Handle different response formats
            if (Array.isArray(response)) {
                setMealPlans(response);
            } else if (typeof response === 'object' && response !== null) {
                
                // Option 1: If mealplans are in a 'data' property
                if (Array.isArray(response.data)) {
                    setMealPlans(response.data);
                }
                // Option 2: If mealplans are in a 'mealplans' property
                else if (Array.isArray(response.mealplans)) {
                    setMealPlans(response.mealplans);
                }
                // Option 3: If the object itself is a collection of mealplans with numeric keys
                else if (Object.values(response).length > 0 && 
                        typeof Object.values(response)[0] === 'object') {
                    setMealPlans(Object.values(response));
                }
                // Fallback if we can't find an array
                else {
                    console.error("Couldn't find meal plan array in response:", response);
                    setMealPlans([]);
                    setError('Unable to process mealplans from server.');
                }
            } else {
            // If response is neither an array nor an object
            setMealPlans([]);
            setError('Received invalid data format from server.');
            }
        }
        catch (err) {
            setError('Failed to load meal plans. Please try again.');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMealPlans(searchTerm);
    }

    const handleDelete = async (id) => {
        try {
            await deleteMealPlan(id);
            setMealPlans(mealPlans.filter(mealplan => mealplan.id !== id));
        }
        catch (err) {
            setError('Failed to delete meal plan. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-4 px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Meal Plans</h1>
                <Button size="sm" asChild>
                    <Link to="/mealplans/new">
                        <div className = "flex items-center">
                            <Plus className="mr-1 h-3 w-3" />  New
                        </div>
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                type="search"
                placeholder="Search meal plans..."
                className="h-10 w-full rounded-md border border-input pl-9 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>

            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-8">
                <p className="text-muted-foreground">Loading meal plans...</p>
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-8">
                <p className="text-muted-foreground">No meal plans found.</p>
                </div>
            ) : (
                <div className="space-y-3 pt-2">
                {mealPlans.map((mealplan) => (
                    <MealPlanCard
                        key={mealplan.id}
                        mealplan={mealplan}
                        onDelete={handleDelete}
                    />
                ))}
                </div>
            )}
        </div>
    );
}