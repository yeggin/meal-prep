import supabase from "../supabase.js";

// Set this to true when you want to use real image uploads
const USE_REAL_UPLOADS = true;

// Create new recipe
export const createRecipe = async (req, res) => {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    
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
    
    let imageUrl = null;

    // Handle image upload
    if (imageFile) {
        if (USE_REAL_UPLOADS) {
            try {
                console.log('Image file details:', {
                    name: imageFile.originalname,
                    size: imageFile.size,
                    type: imageFile.mimetype,
                    hasBuffer: !!imageFile.buffer
                });
                
                // Create a safe filename by removing special characters and adding timestamp
                const safeOriginalName = imageFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `recipe_${Date.now()}_${safeOriginalName}`;
                
                console.log('Attempting to upload file:', fileName);
                
                // Verify buffer exists and has content
                if (!imageFile.buffer || imageFile.buffer.length === 0) {
                    throw new Error('Image buffer is empty or undefined');
                }
                
                // Upload to Supabase storage bucket
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('recipe-images')
                    .upload(fileName, imageFile.buffer, {
                        cacheControl: '3600',
                        upsert: false, // Don't overwrite existing files with same name
                        contentType: imageFile.mimetype
                    });

                console.log('Upload response data:', uploadData);
                
                if (uploadError) {
                    console.error("Supabase image upload error:", uploadError);
                    throw new Error(`Upload failed: ${uploadError.message}`);
                }
                
                // Get public URL for the uploaded image
                const { data: urlData } = supabase.storage
                    .from('recipe-images')
                    .getPublicUrl(fileName);
                    
                if (!urlData || !urlData.publicUrl) {
                    throw new Error('Failed to generate public URL');
                }
                
                imageUrl = urlData.publicUrl;
                console.log('Generated image URL:', imageUrl);
            } catch (uploadErr) {
                console.error("Image upload exception:", uploadErr);
                return res.status(500).json({ 
                    error: 'Error uploading image',
                    details: uploadErr.message
                });
            }
        } else {
            // Fallback to placeholder if real uploads are disabled
            const recipeName = name.replace(/\s+/g, '+');
            imageUrl = `https://placehold.co/400x300?text=${recipeName}`;
            console.log('Using placeholder image:', imageUrl);
        }
    }

    // Convert empty strings to null or 0 before inserting
    duration = duration === "" ? null : parseInt(duration, 10);
    
    // Insert recipe data into recipes table
    const { data, error } = await supabase
        .from('recipes')
        .insert([
            {
                name: name,
                description: description,
                duration: duration,
                category: category,
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
    
    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
        const ingredientData = ingredients.map(ingredient => ({
            recipe_id: data.id,
            content: ingredient
        }));
        
        const { error: ingredientError } = await supabase
            .from('recipeingredients')
            .insert(ingredientData);
            
        if (ingredientError) {
            return res.status(500).json({ error: 'Error adding ingredients' });
        }
    }
    
    // Insert instructions
    if (instructions && instructions.length > 0) {
        const instructionData = instructions.map((step, index) => ({
            recipe_id: data.id,
            content: step,
            step_number: index + 1
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

// Update a recipe with image handling
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
        if (imageFile && USE_REAL_UPLOADS) {
            try {
                // Create a safe filename
                const safeOriginalName = imageFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `recipe_update_${Date.now()}_${safeOriginalName}`;
                
                // Upload to Supabase storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('recipe-images')
                    .upload(fileName, imageFile.buffer, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageFile.mimetype
                    });

                if (uploadError) {
                    throw new Error(`Upload failed: ${uploadError.message}`);
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('recipe-images')
                    .getPublicUrl(fileName);
                
                if (!urlData || !urlData.publicUrl) {
                    throw new Error('Failed to generate public URL');
                }
                
                imageUrl = urlData.publicUrl;
            } catch (uploadErr) {
                console.error("Image upload exception during update:", uploadErr);
                return res.status(500).json({ 
                    error: 'Error uploading image during update',
                    details: uploadErr.message
                });
            }
        } else if (imageFile && !USE_REAL_UPLOADS) {
            // Use placeholder if real uploads are disabled
            const recipeName = name.replace(/\s+/g, '+');
            imageUrl = `https://placehold.co/400x300?text=${recipeName}`;
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
                image_url: imageUrl
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
            // Delete existing ingredients
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

        res.status(200).json({message: 'Recipe updated successfully', data});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all recipes
export const getAllRecipes = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        let query = supabase.from('recipes').select('*');

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        const { data, error } = await query;

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
            .eq('id', id)
            .single();
        
        const { data: recipeingredients } = await supabase
            .from('recipeingredients')
            .select('*')
            .eq('recipe_id', id);
        
        const { data: recipesteps } = await supabase
            .from('recipesteps')
            .select('*')
            .eq('recipe_id', id)
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
            .eq('recipe_id', recipe_id);

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
            .eq('recipe_id', recipe_id)
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

// Delete a recipe
export const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id);

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