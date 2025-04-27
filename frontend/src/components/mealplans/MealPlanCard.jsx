import { Link } from 'react-router-dom';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';


export default function MealPlanCard({ mealplan, onDelete}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this meal plan?')) {
            onDelete(mealplan.id);
        }
    };

    // Close menu when clicking outside
    const handleClickOutside = () => {
        if (menuOpen) {
            setMenuOpen(false);
        }
    };

    // Add event listener when component mounts
    useEffect(() => {
        if (menuOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="overflow-hidden rounded-lg border bg-card">            
            {/* meal plan details */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <Link to={`/mealplans/${mealplan.id}`}>
                        <h3 className="font-medium mb-1">{mealplan.name}</h3>
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
                                <Link to={`/mealplans/${mealplan.id}/edit`}>
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
                        <span>{mealplan.start_date} - {mealplan.end_date}</span>
                </div>
            </div>

            {/* recipe images */}
            <div className="flex space-x-2 mb-3 overflow-x-auto pb-1">
            {mealplan.recipes && mealplan.recipes.map((recipe, index) => (
                <div 
                key={recipe.id || index} 
                className="w-10 h-10 rounded-md flex-shrink-0 bg-gray-100 overflow-hidden"
                >
                {recipe.image_url ? (
                    <img 
                    src={recipe.image_url} 
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    // Fallback for recipes without images - showing first letter
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    {recipe.name ? recipe.name.charAt(0).toUpperCase() : '?'}
                    </div>
                )}
                </div>
            ))}
            
            {/* If there are no recipes or we need a placeholder */}
            {(!mealplan.recipes || mealplan.recipes.length === 0) && (
                <div className="text-sm text-gray-400">No recipes added yet</div>
            )}
            </div>
        </div>
    )
}
