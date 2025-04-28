import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Search, Plus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { getRecipes } from "../../api/recipes";
import apiClient from "../../api/client";

export default function RecipeSelection({ 
  day, 
  mealType, 
  initialSelectedRecipes = [], 
  onSelectionDone,
  onCancel,
  isOpen = false // Control visibility through props
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipes, setSelectedRecipes] = useState(initialSelectedRecipes || []);
  
  useEffect(() => {
    if (!isOpen) return; // Only fetch data when modal is open
    fetchRecipes();
  }, [isOpen]);
  
  // Reset selected recipes when initialSelectedRecipes changes
  useEffect(() => {
    setSelectedRecipes(initialSelectedRecipes || []);
  }, [initialSelectedRecipes]);
  
  const fetchRecipes = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecipes({ search });

      const apiUrl = apiClient.defaults.baseURL;
      console.log("Using API URL:", apiUrl);

      if (!apiUrl || apiUrl.includes('localhost')) {
        setError(`API Configuration Issue: Using URL "${apiUrl}"`);
        return;
      }

      console.log("API Response:", response);
      console.log("Type:", typeof response);
      console.log("Is Array:", Array.isArray(response));
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setRecipes(response);
      } else if (typeof response === 'object' && response !== null) {
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
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(searchTerm);
  };
  
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleRecipeSelection = (recipe) => {
    const isSelected = selectedRecipes.some(r => r.id === recipe.id);
    
    if (isSelected) {
      setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipe.id));
    } else {
      setSelectedRecipes([...selectedRecipes, recipe]);
    }
  };
  
  const handleDone = () => {
    // Call the onSelectionDone callback with the selected recipes
    if (onSelectionDone) {
      onSelectionDone(selectedRecipes);
    }
  };
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Use portal to render at the root level of the DOM
  return createPortal(
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="space-y-4 px-4 py-6 flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">
            Add to {day} - {mealType}
          </h1>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md">
            {error}
          </div>
        )}
        
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes..."
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
          />
        </form>
        
        {/* Selected recipes count */}
        {selectedRecipes.length > 0 && (
          <div className="flex justify-between items-center p-2 bg-accent rounded-md">
            <span className="text-sm">
              {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected
            </span>
            <Button size="sm" onClick={handleDone}>
              Done
            </Button>
          </div>
        )}
        
        {/* Recipe list */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading recipes...</p>
            </div>
          ) : filteredRecipes.length > 0 ? (
            <div className="space-y-2">
              {filteredRecipes.map(recipe => {
                const isSelected = selectedRecipes.some(r => r.id === recipe.id);
                
                return (
                  <div
                    key={recipe.id}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                    }`}
                    onClick={() => toggleRecipeSelection(recipe)}
                  >
                    {recipe.image_url ? (
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.name} 
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gray-200 text-gray-500">
                        {recipe.name ? recipe.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{recipe.name || 'Unnamed Recipe'}</p>
                      {recipe.category && (
                        <span className="text-xs text-muted-foreground">{recipe.category}</span>
                      )}
                    </div>
                    <Button 
                      variant={isSelected ? "default" : "ghost"} 
                      size="icon" 
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRecipeSelection(recipe);
                      }}
                    >
                      {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">No recipes found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom action button for multiple selection */}
      {selectedRecipes.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button className="w-full" onClick={handleDone}>
            Add {selectedRecipes.length} Recipe{selectedRecipes.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>,
    document.body // Mount to body element
  );
}