import { Link } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

export default function RecipeCard({ recipe, onDelete}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this recipe?')) {
            onDelete(recipe.id);
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border bg-card">            
            {/* recipe details */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <Link to={`/recipes/${recipe.id}`}>
                        <h3 className="font-medium mb-1">{recipe.name}</h3>
                    </Link>
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                <Link to={`/recipes/${recipe.id}/edit`}>
                                    <Button variant="ghost" className="w-full text-left">
                                        <Edit className="mr-2" /> Edit
                                    </Button>
                                </Link>
                                <Button variant="ghost" className="w-full text-left" onClick={handleDelete}>
                                    <Trash2 className="mr-2" /> Delete
                                </Button>
                            </div>
                        )} 
                    </div>
                </div>
                <div className="flex item-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Prep: {recipe.duration}</span>
                        <span>{recipe.calories} cals</span>
                        <span>{recipe.ingredient?.length || 0} ingredients</span>
                </div>
            </div>
            {/* recipe image */}
            <div className="relative h-36">
                <img
                    src={recipe.image_url || '../assets/placeholder.jpg'}
                    alt={recipe.name}
                    className="h-full w-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    {recipe.category}
                </span>
            </div>
        </div>
    )


}
