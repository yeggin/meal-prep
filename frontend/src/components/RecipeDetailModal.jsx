import { X } from 'lucide-react';
import { Button } from './ui/Button';

export default function RecipeDetailModal({ recipe, isOpen, onClose, onAdd }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{recipe.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Recipe metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>{recipe.duration || 30} mins</div>
            <div>{recipe.calories || 'N/A'} calories</div>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm">{recipe.description}</p>
          </div>
          
          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-medium mb-1">Ingredients</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {Array.isArray(recipe.ingredients) ? (
                recipe.ingredients.map((ingredient, i) => (
                  <li key={i}>{ingredient}</li>
                ))
              ) : (
                <li>{recipe.ingredients || 'No ingredients available'}</li>
              )}
            </ul>
          </div>
          
          {/* Instructions */}
          <div>
            <h3 className="text-sm font-medium mb-1">Instructions</h3>
            <ol className="list-decimal list-inside text-sm space-y-1">
              {Array.isArray(recipe.instructions) ? (
                recipe.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))
              ) : (
                <li>{recipe.instructions || 'No instructions available'}</li>
              )}
            </ol>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <Button onClick={() => onAdd(recipe)}>
            Add to My Recipes
          </Button>
        </div>
      </div>
    </div>
  );
}