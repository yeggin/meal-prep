import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

export default function IngredientInput({ ingredients, onChange }) {
    const addIngredient = () => {
        onChange([...ingredients, '']);
      };
    
    const updateIngredient = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        onChange(newIngredients);
    };

    const removeIngredient = (index) => {
        if (ingredients.length > 1) {
            const newIngredients = [...ingredients];
            newIngredients.splice(index, 1);
            onChange(newIngredients);
        }
    };

    return (
        <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeIngredient(index)}
                        disabled={ingredients.length === 1}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button 
                type="button"
                variant="outline" 
                onClick={addIngredient}
                className="w-full text-sm"
            >
                <Plus className="mr-1 h-3 w-3" /> 
                Add Ingredient
            </Button>
        </div>
    );
}