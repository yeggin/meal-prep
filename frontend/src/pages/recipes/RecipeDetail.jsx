//TODO: placeholder recipe image

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
//import PageHeader from '../../components/layout/PageHeader';
import { getRecipeById, deleteRecipe } from '../../api/recipes';
import { useNavigate } from 'react-router-dom';

export default function RecipeDetail() { 
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getRecipeById(id);
            setRecipe(data);
        } catch (err) {
            setError('Failed to load recipe. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this recipe?')) {
            try {
                await deleteRecipe(id);
                navigate('/recipes');
            } catch (err) {
                setError('Failed to delete recipe. Please try again.');
                console.error(err);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="px-4 py-6">
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading recipe...</p>
                </div>
            </div>
        )
    };

    if (error || !recipe) {
        return (
            <div className="px-4 py-6">
                <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">
                    {error || 'Recipe not found.'}
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-4 pb-16">
            {/* Header + Image */}
            <div className="relative h-48">
                <img
                src={recipe.image || '/placeholder.jpg'}
                alt={recipe.name}
                className="h-full w-full object-cover"
                />
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/recipes')} className="h-8 w-8 text-white">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </div>
                <span className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                {recipe.category}
                </span>
            </div>

            <div className="px-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">{recipe.name}</h1>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Prep time: {recipe.duration} min</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">{recipe.description}</p>

                <div className="flex gap-2">
                    <Button asChild className="flex-1">
                        <Link to={`/recipes/${recipe.id}/edit`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit Recipe
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <h2 className="text-lg font-medium mb-3">Ingredients</h2>
                    <ul className="space-y-2">
                        {recipe.recipeingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-baseline gap-2 text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
                            <span>{ingredient.content}</span>
                        </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <h2 className="text-lg font-medium mb-3">Instructions</h2>
                    <ol className="space-y-4">
                        {recipe.recipesteps.map((step, index) => (
                        <li key={index} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-xs">
                            {index + 1}
                            </span>
                            <span className="flex-1 pt-0.5">{step.content}</span>
                        </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}

