import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import IngredientInput from '../../components/recipes/IngredientInput';
import InstructionInput from '../../components/recipes/InstructionInput';
import { getRecipeById, updateRecipe } from '../../api/recipes';

export default function RecipeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: 'Meal',
        image: null,
        imageUrl: null,
        duration: 0,
        description: '',
        ingredients: [''],
        instructions: [''],
    });

    // Fetch recipe data when component mounts
    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                const recipeData = await getRecipeById(id);
                
                // Get ingredients from recipeingredients array
                const ingredients = recipeData.recipeingredients 
                    ? recipeData.recipeingredients.map(item => item.content)
                    : [''];
                
                // Get instructions from recipesteps array
                const instructions = recipeData.recipesteps 
                    ? recipeData.recipesteps
                        .sort((a, b) => a.step_number - b.step_number)
                        .map(item => item.content)
                    : [''];

                setFormData({
                    name: recipeData.name || '',
                    category: recipeData.category || 'Meal',
                    image: null, // Can't pre-populate file input
                    imageUrl: recipeData.image_url || null, // Store existing image URL
                    duration: recipeData.duration || 0,
                    description: recipeData.description || '',
                    ingredients,
                    instructions,
                });
                
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching recipe:', err);
                setError('Failed to load recipe data');
                setIsLoading(false);
            }
        };

        fetchRecipeData();
    }, [id]);

    // Handle form data change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Update form data with the selected file
            setFormData({ ...formData, image: file });
            setSelectedFileName(file.name);
            
            // Create a FileReader to read the image for preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle remove image
    const removeImage = () => {
        // Update form data to clear both the file and the URL

        setFormData({ ...formData, image: null, imageUrl:null });
        setImagePreview(null);
        setSelectedFileName('');
        
        // Reset the file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || formData.instructions.some(step => !step.trim()) || formData.ingredients.some(ingredient => !ingredient.trim())) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const formToSubmit = new FormData();
            formToSubmit.append('name', formData.name);
            formToSubmit.append('category', formData.category);
            if (formData.image) {
                formToSubmit.append('image', formData.image);
            }
            formToSubmit.append('duration', formData.duration);
            formToSubmit.append('description', formData.description);
            formToSubmit.append('ingredients', JSON.stringify(formData.ingredients));
            formToSubmit.append('instructions', JSON.stringify(formData.instructions));
                    
            await updateRecipe(id, formToSubmit);
            navigate(`/recipes/${id}`);
        } 
        catch (err) {
            setError('Error updating recipe. Please try again.');
            console.error(err);
        }
        finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Loading recipe data...</div>;
    }

    return (
        <div className="space-y-4 px-4 py-6">
            <h1 className="text-2xl font-bold">Edit Recipe</h1>
            
            {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipe name input */}
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="recipe-name" className="text-sm font-medium">
                            Recipe Name
                        </label>
                        <input
                            type="text"
                            id="recipe-name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="e.g., Avocado Toast with Eggs"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                
                    {/* Category Input */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label htmlFor="category" className="text-sm font-medium">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="Meal">Meal</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>

                        {/* Prep time input */}
                        <div className="space-y-2">
                            <label htmlFor="duration" className="text-sm font-medium">
                                Prep Time (min)
                            </label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleFormChange}
                                placeholder="e.g., 15"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    
                    {/* Description input */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            placeholder="Briefly describe your recipe..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* Image upload */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                    <h2 className="text-base font-medium">Recipe Image</h2>
                    {!imagePreview && !formData.imageUrl ? (
                        /* Upload interface when no image is selected or exists */
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-40">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground text-center mb-3">Tap to upload an image</p>
                            <input
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                id="image-upload" 
                            />
                            <label htmlFor="image-upload">
                                <Button variant="outline" size="sm" type="button" asChild>Upload</Button>
                            </label>
                        </div>
                    ) : (
                        /* Image preview when an image is selected or exists */
                        <div className="flex flex-col items-center border rounded-md p-2">
                            <div className="relative w-full h-40 mb-2">
                                <img 
                                    src={imagePreview || formData.imageUrl} 
                                    alt="Recipe preview" 
                                    className="w-full h-full object-contain rounded-md"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                {selectedFileName || (formData.imageUrl ? 'Current image' : '')}
                            </p>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button"
                                    onClick={() => document.getElementById('image-upload-replace').click()}
                                >
                                    Change Image
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload-replace"
                                />
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button"
                                    className="text-destructive"
                                    onClick={removeImage}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ingredients input */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                    <h2 className="text-base font-medium">Ingredients</h2>
                    <IngredientInput
                        ingredients={formData.ingredients}
                        onChange={(ingredients) => setFormData({...formData, ingredients})}
                    />
                </div>

                {/* Instructions input */}
                <div className="rounded-lg border bg-card p-4 space-y-3">
                    <h2 className="text-base font-medium">Instructions</h2>
                    <InstructionInput
                        instructions={formData.instructions}
                        onChange={(instructions) => setFormData({...formData, instructions})}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/recipes/${id}`)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Update Recipe'}
                    </Button>
                </div>
            </form>
        </div>
    );
}