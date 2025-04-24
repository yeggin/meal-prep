
import supabase from "../supabase.js";


// Create new recipe
export const createRecipe = async (req, res) => {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    //TODO: calories
    const {  name, description, category } = req.body;
    let { duration } = req.body;

    const imageFile = req.file || null;

    let ingredients = [];
    let instructions = [];
    try {
        ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
        instructions = req.body.instructions ? JSON.parse(req.body.instructions) : [];
    } 
    catch (e) {
        console.error("JSON parse error:", e);
        return res.status(400).json({ error: "Invalid ingredients/instructions format" });
    }
    
   
    let imageUrl = null;

    // Upload image to Supabase storage bucket if image is provided
    try {
        const fileName = `${Date.now()}_${imageFile.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recipe-images')
            .upload(fileName, imageFile.buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: imageFile.mimetype
            });

        console.log('Upload response:', uploadData || uploadError);

    
        if (uploadError) {
            console.error("Supabase image upload error:", uploadError);
            return res.status(500).json({ error: 'Error uploading image', details: uploadError });
        }
    
        imageUrl = supabase.storage
            .from('recipe-images')
            .getPublicUrl(uploadData.path).data.publicUrl;
        console.log('Generated image URL:', imageUrl);
    } catch (uploadErr) {
        console.error("Image upload exception:", uploadErr);
        return res.status(500).json({ error: 'Exception during image upload', details: uploadErr.message });
    }

    // Convert empty strings to null or 0 before inserting
    duration = duration === "" ? null : parseInt(duration, 10);
    // Insert recipe data into recipes table
    const { data, error } = await supabase
        .from('recipes')
        .insert([
            {   //user_id: user_id, // Foreign key
                name: name,
                description: description,
                duration: duration,
                category: category,
                //calories: calories,
                ingredient_count: ingredients.length,
                image_url: imageUrl
            }
        ])
        .select()
        .single();
    if (error) {
        console.error("Supabase recipe insert error:", error);
        return res.status(500).json({ error: 'Error creating recipe' });
    }
    // If ingredients are provided in the request body, insert them into the recipeingredients table
    if (ingredients && ingredients.length > 0) {
        const ingredientData = ingredients.map(ingredient => ({
            recipe_id: data.id, // Foreign key
            content: ingredient
        }));
        const { error: ingredientError } = await supabase
            .from('recipeingredients')
            .insert(ingredientData);
        if (ingredientError) {
            return res.status(500).json({ error: 'Error adding ingredients' });
        }
    }
    // If instructions are provided in the request body, insert them into the recipesteps table
    if (instructions && instructions.length > 0) {
        const instructionData = instructions.map((step, index) => ({
            recipe_id: data.id, // Foreign key
            content: step,
            step_number: index + 1 // Optional: store order
        }));
    
        const { error: instructionError } = await supabase
            .from('recipesteps')
            .insert(instructionData);
    
        if (instructionError) {
            return res.status(500).json({ error: 'Error adding instructions' });
        }
    }
    res.status(201).json({
        message: 'Recipe created successfully',
        recipe: data,
        ingredients: ingredients,
        steps: instructions
      });
    
};

// Get all recipes
export const getAllRecipes = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = supabase.from('recipes').select('*');

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        const { data, error } = await supabase.from('recipes').select('*');

        if (error) return res.status(500).json({ error: 'Error fetching recipes' });

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get recipe by ID
export const getRecipeById = async (req, res) => {
    const {id} = req.params;
    try {
        const { data: recipe , error: recipeError } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id) // WHERE id = id
            .single();
        
        const { data: recipeingredients } = await supabase
            .from('recipeingredients')
            .select('*')
            .eq('recipe_id', id); // WHERE recipe_id = recipe_id
        
        const { data: recipesteps } = await supabase
            .from('recipesteps')
            .select('*')
            .eq('recipe_id', id) // WHERE recipe_id = recipe_id
            .order('step_number', { ascending: true });
        
        if (recipeError) return res.status(500).json({ error: 'Error fetching recipe' });
        
        res.status(200).json({ ...recipe, recipeingredients, recipesteps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all ingredients for a recipe
export const getRecipeIngredients = async (req, res) => {
    const { recipe_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('recipeingredients')
            .select('*')
            .eq('recipe_id', recipe_id); // WHERE recipe_id = recipe_id

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Error fetching ingredients' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all steps for a recipe
export const getRecipeSteps = async (req, res) => {
    const { recipe_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('recipesteps')
            .select('*')
            .eq('recipe_id', recipe_id) // WHERE recipe_id = recipe_id
            .order('step_number', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Error fetching steps' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a recipe
export const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { name, description, category } = req.body;
    let { duration } = req.body;
    const imageFile = req.file || null;

    let ingredients = [];
    let instructions = [];
    try {
        ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];
        instructions = req.body.instructions ? JSON.parse(req.body.instructions) : [];
    } 
    catch (e) {
        console.error("JSON parse error:", e);
        return res.status(400).json({ error: "Invalid ingredients/instructions format" });
    }
    
    try {
        // Get current recipe to check if we need to update the image
        const { data: currentRecipe, error: fetchError } = await supabase
            .from('recipes')
            .select('image_url')
            .eq('id', id)
            .single();
            
        if (fetchError) {
            console.error("Error fetching current recipe:", fetchError);
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        let imageUrl = currentRecipe.image_url;

        // Only upload and update image if a new one is provided
        if (imageFile) {
            const fileName = `${Date.now()}_${imageFile.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(fileName, imageFile.buffer, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                console.error("Supabase image upload error:", uploadError);
                return res.status(500).json({ error: 'Error uploading image' });
            }

            imageUrl = supabase.storage
                .from('recipe-images')
                .getPublicUrl(uploadData.path).data.publicUrl;
        }

        // Convert empty strings to null or 0 before updating
        duration = duration === "" ? null : parseInt(duration, 10);

        // Update recipe data
        const { data, error } = await supabase
            .from('recipes')
            .update({
                name: name,
                description: description,
                duration: duration,
                category: category,
                ingredient_count: ingredients.length,
                image_url: imageUrl // Use the current or new image URL
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({ error: 'Error updating recipe' });
        }

        // Update ingredients: Delete existing and insert new ones
        if (ingredients && ingredients.length > 0) {
            // First delete existing ingredients
            const { error: deleteIngredientsError } = await supabase
                .from('recipeingredients')
                .delete()
                .eq('recipe_id', id);

            if (deleteIngredientsError) {
                console.error("Error deleting ingredients:", deleteIngredientsError);
                return res.status(500).json({ error: 'Error updating ingredients' });
            }

            // Then insert new ingredients
            const ingredientData = ingredients.map(ingredient => ({
                recipe_id: id,
                content: ingredient
            }));

            const { error: ingredientError } = await supabase
                .from('recipeingredients')
                .insert(ingredientData);

            if (ingredientError) {
                console.error("Error inserting ingredients:", ingredientError);
                return res.status(500).json({ error: 'Error updating ingredients' });
            }
        }

        // Update instructions: Delete existing and insert new ones
        if (instructions && instructions.length > 0) {
            // First delete existing steps
            const { error: deleteInstructionsError } = await supabase
                .from('recipesteps')
                .delete()
                .eq('recipe_id', id);

            if (deleteInstructionsError) {
                console.error("Error deleting instructions:", deleteInstructionsError);
                return res.status(500).json({ error: 'Error updating instructions' });
            }

            // Then insert new steps
            const instructionData = instructions.map((step, index) => ({
                recipe_id: id,
                content: step,
                step_number: index + 1
            }));
        
            const { error: instructionError } = await supabase
                .from('recipesteps')
                .insert(instructionData);
        
            if (instructionError) {
                console.error("Error inserting instructions:", instructionError);
                return res.status(500).json({ error: 'Error updating instructions' });
            }
        }

        res.status(200).json({message: 'Recipe updated successfully.', data});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a recipe
export const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id) // WHERE id = id

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Error deleting recipe' });
        }
        res.status(200).json({message: 'Recipe deleted successfully', data});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

