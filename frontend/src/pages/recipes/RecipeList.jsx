import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import RecipeCard from '../../components/recipes/RecipeCard';
import { getRecipes, deleteRecipe } from '../../api/recipes';

export default function RecipeList() {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async ( search = '' ) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getRecipes({ search });
            console.log("API Response:", response);
            console.log("Type:", typeof response);
            console.log("Is Array:", Array.isArray(response));
            // Handle different response formats
            if (Array.isArray(response)) {
            // If response is already an array
            setRecipes(response);
            } else if (typeof response === 'object' && response !== null) {
            // If response is an object, try to extract the recipes array
            
            // Option 1: If recipes are in a 'data' property
            if (Array.isArray(response.data)) {
                setRecipes(response.data);
            }
            // Option 2: If recipes are in a 'recipes' property
            else if (Array.isArray(response.recipes)) {
                setRecipes(response.recipes);
            }
            // Option 3: If the object itself is a collection of recipes with numeric keys
            else if (Object.values(response).length > 0 && 
                    typeof Object.values(response)[0] === 'object') {
                setRecipes(Object.values(response));
            }
            // Fallback if we can't find an array
            else {
                console.error("Couldn't find recipes array in response:", response);
                setRecipes([]);
                setError('Unable to process recipes from server.');
            }
            } else {
            // If response is neither an array nor an object
            setRecipes([]);
            setError('Received invalid data format from server.');
            }
        }
        catch (err) {
            setError('Failed to load recipes. Please try again.');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRecipes(searchTerm);
    }

    const handleDelete = async (id) => {
        try {
            await deleteRecipe(id);
            setRecipes(recipes.filter(recipe => recipe.id !== id));
        }
        catch (err) {
            setError('Failed to delete recipe. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-4 px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
                <Button size="sm" asChild>
                    <Link to="/recipes/new">
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
                placeholder="Search recipes..."
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
                <p className="text-muted-foreground">Loading recipes...</p>
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-8">
                <p className="text-muted-foreground">No recipes found.</p>
                </div>
            ) : (
                <div className="space-y-3 pt-2">
                {recipes.map((recipe) => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onDelete={handleDelete}
                    />
                ))}
                </div>
            )}
        </div>
    );
}