import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import Navbar  from '../../components/ui/NavBar';
import { Card } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';

// Free AI API options
import { generateRecipesWithAI } from '../../api/aiService';

// Dietary preferences options
const dietaryPreferences = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
  { id: "low-carb", label: "Low Carb" },
  { id: "high-protein", label: "High Protein" },
];

// Meal types
const mealTypes = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
  { id: "dessert", label: "Dessert" },
];

export default function AIRecipeGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState("dinner");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [calorieTarget, setCalorieTarget] = useState("");
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [error, setError] = useState(null);

  // Toggle dietary preference selection
  const togglePreference = (id) => {
    setSelectedPreferences((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle meal type selection
  const handleMealTypeChange = (e) => {
    setSelectedMealType(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request data
      const requestData = {
        preferences: selectedPreferences,
        mealType: selectedMealType,
        calorieTarget: calorieTarget ? parseInt(calorieTarget) : null,
        additionalInfo: additionalInfo
      };
      
      // Call AI service
      const recipes = await generateRecipesWithAI(requestData);
      setGeneratedRecipes(recipes);
      setShowResponse(true);
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError('Failed to generate recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a recipe to your collection - Fixed version
  const addRecipeToCollection = (recipe) => {
    // Ensure calories property exists in the navigation state
    const calories = recipe.calories || 0;
    
    // Format ingredients and instructions as arrays
    const formattedIngredients = Array.isArray(recipe.ingredients) ? 
      recipe.ingredients : 
      (typeof recipe.ingredients === 'string' ? [recipe.ingredients] : []);
      
    const formattedInstructions = Array.isArray(recipe.instructions) ? 
      recipe.instructions : 
      (typeof recipe.instructions === 'string' ? [recipe.instructions] : []);
    
    navigate('/recipes/new', { 
      state: { 
        prefillData: {
          name: recipe.name || "",
          category: recipe.category || 'Meal',
          imageUrl: null,
          duration: recipe.duration || 30,
          calories: calories,
          description: recipe.description || "",
          ingredients: formattedIngredients,
          instructions: formattedInstructions,
        } 
      } 
    });
  };

  // Reset to form view
  const resetForm = () => {
    setShowResponse(false);
    setSelectedPreferences([]);
    setSelectedMealType("dinner");
    setAdditionalInfo("");
    setCalorieTarget("");
  };

  return (
    <div className="space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">AI Recipe Generator</h1>
        <Sparkles className="h-5 w-5 text-emerald-600" />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">
          {error}
        </div>
      )}

      {!showResponse ? (
        <Card className="p-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Meal Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <select
                id="meal-type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedMealType}
                onChange={handleMealTypeChange}
              >
                {mealTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-3">
              <Label>Dietary Preferences</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryPreferences.map((preference) => (
                  <div key={preference.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={preference.id}
                      checked={selectedPreferences.includes(preference.id)}
                      onCheckedChange={() => togglePreference(preference.id)}
                    />
                    <Label 
                      htmlFor={preference.id} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {preference.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Calorie Target */}
            <div className="space-y-2">
              <Label htmlFor="calories">Calorie Target (per serving)</Label>
              <Input
                id="calories"
                type="number"
                placeholder="e.g., 500"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additional-info">Additional Information</Label>
              <Textarea
                id="additional-info"
                placeholder="Ingredients to include/exclude, cuisine preferences, etc."
                rows={3}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Recipes...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Recipes
                </>
              )}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Generated Recipes Display */}
          <Card className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-medium">Generated Recipes</h2>
              <p className="text-xs text-muted-foreground">
                Based on your {selectedMealType} preferences
                {calorieTarget && ` with ~${calorieTarget} calories per serving`}
              </p>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {generatedRecipes.map((recipe, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-3 space-y-2 bg-card hover:bg-accent/20 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{recipe.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground space-x-2">
                        <span>{recipe.duration || 30} mins</span>
                        <span>•</span>
                        <span>{recipe.calories} calories</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addRecipeToCollection(recipe)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="pt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex items-center hover:bg-accent"
                      onClick={() => {
                        // Option to expand recipe details if needed
                        console.log("View recipe details:", recipe);
                      }}
                    >
                      View details <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reset Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={resetForm}
          >
            Create New Recipes
          </Button>
        </div>
      )}
      <Navbar />
    </div>
  );
}